"""Tjekker at blueprintet til spændingslyset er gyldigt YAML og hænger sammen.

Home Assistant læser blueprintet som YAML med `!input`-mærker. Her tjekkes:
- at filen kan parses (med !input som almindelige mærker),
- at blueprint.name, .domain og .input findes,
- at hvert `!input x` faktisk er defineret i input,
- at der er både trigger og action.

Kør: python tools/tjek_blueprint.py
"""
import os
import re
import sys

try:
    import yaml
except ImportError:  # CI installerer PyYAML; lokalt kan den mangle
    print("PyYAML mangler – kør: python -m pip install pyyaml")
    sys.exit(2)

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STI = os.path.join(ROD, "blueprints", "automation", "hyggespil", "spaending.yaml")


class Loader(yaml.SafeLoader):
    """SafeLoader der accepterer Home Assistants !input-mærke."""


Loader.add_multi_constructor("!", lambda loader, suffix, node: None)


def main() -> None:
    tekst = open(STI, encoding="utf-8").read()
    fejl = []
    try:
        data = yaml.load(tekst, Loader=Loader)
    except yaml.YAMLError as e:
        print(f"FEJL: blueprintet kan ikke læses som YAML: {e}")
        sys.exit(1)

    bp = (data or {}).get("blueprint") or {}
    if not bp.get("name"):
        fejl.append("blueprint.name mangler")
    if bp.get("domain") != "automation":
        fejl.append("blueprint.domain skal være 'automation'")
    inputs = bp.get("input") or {}
    if not inputs:
        fejl.append("blueprint.input mangler")
    for paakraevet in ("trigger", "action"):
        if paakraevet not in (data or {}):
            fejl.append(f"'{paakraevet}' mangler i blueprintet")
    brugte = set(re.findall(r"!input\s+([A-Za-z0-9_]+)", tekst))
    ukendte = sorted(brugte - set(inputs))
    if ukendte:
        fejl.append("!input peger på felter, der ikke er defineret: " + ", ".join(ukendte))
    ubrugte = sorted(set(inputs) - brugte)
    if ubrugte:
        fejl.append("felter i input bruges ikke i blueprintet: " + ", ".join(ubrugte))
    if not any("sensor" == n for n in inputs):
        fejl.append("blueprintet mangler en sensor-input")

    if fejl:
        for f in fejl:
            print("  FEJL: " + f)
        sys.exit(1)
    print(f"OK: {os.path.basename(STI)} er gyldigt ({len(inputs)} valgmuligheder, {len(brugte)} brugt)")


if __name__ == "__main__":
    main()
