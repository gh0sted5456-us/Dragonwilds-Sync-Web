/* Live, Sync-only World directory. No game-lobby or third-party observations. */
(() => {
  const API = 'https://dragonwilds-sync-directory.dragonwilds.workers.dev/api/v1/worlds';
  const PAGE_URL = 'https://gh0sted5456-us.github.io/Dragonwilds-Sync-Web/servers.html';
  const PAGE_SIZE = 10;
  const grid = document.querySelector('#world-grid');
  const pagination = document.querySelector('#world-pagination');
  if (!grid) return;

  let worlds = [];
  let renderedSignature = '';
  let filter = 'all';
  let page = 1;
  let view = localStorage.getItem('dragonwilds-sync-public-directory-view') === 'horizontal' ? 'horizontal' : 'placards';

  const text = (value, fallback = '—') => String(value ?? '').trim() || fallback;
  const list = (value) => Array.isArray(value) ? value.map((item) => text(item, '')).filter(Boolean) : [];
  const online = (world) => ['online', 'active', 'starting', 'maintenance'].includes(text(world.status, 'offline').toLowerCase());
  const time = (seconds) => {
    const age = Math.max(0, Math.floor(Date.now() / 1000) - Number(seconds || 0));
    if (age < 60) return `${age}s ago`;
    if (age < 3600) return `${Math.floor(age / 60)}m ago`;
    if (age < 172800) return `${Math.floor(age / 3600)}h ago`;
    return `${Math.floor(age / 86400)}d ago`;
  };

  function normalize(raw) {
    const players = raw?.players && typeof raw.players === 'object' ? raw.players : {};
    const connect = raw?.public_connect && typeof raw.public_connect === 'object' ? raw.public_connect : null;
    return {
      id: text(raw?.world_id, 'unknown-world'), name: text(raw?.world_name, 'Unnamed World'),
      description: text(raw?.description, 'A launcher-broadcast Dragonwilds Sync World.'),
      region: text(raw?.region, 'Unknown'), version: text(raw?.version, 'Unknown'),
      status: text(raw?.status, 'offline').toLowerCase(), current: Number(players.current || 0),
      max: Number(players.max || 0), tags: list(raw?.tags), mods: list(raw?.mods),
      rules: list(raw?.rules), badges: list(raw?.badges), lastSeen: Number(raw?.last_seen || 0), connect,
    };
  }

  function chipSection(title, values) {
    const items = values.length ? values : ['None published'];
    return `<section class="world-back-section"><h4>${title}</h4><div class="world-back-list">${items.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}</div></section>`;
  }
  function escapeHtml(value) {
    const node = document.createElement('span'); node.textContent = text(value, ''); return node.innerHTML;
  }
  function card(world) {
    const article = document.createElement('article');
    article.className = 'world-card'; article.tabIndex = 0; article.setAttribute('role', 'button');
    const connect = world.connect?.host ? `${text(world.connect.host, '')}${world.connect.port ? `:${world.connect.port}` : ''}` : '';
    article.innerHTML = `<div class="world-card-inner">
      <div class="world-card-face world-card-front"><div class="world-card-top"><span class="world-status ${online(world) ? 'online' : ''}">${escapeHtml(world.status)}</span><span class="world-id">${escapeHtml(world.id)}</span></div>
      <h3>${escapeHtml(world.name)}</h3><p class="world-description">${escapeHtml(world.description)}</p>
      <div class="world-metrics"><div class="world-metric"><span>REGION</span><strong>${escapeHtml(world.region)}</strong></div><div class="world-metric"><span>PLAYERS</span><strong>${world.current} / ${world.max || '—'}</strong></div><div class="world-metric"><span>BUILD</span><strong>${escapeHtml(world.version)}</strong></div></div>
      <div class="world-card-tags">${(world.tags.length ? world.tags.slice(0, 5) : ['Sync broadcast']).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><div class="world-card-footer"><span data-last-seen="${world.lastSeen}">Last seen ${time(world.lastSeen)}</span><b>DETAILS ↻</b></div></div>
      <div class="world-card-face world-card-back"><div class="world-card-top"><span class="world-status">SYNC DETAILS</span><span class="world-id">${escapeHtml(world.id)}</span></div><div class="world-back-grid">${chipSection('Mods', world.mods)}${chipSection('Rules', world.rules)}${chipSection('Badges', world.badges)}${chipSection('Tags', world.tags)}</div>${connect ? `<div class="world-connect">Public connect: ${escapeHtml(connect)}</div>` : ''}<div class="world-card-footer"><span>Signed launcher heartbeat</span><b>FRONT ↻</b></div></div>
    </div>`;
    const flip = () => article.classList.toggle('flipped');
    article.addEventListener('click', flip);
    article.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); } });
    return article;
  }

  function selected() {
    const query = (document.querySelector('#world-search')?.value || '').trim().toLowerCase();
    return worlds.filter((world) => {
      const matches = filter === 'all' || (filter === 'online' && online(world)) || (filter === 'offline-sync' && !online(world)) || (filter === 'modded' && world.mods.length) || (filter === 'current' && /current/i.test(world.version));
      return matches && (!query || [world.name, world.region, world.version, ...world.tags, ...world.mods].join(' ').toLowerCase().includes(query));
    });
  }

  function render() {
    const rows = selected(); const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE)); page = Math.min(page, pages);
    grid.replaceChildren(...rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(card));
    if (!rows.length) grid.innerHTML = '<div class="directory-placeholder"><strong>No launcher-broadcast Worlds match this view.</strong><p>Try another filter, or check again when a Sync host is online.</p></div>';
    grid.classList.toggle('directory-horizontal', view === 'horizontal');
    if (pagination) {
      pagination.hidden = rows.length <= PAGE_SIZE; pagination.replaceChildren();
      if (rows.length > PAGE_SIZE) {
        const prev = document.createElement('button'); prev.textContent = '← Previous'; prev.disabled = page === 1; prev.onclick = () => { page -= 1; render(); };
        const status = document.createElement('span'); status.className = 'directory-page-status'; status.textContent = `Page ${page} of ${pages} · ${rows.length} Worlds`;
        const next = document.createElement('button'); next.textContent = 'Next →'; next.disabled = page === pages; next.onclick = () => { page += 1; render(); };
        pagination.append(prev, status, next);
      }
    }
  }

  function materialSignature(rows) {
    return JSON.stringify(rows.map(({ lastSeen, ...world }) => world));
  }

  function refreshRelativeTimes() {
    document.querySelectorAll('[data-last-seen]').forEach((node) => {
      node.textContent = `Last seen ${time(Number(node.dataset.lastSeen || 0))}`;
    });
  }

  function setDirectoryState(state, markup) {
    if (!state || state.dataset.directoryMarkup === markup) return;
    state.dataset.directoryMarkup = markup;
    state.innerHTML = markup;
  }

  async function refresh() {
    const state = document.querySelector('#directory-state');
    try {
      const response = await fetch(API, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const nextWorlds = (Array.isArray(payload.worlds) ? payload.worlds : [])
        .filter((world) => world?.is_sync_world === true && world?.directory_source === 'dragonwilds-sync').map(normalize);
      const nextSignature = materialSignature(nextWorlds);
      const changed = nextSignature !== renderedSignature;
      worlds = nextWorlds;
      setDirectoryState(state, `<span class="directory-dot"></span><div><strong>Sync directory online</strong><small>${worlds.length} signed launcher broadcast${worlds.length === 1 ? '' : 's'} received.</small></div>`);
      const active = worlds.filter(online);
      document.querySelector('#stat-worlds').textContent = String(active.length);
      document.querySelector('#stat-players').textContent = String(active.reduce((sum, world) => sum + world.current, 0));
      document.querySelector('#stat-users').textContent = '—'; document.querySelector('#stat-build').textContent = text(active[0]?.version, '—');
      const starts = Number(payload?.directory?.total_sync_world_starts); document.querySelector('#stat-total-sync-starts').textContent = Number.isFinite(starts) ? starts.toLocaleString() : '—';
      document.querySelector('#network-message').textContent = 'Live signed heartbeats from Dragonwilds Sync launchers.';
      if (changed) {
        renderedSignature = nextSignature;
        render();
      } else {
        refreshRelativeTimes();
      }
    } catch (error) {
      setDirectoryState(state, `<span class="directory-dot"></span><div><strong>Directory unavailable</strong><small>${escapeHtml(error.message || error)}</small></div>`);
      if (!worlds.length) grid.innerHTML = '<div class="directory-placeholder"><strong>The Sync directory is temporarily unavailable.</strong><p>No third-party server data will be substituted.</p></div>';
    }
  }

  document.querySelectorAll('[data-world-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.worldFilter; page = 1; document.querySelectorAll('[data-world-filter]').forEach((item) => item.classList.toggle('active', item === button)); render(); }));
  document.querySelector('#world-search')?.addEventListener('input', () => { page = 1; render(); });
  document.querySelectorAll('[data-directory-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.directoryView === 'horizontal' ? 'horizontal' : 'placards'; localStorage.setItem('dragonwilds-sync-public-directory-view', view); document.querySelectorAll('[data-directory-view]').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); render(); }));
  document.querySelector('#copy-app-directory-link')?.addEventListener('click', async () => { await navigator.clipboard.writeText(PAGE_URL); document.querySelector('#copy-app-directory-status').textContent = 'Server list link copied.'; });
  refresh(); const timer = setInterval(() => { if (!document.hidden) refresh(); }, 60000); window.addEventListener('beforeunload', () => clearInterval(timer));
})();
