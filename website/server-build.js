/* Dedicated-server build authority from the Steam-generated Pages artifact. */
(() => {
  let currentSteamServerBuild = '';
  const previousNormalizeWorld = normalizeWorld;

  const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const isClIdentifier = (value) => /^cl-?\d+$/i.test(String(value || '').trim());

  normalizeWorld = function normalizeSteamWorld(raw) {
    const world = previousNormalizeWorld(raw);
    return {
      ...world,
      steamBuildId: safeText(
        raw?.steam_build_id ?? raw?.server_build_id ?? raw?.steam?.buildid ?? raw?.steam?.build_id,
        '',
        48,
      ),
    };
  };

  buildState = function authoritativeBuildState(world) {
    if (currentSteamServerBuild && world?.steamBuildId) {
      return normalizeIdentifier(world.steamBuildId) === normalizeIdentifier(currentSteamServerBuild) ? 'current' : 'outdated';
    }

    // CL-XXXXX and Steam's global BuildID are intentionally separate identifiers.
    // Preserve CL comparison only when both sides are authoritative CL values.
    if (currentBuild && world?.version && isClIdentifier(currentBuild) && isClIdentifier(world.version)) {
      return normalizeIdentifier(world.version) === normalizeIdentifier(currentBuild) ? 'current' : 'outdated';
    }

    return 'unknown';
  };

  function applySteamBuildDisplay() {
    if (!currentSteamServerBuild) return;
    const stat = $('#stat-build');
    if (!stat) return;
    if (stat.textContent !== currentSteamServerBuild) stat.textContent = currentSteamServerBuild;
    const card = stat.closest('article');
    const label = card?.querySelector('span');
    const detail = card?.querySelector('small');
    if (label) label.textContent = 'SERVER BUILD';
    if (detail) detail.textContent = 'Steam public branch · dedicated server';
    if (card) card.title = `Steam AppID 4019830 · public branch BuildID ${currentSteamServerBuild}`;
  }

  async function loadSteamServerBuild() {
    try {
      const response = await fetch(`assets/server-build.json?v=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const build = safeText(data?.buildid, '', 48);
      if (!/^\d+$/.test(build)) throw new Error('Invalid Steam BuildID');
      currentSteamServerBuild = build;
      applySteamBuildDisplay();
      renderWorlds();

      const stat = $('#stat-build');
      if (stat) {
        new MutationObserver(() => applySteamBuildDisplay()).observe(stat, { childList: true, subtree: true, characterData: true });
      }
    } catch (_) {
      const card = $('#stat-build')?.closest('article');
      const detail = card?.querySelector('small');
      if (detail) detail.textContent = 'Steam build lookup unavailable';
    }
  }

  loadSteamServerBuild();
})();
