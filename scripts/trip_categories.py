#!/usr/bin/env python3
"""Build content/tripcategories/<slug>.md from the exported tab and its labels.

    python3 scripts/trip_categories.py <slug> [--seed seed.yaml]

Labels (a venue per bill, a category per line item) are hand-made. They live in
the output file itself, keyed by id, so re-running after `export_public_tabs`
keeps them and only recomputes the per-person totals. A bill the file doesn't
label yet takes its labels from the seed, keyed by bill description:

    "Bill description": [venue, category]                    # every item
    "Bill description": [venue, category, {item: category}]  # with exceptions

Anything still unlabelled is an error, so a new bill can't slip in uncounted.
"""
import argparse
import sys

import yaml

CATEGORIES = [
    ('accommodation', 'Accommodation'), ('flights', 'Flights'), ('getting_around', 'Transport'),
    ('activities', 'Activities'), ('food_drink', 'Food & drink'), ('alcohol', 'Alcohol'),
    ('shopping', 'Shopping'), ('other', 'Other'),
]
# The categories that make one person's total not another's.
HIGHLIGHT = {'flights', 'accommodation', 'alcohol'}
VENUES = [
    ('restaurant', 'Food & Drink out'), ('bar', 'Bar'), ('supermarket', 'Supermarket'), ('shop', 'Shop'),
    ('accommodation', 'Accommodation'), ('transport', 'Transport'), ('activity', 'Activity'), ('other', 'Other'),
]


def frontmatter(path):
    return yaml.safe_load(open(path).read().split('---')[1])


def split_exact(parts, target):
    """Round float parts to ints that sum to `target` (largest remainder)."""
    floors = {k: int(v) for k, v in parts.items()}
    short = target - sum(floors.values())
    for k in sorted(parts, key=lambda k: parts[k] - floors[k], reverse=True)[:short]:
        floors[k] += 1
    return {k: v for k, v in floors.items() if v}


def build(tab, labels, seed):
    venue_keys, cat_keys = {k for k, _ in VENUES}, {k for k, _ in CATEGORIES}
    details = {bd['id']: bd for bd in tab['bill_details']}
    bills, missing = [], []
    for b in tab['bills']:
        desc = b['description'].strip()
        entry = seed.get(desc, [])
        venue, default, over = (entry + [None, None, {}][len(entry):])[:3]
        venue = labels['venues'].get(b['id'], venue)
        items = []
        for li in details[b['id']]['line_items']:
            li_desc = li['description'].strip()
            cat = labels['items'].get(li['id']) or over.get(li_desc, default)
            if cat not in cat_keys:
                missing.append(f'{desc} / {li_desc}: category {cat!r}')
            items.append({'id': li['id'], 'description': li_desc, 'category': cat})
        if venue not in venue_keys:
            missing.append(f'{desc}: venue {venue!r}')
        bills.append({'id': b['id'], 'description': desc, 'venue': venue, 'items': items})
    if missing:
        sys.exit('Unlabelled:\n  ' + '\n  '.join(missing))

    # Per-person totals in the settlement currency. Claims are in bill currency
    # and the per-claim rate isn't exported, so each person's foreign claims are
    # scaled to land exactly on their exported `spend`.
    cat_of = {li['id']: li['category'] for b in bills for li in b['items']}
    venue_of = {b['id']: b['venue'] for b in bills}
    cur_of = {b['id']: b['currency'] for b in tab['bills']}
    home_cur = tab['settlement_currency']
    people = []
    for p in tab['people']:
        rows = [(cur_of[bd['id']] == home_cur, cat_of[li['id']], venue_of[bd['id']], c['amount'] or 0)
                for bd in tab['bill_details'] for li in bd['line_items'] for c in li['claims']
                if c['person_id'] == p['id']]
        home = sum(a for is_home, _, _, a in rows if is_home)
        foreign = sum(a for is_home, _, _, a in rows if not is_home)
        rate = (p['spend'] - home) / foreign if foreign else 0
        by_cat, by_venue = {}, {}
        for is_home, cat, venue, a in rows:
            x = a if is_home else a * rate
            by_cat[cat] = by_cat.get(cat, 0) + x
            by_venue[venue] = by_venue.get(venue, 0) + x
        order = lambda d, keys: {k: d[k] for k, _ in keys if k in d}
        people.append({
            'id': p['id'], 'name': p['name'], 'spend': p['spend'],
            'by_category': order(split_exact(by_cat, p['spend']), CATEGORIES),
            'by_venue': order(split_exact(by_venue, p['spend']), VENUES),
        })

    return {
        'slug': tab['slug'],
        'currency': home_cur,
        'categories': [{'key': k, 'label': v, **({'highlight': True} if k in HIGHLIGHT else {})}
                       for k, v in CATEGORIES],
        'venues': [{'key': k, 'label': v} for k, v in VENUES],
        'people': people,
        'bills': bills,
    }


def check():
    assert split_exact({'a': 1.5, 'b': 1.5, 'c': 0.0}, 3) == {'a': 2, 'b': 1}
    tab = {
        'slug': 't', 'settlement_currency': 'GBP',
        'people': [{'id': 'p', 'name': 'P', 'spend': 1000}],
        'bills': [{'id': 'b1', 'description': 'Dinner', 'currency': 'GBP'},
                  {'id': 'b2', 'description': 'Beer', 'currency': 'EUR'}],
        'bill_details': [
            {'id': 'b1', 'line_items': [{'id': 'i1', 'description': 'Pizza', 'claims': [{'person_id': 'p', 'amount': 600}]},
                                        {'id': 'i2', 'description': 'Wine', 'claims': [{'person_id': 'p', 'amount': 200}]}]},
            {'id': 'b2', 'line_items': [{'id': 'i3', 'description': 'Beer', 'claims': [{'person_id': 'p', 'amount': 250}]}]},
        ],
    }
    seed = {'Dinner': ['restaurant', 'food_drink', {'Wine': 'alcohol'}], 'Beer': ['bar', 'alcohol']}
    out = build(tab, {'venues': {}, 'items': {}}, seed)
    p = out['people'][0]
    assert p['by_category'] == {'food_drink': 600, 'alcohol': 400}, p
    assert p['by_venue'] == {'restaurant': 800, 'bar': 200}, p
    # Labels already in the file win over the seed.
    out = build(tab, {'venues': {'b2': 'restaurant'}, 'items': {'i3': 'food_drink'}}, seed)
    assert out['people'][0]['by_category'] == {'food_drink': 800, 'alcohol': 200}


if __name__ == '__main__':
    check()
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('--seed')
    args = ap.parse_args()

    out_path = f'content/tripcategories/{args.slug}.md'
    labels = {'venues': {}, 'items': {}}
    try:
        for b in frontmatter(out_path)['bills']:
            labels['venues'][b['id']] = b['venue']
            labels['items'].update({li['id']: li['category'] for li in b['items']})
    except FileNotFoundError:
        pass
    seed = yaml.safe_load(open(args.seed)) if args.seed else {}

    out = build(frontmatter(f'content/tripdata/{args.slug}.md'), labels, seed)
    with open(out_path, 'w') as f:
        f.write('---\n' + yaml.safe_dump(out, sort_keys=False, allow_unicode=True, width=200) + '---\n')
    for p in out['people']:
        print(p['name'], p['by_category'])
