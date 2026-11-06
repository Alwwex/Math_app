#!/usr/bin/env python3
"""Sestaví kompletní sadu 3D emoji (Microsoft Fluent Emoji 3D, licence MIT) do app/emoji/u/
a rejstřík app/emoji/index.json pro výběr emoji (skupiny, anglické názvy a klíčová slova).

Zdroje (npm):  npm pack @lobehub/fluent-emoji-3d@1.1.0   a   npm pack emojibase-data@15.3.2
Použití:       python3 tools/build-emoji-set.py <složka fluent assets> <emojibase en/data.json>
"""
import json, pathlib, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'app' / 'emoji' / 'u'
OUT.mkdir(parents=True, exist_ok=True)
SKIN = {'1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'}
norm = lambda hx: '-'.join(p for p in hx.lower().split('-') if p != 'fe0f')

src = pathlib.Path(sys.argv[1])
fluent = {}
for f in src.glob('*.webp'):
    parts = f.stem.lower().split('-')
    if any(p in SKIN for p in parts):
        continue
    fluent[norm(f.stem)] = f

data = json.load(open(sys.argv[2]))
GROUPS = [('smileys-emotion', 'Smajlíci', 'Smileys'), ('people-body', 'Lidé', 'People'), ('animals-nature', 'Zvířata a příroda', 'Animals & nature'),
          ('food-drink', 'Jídlo a pití', 'Food & drink'), ('travel-places', 'Cestování', 'Travel & places'), ('activities', 'Aktivity', 'Activities'),
          ('objects', 'Předměty', 'Objects'), ('symbols', 'Symboly', 'Symbols'), ('flags', 'Vlajky', 'Flags')]
GROUP_IDX = {0: 0, 1: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8}
out, seen = [], set()
for e in sorted(data, key=lambda e: e.get('order', 1e9)):
    g = e.get('group')
    if g not in GROUP_IDX:
        continue
    key = norm(e['hexcode'])
    if key in seen or key not in fluent:
        continue
    seen.add(key)
    dst = OUT / f'{key}.webp'
    if not dst.exists():
        im = Image.open(fluent[key]).convert('RGBA')
        im.thumbnail((72, 72), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=84, method=6)
    tags = ' '.join(t for t in e.get('tags', []) if t not in e['label'])
    out.append([key, e.get('emoji') or e.get('unicode'), e['label'], GROUP_IDX[g], tags])
json.dump({'groups': [[k, cs, en] for k, cs, en in GROUPS], 'list': out}, open(ROOT / 'app' / 'emoji' / 'index.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('emoji:', len(out), 'missing in fluent:', sum(1 for e in data if e.get('group') in GROUP_IDX and norm(e['hexcode']) not in fluent))
