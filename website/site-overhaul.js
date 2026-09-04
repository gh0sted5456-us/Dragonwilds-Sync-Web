(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    document.documentElement.classList.add('nav-ready');
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { close(); toggle.focus(); } });
    document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
    matchMedia('(min-width: 821px)').addEventListener('change', close);
  }
  const history = 'https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases';
  const links = document.querySelectorAll('[data-sync-download]');
  const versions = document.querySelectorAll('[data-sync-version]');
  const dates = document.querySelectorAll('[data-sync-date]');
  if (!links.length && !versions.length && !dates.length) return;
  const trusted = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith('/gh0sted5456-us/Dragonwilds-Sync/releases/') ? url.href : history; }
    catch { return history; }
  };
  const matchers = {
    windows: name => /\.exe$/i.test(name) && !/headless|setup|installer/i.test(name),
    linux: name => /\.AppImage$/i.test(name) && !/headless/i.test(name),
    'windows-checksums': name => /windows/i.test(name) && /sha256|checksums?/i.test(name),
    'linux-checksums': name => /linux/i.test(name) && /sha256|checksums?/i.test(name)
  };
  async function hydrateRelease() {
    try {
      const response = await fetch('https://api.github.com/repos/gh0sted5456-us/Dragonwilds-Sync/releases/latest', {headers: {Accept: 'application/vnd.github+json'}, signal: AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error('Release metadata unavailable');
      const release = await response.json();
      versions.forEach(node => { node.textContent = release.tag_name || release.name || 'GitHub release'; });
      const date = new Date(release.published_at);
      dates.forEach(node => { node.textContent = release.published_at && !isNaN(date) ? date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}) : 'via GitHub'; });
      const assets = Array.isArray(release.assets) ? release.assets : [];
      links.forEach(link => {
        const kind = link.dataset.syncDownload || 'windows';
        const asset = assets.find(asset => matchers[kind]?.(String(asset.name)));
        link.href = trusted(asset?.browser_download_url || release.html_url);
        if (asset && link.href !== history) link.textContent = kind.endsWith('checksums') ? 'Download checksums' : `Download ${kind === 'linux' ? 'Linux AppImage' : 'Windows portable'} ↓`;
        else link.textContent = kind.endsWith('checksums') ? 'Check release assets for checksums' : `Find ${kind === 'linux' ? 'Linux' : 'Windows'} release assets ↗`;
      });
    } catch { links.forEach(link => { link.href = history; }); }
  }
  hydrateRelease();
})();
