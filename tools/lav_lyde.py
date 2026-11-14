"""Laver Hyggespils indbyggede drama- og quiz-lyde fra bunden.

Alle lyde er syntetiseret her i scriptet – der hentes intet fra internettet, og der er
ingen tredjeparts-lydfiler. De er derfor vores egne (MIT) og må bruges frit i spillet.

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


def buf(sek):
    return [0.0] * int(SR * sek)


def blanding(dst, src, ved=0.0, gain=1.0):
    start = int(ved * SR)
    for i, v in enumerate(src):
        j = start + i
        if 0 <= j < len(dst):
            dst[j] += v * gain
    return dst


def normaliser(x, top=0.9):
    peak = max((abs(v) for v in x), default=0)
    return [v * top / peak for v in x] if peak else x


def fade(x, ind=0.01, ud=0.05):
    a, b = int(ind * SR), int(ud * SR)
    for i in range(min(a, len(x))):
        x[i] *= i / max(a, 1)
    for i in range(min(b, len(x))):
        x[-1 - i] *= i / max(b, 1)
    return x


# ---------- grundlyde ----------
def sinus(freq, sek, fase=0.0):
    return [math.sin(2 * math.pi * freq * i / SR + fase) for i in range(int(SR * sek))]


def glid(fra, til, sek, kurve=1.0):
    n = int(SR * sek)
    ud, fase = [], 0.0
    for i in range(n):
        t = (i / n) ** kurve
        f = fra + (til - fra) * t
        fase += 2 * math.pi * f / SR
        ud.append(math.sin(fase))
    return ud


def stoej(sek, fra=0.0):
    n = int(SR * sek)
    return [random.uniform(-1, 1) for _ in range(n)]


def lavpas(x, cutoff):
    a = 1 - math.exp(-2 * math.pi * cutoff / SR)
    y, ud = 0.0, []
    for v in x:
        y += a * (v - y)
        ud.append(y)
    return ud


def hoejpas(x, cutoff):
    lav = lavpas(x, cutoff)
    return [v - l for v, l in zip(x, lav)]


def knap(sek, attack=0.005, release=0.2, form=2.0):
    """Kort, hård lyd med eksponentiel udklang."""
    n = int(SR * sek)
    a = max(1, int(attack * SR))
    ud = []
    for i in range(n):
        if i < a:
            e = i / a
        else:
            e = math.exp(-form * (i - a) / max(1, n - a) * 6)
        ud.append(e)
    return ud


def klokke(freq, sek, partialer=(1.0, 2.01, 3.02, 4.07), udklang=2.2):
    ud = buf(sek)
    for k, p in enumerate(partialer):
        amp = 1.0 / (k + 1) ** 1.4
        tone = sinus(freq * p, sek)
        e = [math.exp(-udklang * (k * 0.6 + 1) * i / len(tone)) for i in range(len(tone))]
        for i, v in enumerate(tone):
            ud[i] += v * e[i] * amp
    return ud


def sum_af(*dele):
    længde = max(len(d) for d in dele)
    ud = [0.0] * længde
    for d in dele:
        for i, v in enumerate(d):
            ud[i] += v
    return ud


# ---------- de enkelte lyde ----------
def tikken():
    """Ur der tikker – 4 sekunder, kan loope."""
    ud = buf(4.0)
    for k in range(8):
        t = k * 0.5
        klik = [v * e for v, e in zip(hoejpas(stoej(0.02), 2000), knap(0.02, 0.001, 0.01, 6))]
        blanding(ud, klik, t, 0.55 if k % 2 == 0 else 0.4)
        blanding(ud, [v * e for v, e in zip(sinus(1800, 0.03), knap(0.03, 0.001, 0.01, 8))], t, 0.25)
    return ud


def hjerte():
    """Hjertelyd – 60 slag i minuttet, 4 sekunder, kan loope."""
    ud = buf(4.0)
    for slag in range(4):
        t = slag * 1.0
        for forsink, styrke in ((0.0, 1.0), (0.28, 0.65)):
            dunk = [v * e for v, e in zip(glid(70, 40, 0.22), knap(0.22, 0.006, 0.2, 3.0))]
            blanding(ud, dunk, t + forsink, 0.9 * styrke)
    return normaliser(ud, 0.8)


def spaending():
    """Dyb, langsomt stigende drone – 8 sekunder."""
    ud = buf(8.0)
    for f, g in ((55, 0.5), (82.5, 0.35), (110, 0.2)):
        tone = sinus(f, 8.0)
        for i in range(len(tone)):
            sving = 0.75 + 0.25 * math.sin(2 * math.pi * 0.12 * i / SR)
            stigning = 0.35 + 0.65 * (i / len(tone))
            ud[i] += tone[i] * g * sving * stigning
    luft = lavpas(stoej(8.0), 500)
    for i in range(len(ud)):
        ud[i] += luft[i] * 0.25 * (i / len(ud))
    return normaliser(fade(ud, 0.8, 0.8), 0.75)


def rister():
    """Spændingsrister: stiger i tonehøjde – 4 sekunder."""
    ud = buf(4.0)
    sweep = glid(180, 1400, 4.0, 2.2)
    støj = hoejpas(stoej(4.0), 1200)
    for i in range(len(ud)):
        p = i / len(ud)
        ud[i] = sweep[i] * 0.55 * p + støj[i] * 0.35 * p ** 2
    return normaliser(fade(ud, 0.05, 0.4), 0.8)


def trommehvirvel():
    """Trommehvirvel med crescendo – 4 sekunder."""
    ud = buf(4.0)
    t, i = 0.0, 0
    while t < 3.95:
        p = t / 4.0
        hast = 14 + 26 * p          # slag pr. sekund
        slag = [v * e for v, e in zip(lavpas(stoej(0.03), 4000), knap(0.03, 0.001, 0.02, 5))]
        blanding(ud, slag, t, 0.25 + 0.75 * p)
        t += 1.0 / hast
        i += 1
    return normaliser(fade(ud, 0.02, 0.15), 0.85)


def boom():
    """Dyb Pauke-lignende stød – 2 sekunder."""
    ud = buf(2.0)
    blanding(ud, [v * e for v, e in zip(glid(90, 28, 1.2, 0.6), knap(1.2, 0.004, 1.1, 2.2))], 0, 1.0)
    blanding(ud, [v * e for v, e in zip(lavpas(stoej(0.35), 900), knap(0.35, 0.001, 0.3, 4))], 0, 0.5)
    return normaliser(ud, 0.9)


def mystik():
    """Mystisk klokke-motiv i mol – 6 sekunder, kan loope."""
    ud = buf(6.0)
    toner = [(392.0, 0.0), (466.16, 0.7), (587.33, 1.4), (466.16, 2.1), (392.0, 3.2), (311.13, 4.2)]
    for f, t in toner:
        blanding(ud, klokke(f, 2.2, udklang=1.6), t, 0.55)
    return normaliser(ud, 0.7)


def quizintro():
    """Kort gameshow-agtig intro – 3 sekunder."""
    ud = buf(3.4)
    akkord = [261.63, 329.63, 392.0]
    for i, f in enumerate(akkord):
        tone = [v * e for v, e in zip(sinus(f, 1.2), knap(1.2, 0.02, 0.9, 1.6))]
        blanding(ud, tone, i * 0.09, 0.35)
    for k in range(6):
        blanding(ud, [v * e for v, e in zip(lavpas(stoej(0.08), 6000), knap(0.08, 0.001, 0.06, 5))], 1.3 + k * 0.11, 0.35)
    blanding(ud, klokke(784.0, 1.6), 1.9, 0.5)
    return normaliser(fade(ud, 0.01, 0.3), 0.85)


def vinder():
    """Kort sejrsfanfare – 3 sekunder."""
    ud = buf(3.0)
    for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
        blanding(ud, [v * e for v, e in zip(sinus(f, 0.9), knap(0.9, 0.01, 0.7, 1.4))], i * 0.16, 0.35)
        blanding(ud, klokke(f * 2, 1.0, udklang=2.5), i * 0.16, 0.12)
    return normaliser(fade(ud, 0.01, 0.4), 0.8)


def forkert():
    """Kort «forkert»-summen – 1,2 sekunder."""
    ud = buf(1.2)
    for base, t in ((220.0, 0.0), (155.56, 0.42)):
        tone = sinus(base, 0.42)
        firkant = [1.0 if v > 0 else -1.0 for v in tone]
        blanding(ud, [v * e for v, e in zip(firkant, knap(0.42, 0.01, 0.35, 1.2))], t, 0.28)
    return normaliser(ud, 0.55)


def uret():
    """Nedtællings-biip – 5 sekunder, sidste biip er længere."""
    ud = buf(5.0)
    for k in range(4):
        blanding(ud, [v * e for v, e in zip(sinus(1000, 0.12), knap(0.12, 0.002, 0.09, 3))], k * 1.0, 0.45)
    lang = [v * e for v, e in zip(sinus(880, 0.7), knap(0.7, 0.002, 0.6, 1.2))]
    blanding(ud, lang, 4.0, 0.55)
    return normaliser(ud, 0.7)


def hvisken():
    """Luftig, hviskende spænding – 6 sekunder, kan loope."""
    ud = lavpas(stoej(6.0), 900)
    ud = hoejpas(ud, 200)
    for i in range(len(ud)):
        a = 0.25 + 0.75 * (0.5 + 0.5 * math.sin(2 * math.pi * 0.18 * i / SR))
        ud[i] *= a
    return normaliser(fade(ud, 0.6, 0.6), 0.5)


def xylofon():
    """Mystisk xylofon-motiv – 5 sekunder, kan loope."""
    ud = buf(5.0)
    motiv = [(880.0, 0.0), (659.25, 0.35), (987.77, 0.7), (659.25, 1.05), (880.0, 1.6), (587.33, 2.4), (659.25, 3.0), (880.0, 3.6)]
    for f, t in motiv:
        blanding(ud, klokke(f, 0.9, partialer=(1.0, 3.0, 5.4), udklang=3.2), t, 0.45)
    return normaliser(ud, 0.7)


def sirene():
    """Alarm/sirene når tiden er gået – 2,4 sekunder."""
    ud = buf(2.4)
    for k in range(3):
        blanding(ud, glid(500, 900, 0.35, 0.5), k * 0.75, 0.5)
        blanding(ud, glid(900, 500, 0.35, 0.5), k * 0.75 + 0.38, 0.5)
    return normaliser(fade(ud, 0.02, 0.2), 0.7)


def marimba():
    """Rolig marimba-loop til baggrund – 8 sekunder."""
    ud = buf(8.0)
    toner = [(523.25, 0.0), (659.25, 0.5), (783.99, 1.0), (659.25, 1.5),
             (587.33, 2.0), (698.46, 2.5), (880.0, 3.0), (698.46, 3.5),
             (523.25, 4.0), (659.25, 4.5), (783.99, 5.0), (1046.5, 5.5)]
    for f, t in toner:
        blanding(ud, klokke(f, 1.2, partialer=(1.0, 4.0), udklang=2.8), t, 0.3)
    return normaliser(fade(ud, 0.4, 0.8), 0.6)


LYDE = [
    ("tikken", "Ur der tikker", tikken),
    ("hjerte", "Hjerteslag", hjerte),
    ("spaending", "Dyb spænding", spaending),
    ("rister", "Stigende spænding", rister),
    ("trommehvirvel", "Trommehvirvel", trommehvirvel),
    ("boom", "Dyb Pauke", boom),
    ("mystik", "Mystisk klokke", mystik),
    ("quizintro", "Quiz-intro", quizintro),
    ("vinder", "Sejr", vinder),
    ("forkert", "Forkert svar", forkert),
    ("uret", "Nedtælling", uret),
    ("hvisken", "Hviskende luft", hvisken),
    ("xylofon", "Xylofon-motiv", xylofon),
    ("sirene", "Tid er gået", sirene),
    ("marimba", "Rolig marimba", marimba),
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
    os.makedirs(UD, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    samlet = 0
    for navn, titel, fn in LYDE:
        data = fn()
        wav = os.path.join(UD, navn + ".wav")
        skriv_wav(wav, data)
        endelig = wav
        if ffmpeg and not behold_wav:
            mp3 = os.path.join(UD, navn + ".mp3")
            subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", wav,
                            "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", mp3], check=True)
            os.remove(wav)
            endelig = mp3
        samlet += os.path.getsize(endelig)
        print(f"{navn:14s} {titel:20s} {len(data) / SR:4.1f} s  {os.path.getsize(endelig) // 1024:4d} KB")
    print(f"i alt {samlet / 1024:.0f} KB i {UD}")


if __name__ == "__main__":
    main()
