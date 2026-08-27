(() => {
  const DIRECTORY = 'https://dragonwilds-sync-directory.dragonwilds.workers.dev';
  const shell = document.querySelector('#invite-shell');
  const token = new URLSearchParams(location.search).get('invite') || '';
  const esc = (value) => { const node = document.createElement('span'); node.textContent = String(value ?? ''); return node.innerHTML; };
  const list = (value) => Array.isArray(value) ? value.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
  const chips = (values, empty = 'None published') => `<div class="invite-chips">${(values.length ? values : [empty]).map((value) => `<span>${esc(value)}</span>`).join('')}</div>`;
  const errorCopy = (code) => ({ invite_expired: ['This invitation expired.', 'Ask the World host for a new invitation.'], invite_not_found: ['Invitation not found.', 'The link may have been revoked or copied incorrectly.'], world_unavailable: ['This World is no longer available.', 'Its host may have deleted the World or withdrawn its broadcast.'], invalid_invite: ['This invitation is invalid.', 'Check that the complete link was copied.'] }[code] || ['Invitation unavailable.', 'The invitation service could not resolve this World.']);
  const initials = (name) => String(name || 'DW').split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
  const mediaUrl = (value, fallback = '') => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    if (/^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,/i.test(raw)) return raw;
    try { const url = new URL(raw, location.href); return url.protocol === 'https:' || url.origin === location.origin ? url.href : fallback; }
    catch (_) { return fallback; }
  };
  const firstMedia = (fallback, ...values) => values.map((value) => mediaUrl(value, '')).find(Boolean) || fallback;
  async function copy(value, button) { await navigator.clipboard.writeText(value); if (button) button.textContent = 'Copied'; }
  async function load() {
    if (!token) { const [title, body] = errorCopy('invalid_invite'); shell.innerHTML = `<div class="invite-error"><strong>${title}</strong><p>${body}</p><a href="servers.html">Browse Sync Worlds</a></div>`; return; }
    try {
      const response = await fetch(`${DIRECTORY}/api/v1/invites/${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { const error = new Error(payload.error || `HTTP ${response.status}`); error.code = payload.error; throw error; }
      const world = payload.world || {}, invite = payload.invite || {}, players = world.players || {};
      const active = ['online', 'starting'].includes(String(world.status || '').toLowerCase());
      const platforms = list(world.declared_platforms).map((value) => value.toUpperCase());
      const mods = Array.isArray(world.mod_summary) ? world.mod_summary.map((mod) => [mod.name || mod.key, mod.client_required ? 'Client required' : 'Server retained', mod.version].filter(Boolean).join(' · ')) : list(world.mods);
      const joinUrl = `dragonwilds-sync://join?directory=${encodeURIComponent(DIRECTORY)}&world_id=${encodeURIComponent(world.world_id || '')}`;
      const presentation = world.presentation && typeof world.presentation === 'object' ? world.presentation : {};
      const artwork = world.artwork && typeof world.artwork === 'object' ? world.artwork : {};
      const icon = firstMedia('assets/application-icon.png', world.icon_url, world.iconUrl, world.icon, presentation.icon_url, presentation.iconUrl, presentation.icon, artwork.icon_url, artwork.iconUrl, artwork.icon);
      const banner = firstMedia('', world.banner_url, world.bannerUrl, world.banner, presentation.banner_url, presentation.bannerUrl, presentation.banner, artwork.banner_url, artwork.bannerUrl, artwork.banner);
      const background = firstMedia('assets/backgrounds/world-bg-dark.webp', world.background_url, world.backgroundUrl, world.background, presentation.background_url, presentation.backgroundUrl, presentation.background, artwork.background_url, artwork.backgroundUrl, artwork.background);
      shell.innerHTML = `<header class="invite-world-hero" style="--invite-world-background:url('${esc(background)}')"><div class="invite-world-banner">${banner ? `<img src="${esc(banner)}" alt="${esc(world.world_name || 'World')} banner">` : ''}</div><div class="invite-world-hero-content"><div class="invite-world-icon"><img src="${esc(icon)}" alt="${esc(world.world_name || 'World')} icon"></div><div><div class="invite-kicker">Dragonwilds Sync World invitation</div><h1>${esc(world.world_name || 'Unnamed World')}</h1><p>${esc(world.description || 'A launcher-broadcast Dragonwilds Sync World.')}</p></div><span class="invite-status ${active ? '' : 'offline'}">${esc(world.status || 'offline')}</span></div></header><div class="invite-body"><div class="invite-metrics"><div><span>Players</span><strong>${Number(players.current || 0)} / ${Number(players.max || 0) || '—'}</strong></div><div><span>Region</span><strong>${esc(world.region || 'Unknown')}</strong></div><div><span>Build</span><strong>${esc(world.version || 'Unknown')}</strong></div><div><span>Access</span><strong>${world.password_required ? 'World Password' : 'Open'}</strong></div></div><div class="invite-grid"><section class="invite-section"><h2>Declared platforms</h2>${chips(platforms, 'PC')}</section><section class="invite-section"><h2>World rules</h2>${chips(list(world.rules))}</section><section class="invite-section"><h2>Required and retained mods</h2>${chips(mods)}</section><section class="invite-section"><h2>Tags</h2>${chips(list(world.tags))}</section></div><span class="invite-expiry">This invitation expires ${new Date(Number(invite.expires_at || 0) * 1000).toLocaleString()}.</span><div class="invite-actions"><button type="button" id="copy-invite">Copy invite</button><a href="https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases/latest" target="_blank" rel="noopener">Get Dragonwilds Sync</a><a class="primary" id="open-world" href="${esc(joinUrl)}" ${active ? '' : 'aria-disabled="true"'}>${active ? 'Open login & sync' : 'World is not ready'}</a></div><small id="join-status" class="invite-expiry" aria-live="polite"></small></div>`;
      document.querySelector('#copy-invite')?.addEventListener('click', (event) => copy(location.href, event.currentTarget).catch(() => {}));
      document.querySelector('#open-world')?.addEventListener('click', () => { const status = document.querySelector('#join-status'); if (status) status.textContent = 'Opening the World login and Sync flow in Dragonwilds Sync…'; });
    } catch (error) {
      const [title, body] = errorCopy(error.code); shell.innerHTML = `<div class="invite-error"><strong>${esc(title)}</strong><p>${esc(body)}</p><a href="servers.html">Browse Sync Worlds</a></div>`;
    }
  }
  load();
})();
