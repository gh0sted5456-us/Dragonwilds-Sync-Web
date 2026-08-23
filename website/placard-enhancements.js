/* Asset-first icon enhancements layered over the app-parity World placards.
   Real SVG artwork from renderer/assets is preferred; semantic inline SVGs are
   only a fallback when the application does not ship a matching badge asset. */
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const baseCreateWorldCard = createWorldCard;

  const REAL_BADGE_ASSETS = [
    { test: /\b(?:18\+|adult|adults only|mature)\b/i, src: 'assets/platforms/adults-only.svg', kind: 'age' },
    { test: /\b(?:kid friendly|kid-friendly|family friendly|family-friendly)\b/i, src: 'assets/platforms/kid-friendly.svg', kind: 'age' },
    { test: /\b(?:nexus|nexusmods|nexus mods)\b/i, src: 'assets/platforms/nexusmods.svg', kind: 'brand' },
    { test: /\b(?:discord|community|rsdw)\b/i, src: 'assets/platforms/discord.svg', kind: 'brand' },
    { test: /\b(?:steam|steamcmd|build id|buildid|current build|outdated build)\b/i, src: 'assets/platforms/steam.svg', kind: 'brand' },
    { test: /\b(?:playstation|ps4|ps5)\b/i, src: 'assets/platforms/playstation.svg', kind: 'brand' },
    { test: /\b(?:xbox)\b/i, src: 'assets/platforms/xbox.svg', kind: 'brand' },
    { test: /\b(?:nintendo|switch)\b/i, src: 'assets/platforms/nintendo.svg', kind: 'brand' },
    { test: /\b(?:epic|epic games)\b/i, src: 'assets/platforms/epicgames.svg', kind: 'brand' },
    { test: /\b(?:modded|mods enabled|modded world)\b/i, src: 'assets/badges/modded-items.svg', kind: 'app' },
  ];

  const svgPaths = {
    shield: ['M12 2 20 5v6c0 5.2-3.4 9.3-8 11-4.6-1.7-8-5.8-8-11V5l8-3Z'],
    game: ['M7 7h10l2 5-2 5-3-2H10l-3 2-2-5 2-5Z', 'M8 12h4', 'M10 10v4', 'M15.5 11.5h.01', 'M17 13.5h.01'],
    server: ['M5 4h14v5H5z', 'M5 15h14v5H5z', 'M8 6.5h.01', 'M8 17.5h.01', 'M11 6.5h5', 'M11 17.5h5'],
    rune: ['M12 2 20 8l-3 11H7L4 8l8-6Z', 'M9 8l6 8', 'M15 8l-6 8'],
    code: ['M9 7 4 12l5 5', 'M15 7l5 5-5 5'],
    package: ['M4 7 12 3l8 4-8 4-8-4Z', 'M4 7v10l8 4 8-4V7', 'M12 11v10'],
    verified: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8 12 2.5 2.5L16 9'],
    badge: ['M12 3 15 8l6 1-4 4 .8 6L12 16l-5.8 3L7 13 3 9l6-1 3-5Z'],
    cloud: ['M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z'],
    audience: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
    players: ['M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M2 20c.5-4 2.5-6 6-6s5.5 2 6 6', 'M13 15c1-.8 2-.9 3-.9 3 0 5 1.8 6 5.9'],
    clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  };

  function makeSvgIcon(kind, className = 'badge-icon badge-icon-fallback') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(...className.split(/\s+/).filter(Boolean));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    (svgPaths[kind] || svgPaths.badge).forEach((d) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
    return svg;
  }

  function fallbackKind(label) {
    const text = String(label || '').toLowerCase();
    if (/runeschema|rune schema|\brune\b/.test(text)) return 'rune';
    if (/ue4ss|ue4|script|code/.test(text)) return 'code';
    if (/\bpak\b|paks|package/.test(text)) return 'package';
    if (/verified|sync|operator|official/.test(text)) return 'verified';
    if (/dedicated|server|host|singleplayer|co-?op/.test(text)) return 'server';
    if (/hardcore|creative|normal|custom/.test(text)) return 'game';
    if (/vanilla|public|private/.test(text)) return 'shield';
    return 'badge';
  }

  function resolveRealAsset(label) {
    const text = String(label || '').trim();
    return REAL_BADGE_ASSETS.find((entry) => entry.test.test(text)) || null;
  }

  function makeRealAssetIcon(asset, label, className = 'badge-icon badge-icon-asset') {
    const img = document.createElement('img');
    img.className = `${className} badge-icon-${asset.kind}`;
    img.src = new URL(asset.src, document.baseURI).href;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.dataset.assetSource = asset.src;
    img.addEventListener('error', () => {
      const fallback = makeSvgIcon(fallbackKind(label), className.replace('badge-icon-asset', 'badge-icon-fallback'));
      img.replaceWith(fallback);
    }, { once: true });
    return img;
  }

  function badgeIcon(label) {
    const asset = resolveRealAsset(label);
    return asset ? makeRealAssetIcon(asset, label) : makeSvgIcon(fallbackKind(label));
  }

  function prependIcon(node, icon) {
    if (!node || !icon || node.querySelector(':scope > .badge-icon, :scope > .metric-icon')) return;
    node.prepend(icon);
  }

  function enhanceBadges(card) {
    card.querySelectorAll('.badges .badge').forEach((badge) => {
      const label = badge.textContent.trim();
      const asset = resolveRealAsset(label);
      if (asset) badge.dataset.iconAsset = asset.src;
      prependIcon(badge, badgeIcon(label));
    });

    card.querySelectorAll('.world-back-section').forEach((section) => {
      if (section.querySelector('h4')?.textContent?.trim().toLowerCase() !== 'badges') return;
      section.querySelectorAll('.world-back-list > span').forEach((badge) => {
        badge.classList.add('back-badge');
        const label = badge.textContent.trim();
        const asset = resolveRealAsset(label);
        if (asset) badge.dataset.iconAsset = asset.src;
        prependIcon(badge, badgeIcon(label));
      });
    });
  }

  function makeMetricIcon(kind) {
    return makeSvgIcon(kind, 'metric-icon');
  }

  function enhanceMetrics(card, world) {
    const metrics = card.querySelector('.world-card-front .card-metrics');
    if (!metrics) return;

    const location = world.countryName || world.countryCode || world.region;
    if (location) {
      const locationNode = [...metrics.children].find((node) => node.textContent.trim() === location);
      if (locationNode && /^[A-Z]{2}$/.test(world.countryCode || '')) {
        const flag = document.createElement('img');
        flag.className = 'metric-icon country-flag';
        flag.src = new URL(`assets/flags/4x3/${world.countryCode.toLowerCase()}.svg`, document.baseURI).href;
        flag.alt = '';
        flag.decoding = 'async';
        flag.loading = 'lazy';
        flag.addEventListener('error', () => flag.remove(), { once: true });
        prependIcon(locationNode, flag);
      }
    }

    if (world.hosting) {
      const node = [...metrics.children].find((entry) => entry.textContent.trim() === world.hosting);
      prependIcon(node, makeMetricIcon('cloud'));
    }
    if (world.audience) {
      const node = [...metrics.children].find((entry) => entry.textContent.trim() === world.audience);
      prependIcon(node, badgeIcon(world.audience));
    }

    const playerNode = [...metrics.children].find((entry) => /players$/i.test(entry.textContent.trim()));
    prependIcon(playerNode, makeMetricIcon('players'));
    const lastSeenNode = [...metrics.children].find((entry) => /^Last seen /i.test(entry.textContent.trim()));
    prependIcon(lastSeenNode, makeMetricIcon('clock'));

    const platformAsset = resolveRealAsset(world.platform);
    if (world.platform && platformAsset) {
      const platformNode = makeEl('span', 'world-platform-badge', world.platform.toUpperCase());
      platformNode.prepend(makeRealAssetIcon(platformAsset, world.platform, 'metric-icon badge-icon-asset'));
      const community = metrics.querySelector('.world-community-badge');
      if (community) metrics.insertBefore(platformNode, community);
      else metrics.appendChild(platformNode);
    }
  }

  createWorldCard = function createAssetEnhancedWorldCard(world) {
    const card = baseCreateWorldCard(world);
    enhanceBadges(card);
    enhanceMetrics(card, world);
    return card;
  };

  queueMicrotask(() => {
    try { if (Array.isArray(allWorlds) && allWorlds.length) renderWorlds(); } catch (_) {}
  });
})();
