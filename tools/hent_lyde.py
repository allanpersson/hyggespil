"""Henter de indbyggede lyde fra OpenGameArt og gør dem klar til spillet.

Alle filer er valgt fordi deres licens tillader videregivelse:
  CC0            – ingen betingelser
  CC-BY 3.0/4.0  – kræver kreditering (skrives i www/lyd/CREDITS.txt og docs/lyd.md)

Kør:
    python tools/hent_lyde.py          # henter, trimmer og koder MP3
    python tools/hent_lyde.py --tjek   # viser kun hvad der ville blive gjort

Kræver ffmpeg i PATH.
"""
import json
import os
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UD = os.path.join(ROD, "custom_components", "hyggespil", "www", "lyd")
MELLEM = os.path.join(ROD, "udg", "_lyd-hent")

# navn, fil på OpenGameArt, titel, ophav, licens, licensside, klip (start, længde), loop
LYDE = [
    ("spaending", "space1_0.mp3", "Space Impending Danger SFX (space1)", "aquinn", "CC0",
     "https://opengameart.org/content/space-impending-danger-sfx", (20.0, 12.0), False),
    ("fare", "space2.mp3", "Space Impending Danger SFX (space2)", "aquinn", "CC0",
     "https://opengameart.org/content/space-impending-danger-sfx", (30.0, 12.0), False),
    ("tikken", "ticking_clock.wav", "Ticking clock", "bart", "CC0",
     "https://opengameart.org/content/ticking-clock", (0.0, 8.0), True),
    ("langsomt-ur", "Slow Office Clock Tick Sfx.wav", "Slow Office Clock Tick", "medicinestorm", "CC-BY 4.0",
     "https://opengameart.org/content/slow-clock-ticking-seamless-looping-sfx-sound-effect", (0.0, 12.0), True),
    ("hjerte", "heartbeat_slow_reverb.wav", "Heartbeat sounds (slow, reverb)", "bart", "CC0",
     "https://opengameart.org/content/heartbeat-sounds", (0.0, 1.8), True),
    ("trommer", "horde_war_drums_by_william_hector.wav", "Horde War Drums loop", "william-hector", "CC0",
     "https://opengameart.org/content/horde-war-drums-loop", (0.0, 12.0), False),
    ("sting", "mystery_sting.ogg", "Mystery Sting", "railkill", "CC0",
     "https://opengameart.org/content/mystery-sting", (0.0, 5.7), False),
    ("whoosh", "Day_1_v2.ogg", "\"Day 1\" Cinematic transition sound", "copyc4t", "CC-BY 3.0",
     "https://opengameart.org/content/day-1-cinematic-transition-sound", (0.0, 3.0), False),
    ("forkert", "caught.wav", "Wrong choice, Caught", "davidw", "CC-BY 3.0",
     "https://opengameart.org/content/wrong-choice-caught", (0.0, 0.45), False),
    ("vinder", "Win sound.wav", "Win sound effect", "listener", "CC0",
     "https://opengameart.org/content/win-sound-effect", (0.0, 4.4), False),
    ("fanfare", "sboe.wav", "Hyper-Ultra-Fanfare", "zane-little-music", "CC0",
     "https://opengameart.org/content/hyper-ultra-fanfare", (0.0, 6.1), False),
]
BASE = "https://opengameart.org/sites/default/files/"


def hent(url: str, sti: str) -> None:
    if os.path.exists(sti):
        return
    rq = urllib.request.Request(url, headers={"User-Agent": "Hyggespil/1.0 (hobby project)"})
    with urllib.request.urlopen(rq, timeout=120) as r, open(sti, "wb") as f:
        shutil.copyfileobj(r, f)


def main() -> None:
    tjek = "--tjek" in sys.argv
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg mangler i PATH")
    os.makedirs(UD, exist_ok=True)
    os.makedirs(MELLEM, exist_ok=True)
    kreditering = []
    for navn, fil, titel, ophav, licens, side, (start, længde), loop in LYDE:
        rå = os.path.join(MELLEM, fil)
        if not tjek:
            hent(BASE + urllib.parse.quote(fil), rå)
        mål = os.path.join(UD, navn + ".mp3")
        fade_ud = max(0.05, længde - 0.35)
        af = f"afade=t=in:st=0:d=0.05,afade=t=out:st={fade_ud:.2f}:d=0.3,loudnorm=I=-16:TP=-1.5:LRA=11"
        if loop:
            af = "loudnorm=I=-16:TP=-1.5:LRA=11"      # loops må ikke fade (ville give hak)
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(længde),
               "-i", rå, "-af", af, "-codec:a", "libmp3lame", "-b:a", "96k", "-ar", "44100", mål]
        print(f"{navn:14s} <- {titel:42s} {ophav:16s} {licens}")
        if not tjek:
            subprocess.run(cmd, check=True)
        kreditering.append((navn, titel, ophav, licens, side, loop))

    if tjek:
        return

    with open(os.path.join(UD, "CREDITS.txt"), "w", encoding="utf-8") as f:
        f.write("Lyde i Hyggespil\n")
        f.write("================\n\n")
        f.write("Nogle lyde kommer fra OpenGameArt og bruges under deres licens.\n")
        f.write("CC-BY kræver kreditering – den står her og i docs/lyd.md.\n\n")
        for navn, titel, ophav, licens, side, loop in kreditering:
            f.write(f"{navn}.mp3\n  Titel:   {titel}\n  Ophav:   {ophav}\n  Licens:  {licens}\n  Kilde:   {side}\n\n")
        f.write("Øvrige lyde (sirene) er syntetiseret af projektet selv og er MIT.\n")

    samlet = sum(os.path.getsize(os.path.join(UD, n + ".mp3")) for n, *_ in kreditering)
    print(f"\n{len(kreditering)} lyde, {samlet / 1024:.0f} KB i {UD}")
    print("kreditering skrevet til CREDITS.txt")


if __name__ == "__main__":
    main()
