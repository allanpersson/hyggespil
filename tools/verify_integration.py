# Prøver Hyggespil-integrationens logik uden Home Assistant (Home Assistants moduler er erstattet af attrapper).
# Kør:  python tools/verify_integration.py
# Dækker: syntaks, manifest, opsætningsdialog, statisk sti, panel, genindlæsning og fjernelse.
# Dækker IKKE: at en rigtig Home Assistant viser panelet – det skal prøves i en kørende installation.
import ast
import asyncio
import json
import os
import sys
import types

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = os.path.join(ROOT, "custom_components", "hyggespil")
FAIL = []


def check(name, ok, detail=""):
    print(("  OK    " if ok else "  FEJL  ") + name + ("  - " + str(detail) if detail else ""))
    if not ok:
        FAIL.append(name)


for f in ("__init__.py", "config_flow.py", "const.py"):
    try:
        ast.parse(open(os.path.join(COMP, f), encoding="utf-8").read())
        check("syntaks " + f, True)
    except SyntaxError as e:
        check("syntaks " + f, False, e)

mf = json.load(open(os.path.join(COMP, "manifest.json"), encoding="utf-8"))
keys = list(mf)
check("manifest: domain, name, derefter alfabetisk", keys[:2] == ["domain", "name"] and keys[2:] == sorted(keys[2:]), keys)
for k in ("domain", "name", "version", "documentation", "issue_tracker", "codeowners", "config_flow"):
    check("manifest har " + k, k in mf and mf[k] not in ("", None, []))
check("codeowners begynder med @", all(c.startswith("@") for c in mf["codeowners"]), mf["codeowners"])
check("domain = mappenavn", mf["domain"] == os.path.basename(COMP))
hc = json.load(open(os.path.join(ROOT, "hacs.json"), encoding="utf-8"))
check("hacs.json har name", bool(hc.get("name")))
for lang in ("en", "da"):
    t = json.load(open(os.path.join(COMP, "translations", lang + ".json"), encoding="utf-8"))
    check("oversættelse " + lang, "user" in t["config"]["step"])
check("brand/icon.png findes", os.path.isfile(os.path.join(COMP, "brand", "icon.png")))

# ---- attrapper for Home Assistant ----
calls = {"panel": [], "removed": [], "static": []}


def mod(name, **attrs):
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m


class StaticPathConfig:
    def __init__(self, url_path, path, cache_headers=True):
        self.url_path, self.path, self.cache_headers = url_path, path, cache_headers


def async_register_built_in_panel(hass, component_name, sidebar_title=None, sidebar_icon=None,
                                  sidebar_default_visible=True, frontend_url_path=None, config=None,
                                  require_admin=False, *, update=False, config_panel_domain=None,
                                  show_in_sidebar=True):
    calls["panel"].append({"component": component_name, "path": frontend_url_path, "config": config, "update": update})


def async_remove_panel(hass, frontend_url_path, *, warn_if_unknown=True):
    calls["removed"].append(frontend_url_path)


class ConfigFlow:
    def __init_subclass__(cls, domain=None, **kw):
        cls.domain = domain

    def async_create_entry(self, title, data):
        return {"type": "create_entry", "title": title, "data": data}

    def async_show_form(self, step_id, **kw):
        return {"type": "form", "step_id": step_id}


mod("homeassistant")
mod("homeassistant.core", HomeAssistant=object)
mod("homeassistant.config_entries", ConfigEntry=object, ConfigFlow=ConfigFlow, ConfigFlowResult=dict)
mod("homeassistant.components")
mod("homeassistant.components.http", StaticPathConfig=StaticPathConfig)
mod("homeassistant.components.frontend", async_register_built_in_panel=async_register_built_in_panel,
    async_remove_panel=async_remove_panel)

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(COMP))
import hyggespil as integration  # noqa: E402
from hyggespil import config_flow, const  # noqa: E402


class FakeHTTP:
    async def async_register_static_paths(self, cfgs):
        calls["static"].extend(cfgs)


class FakeHass:
    def __init__(self):
        self.data = {}
        self.http = FakeHTTP()

    async def async_add_executor_job(self, fn, *args):
        return fn(*args)


async def run():
    hass = FakeHass()
    flow = config_flow.HyggespilConfigFlow()
    check("opsætningsdialog: viser formular først", (await flow.async_step_user())["type"] == "form")
    r = await flow.async_step_user({})
    check("opsætningsdialog: opretter post uden data", r["type"] == "create_entry" and r["data"] == {})
    check("opsætningsdialog: domæne", config_flow.HyggespilConfigFlow.domain == "hyggespil")

    check("async_setup_entry lykkes", await integration.async_setup_entry(hass, object()) is True)
    s = calls["static"]
    check("én statisk sti", len(s) == 1 and s[0].url_path == const.URL_BASE, [x.url_path for x in s])
    check("statisk sti peger på integrationens www", s and os.path.isfile(os.path.join(s[0].path, "hs.html")))
    check("ingen cache-headers", s and s[0].cache_headers is False)
    p = calls["panel"]
    check("iframe-panel med spillets URL", len(p) == 1 and p[0]["component"] == "iframe"
          and p[0]["config"] == {"url": const.PANEL_URL} and p[0]["path"] == "hyggespil", p)
    check("spillets URL ligger under den statiske sti", const.PANEL_URL.startswith(const.URL_BASE + "/"))

    check("async_unload_entry lykkes", await integration.async_unload_entry(hass, object()) is True)
    check("panelet fjernes", calls["removed"] == ["hyggespil"])
    await integration.async_setup_entry(hass, object())
    check("genindlæsning: statisk sti registreres ikke to gange", len(calls["static"]) == 1)
    check("genindlæsning: panelet kommer igen", len(calls["panel"]) == 2)


asyncio.run(run())
print("\n" + ("ALT OK" if not FAIL else "FEJL: " + ", ".join(FAIL)))
sys.exit(1 if FAIL else 0)
