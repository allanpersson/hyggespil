"""Laver Hyggespils egen lyd (sirene) fra bunden.

De øvrige lyde i spillet hentes fra OpenGameArt med klare licenser – se tools/hent_lyde.py
og docs/lyd.md. Dette script dækker kun de lyde, projektet selv ejer (MIT).

Kør:
    python tools/lav_lyde.py            # skriver MP3-filer i custom_components/hyggespil/www/lyd
    python tools/lav_lyde.py --wav      # behold WAV-filerne (til inspektion)

Kræver ffmpeg i PATH (til MP3-kodning). Uden ffmpeg skrives WAV.
"""
import math
import os
import random
import shutil
import struct
import subprocess
import sys
import wave

SR = 44100
ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UD = os.path.join(ROD, "custom_components", "hyggespil", "www", "lyd")
TAU = 2 * math.pi


# ---------- grundværktøj ----------
def buf(sek):
    return [0.0] * int(SR * sek)


def blanding(dst, src, ved=0.0, gain=1.0):
    start = int(ved * SR)
    for i, v in enumerate(src):
        j = start + i
        if 0 <= j < len(dst):
            dst[j] += v * gain
    return dst


def normaliser(x, top=0.92):
    peak = max((abs(v) for v in x), default=0)
    return [v * top / peak for v in x] if peak else x


def fade(x, ind=0.01, ud=0.05):
    a, b = int(ind * SR), int(ud * SR)
    for i in range(min(a, len(x))):
        x[i] *= i / max(a, 1)
    for i in range(min(b, len(x))):
        x[-1 - i] *= i / max(b, 1)
    return x


def enveloper(n, attack, release, form=2.0):
    """Angrebs-/udklangskurve, så slag får en hård start og naturlig udklang."""
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    ud = [0.0] * n
    for i in range(n):
        if i < a:
            e = (i / a) ** 0.6
        elif i > n - r:
            e = max(0.0, (n - i) / r) ** form
        else:
            e = 1.0
        ud[i] = e
    return ud


def sinus(freq, sek, fase=0.0):
    return [math.sin(TAU * freq * i / SR + fase) for i in range(int(SR * sek))]


def glid(fra, til, sek, kurve=1.0):
    n = int(SR * sek)
    ud, fase = [], 0.0
    for i in range(n):
        t = (i / n) ** kurve
        fase += TAU * (fra + (til - fra) * t) / SR
        ud.append(math.sin(fase))
    return ud


def stoej(sek):
    return [random.uniform(-1, 1) for _ in range(int(SR * sek))]


def lavpas(x, cutoff):
    a = 1 - math.exp(-TAU * cutoff / SR)
    y, ud = 0.0, []
    for v in x:
        y += a * (v - y)
        ud.append(y)
    return ud


def hoejpas(x, cutoff):
    lav = lavpas(x, cutoff)
    return [v - l for v, l in zip(x, lav)]


def saw(freq, sek, harmonik=14):
    """Additiv savtak – rundere og uden aliasing ved høje toner."""
    n = int(SR * sek)
    ud = [0.0] * n
    for k in range(1, harmonik + 1):
        if freq * k > SR / 2.2:
            break
        amp = 1.0 / k
        w = TAU * freq * k / SR
        for i in range(n):
            ud[i] += math.sin(w * i) * amp
    return ud


def stryger(freq, sek, stemmer=4, spredning=0.006, harmonik=12):
    """Flere let stemte savtakke – det giver den brede, filmiske strygerklang."""
    ud = buf(sek)
    for s in range(stemmer):
        f = freq * (1 + (s - (stemmer - 1) / 2) * spredning)
        blanding(ud, saw(f, sek, harmonik), 0, 1.0 / stemmer)
    return ud


def forvræng(x, mængde=2.0):
    return [math.tanh(v * mængde) for v in x]


def komb(x, d, fb):
    y = [0.0] * len(x)
    huk = [0.0] * d
    i = 0
    for n, v in enumerate(x):
        out = huk[i]
        huk[i] = v + out * fb
        y[n] = out
        i = (i + 1) % d
    return y


def allpas(x, d, g):
    y = [0.0] * len(x)
    huk = [0.0] * d
    i = 0
    for n, v in enumerate(x):
        b = huk[i]
        out = -g * v + b
        huk[i] = v + g * out
        y[n] = out
        i = (i + 1) % d
    return y


def rumklang(x, våd=0.35, størrelse=1.0):
    """Enkel Schroeder-rumklang – giver lyde af stor sal i stedet for tør boks."""
    if våd <= 0:
        return x
    dæmpet = lavpas(x, 5500)
    tør = x
    sum_ = [0.0] * len(x)
    for d in (1557, 1617, 1491, 1422):
        c = komb(dæmpet, max(1, int(d * størrelse)), 0.82)
        for i, v in enumerate(c):
            sum_[i] += v * 0.25
    for d, g in ((225, 0.5), (341, 0.5)):
        sum_ = allpas(sum_, int(d * størrelse), g)
    return [t * (1 - våd) + w * våd for t, w in zip(tør, sum_)]


def pauke(f0=62.0, sek=3.0, styrke=1.0):
    """Pauke: stemt krop, kort transient og lang udklang."""
    n = int(SR * sek)
    krop = [0.0] * n
    glide = glid(f0 * 1.5, f0, sek, 0.12)
    env = enveloper(n, 0.004, sek * 0.95, 2.4)
    for i in range(n):
        krop[i] = glide[i] * env[i]
    transient = [v * e for v, e in zip(lavpas(stoej(0.12), 1400), enveloper(int(0.12 * SR), 0.001, 0.1, 3))]
    blanding(krop, transient, 0, 0.7)
    sub = glid(f0 / 2, f0 / 1.6, 0.5, 0.8)
    stamp = [v * e for v, e in zip(sub, enveloper(len(sub), 0.01, 0.5, 3))]
    blanding(krop, stamp, 0, 0.5)
    return rumklang(normaliser(krop, 0.85 * styrke), 0.3, 1.1)


def braam(f0=55.0, sek=3.2, våd=0.4):
    """Filmisk braam: dybe, let forvrængede strygere med åbnende filter."""
    n = int(SR * sek)
    lag = buf(sek)
    for interval, g in ((1.0, 1.0), (1.5, 0.6), (2.0, 0.45), (1.19, 0.3)):
        blanding(lag, stryger(f0 * interval, sek, 4, 0.008, 10), 0, g)
    # filter der åbner og lukker
    ud = [0.0] * n
    a_åben, a_luk = 1 - math.exp(-TAU * 2600 / SR), 1 - math.exp(-TAU * 260 / SR)
    y = 0.0
    for i in range(n):
        t = i / n
        a = a_åben if t < 0.18 else a_åben + (a_luk - a_åben) * (t - 0.18) / 0.82
        y += a * (lag[i] - y)
        ud[i] = y
    ud = forvræng(ud, 1.8)
    env = enveloper(n, 0.05, sek * 0.75, 1.6)
    ud = [v * e for v, e in zip(ud, env)]
    return rumklang(normaliser(ud, 0.9), våd, 1.2)


def stryger_tremolo(freq, sek, sekund=8.0, takt=9.0):
    """Stryger-tremolo på en mol-treklang – den klassiske 'spænding' i tv-quizzer."""
    n = int(SR * sek)
    akkord = [1.0, 1.1892, 1.4983, 2.0]
    ud = buf(sek)
    for interval in akkord:
        blanding(ud, stryger(freq * interval, sek, 5, 0.005, 12), 0, 0.45)
    for i in range(n):
        sving = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(TAU * takt * i / SR))
        ud[i] *= sving
    ud = lavpas(ud, 3200)
    env = enveloper(n, 0.4, sek * 0.35, 1.2)
    return rumklang(normaliser([v * e for v, e in zip(ud, env)], 0.75), 0.45, 1.3)


def cymbal(sek=5.0):
    n = int(SR * sek)
    støj = hoejpas(stoej(sek), 3000)
    env = [(i / n) ** 2.6 for i in range(n)]
    ud = [v * e for v, e in zip(støj, env)]
    for f in (2100, 3170, 4410, 5930):
        ping = [v * e for v, e in zip(sinus(f, sek), env)]
        blanding(ud, ping, 0, 0.05)
    return rumklang(normaliser(ud, 0.7), 0.5, 1.6)


def riser(sek=6.0):
    n = int(SR * sek)
    ud = [0.0] * n
    støj = stoej(sek)
    # båndpas der stiger
    lav = lavpas(støj, 400)
    for i in range(n):
        t = i / n
        cutoff = 300 + 5200 * t ** 1.6
        a = 1 - math.exp(-TAU * cutoff / SR)
        # simpel én-pol bandpas
        if i == 0:
            y = 0.0
        y += a * (støj[i] - y)
        ud[i] += (støj[i] - y) * 0.5
    sweep = glid(90, 900, sek, 2.2)
    for i in range(n):
        t = i / n
        ud[i] += sweep[i] * 0.45 * t
        ud[i] *= 0.25 + 0.75 * t
    # acceleration i pulser
    for i in range(n):
        t = i / n
        puls = 0.65 + 0.35 * math.sin(TAU * (2 + 14 * t) * i / SR)
        ud[i] *= puls
    return rumklang(normaliser(fade(ud, 0.05, 0.25), 0.85), 0.35, 1.2)


def trommehvirvel(sek=5.0):
    ud = buf(sek)
    t = 0.0
    while t < sek - 0.1:
        p = t / sek
        slag = [v * e for v, e in zip(lavpas(stoej(0.05), 6000), enveloper(int(0.05 * SR), 0.001, 0.04, 4))]
        blanding(ud, slag, t, 0.2 + 0.8 * p)
        t += 1.0 / (12 + 30 * p)
    # pauke under hvirvlen
    blanding(ud, pauke(58, 1.6, 0.9), sek - 1.5, 0.8)
    return rumklang(normaliser(fade(ud, 0.02, 0.3), 0.9), 0.3, 1.1)


def ur(sek=4.0):
    ud = buf(sek)
    for k in range(int(sek * 2)):
        t = k * 0.5
        klik = [v * e for v, e in zip(hoejpas(stoej(0.02), 2500), enveloper(int(0.02 * SR), 0.001, 0.015, 5))]
        blanding(ud, klik, t, 0.5)
        ping = [v * e for v, e in zip(sinus(2400, 0.05), enveloper(int(0.05 * SR), 0.001, 0.04, 4))]
        blanding(ud, ping, t, 0.3)
    return rumklang(normaliser(fade(ud, 0.005, 0.01), 0.75), 0.35, 0.9)


def hjerte(sek=4.0):
    ud = buf(sek)
    for slag in range(int(sek)):
        for forsink, styrke in ((0.0, 1.0), (0.26, 0.6)):
            n = int(0.28 * SR)
            dun = [0.0] * n
            g = glid(78, 38, 0.28, 0.7)
            e = enveloper(n, 0.005, 0.26, 3.0)
            for i in range(n):
                dun[i] = g[i] * e[i]
            blanding(ud, dun, slag + forsink, styrke)
    rum = rumklang(ud, 0.25, 1.0)
    return normaliser(fade(rum, 0.005, 0.02), 0.85)


def spaending(sek=10.0):
    """Dyb, langsomt svulmende braam-drone, kan loope."""
    ud = buf(sek)
    for interval, g in ((1.0, 1.0), (1.5, 0.5), (2.0, 0.3)):
        tone = stryger(41.2 * interval, sek, 4, 0.007, 8)
        blanding(ud, tone, 0, g)
    for i in range(len(ud)):
        t = i / len(ud)
        svulm = 0.35 + 0.65 * (0.5 - 0.5 * math.cos(TAU * t))
        ud[i] *= svulm
    ud = lavpas(ud, 900)
    luft = lavpas(stoej(sek), 300)
    for i in range(len(ud)):
        ud[i] += luft[i] * 0.2 * (i / len(ud))
    return normaliser(fade(ud, 0.5, 0.5), 0.8)


def mork(sek=8.0):
    """Mørk, pulserende drone (loop)."""
    ud = buf(sek)
    blanding(ud, stryger(49, sek, 4, 0.006, 8), 0, 1.0)
    blanding(ud, stryger(73.4, sek, 3, 0.006, 8), 0, 0.5)
    for i in range(len(ud)):
        t = i / len(ud)
        puls = 0.55 + 0.45 * (0.5 - 0.5 * math.cos(TAU * 0.5 * i / SR))
        ud[i] *= puls * (0.75 + 0.25 * t)
    ud = lavpas(ud, 700)
    return normaliser(fade(ud, 0.3, 0.3), 0.8)


def hvisken(sek=8.0):
    ud = lavpas(stoej(sek), 1200)
    ud = hoejpas(ud, 180)
    for i in range(len(ud)):
        t = i / len(ud)
        svulm = 0.3 + 0.7 * (0.5 - 0.5 * math.cos(TAU * 0.25 * i / SR))
        ud[i] *= svulm * (0.6 + 0.4 * t)
    return normaliser(fade(ud, 0.5, 0.5), 0.45)


def sting(sek=3.0):
    """Orkester-sting: mol-treklang, pauke og bækken – 'drama' i to sekunder."""
    ud = braam(55, sek, 0.35)
    for interval in (1.0, 1.1892, 1.4983):
        blanding(ud, stryger(110 * interval, 1.6, 3, 0.01, 10), 0, 0.22)
    blanding(ud, pauke(62, 2.2, 1.0), 0, 0.7)
    blanding(ud, cymbal(2.2), 0, 0.35)
    return normaliser(ud, 0.93)


def boom(sek=2.6):
    ud = braam(48, sek, 0.3)
    blanding(ud, pauke(52, 2.4, 1.0), 0, 0.8)
    blanding(ud, [v * e for v, e in zip(glid(70, 30, 1.0, 0.8), enveloper(int(SR), 0.01, 0.95, 2.5))], 0, 0.6)
    return normaliser(ud, 0.95)


def mystik(sek=7.0):
    ud = buf(sek)
    toner = [(220.0, 0.0), (261.63, 0.9), (329.63, 1.8), (261.63, 3.0), (220.0, 3.9), (174.61, 5.0)]
    for f, t in toner:
        blanding(ud, stryger(f, 2.2, 3, 0.004, 10), t, 0.4)
        blanding(ud, pauke(f / 4, 1.2, 0.25), t, 0.25)
    return rumklang(normaliser(ud, 0.8), 0.45, 1.3)


def quizintro(sek=4.0):
    ud = buf(sek)
    for i, f in enumerate((130.81, 164.81, 196.0)):
        blanding(ud, stryger(f, 1.4, 4, 0.006, 10), i * 0.12, 0.5)
    blanding(ud, pauke(65, 1.8), 0.35, 0.8)
    blanding(ud, cymbal(2.6), 0.36, 0.5)
    for k in range(4):
        blanding(ud, [v * e for v, e in zip(lavpas(stoej(0.06), 7000), enveloper(int(0.06 * SR), 0.001, 0.05, 5))], 2.2 + k * 0.14, 0.3)
    blanding(ud, braam(65, 1.6, 0.3), 2.4, 0.6)
    return normaliser(fade(ud, 0.01, 0.5), 0.9)


def vinder(sek=4.0):
    ud = buf(sek)
    for i, f in enumerate((261.63, 329.63, 392.0, 523.25)):
        blanding(ud, stryger(f, 1.2, 4, 0.005, 10), i * 0.18, 0.4)
        blanding(ud, pauke(f / 2, 1.0, 0.4), i * 0.18, 0.3)
    blanding(ud, cymbal(3.0), 0.7, 0.5)
    return normaliser(fade(ud, 0.01, 0.6), 0.88)


def forkert(sek=1.6):
    ud = buf(sek)
    for f, t in ((155.56, 0.0), (146.83, 0.0)):
        tone = [1.0 if v > 0 else -1.0 for v in sinus(f, 0.7)]
        blanding(ud, [v * e for v, e in zip(tone, enveloper(int(0.7 * SR), 0.005, 0.6, 1.6))], t, 0.25)
    blanding(ud, pauke(45, 0.9, 0.8), 0.1, 0.7)
    return normaliser(ud, 0.75)


def uret(sek=5.0):
    ud = buf(sek)
    for k in range(4):
        tone = [v * e for v, e in zip(sinus(1046.5, 0.16), enveloper(int(0.16 * SR), 0.002, 0.13, 3))]
        blanding(ud, tone, k, 0.5)
        blanding(ud, tone, k + 0.18, 0.18)      # ekko
    lang = [v * e for v, e in zip(sinus(784, 0.8), enveloper(int(0.8 * SR), 0.002, 0.7, 1.4))]
    blanding(ud, lang, 4.0, 0.6)
    blanding(ud, pauke(60, 1.2, 0.5), 4.0, 0.4)
    return rumklang(normaliser(ud, 0.8), 0.3, 1.1)


def sirene(sek=2.8):
    ud = buf(sek)
    for k in range(3):
        blanding(ud, [v * e for v, e in zip(glid(520, 980, 0.36, 0.6), enveloper(int(0.36 * SR), 0.01, 0.3, 1.2))], k * 0.8, 0.5)
        blanding(ud, [v * e for v, e in zip(glid(980, 520, 0.36, 0.6), enveloper(int(0.36 * SR), 0.01, 0.3, 1.2))], k * 0.8 + 0.4, 0.5)
    ud = forvræng(ud, 1.4)
    return rumklang(normaliser(fade(ud, 0.01, 0.2), 0.8), 0.3, 1.2)


LYDE = [
    ("spaending", "Dyb spænding", spaending),
    ("mork", "Mørk puls", mork),
    ("tikken", "Ur der tikker", ur),
    ("hjerte", "Hjerteslag", hjerte),
    ("hvisken", "Hviskende luft", hvisken),
    ("rister", "Stigende spænding", riser),
    ("trommehvirvel", "Trommehvirvel", trommehvirvel),
    ("boom", "Dramatisk stød", boom),
    ("sting", "Drama-sting", sting),
    ("cymbal", "Bækken-svulm", cymbal),
    ("mystik", "Mystisk tema", mystik),
    ("quizintro", "Quiz-intro", quizintro),
    ("vinder", "Sejr", vinder),
    ("forkert", "Forkert svar", forkert),
    ("uret", "Nedtælling", uret),
    ("sirene", "Tid er gået", sirene),
]


def skriv_wav(sti, data):
    data = normaliser(data, 0.92)
    with wave.open(sti, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 32767)) for v in data))


def main():
    behold_wav = "--wav" in sys.argv
    kun = [a for a in sys.argv[1:] if not a.startswith("--")]
    os.makedirs(UD, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    samlet = 0
    for navn, titel, fn in LYDE:
        if kun and navn not in kun:
            continue
        data = fn()
        wav = os.path.join(UD, navn + ".wav")
        skriv_wav(wav, data)
        endelig = wav
        if ffmpeg and not behold_wav:
            mp3 = os.path.join(UD, navn + ".mp3")
            subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", wav,
                            "-codec:a", "libmp3lame", "-b:a", "96k", "-ac", "1", mp3], check=True)
            os.remove(wav)
            endelig = mp3
        samlet += os.path.getsize(endelig)
        print(f"{navn:14s} {titel:20s} {len(data) / SR:4.1f} s  {os.path.getsize(endelig) // 1024:4d} KB")
    print(f"i alt {samlet / 1024:.0f} KB i {UD}")


if __name__ == "__main__":
    main()
