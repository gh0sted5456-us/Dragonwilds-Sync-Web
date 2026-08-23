/* Dedicated World Builder runtime guard.
   This file intentionally provides only the minimum trusted presentation/runtime
   helpers required for home-demo.js to mount when the shared website bundle is
   unavailable or partially initialized. Normal Pages deployments still use the
   richer shared placard implementation when it is present. */
(() => {
  const mount = document.querySelector('#world-builder-demo');
  if (!mount) return;

  window.DWS_WORLD_BUILDER_RUNTIME = {
    loaded: true,
    startedAt: Date.now(),
    usingFallbackNormalize: typeof window.normalizeWorld !== 'function',
    usingFallbackCard: typeof window.createWorldCard !== 'function',
  };

  const asText = (value, fallback = '') => {
    const text = value == null ? '' : String(value).trim();
    return text || fallback;
  };
  const asList = (value) => Array.isArray(value) ? value.map((item) => asText(item)).filter(Boolean) : [];
  const asNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  if (typeof window.normalizeWorld !== 'function') {
    window.normalizeWorld = function normalizeWorldBuilderFallback(raw = {}) {
      const players = raw.players && typeof raw.players === 'object' ? raw.players : {};
      const rating = raw.rating && typeof raw.rating === 'object' ? raw.rating : {};
      const rules = asList(raw.rules || raw.community_rule_profile?.rules);
      const mods = asList(raw.mods);
      return {
        worldId: asText(raw.world_id, 'browser-draft'),
        name: asText(raw.nickname || raw.world_name || raw.name, 'Dragonwilds World'),
        authoritativeName: asText(raw.world_name || raw.name || raw.nickname, 'Dragonwilds World'),
        description: asText(raw.description, 'A Dragonwilds Sync World.'),
        region: asText(raw.region, 'Unknown'),
        countryName: asText(raw.country_name, ''),
        countryCode: asText(raw.country_code, ''),
        hosting: asText(raw.hosting, ''),
        audience: asText(raw.audience, ''),
        platform: asText(raw.platform, ''),
        contentType: asText(raw.content_type, ''),
        gameMode: asText(raw.game_mode, ''),
        version: asText(raw.version, 'CL-CURRENT'),
        status: asText(raw.status, 'online').toLowerCase(),
        currentPlayers: Math.max(0, asNumber(players.current, 0)),
        maxPlayers: Math.max(0, asNumber(players.max, 0)),
        tags: asList(raw.tags),
        mods,
        rules,
        badges: asList(raw.badges),
        ratingAverage: Math.max(0, Math.min(5, asNumber(rating.average ?? raw.rating_average, 0))),
        ratingCount: Math.max(0, Math.floor(asNumber(rating.count ?? raw.rating_count, 0))),
        placardBackground: asText(raw.placard_background, '1'),
        bannerUrl: asText(raw.banner_url, ''),
        iconUrl: asText(raw.icon_url, ''),
        originLabel: asText(raw.source_name, 'Browser World Builder'),
        community: raw.community && typeof raw.community === 'object' ? raw.community : {},
        ruleProfile: raw.community_rule_profile || { id: rules.length ? 'custom' : 'none', label: rules.length ? 'Custom Rules' : 'No Rules', rules },
        modGroups: raw.mod_groups || {},
        releaseChannel: asText(raw.release_channel, 'main'),
        lastSeen: raw.last_seen || Date.now(),
      };
    };
  }

  if (typeof window.createWorldCard !== 'function') {
    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    };

    const chips = (parent, values, empty = 'None published') => {
      const source = values && values.length ? values : [empty];
      source.slice(0, 12).forEach((value) => parent.appendChild(el('span', 'back-chip', value)));
    };

    window.createWorldCard = function createWorldBuilderFallbackCard(world) {
      const card = el('article', 'world-card world-builder-fallback-card');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');

      const inner = el('div', 'world-card-inner');
      const front = el('div', 'world-card-face world-card-front');
      const back = el('div', 'world-card-face world-card-back');

      const mode = el('div', 'world-mode-banner dedicated', world.releaseChannel === 'experimental' ? 'EXPERIMENTAL' : 'WORLD PREVIEW');
      front.appendChild(mode);

      if (world.bannerUrl) {
        const media = el('div', 'world-card-media');
        const banner = document.createElement('img');
        banner.className = 'world-card-banner';
        banner.src = world.bannerUrl;
        banner.alt = '';
        media.appendChild(banner);
        front.appendChild(media);
      }

      const body = el('div', 'world-card-body');
      const top = el('div', 'card-topline');
      const title = el('div', 'card-title');
      title.append(el('h3', '', world.name), el('small', '', world.worldId));
      top.append(title, el('span', 'status-pill online', world.status.toUpperCase()));
      body.append(top, el('div', 'card-description', world.description));

      const tagRow = el('div', 'tags');
      (world.tags.length ? world.tags : ['Browser Draft']).slice(0, 6).forEach((tag) => tagRow.appendChild(el('span', 'tag', `#${tag}`)));
      body.appendChild(tagRow);

      const badgeRow = el('div', 'badges');
      (world.badges || []).slice(0, 10).forEach((badge) => badgeRow.appendChild(el('span', 'badge', badge)));
      body.appendChild(badgeRow);

      const footer = el('div', 'card-footer');
      const metrics = el('div', 'card-metrics');
      if (world.region) metrics.appendChild(el('span', '', world.region));
      metrics.appendChild(el('span', '', `${world.currentPlayers} / ${world.maxPlayers || '—'} players`));
      footer.appendChild(metrics);
      if (world.ratingAverage || world.ratingCount) {
        const rating = el('span', 'world-rating');
        const rounded = Math.max(0, Math.min(5, Math.round(world.ratingAverage)));
        rating.append(el('span', '', `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`), el('b', '', world.ratingAverage.toFixed(1)), el('small', '', `(${world.ratingCount})`));
        footer.appendChild(rating);
      }
      footer.appendChild(el('span', 'card-flip-hint', 'DETAILS ↻'));
      body.appendChild(footer);
      front.appendChild(body);

      back.appendChild(el('div', 'world-mode-banner dedicated', 'PUBLIC DETAILS'));
      const backGrid = el('div', 'world-back-grid');
      [['Community Rules', world.rules], ['Mods', world.mods], ['Badges', world.badges], ['Tags', world.tags]].forEach(([heading, values]) => {
        const section = el('section', 'world-back-section');
        section.appendChild(el('h4', '', heading));
        const list = el('div', 'world-back-list');
        chips(list, values);
        section.appendChild(list);
        backGrid.appendChild(section);
      });
      back.appendChild(backGrid);
      const backFooter = el('div', 'world-card-footer');
      backFooter.append(el('span', '', 'Browser-authored preview'), el('b', '', 'FRONT ↻'));
      back.appendChild(backFooter);

      inner.append(front, back);
      card.appendChild(inner);
      const flip = () => {
        const flipped = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', String(flipped));
      };
      card.addEventListener('click', flip);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          flip();
        }
      });
      return card;
    };
  }

  window.addEventListener('error', (event) => {
    const loading = document.querySelector('#world-builder-loading');
    if (!loading || !loading.isConnected) return;
    const copy = loading.querySelector('p');
    if (copy) copy.textContent = `World Builder runtime error: ${event.message || 'unknown JavaScript error'}`;
  });

  window.addEventListener('unhandledrejection', (event) => {
    const loading = document.querySelector('#world-builder-loading');
    if (!loading || !loading.isConnected) return;
    const copy = loading.querySelector('p');
    const reason = event.reason?.message || String(event.reason || 'unknown promise rejection');
    if (copy) copy.textContent = `World Builder initialization failed: ${reason}`;
  });
})();
