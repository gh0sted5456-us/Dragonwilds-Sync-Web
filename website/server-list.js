/* Live, Sync-only World directory. No game-lobby or third-party observations. */
(() => {
  if (new URLSearchParams(location.search).get('embed') === 'launcher') document.documentElement.classList.add('embedded-directory');
  const API = 'https://dragonwilds-sync-directory.dragonwilds.workers.dev/api/v1/worlds';
  const DIRECTORY = 'https://dragonwilds-sync-directory.dragonwilds.workers.dev';
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
  const advanced = { mods: new Set() };
  const DEFAULT_ICON = 'assets/application-icon.png';
  const DEFAULT_BANNER = 'assets/demo-world-banner.svg';
  const DEFAULT_BACKGROUND = 'assets/backgrounds/world-bg-dark.webp';
  const SYNC_STATUS_ICON = 'assets/application-icon.png';
  const GAME_STATUS_ICON = 'https://raw.githubusercontent.com/gh0sted5456-us/Dragonwilds-Sync/main/renderer/assets/navigation/dragonwilds.webp';

  const text = (value, fallback = '—') => String(value ?? '').trim() || fallback;
  const list = (value) => Array.isArray(value) ? value.map((item) => text(item, '')).filter(Boolean) : [];
  const online = (world) => world.gameActive === true;
  const mediaUrl = (value, fallback) => {
    const raw = text(value, '');
    if (!raw) return fallback;
    if (/^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,/i.test(raw)) return raw;
    try {
      const url = new URL(raw, location.href);
      return url.protocol === 'https:' || url.origin === location.origin ? url.href : fallback;
    } catch (_) { return fallback; }
  };
  const firstMedia = (fallback, ...values) => {
    for (const value of values) {
      const resolved = mediaUrl(value, '');
      if (resolved) return resolved;
    }
    return fallback;
  };
  function confirmAppJoin(world, joinUrl, status) {
    document.querySelector('#app-join-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.id = 'app-join-dialog'; dialog.className = 'app-join-dialog';
    dialog.innerHTML = `<form method="dialog"><div class="app-join-kicker">Open Dragonwilds Sync</div><h2>Join ${escapeHtml(world.name)}?</h2><p>The desktop application will verify this World through the official directory, then show its login and synchronization dialog. No password is included in this website link.</p><div class="app-join-dialog-actions"><button value="cancel" type="submit">Cancel</button><button value="open" class="primary" type="submit">Open Dragonwilds Sync</button></div></form>`;
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'open') {
        if (status) status.textContent = 'Opening this World in Dragonwilds Sync…';
        window.location.assign(joinUrl);
      }
      dialog.remove();
    });
    document.body.appendChild(dialog);
    dialog.showModal();
  }
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
    const presentation = raw?.presentation && typeof raw.presentation === 'object' ? raw.presentation : {};
    const artwork = raw?.artwork && typeof raw.artwork === 'object' ? raw.artwork : {};
    const profile = raw?.profile && typeof raw.profile === 'object' ? raw.profile : {};
    const syncBroadcasting = raw?.sync_broadcasting == null
      ? text(raw?.status, 'offline').toLowerCase() !== 'offline'
      : raw.sync_broadcasting === true;
    const gameActive = raw?.game_active == null
      ? syncBroadcasting && ['online', 'active', 'starting', 'maintenance', 'stopping'].includes(text(raw?.status, 'offline').toLowerCase())
      : raw.game_active === true;
    const launcherBroadcasting = raw?.launcher_broadcasting == null ? syncBroadcasting || gameActive : raw.launcher_broadcasting === true;
    return {
      id: text(raw?.world_id, 'unknown-world'), name: text(raw?.world_name, 'Unnamed World'),
      description: text(raw?.description, 'A launcher-broadcast Dragonwilds Sync World.'),
      region: text(raw?.region, 'Unknown'), version: text(raw?.version, 'Unknown'),
      status: text(raw?.status, 'offline').toLowerCase(), current: Number(players.current || 0),
      max: Number(players.max || 0), tags: list(raw?.tags), mods: list(raw?.mods),
      rules: list(raw?.rules), badges: list(raw?.badges), lastSeen: Number(raw?.last_seen || 0), connect,
      hostOs: text(raw?.host_os, '').toLowerCase(), hostOsLabel: text(raw?.host_os_label, ''),
      passwordRequired: raw?.password_required === true,
      modSummary: Array.isArray(raw?.mod_summary) ? raw.mod_summary.filter((row) => row && typeof row === 'object') : [],
      runtimeChannels: raw?.runtime_channels && typeof raw.runtime_channels === 'object' ? raw.runtime_channels : {},
      serverCurrent: raw?.server_current === true,
      platforms: list(raw?.declared_platforms).map((value) => value.toLowerCase()),
      platformCompatibility: raw?.platform_compatibility && typeof raw.platform_compatibility === 'object' ? raw.platform_compatibility : { pc: true },
      iconUrl: firstMedia(DEFAULT_ICON, raw?.icon_url, raw?.iconUrl, raw?.icon, presentation.icon_url, presentation.iconUrl, presentation.icon, artwork.icon_url, artwork.iconUrl, artwork.icon, profile.icon_url, profile.iconUrl, profile.icon),
      bannerUrl: firstMedia(DEFAULT_BANNER, raw?.banner_url, raw?.bannerUrl, raw?.banner, presentation.banner_url, presentation.bannerUrl, presentation.banner, artwork.banner_url, artwork.bannerUrl, artwork.banner, profile.banner_url, profile.bannerUrl, profile.banner),
      backgroundUrl: firstMedia(DEFAULT_BACKGROUND, raw?.background_url, raw?.backgroundUrl, raw?.background, presentation.background_url, presentation.backgroundUrl, presentation.background, artwork.background_url, artwork.backgroundUrl, artwork.background, profile.background_url, profile.backgroundUrl, profile.background),
      syncBroadcasting, gameActive, launcherBroadcasting,
      broadcastState: text(raw?.broadcast_state, syncBroadcasting && gameActive ? 'sync-and-game' : syncBroadcasting ? 'sync-only' : gameActive ? 'game-only' : 'offline'),
      broadcastWarning: text(raw?.broadcast_warning, ''),
    };
  }

  function broadcastDescriptor(world) {
    if (world.syncBroadcasting && world.gameActive) return { key: 'sync-and-game', label: 'SYNC + DRAGONWILDS', icons: [SYNC_STATUS_ICON, GAME_STATUS_ICON] };
    if (world.syncBroadcasting) return { key: 'sync-only', label: 'SYNC ONLY', icons: [SYNC_STATUS_ICON] };
    if (world.gameActive) return { key: 'game-only', label: 'DRAGONWILDS ONLY', icons: [GAME_STATUS_ICON] };
    return { key: 'offline', label: 'OFFLINE', icons: [] };
  }

  function broadcastBadge(world) {
    const descriptor = broadcastDescriptor(world);
    const icons = descriptor.icons.map((src) => `<img src="${escapeHtml(src)}" alt="">`).join('');
    return `<span class="status-pill broadcast-status ${descriptor.key}"><span class="broadcast-status-icons">${icons}</span>${descriptor.label}</span>`;
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
    const broadcast = broadcastDescriptor(world);
    article.className = `world-card ${broadcast.key}`; article.tabIndex = 0; article.setAttribute('role', 'button');
    const connect = world.connect?.host ? `${text(world.connect.host, '')}${world.connect.port ? `:${world.connect.port}` : ''}` : '';
    const runtimes = [`UE4SS · ${text(world.runtimeChannels.ue4ss, 'Unknown')}`, `RuneSchema · ${text(world.runtimeChannels.runeschema, 'Unknown')}`];
    const hostDetails = [world.hostOsLabel || world.hostOs || 'OS not published', world.passwordRequired ? 'Password required' : 'No World Password'];
    const platforms = world.platforms.length ? world.platforms.map((value) => value.replace(/(^|[-_])\w/g, (match) => match.replace(/[-_]/, ' ').toUpperCase())) : ['PC'];
    const publishedMods = world.modSummary.length ? world.modSummary.map((mod) => {
      const name = text(mod.name || mod.key, 'Unnamed mod');
      const loader = text(mod.loader || mod.section || mod.kind, '').toUpperCase();
      const audience = mod.client_required === true ? 'CLIENT REQUIRED' : 'SERVER RETAINED';
      const version = text(mod.version, '');
      return [name, loader, audience, version].filter(Boolean).join(' · ');
    }) : world.mods;
    const joinUrl = `dragonwilds-sync://join?directory=${encodeURIComponent(DIRECTORY)}&world_id=${encodeURIComponent(world.id)}`;
    const warning = world.gameActive && !world.syncBroadcasting ? `<div class="world-broadcast-warning">${escapeHtml(world.broadcastWarning || 'Dragonwilds is active without Sync. File matching and managed joining are unavailable.')}</div>` : '';
    const joinAction = world.syncBroadcasting ? `<a class="world-join-button" href="${escapeHtml(joinUrl)}" data-world-join="1">Join in Dragonwilds Sync</a>` : '<button class="world-join-button unavailable" type="button" disabled>Sync unavailable</button>';
    const tags = (world.tags.length ? world.tags.slice(0, 5) : ['Sync broadcast']).map((tag, index) => `<span class="tag tone-${index % 8}">#${escapeHtml(tag)}</span>`).join('');
    article.innerHTML = `<div class="world-card-inner">
      <div class="world-card-face world-card-front"><img class="world-placard-backdrop" src="${escapeHtml(world.backgroundUrl)}" alt=""><div class="world-mode-banner dedicated">DEDICATED SYNC WORLD</div><div class="world-origin-banner">DRAGONWILDS SYNC NETWORK</div><div class="world-card-media"><img class="world-card-banner" src="${escapeHtml(world.bannerUrl)}" alt=""><div class="world-card-banner-blend"></div></div><div class="world-card-body"><img class="world-icon" src="${escapeHtml(world.iconUrl)}" alt=""><div class="card-topline"><div class="card-title"><h3>${escapeHtml(world.name)}</h3><small>${escapeHtml(world.id)}</small></div>${broadcastBadge(world)}</div><div class="card-description">${escapeHtml(world.description)}</div>${warning}<div class="tags">${tags}</div><div class="world-metrics"><div class="world-metric"><span>REGION</span><strong>${escapeHtml(world.region)}</strong></div><div class="world-metric"><span>PLAYERS</span><strong>${world.current} / ${world.max || '—'}</strong></div><div class="world-metric"><span>BUILD</span><strong>${escapeHtml(world.version)}</strong></div></div><div class="card-footer"><div class="card-metrics"><span data-last-seen="${world.lastSeen}">Last seen ${time(world.lastSeen)}</span></div><b class="card-flip-hint">DETAILS ↻</b></div></div></div>
      <div class="world-card-face world-card-back"><img class="world-placard-backdrop" src="${escapeHtml(world.backgroundUrl)}" alt=""><div class="world-mode-banner dedicated">SYNC DETAILS</div><div class="world-card-body"><div class="card-topline"><div class="card-title"><h3>${escapeHtml(world.name)}</h3><small>${escapeHtml(world.id)}</small></div>${broadcastBadge(world)}</div><div class="world-back-grid">${chipSection('Broadcast', [broadcast.label])}${chipSection('Mods', publishedMods)}${chipSection('Runtimes', runtimes)}${chipSection('Platforms', platforms)}${chipSection('Host', hostDetails)}${chipSection('Rules', world.rules)}${chipSection('Badges', world.badges)}${chipSection('Tags', world.tags)}</div>${warning}${connect ? `<div class="world-connect">Public connect: ${escapeHtml(connect)}</div>` : ''}<div class="world-invite-actions">${joinAction}<button class="world-share-button" type="button" data-world-share="1">Share World Invite</button></div><small class="world-share-status" aria-live="polite"></small><div class="card-footer"><span>Signed launcher heartbeat</span><b class="card-flip-hint">FRONT ↻</b></div></div></div>
    </div>`;
    article.querySelectorAll('img').forEach((image) => image.addEventListener('error', () => {
      if (image.classList.contains('world-icon')) image.src = DEFAULT_ICON;
      else if (image.classList.contains('world-card-banner')) image.src = DEFAULT_BANNER;
      else image.src = DEFAULT_BACKGROUND;
    }, { once: true }));
    const flip = () => article.classList.toggle('flipped');
    article.addEventListener('click', flip);
    article.querySelector('[data-world-join]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const status = article.querySelector('.world-share-status');
      if (!online(world)) { if (status) status.textContent = 'This World is not currently ready to join.'; return; }
      confirmAppJoin(world, joinUrl, status);
    });
    article.querySelector('[data-world-share]')?.addEventListener('click', async (event) => {
      event.stopPropagation();
      const button = event.currentTarget;
      const status = article.querySelector('.world-share-status');
      button.disabled = true; if (status) status.textContent = 'Creating an expiring invite…';
      try {
        const response = await fetch(`${DIRECTORY}/api/v1/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ world_id: world.id, expires_in_seconds: 86400 }) });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error === 'world_offline' ? 'This World must be online before it can be shared.' : payload.error || `Invite request failed (${response.status}).`);
        const inviteUrl = new URL('invite.html', PAGE_URL); inviteUrl.searchParams.set('invite', payload.token);
        if (navigator.share) {
          try { await navigator.share({ title: `${world.name} · Dragonwilds Sync`, text: `Join ${world.name} through Dragonwilds Sync.`, url: inviteUrl.href }); if (status) status.textContent = 'World invite shared.'; }
          catch (shareError) { if (shareError?.name !== 'AbortError') throw shareError; if (status) status.textContent = 'Sharing cancelled.'; }
        } else {
          await navigator.clipboard.writeText(inviteUrl.href); if (status) status.textContent = 'Invite copied. Paste it into Discord.';
        }
      } catch (error) { if (status) status.textContent = error.message || String(error); }
      finally { button.disabled = false; }
    });
    article.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); } });
    return article;
  }

  function selected() {
    const query = (document.querySelector('#world-search')?.value || '').trim().toLowerCase();
    return worlds.filter((world) => {
      const matches = filter === 'all' || (filter === 'game-active' && world.gameActive && world.syncBroadcasting) || (filter === 'sync-only' && world.syncBroadcasting && !world.gameActive) || (filter === 'game-only' && world.gameActive && !world.syncBroadcasting) || (filter === 'modded' && (world.mods.length || world.modSummary.length)) || (filter === 'current' && world.serverCurrent);
      if (!matches || (query && ![world.name, world.region, world.version, ...world.tags, ...world.mods, ...world.modSummary.map((mod) => mod.name || mod.key || '')].join(' ').toLowerCase().includes(query))) return false;
      if (world.current < Number(advanced.minPlayers || 0)) return false;
      if (advanced.openSlots && world.max > 0 && world.current >= world.max) return false;
      if (advanced.hostOs && world.hostOs !== advanced.hostOs) return false;
      if (advanced.platform && !world.platforms.includes(advanced.platform)) return false;
      if (advanced.ue4ss && text(world.runtimeChannels.ue4ss, 'unknown').toLowerCase() !== advanced.ue4ss) return false;
      if (advanced.runeschema && text(world.runtimeChannels.runeschema, 'unknown').toLowerCase() !== advanced.runeschema) return false;
      if (advanced.password === 'open' && world.passwordRequired) return false;
      if (advanced.password === 'protected' && !world.passwordRequired) return false;
      if (advanced.clientRequired && !world.modSummary.some((mod) => mod.client_required === true)) return false;
      const presentMods = new Set([...world.mods, ...world.modSummary.map((mod) => mod.name || mod.key || '')].map((name) => text(name, '').toLowerCase()));
      if ([...advanced.mods].some((name) => !presentMods.has(name))) return false;
      return true;
    });
  }

  function render() {
    const rows = selected(); const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE)); page = Math.min(page, pages);
    const resultCount = document.querySelector('#advanced-result-count'); if (resultCount) resultCount.textContent = `${rows.length} World${rows.length === 1 ? '' : 's'} match`;
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

  function refreshAdvancedChoices() {
    const osSelect = document.querySelector('#filter-server-os');
    const selectedOs = osSelect?.value || '';
    const osRows = [...new Map(worlds.filter((world) => world.hostOs).map((world) => [world.hostOs, world.hostOsLabel || world.hostOs])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    if (osSelect) {
      osSelect.innerHTML = '<option value="">Any OS</option>' + osRows.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
      osSelect.value = osRows.some(([value]) => value === selectedOs) ? selectedOs : '';
    }
    const platformSelect = document.querySelector('#filter-platform');
    const selectedPlatform = platformSelect?.value || '';
    const platformRows = [...new Set(worlds.flatMap((world) => world.platforms))].filter(Boolean).sort();
    if (platformSelect) {
      platformSelect.innerHTML = '<option value="">Any declared platform</option>' + platformRows.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value.toUpperCase())}</option>`).join('');
      platformSelect.value = platformRows.includes(selectedPlatform) ? selectedPlatform : '';
    }
    const modNames = [...new Set(worlds.flatMap((world) => [...world.mods, ...world.modSummary.map((mod) => mod.name || mod.key || '')]).map((name) => text(name, '')).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const query = (document.querySelector('#filter-mod-search')?.value || '').trim().toLowerCase();
    const visible = modNames.filter((name) => !query || name.toLowerCase().includes(query));
    const target = document.querySelector('#advanced-mod-options');
    if (target) target.innerHTML = visible.length ? visible.map((name) => `<label><input type="checkbox" data-advanced-mod="${escapeHtml(name.toLowerCase())}" ${advanced.mods.has(name.toLowerCase()) ? 'checked' : ''}><span>${escapeHtml(name)}</span></label>`).join('') : '<span class="advanced-empty">No matching published mods.</span>';
    target?.querySelectorAll('[data-advanced-mod]').forEach((input) => input.addEventListener('change', () => {
      input.checked ? advanced.mods.add(input.dataset.advancedMod) : advanced.mods.delete(input.dataset.advancedMod);
      page = 1; render();
    }));
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
        .filter((world) => world?.is_sync_world === true && world?.directory_source === 'dragonwilds-sync')
        .map(normalize).filter((world) => world.launcherBroadcasting);
      const nextSignature = materialSignature(nextWorlds);
      const changed = nextSignature !== renderedSignature;
      worlds = nextWorlds;
      refreshAdvancedChoices();
      setDirectoryState(state, `<span class="directory-dot"></span><div><strong>Sync directory online</strong><small>${worlds.length} signed launcher broadcast${worlds.length === 1 ? '' : 's'} received.</small></div>`);
      const active = worlds.filter(online);
      document.querySelector('#stat-worlds').textContent = String(worlds.length);
      document.querySelector('#stat-game-active').textContent = String(active.length);
      document.querySelector('#stat-players').textContent = String(active.reduce((sum, world) => sum + world.current, 0));
      document.querySelector('#stat-build').textContent = text(active[0]?.version || worlds[0]?.version, '—');
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
  const advancedBindings = [
    ['#filter-min-players', 'minPlayers', (value) => Math.max(0, Number(value || 0))],
    ['#filter-server-os', 'hostOs'], ['#filter-platform', 'platform'], ['#filter-ue4ss-channel', 'ue4ss'], ['#filter-runeschema-channel', 'runeschema'], ['#filter-password', 'password'],
    ['#filter-open-slots', 'openSlots', (_value, node) => node.checked], ['#filter-client-required', 'clientRequired', (_value, node) => node.checked],
  ];
  advancedBindings.forEach(([selector, key, convert]) => document.querySelector(selector)?.addEventListener('input', (event) => {
    advanced[key] = convert ? convert(event.target.value, event.target) : event.target.value;
    page = 1; render();
  }));
  document.querySelector('#filter-mod-search')?.addEventListener('input', refreshAdvancedChoices);
  document.querySelector('#reset-advanced-filters')?.addEventListener('click', () => {
    advanced.mods.clear();
    advancedBindings.forEach(([selector, key]) => {
      const node = document.querySelector(selector); if (!node) return;
      if (node.type === 'checkbox') node.checked = false; else node.value = key === 'minPlayers' ? '0' : '';
      advanced[key] = key === 'minPlayers' ? 0 : key === 'openSlots' || key === 'clientRequired' ? false : '';
    });
    const search = document.querySelector('#filter-mod-search'); if (search) search.value = '';
    refreshAdvancedChoices(); page = 1; render();
  });
  document.querySelectorAll('[data-directory-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.directoryView === 'horizontal' ? 'horizontal' : 'placards'; localStorage.setItem('dragonwilds-sync-public-directory-view', view); document.querySelectorAll('[data-directory-view]').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); render(); }));
  document.querySelector('#copy-app-directory-link')?.addEventListener('click', async () => { await navigator.clipboard.writeText(PAGE_URL); document.querySelector('#copy-app-directory-status').textContent = 'Server list link copied.'; });
  refresh(); const timer = setInterval(() => { if (!document.hidden) refresh(); }, 60000); window.addEventListener('beforeunload', () => clearInterval(timer));
})();
