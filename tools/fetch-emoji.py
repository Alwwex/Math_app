#!/usr/bin/env python3
"""Stáhne 3D emoji (Microsoft Fluent Emoji, licence MIT) a zmenší je do app/emoji/<klíč>.png."""
import io, pathlib, sys, urllib.parse, urllib.request
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'app' / 'emoji'
OUT.mkdir(exist_ok=True)
E = {
 # chapters
 'abacus': 'Abacus', 'chart': 'Chart increasing', 'cyclone': 'Cyclone', 'infinity': 'Infinity', 'mountain': 'Mountain',
 'package': 'Package', 'compass': 'Compass', 'numbers': 'Input numbers', 'guitar': 'Guitar', 'tornado': 'Tornado',
 'wave': 'Water wave', 'music': 'Musical notes', 'antenna': 'Satellite antenna', 'hourglass': 'Hourglass not done',
 'bell': 'Bell', 'link': 'Link', 'violin': 'Violin', 'gem': 'Gem stone', 'atom': 'Atom symbol', 'fire': 'Fire',
 'drum': 'Drum', 'coaster': 'Roller coaster', 'puzzle': 'Puzzle piece', 'galaxy': 'Milky way', 'airplane': 'Airplane',
 'ice': 'Ice', 'laptop': 'Laptop', 'snowflake': 'Snowflake', 'testtube': 'Test tube', 'die': 'Game die', 'barchart': 'Bar chart',
 'bulb': 'Light bulb',
 # ui
 'books': 'Books', 'openbook': 'Open book', 'notebook': 'Notebook', 'pencil': 'Pencil', 'memo': 'Memo', 'brain': 'Brain',
 'cards': 'Card index dividers', 'trophy': 'Trophy', 'star': 'Star', 'party': 'Party popper', 'target': 'Bullseye',
 'sparkles': 'Sparkles', 'grad': 'Graduation cap', 'wave_hand': 'Waving hand', 'lock': 'Locked', 'key': 'Key',
 'check': 'Check mark button', 'cross': 'Cross mark', 'rocket': 'Rocket', 'thinking': 'Thinking face', 'calendar': 'Calendar',
 'muscle': 'Flexed biceps', 'hundred': 'Hundred points', 'clock': 'Alarm clock', 'warning': 'Warning', 'flag': 'Chequered flag',
 'speech': 'Speech balloon', 'globe': 'Globe showing europe-africa', 'bookmark': 'Bookmark', 'magnifier': 'Magnifying glass tilted left',
 'triangle_ruler': 'Triangular ruler', 'straight_ruler': 'Straight ruler', 'crystal': 'Crystal ball', 'seedling': 'Seedling',
 'gear': 'Gear', 'medal': 'Sports medal', 'crown': 'Crown', 'moon': 'Crescent moon', 'sun': 'Sun', 'coffee': 'Hot beverage',
 # avatars
 'fox': 'Fox', 'cat': 'Cat face', 'dog': 'Dog face', 'panda': 'Panda', 'owl': 'Owl', 'unicorn': 'Unicorn', 'lion': 'Lion',
 'frog': 'Frog', 'penguin': 'Penguin', 'koala': 'Koala', 'tiger': 'Tiger face', 'rabbit': 'Rabbit face', 'bear': 'Bear',
 'octopus': 'Octopus', 'turtle': 'Turtle', 'butterfly': 'Butterfly', 'alien': 'Alien', 'robot': 'Robot',
}
fail = []
for key, name in E.items():
    dst = OUT / f'{key}.png'
    if dst.exists(): continue
    fname = name.lower().replace(' ', '_').replace('-', '-') + '_3d.png'
    url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/' + urllib.parse.quote(name) + '/3D/' + urllib.parse.quote(fname)
    try:
        data = urllib.request.urlopen(url, timeout=30).read()
        im = Image.open(io.BytesIO(data)).convert('RGBA')
        im.thumbnail((144, 144), Image.LANCZOS)
        im.save(dst, optimize=True)
    except Exception as e:
        fail.append((key, name, str(e)[:60]))
print('failed:', fail)
