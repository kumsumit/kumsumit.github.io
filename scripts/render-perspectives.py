"""Edit data/global-perspectives.json, then run python3 scripts/render-perspectives.py.
Emits static HTML so the editorial content is accessible without JavaScript.
Only add entries after checking wording, historical role, date and original source.
"""
from pathlib import Path
from html import escape
import json
from datetime import date

root = Path(__file__).resolve().parent.parent
entries = json.loads((root / 'data/global-perspectives.json').read_text())
cards = []
seen = set()
for item in entries:
    assert item['id'] not in seen
    seen.add(item['id'])
    assert item['kind'] in ('quote', 'summary')
    date.fromisoformat(item['date'])
    assert item['source'].startswith('https://')
    e = {key: escape(value, quote=True) for key, value in item.items()}
    body = (f'<blockquote cite="{e["source"]}"><p>“{e["text"]}”</p></blockquote>'
            if item['kind'] == 'quote' else f'<p class="perspective-summary">{e["text"]}</p>')
    label = 'Quotation' if item['kind'] == 'quote' else 'Editorial summary'
    cards.append(f'''<article class="perspective-card" aria-labelledby="perspective-{e['id']}">
<p class="eyebrow">{e['theme']}</p><h3 id="perspective-{e['id']}">{e['name']}</h3><p class="perspective-role">{e['role']}</p>
<p class="perspective-kind">{label}</p>{body}
<footer><p class="perspective-event">{e['event']}</p><p class="perspective-date">Published <time datetime="{e['date']}">{e['dateLabel']}</time> · {e['publisher']}</p><p class="perspective-source-type">{e['sourceType']}</p><a class="text-link" href="{e['source']}" aria-label="Read original statement by {e['name']}">Read original statement <span aria-hidden="true">↗</span></a></footer>
</article>''')
p = root / 'index.html'
s = p.read_text()
start = '<!-- global-perspectives:start -->'
end = '<!-- global-perspectives:end -->'
a = s.index(start) + len(start)
b = s.index(end, a)
p.write_text(s[:a] + '\n' + '\n'.join(cards) + '\n' + s[b:])
print(f'Rendered {len(cards)} verified perspectives.')
