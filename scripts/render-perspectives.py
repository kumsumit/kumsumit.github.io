"""Edit data/global-perspectives.json, then run python3 scripts/render-perspectives.py.
Emits static HTML so the editorial content is accessible without JavaScript.
Only add entries after checking wording, historical role, date and original source.
"""
from pathlib import Path
from html import escape
import json
import re
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
    video_segment = (f'<p class="perspective-date">Video segment: {e["videoTimestamp"]}</p>'
                     if e.get('videoTimestamp') else '')
    video = ''
    if item.get('videoId'):
        assert re.fullmatch(r'[A-Za-z0-9_-]{11}', item['videoId'])
        params = 'rel=0&amp;playsinline=1'
        watch_url = f'https://www.youtube.com/watch?v={e["videoId"]}'
        video_label = e.get('videoLabel', 'Full recording')
        if item.get('videoStart') is not None:
            start_seconds, end_seconds = int(item['videoStart']), int(item['videoEnd'])
            assert 0 <= start_seconds < end_seconds
            params = f'start={start_seconds}&amp;end={end_seconds}&amp;' + params
            watch_url += f'&amp;t={start_seconds}s'
            video_label = e['videoTimestamp']
        video = (f'<div class="perspective-video"><iframe '
                 f'src="https://www.youtube-nocookie.com/embed/{e["videoId"]}?{params}" '
                 f'title="{e["name"]} — {e["event"]}, {video_label}" '
                 'width="560" height="315" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" '
                 'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe><p class="perspective-video-fallback" hidden>Watch this recording on YouTube using the link below.</p></div>'
                 f'<a class="perspective-video-link" href="{watch_url}">Watch on YouTube · {video_label}</a>')
    additional_source = ''
    if item.get('additionalSource'):
        assert item['additionalSource'].startswith('https://')
        additional_source = (f'<a class="text-link perspective-additional-source" href="{e["additionalSource"]}">'
                             f'{e["additionalSourceLabel"]} <span aria-hidden="true">↗</span></a>')
    connection = (f'<p class="perspective-connection"><span>Kumpali editorial context</span>{e["connection"]}</p>'
                  if item.get('connection') else '')
    year = item['date'][:4]
    year_label = f'<p class="perspective-year">{year}</p>' if item.get('collection') == 'recent' else ''
    date_prefix = e.get('datePrefix', 'Published')
    label = 'Quotation'    if item['kind'] == 'quote' else 'Editorial summary'
    cards.append(f'''<article class="perspective-card" aria-labelledby="perspective-{e['id']}">
{year_label}<p class="eyebrow">{e['theme']}</p><h3 id="perspective-{e['id']}">{e['name']}</h3><p class="perspective-role">{e['role']}</p>
<p class="perspective-kind">{label}</p>{body}{video}{connection}
<footer><p class="perspective-event">{e['event']}</p><p class="perspective-date">{date_prefix} <time datetime="{e['date']}">{e['dateLabel']}</time> · {e['publisher']}</p><p class="perspective-source-type">{e['sourceType']}</p>{video_segment}<a class="text-link" href="{e['source']}" aria-label="Read original statement by {e['name']}">Read original statement <span aria-hidden="true">↗</span></a>{additional_source}</footer>
</article>''')
# Keep recent statements newest first; dates remain part of every card.
recent = sorted([(item, card) for item, card in zip(entries, cards)
                 if item.get('collection') == 'recent'], key=lambda pair: pair[0]['date'], reverse=True)
historical = [card for item, card in zip(entries, cards) if item.get('collection') != 'recent']
years = sorted({item['date'][:4] for item, _ in recent}, reverse=True)
recent_groups = []
for year in years:
    year_cards = '\n'.join(card for item, card in recent if item['date'].startswith(year))
    recent_groups.append(f'<div class="perspective-year-group"><h4>{year}</h4><div class="perspective-grid recent-perspective-grid">{year_cards}</div></div>')
rendered = ('<section class="recent-perspectives" aria-labelledby="recent-perspectives-title">'
            '<div class="perspective-subsection-intro"><p class="eyebrow">2025–2026</p>'
            '<h3 id="recent-perspectives-title">Recent Perspectives</h3>'
            '<p>Recent public statements on practical technology, digital access and opportunity for businesses of every size.</p></div>'
            + '\n'.join(recent_groups) + '</section>'
            '<section class="historical-perspectives" aria-labelledby="historical-perspectives-title">'
            '<div class="perspective-subsection-intro"><p class="eyebrow">Earlier statements · 2013–2024</p>'
            '<h3 id="historical-perspectives-title">Perspectives over time</h3>'
            '<p>Earlier voices in this continuing conversation, presented in their original context.</p></div>'
            '<div class="perspective-grid">' + '\n'.join(historical) + '</div></section>')
p = root / 'index.html'
s = p.read_text()
start = '<!-- global-perspectives:start -->'
end = '<!-- global-perspectives:end -->'
a = s.index(start) + len(start)
b = s.index(end, a)
p.write_text(s[:a] + '\n' + rendered + '\n' + s[b:])
print(f'Rendered {len(cards)} verified perspectives.')
