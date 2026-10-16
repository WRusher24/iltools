#!/usr/bin/env python3
"""Validate /data JSON against schemas and check cross-references (source_id exists, no future dates)."""
import json, sys, glob, datetime, pathlib
from jsonschema import Draft202012Validator, FormatChecker

root = pathlib.Path(__file__).resolve().parent.parent
errs = 0
def load(p): return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))
def check(data, schema_path, label):
    global errs
    v = Draft202012Validator(load(schema_path), format_checker=FormatChecker())
    for e in sorted(v.iter_errors(data), key=lambda e: list(e.path)):
        errs += 1; print(f"FAIL {label}: /{'/'.join(map(str, e.path))}: {e.message}")

src_path = root / "data/sources.json"
ids = set()
if src_path.exists():
    s = load(src_path); check(s, root / "data/sources.schema.json", "sources.json")
    ids = {x["id"] for x in s["sources"]}
    print(f"OK sources.json: {len(ids)} sources")
else:
    print("WARN no sources.json yet")

def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ("source_id", "secondary_source_ids", "source_ids"):
                for i in (v if isinstance(v, list) else [v]): yield i
            yield from walk(v)
    elif isinstance(o, list):
        for x in o: yield from walk(x)

today = datetime.date.today().isoformat()
for f in sorted(glob.glob(str(root / "data/rates/[0-9]*.json"))):
    d = load(f); check(d, root / "data/rates/schema.json", f)
    for k, p in d["parameters"].items():
        if p["accessed_on"] > today: errs += 1; print(f"FAIL {f}: {k} accessed_on in future")
    bad = {i for i in walk(d) if i not in ids}
    if bad: errs += 1; print(f"FAIL {f}: unknown source ids {sorted(bad)}")
    nulls = [k for k, p in d["parameters"].items() if p["value"] is None]
    print(f"OK {pathlib.Path(f).name}: {len(d['parameters'])} params, {len(nulls)} null/low-confidence gaps")
for f in sorted(glob.glob(str(root / "data/providers/*.json"))):
    if f.endswith("schema.json"): continue
    d = load(f); check(d, root / "data/providers/schema.json", f)
    bad = {i for i in walk(d) if i not in ids}
    if bad: errs += 1; print(f"FAIL {f}: unknown source ids {sorted(bad)}")
    print(f"OK {pathlib.Path(f).name}: {len(d['providers'])} providers")
print("RESULT:", "FAIL" if errs else "PASS", f"({errs} errors)")
sys.exit(1 if errs else 0)
