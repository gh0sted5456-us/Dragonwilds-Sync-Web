"""Validate the assembled Pages artifact, including every static local link."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

root = Path(sys.argv[1] if len(sys.argv) > 1 else '_site').resolve()
errors = []
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.nav, self.in_nav = set(), [], [], False
        self.feed(path.read_text(encoding='utf-8-sig'))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag == 'nav' and ('data-nav' in a or a.get('id') == 'main-nav'): self.in_nav = True
        if self.in_nav and tag == 'a': self.nav.append((a.get('href'), a.get('aria-current')))
        for key in ('href', 'src', 'poster'):
            if a.get(key): self.links.append(a[key])
    def handle_endtag(self, tag):
        if tag == 'nav': self.in_nav = False

pages = {p.resolve(): Page(p) for p in root.rglob('*.html')}
primary = ['index.html','downloads.html','runeschema.html','changelog.html','docs.html']
for name in primary:
    p = root / name
    assert p in pages, f'Missing public page: {name}'
    assert [href for href, _ in pages[p].nav[:5]] == primary, f'Primary navigation: {name}'
    assert (name, 'page') in pages[p].nav, f'Current page: {name}'
    text = p.read_text(encoding='utf-8-sig')
    for required in ['site-overhaul.css', 'site-overhaul.js', 'aria-controls="primary-nav"', 'id="main-content"']:
        assert required in text, f'{name}: {required}'
for path, page in pages.items():
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc or link.startswith('//'): continue
        target = (root / unquote(url.path).lstrip('/') if url.path.startswith('/') else path.parent / unquote(url.path)).resolve() if url.path else path
        if target.is_dir(): target /= 'index.html'
        if not target.is_relative_to(root) or not target.exists():
            errors.append(f'{path.relative_to(root)}: missing {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.relative_to(root)}: missing anchor {link}')
for path in root.rglob('*.json'): json.loads(path.read_text(encoding='utf-8-sig'))
for path in (root / 'assets/downloads').glob('*.zip'):
    with ZipFile(path) as archive:
        assert archive.testzip() is None, f'Corrupt archive: {path}'
        for name in archive.namelist():
            if name.endswith('.json'): json.loads(archive.read(name).decode('utf-8-sig'))
docs = pages[root / 'docs.html'].links
for destination in ['setup.html', 'setup.html#networking', 'setup.html#server', 'servers.html', 'helpy.html', 'modding.html', 'mod-packaging.html', 'mod-packaging.html#id-file', 'runeschema-authoring.html', 'tech.html', 'world-builder.html', 'testers.html']:
    assert destination in docs, f'Docs missing {destination}'
changelog = (root / 'changelog.html').read_text(encoding='utf-8-sig')
for token in ['0.6.1E Experimental','0.6.0','mods.txt','$Patch','$Clone','$Create','$Append','$Replace','/assets','/raw','/recipes','/players/appearance','/spawns','/blueprints','FModel','JSON Schema','Okaetsu','Snorkles','Jonesing4Space','Testing status']:
    assert token in changelog, f'Changelog missing {token}'
assert changelog.count('<details') >= 12
if errors: raise SystemExit('\n'.join(sorted(set(errors))))
print(f'Validated {len(pages)} HTML pages, local files/anchors, JSON, ZIPs, navigation and documentation contracts.')
