#!/usr/bin/env python3
"""Structured-data check over the prerendered HTML. Run after `npm run build`.

Two things go wrong with a JSON-LD graph and neither shows up in a build:
an `@id` that points at a node nothing defines, and markup that claims a
figure the page doesn't show. This checks both across every prerendered page.
"""
import collections
import glob
import html
import json
import re
import sys

OUT = '.output/public'

nodes = collections.defaultdict(list)   # @id -> [(page, node)]
refs = []                               # (page, path, @id)


def walk(page, obj, path=''):
    if isinstance(obj, dict):
        node_id = obj.get('@id')
        if node_id:
            # A node with only an @id is a reference; anything more defines it.
            (nodes[node_id].append((page, obj)) if obj.get('@type') or len(obj) > 1
             else refs.append((page, path, node_id)))
        for k, v in obj.items():
            walk(page, v, f'{path}.{k}')
    elif isinstance(obj, list):
        for n, v in enumerate(obj):
            walk(page, v, f'{path}[{n}]')


def visible(src):
    body = re.sub(r'<(script|style).*?</\1>', '', src, flags=re.S)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html.unescape(body)))


pages = {}
for f in sorted(glob.glob(f'{OUT}/**/index.html', recursive=True)):
    src = open(f).read()
    blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', src, re.S)
    if not blocks:
        continue
    route = '/' + f[len(OUT) + 1:-len('index.html')].rstrip('/')
    pages[route] = [json.loads(html.unescape(b)) for b in blocks]
    for b in pages[route]:
        walk(route, b)

if not pages:
    sys.exit(f'no prerendered JSON-LD under {OUT} — run `npm run build` first')

fail = 0
print(f'{len(pages)} pages carry JSON-LD\n')

for page, path, node_id in refs:
    if node_id not in nodes:
        print(f'DANGLING  {page}{path} -> {node_id}')
        fail += 1

# One @id is one entity: it must not describe itself two different ways.
for node_id, defs in nodes.items():
    for prop in ('@type', 'name', 'url', 'headline', 'logo', 'description'):
        vals = {json.dumps(d.get(prop), sort_keys=True) for _, d in defs if prop in d}
        if len(vals) > 1:
            print(f'CONFLICT  {node_id}.{prop}: {vals}')
            fail += 1

for t in ('Organization', 'WebSite', 'Person'):
    ids = sorted({i for i, defs in nodes.items() if any(d.get('@type') == t for _, d in defs)})
    print(f'{t:13} @ids: {ids or "none"}')

for page, blocks in pages.items():
    flat = json.dumps(blocks, separators=(',', ':'))
    # Blog bylines are deliberately a bare name — a different person, with no
    # stable identity to claim. The entities we own must carry an @id.
    for m in re.finditer(r'\{"@type":"(Organization|WebSite)"(.{0,12})', flat):
        if not m.group(2).startswith(',"@id"'):
            print(f'ANONYMOUS {m.group(1)} node on {page}')
            fail += 1

# Every figure in a trip's additionalProperty has to be on the page. Money is
# printed with a symbol, no separators, and cents only when there are any, so
# "560.40" on the page satisfies a JSON-LD 560.4.
print()
for f in sorted(glob.glob(f'{OUT}/t/*/index.html')):
    src = open(f).read()
    graph = json.loads(html.unescape(
        re.search(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', src, re.S).group(1)))['@graph']
    article = next(n for n in graph if n['@type'] == 'Article')
    text = visible(src)
    for prop in article.get('additionalProperty', []):
        v = prop['value']
        shown = str(v['value']) if isinstance(v, dict) else str(v)
        pattern = re.escape(shown) + ('0?' if '.' in shown else '')
        if not re.search(rf'(?<![\d.]){pattern}(?![\d])', text):
            print(f'NOT SHOWN {f.split("/")[-2]}: {prop["name"]} = {shown}')
            fail += 1

print('\n' + ('FAIL' if fail else 'OK - every @id resolves, no conflicts, every figure is on the page'))
sys.exit(1 if fail else 0)
