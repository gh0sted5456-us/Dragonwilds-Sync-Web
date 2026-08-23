/* Public World card parity layer.
   This file is concatenated after website/script.js by the Pages workflow so it can
   extend the existing sanitizer, API normalization, filters and refresh lifecycle. */
(() => {
  const originalNormalizeWorld = normalizeWorld;

  const safeImageUrl = (value) => {
    const raw = safeText(value, '', 1200);
    if (!raw) return '';
    if (/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(raw)) return raw;
    try {
      const url = new URL(raw, window.location.href);
      if (url.origin === window.location.origin && url.protocol === window.location.protocol) return url.href;
      return url.protocol === 'https:' ? url.href : '';
    } catch (_) {
      return '';
    }
  };

  const objectValue = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const placardId = (value) => ['1','2','3','4'].includes(String(value)) ? String(value) : '1';
  const initials = (value) => safeText(value, 'DW', 80).split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join('') || 'DW';
  const textList = (value, max = 24) => {
    const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n|;/) : [];
    return source.map((item) => safeText(item, '', 180)).filter(Boolean).slice(0, max);
  };
  const communitySignal = (raw, badges) => {
    const community = objectValue(raw?.community ?? raw?.presentation?.community);
    const invite = safeText(community.discord_invite ?? community.invite_url ?? raw?.discord_invite, '', 400);
    const guild = safeText(community.discord_guild_id ?? community.guild_id ?? raw?.discord_guild_id, '', 120);
    const label = safeText(community.name ?? community.label ?? raw?.community_name, 'Discord', 80);
    const implied = badges.some((badge) => /discord|community|rsdw/i.test(badge));
    return { enabled: Boolean(invite || guild || implied), invite: /^https:\/\//i.test(invite) ? invite : '', guild, label };
  };
  const normalizeModGroups = (raw, baseMods) => {
    const source = objectValue(raw?.mod_groups ?? raw?.mods_by_family ?? raw?.mods_by_runtime);
    const groups = {
      ue4ss: textList(source.ue4ss ?? source.UE4SS, 32),
      runeschema: textList(source.runeschema ?? source.RuneSchema ?? source.rune_schema, 32),
      paks: textList(source.paks ?? source.pak ?? source.PAKs, 32),
      other: textList(source.other, 32),
    };
    const hasStructured = groups.ue4ss.length || groups.runeschema.length || groups.paks.length || groups.other.length;
    if (!hasStructured) groups.other = textList(baseMods, 32);
    return groups;
  };

  normalizeWorld = function normalizePlacardWorld(raw) {
    const base = originalNormalizeWorld(raw);
    const presentation = objectValue(raw?.presentation);
    const classification = objectValue(raw?.classification);
    const rating = objectValue(raw?.rating);
    const badges = safeList(raw?.badges ?? presentation.badges, 16);
    const name = safeText(raw?.nickname ?? raw?.display_name ?? base.name, 'Unnamed World', 90);
    const authoritativeName = safeText(raw?.world_name ?? raw?.identity?.world_name ?? base.name, name, 90);
    const hostType = safeText(raw?.host_type ?? classification.host_type ?? raw?.mode, '', 32).toLowerCase();
    const modeLabel = hostType === 'dedicated' || hostType === 'server' ? 'DEDICATED SERVER' : hostType === 'coop' || hostType === 'co-op' ? 'CO-OP' : 'SYNC WORLD';
    const modeTone = modeLabel === 'DEDICATED SERVER' ? 'dedicated' : modeLabel === 'CO-OP' ? 'coop' : 'single';
    const community = communitySignal(raw, badges);
    const ruleSource = objectValue(raw?.community_rule_profile ?? raw?.rules_profile ?? raw?.rule_profile);
    const rules = textList(ruleSource.rules ?? raw?.rules ?? raw?.community_rules ?? base.rules, 32);
    const ruleId = safeText(ruleSource.id ?? raw?.community_rule_profile_id, rules.length ? 'custom' : 'none', 40).toLowerCase();
    const audience = safeText(raw?.audience ?? classification.visibility, '', 40);
    const ruleLabel = safeText(ruleSource.label ?? raw?.community_rule_profile_label,
      ruleId === 'kids' ? 'Kids / Family Friendly' : ruleId === 'adults' ? 'Adults Only' : ruleId === 'normal' ? 'Normal' : ruleId === 'roleplay' ? 'Roleplay' : rules.length ? 'Custom Rules' : 'No Rules Published', 80);
    const mods = textList(raw?.mods ?? base.mods, 32);
    return {
      ...base,
      name,
      authoritativeName,
      rules,
      mods,
      ruleProfile: { id: ruleId, label: ruleLabel, audience: safeText(ruleSource.audience ?? audience, audience || 'general', 40), tags: textList(ruleSource.tags, 8), rules },
      modGroups: normalizeModGroups(raw, mods),
      placardBackground: placardId(raw?.placard_background ?? presentation.placard_background),
      bannerUrl: safeImageUrl(raw?.banner_url ?? raw?.banner ?? presentation.banner_url ?? presentation.banner),
      iconUrl: safeImageUrl(raw?.icon_url ?? raw?.icon ?? presentation.icon_url ?? presentation.icon),
      originLabel: safeText(raw?.source_name ?? raw?.directory_name ?? presentation.source_name, '', 90),
      countryCode: safeText(raw?.country_code ?? raw?.status?.country_code, '', 4).toUpperCase(),
      countryName: safeText(raw?.country_name ?? raw?.status?.country_name, '', 60),
      hosting: safeText(raw?.hosting ?? raw?.host_label ?? classification.hosting, '', 60),
      audience,
      platform: safeText(raw?.platform ?? classification.platform, '', 40),
      contentType: safeText(raw?.content_type ?? classification.content_type, '', 40),
      gameMode: safeText(raw?.game_mode ?? classification.game_mode, '', 40),
      modeLabel,
      modeTone,
      community,
      ratingAverage: Math.max(0, Math.min(5, safeNumber(raw?.rating_average ?? rating.average, 0))),
      ratingCount: Math.max(0, Math.floor(safeNumber(raw?.rating_count ?? rating.count, 0)))
    };
  };

  const makeImage = (className, src, alt = '') => {
    if (!src) return null;
    const img = makeEl('img', className);
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => img.remove(), { once: true });
    return img;
  };

  const tagTone = (index) => `tone-${index % 8}`;
  const appendTagSet = (container, values) => {
    values.slice(0, 5).forEach((value, index) => container.appendChild(makeEl('span', `tag ${tagTone(index)}`, `#${value}`)));
  };

  const makeBadge = (text, className = '') => makeEl('span', `badge ${className}`.trim(), text);

  function makeStatusPill(world) {
    const online = isOnline(world);
    return makeEl('span', `status-pill ${online ? 'online' : 'offline'}`, online ? 'ONLINE' : safeText(world.status, 'OFFLINE', 24).toUpperCase());
  }

  function buildBadgeRow(world) {
    const row = makeEl('div', 'badges');
    if (world.contentType) row.appendChild(makeBadge(world.contentType.toUpperCase()));
    if (world.gameMode) row.appendChild(makeBadge(world.gameMode.toUpperCase()));
    const state = buildState(world);
    row.appendChild(makeBadge(`${world.version}${state === 'current' ? ' · Current' : state === 'outdated' ? ' · Outdated' : ''}`, state === 'current' ? 'build-current' : state === 'outdated' ? 'build-outdated' : ''));
    world.badges.slice(0, 8).forEach((badge) => row.appendChild(makeBadge(badge, /discord|community|rsdw/i.test(badge) ? 'community' : '')));
    return row;
  }

  function appendCommunityMetric(container, world) {
    if (!world.community.enabled) return;
    const badge = makeEl(world.community.invite ? 'a' : 'span', 'world-community-badge');
    if (world.community.invite) {
      badge.href = world.community.invite;
      badge.target = '_blank';
      badge.rel = 'noopener noreferrer';
      badge.addEventListener('click', (event) => event.stopPropagation());
    }
    const icon = makeImage('platform-logo', 'assets/platforms/discord.svg');
    if (icon) badge.appendChild(icon);
    badge.appendChild(makeEl('b', '', 'DISCORD'));
    container.appendChild(badge);
  }

  function appendRating(container, world) {
    if (!world.ratingCount && !world.ratingAverage) return;
    const rating = makeEl('span', 'world-rating');
    const rounded = Math.max(0, Math.min(5, Math.round(world.ratingAverage)));
    rating.append(makeEl('span', '', `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`), makeEl('b', '', world.ratingCount ? world.ratingAverage.toFixed(1) : 'New'), makeEl('small', '', `(${world.ratingCount})`));
    container.appendChild(rating);
  }

  function makePlacardBackdrop(world) {
    const backdrop = makeImage('world-placard-backdrop', `assets/placards/${world.placardBackground}.png`);
    if (backdrop) backdrop.loading = 'eager';
    return backdrop;
  }

  function makeModeBanner(world, label = world.modeLabel) {
    return makeEl('div', `world-mode-banner ${world.modeTone}`, label);
  }

  function makeMedia(world) {
    const media = makeEl('div', 'world-card-media');
    const banner = makeImage('world-card-banner', world.bannerUrl);
    if (banner) media.appendChild(banner);
    else media.appendChild(makeEl('div', 'world-card-banner-fallback'));
    media.appendChild(makeEl('div', 'world-card-banner-blend'));
    return media;
  }

  function makeIcon(world) {
    const icon = makeImage('world-icon', world.iconUrl);
    if (icon) return icon;
    return makeEl('div', 'world-icon fallback', initials(world.name));
  }

  function makeFront(world) {
    const front = makeEl('div', 'world-card-face world-card-front');
    front.appendChild(makePlacardBackdrop(world));
    front.appendChild(makeModeBanner(world));
    if (world.originLabel) front.appendChild(makeEl('div', 'world-origin-banner', `DIRECTORY · ${world.originLabel}`));
    front.appendChild(makeMedia(world));

    const body = makeEl('div', 'world-card-body');
    body.appendChild(makeIcon(world));
    const topline = makeEl('div', 'card-topline');
    const title = makeEl('div', 'card-title');
    title.appendChild(makeEl('h3', '', world.name));
    title.appendChild(makeEl('small', '', world.name !== world.authoritativeName ? `World: ${world.authoritativeName}` : world.worldId));
    topline.append(title, makeStatusPill(world));
    body.appendChild(topline);
    body.appendChild(makeEl('div', 'card-description', world.description));

    const tags = makeEl('div', 'tags');
    appendTagSet(tags, world.tags.length ? world.tags : ['Public World']);
    body.appendChild(tags);
    body.appendChild(buildBadgeRow(world));

    const footer = makeEl('div', 'card-footer');
    const metrics = makeEl('div', 'card-metrics');
    const location = world.countryName || world.countryCode || world.region;
    if (location) metrics.appendChild(makeEl('span', '', location));
    if (world.hosting) metrics.appendChild(makeEl('span', '', world.hosting));
    if (world.audience) metrics.appendChild(makeEl('span', '', world.audience));
    appendCommunityMetric(metrics, world);
    metrics.appendChild(makeEl('span', '', `${world.currentPlayers} / ${world.maxPlayers || '—'} players`));
    metrics.appendChild(makeEl('span', '', `Last seen ${relativeTime(world.lastSeen)}`));
    footer.appendChild(metrics);
    appendRating(footer, world);
    footer.appendChild(makeEl('span', 'card-flip-hint', 'DETAILS ↻'));
    body.appendChild(footer);
    front.appendChild(body);
    return front;
  }

  function ensureDetailDialog() {
    let dialog = document.querySelector('#world-detail-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'world-detail-dialog';
    dialog.className = 'world-detail-dialog';
    const shell = makeEl('div', 'world-detail-dialog-shell');
    const head = makeEl('div', 'world-detail-dialog-head');
    const copy = makeEl('div', 'world-detail-dialog-title');
    copy.append(makeEl('span', '', 'WORLD DETAILS'), makeEl('h3', '', 'Details'));
    const close = makeEl('button', 'world-detail-dialog-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close details');
    head.append(copy, close);
    shell.append(head, makeEl('p', 'world-detail-dialog-description', ''), makeEl('div', 'world-detail-dialog-list'));
    dialog.appendChild(shell);
    document.body.appendChild(dialog);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    return dialog;
  }

  function openDetailDialog(world, title, description, values) {
    const dialog = ensureDetailDialog();
    dialog.querySelector('.world-detail-dialog-title span').textContent = world.name;
    dialog.querySelector('.world-detail-dialog-title h3').textContent = title;
    dialog.querySelector('.world-detail-dialog-description').textContent = description || '';
    const list = dialog.querySelector('.world-detail-dialog-list');
    list.replaceChildren();
    values.forEach((value, index) => {
      const row = makeEl('div', 'world-detail-dialog-row');
      row.append(makeEl('span', 'world-detail-dialog-index', String(index + 1)), makeEl('p', '', value));
      list.appendChild(row);
    });
    if (!values.length) list.appendChild(makeEl('p', 'world-detail-empty', 'Nothing has been published in this category.'));
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function makeDetailChip(world, label, values, description, className = '') {
    const button = makeEl('button', `world-detail-chip ${className}`.trim());
    button.type = 'button';
    button.append(makeEl('strong', '', label), makeEl('span', '', String(values.length)));
    button.setAttribute('aria-label', `Open ${label} for ${world.name}`);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDetailDialog(world, label, description, values);
    });
    return button;
  }

  function makeBackSection(heading, values, emptyText) {
    const section = makeEl('section', 'world-back-section');
    section.appendChild(makeEl('h4', '', heading));
    const list = makeEl('div', 'world-back-list');
    appendChips(list, values, emptyText);
    section.appendChild(list);
    return section;
  }

  function makeInteractiveBackSection(heading, children, emptyText) {
    const section = makeEl('section', 'world-back-section world-back-section-interactive');
    section.appendChild(makeEl('h4', '', heading));
    const list = makeEl('div', 'world-back-list world-back-detail-list');
    if (children.length) children.forEach((child) => list.appendChild(child));
    else list.appendChild(makeEl('span', 'back-chip muted', emptyText));
    section.appendChild(list);
    return section;
  }

  function modFamilyButtons(world) {
    const defs = [
      ['ue4ss', 'UE4SS', 'UE4SS runtime and Lua mods published by this World.'],
      ['runeschema', 'RuneSchema', 'RuneSchema data-driven mods published by this World.'],
      ['paks', 'PAKs', 'Cooked Unreal package mods published by this World.'],
      ['other', 'Other Mods', 'Published mods without a declared runtime family.'],
    ];
    return defs.filter(([key]) => world.modGroups[key]?.length).map(([key, label, description]) => makeDetailChip(world, label, world.modGroups[key], description, `mod-family-${key}`));
  }

  function ruleButtons(world) {
    if (!world.ruleProfile.rules.length) return [];
    return [makeDetailChip(world, world.ruleProfile.label, world.ruleProfile.rules,
      world.ruleProfile.id === 'kids' ? 'Family-friendly community rules.' : world.ruleProfile.id === 'adults' ? '18+ community rules.' : 'Published community rules.', `rule-profile-${world.ruleProfile.id}`)];
  }

  function makeBack(world) {
    const back = makeEl('div', 'world-card-face world-card-back');
    back.appendChild(makePlacardBackdrop(world));
    back.appendChild(makeModeBanner(world, 'PUBLIC DETAILS'));
    const body = makeEl('div', 'world-card-body');
    const topline = makeEl('div', 'card-topline');
    const title = makeEl('div', 'card-title');
    title.append(makeEl('h3', '', world.name), makeEl('small', '', world.worldId));
    topline.append(title, makeStatusPill(world));
    body.appendChild(topline);
    body.appendChild(makeEl('p', 'world-back-summary', world.description));

    const grid = makeEl('div', 'world-back-grid');
    grid.append(
      makeInteractiveBackSection('Mods', modFamilyButtons(world), 'None published'),
      makeInteractiveBackSection('Community Rules', ruleButtons(world), 'None published'),
      makeBackSection('Badges', world.badges, 'None'),
      makeBackSection('Tags', world.tags, 'None')
    );
    body.appendChild(grid);

    if (world.community.enabled) {
      const community = makeEl(world.community.invite ? 'a' : 'div', 'world-community-card');
      if (world.community.invite) {
        community.href = world.community.invite;
        community.target = '_blank';
        community.rel = 'noopener noreferrer';
        community.addEventListener('click', (event) => event.stopPropagation());
      }
      const icon = makeImage('', 'assets/platforms/discord.svg');
      if (icon) community.appendChild(icon);
      community.appendChild(makeEl('span', '', world.community.label || 'Discord community'));
      body.appendChild(community);
    }

    if (world.connect?.host) {
      const port = world.connect.port > 0 ? `:${world.connect.port}` : '';
      body.appendChild(makeEl('div', 'world-connect', `Public connect: ${world.connect.host}${port}`));
    }

    const footer = makeEl('div', 'card-footer');
    footer.append(makeEl('div', 'card-metrics', 'Public telemetry only — no admin access'), makeEl('span', 'card-flip-hint', 'FRONT ↻'));
    body.appendChild(footer);
    back.appendChild(body);
    return back;
  }

  createWorldCard = function createAppParityWorldCard(world) {
    const card = makeEl('article', 'world-card');
    card.tabIndex = 0;
    card.dataset.worldId = world.worldId;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${world.name}`);
    card.setAttribute('aria-pressed', 'false');
    const inner = makeEl('div', 'world-card-inner');
    inner.append(makeFront(world), makeBack(world));
    card.appendChild(inner);

    const flip = (event) => {
      if (event?.target?.closest?.('a,button,input,select,textarea')) return;
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flip(event);
      }
    });
    return card;
  };

  queueMicrotask(() => {
    try { if (Array.isArray(allWorlds) && allWorlds.length) renderWorlds(); } catch (_) {}
  });
})();
