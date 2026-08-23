/* Canonical baked platform and ecosystem logo resolver for the public website. */
(() => {
  const baseCreateWorldCard = typeof createWorldCard === 'function' ? createWorldCard : null;

  function installSharedVisualLayer() {
    if (document.querySelector('link[data-dws-site-visuals]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('site-visuals.css?v=visuals-2', document.baseURI).href;
    link.dataset.dwsSiteVisuals = 'true';
    document.head.appendChild(link);
  }
  installSharedVisualLayer();

  const PLATFORMS = [
    { key: 'steam', label: 'Steam', src: 'assets/platforms/steam.svg', storeUrl: 'https://store.steampowered.com/app/1374490/RuneScape_Dragonwilds/', footerStore: true, test: /\bsteam(?:cmd)?\b/i },
    { key: 'windows', label: 'Windows', src: 'assets/platforms/windows.svg', test: /\b(?:windows|win32|win64)\b/i },
    { key: 'xbox', label: 'Xbox', src: 'assets/platforms/xbox.svg', storeUrl: 'https://www.xbox.com/en-US/games/store/runescape-dragonwilds/9p402rwr63h4', footerStore: true, test: /\b(?:xbox|xbox live|xbox network|xbox series(?: x\|s| x| s)?)\b/i },
    { key: 'playstation', label: 'PlayStation 5', src: 'assets/platforms/playstation.svg', storeUrl: 'https://store.playstation.com/en-us/concept/10017405/', footerStore: true, test: /\b(?:playstation(?: 5)?|psn|ps5|playstation network)\b/i },
    { key: 'switch2', label: 'Nintendo Switch 2', src: 'assets/platforms/switch2.svg', storeUrl: 'https://www.nintendo.com/en-gb/Games/Nintendo-Switch-2-games/RuneScape-Dragonwilds-3110764.html', footerStore: true, test: /\b(?:nintendo\s+switch\s*2|switch\s*2|switch2)\b/i },
    // Keep the older key readable for imported/public metadata, but normalize its presentation to Switch 2.
    { key: 'nintendo', normalizedKey: 'switch2', label: 'Nintendo Switch 2', src: 'assets/platforms/switch2.svg', test: /\b(?:nintendo|nintendo switch|switch)\b/i },
    { key: 'epicgames', label: 'Epic Games', src: 'assets/platforms/epicgames.svg', storeUrl: 'https://store.epicgames.com/p/runescape-dragonwilds-3a24c7', footerStore: true, test: /\b(?:epic|epic games|epicgames|epic games store)\b/i },
    { key: 'linux', label: 'Linux', src: 'assets/platforms/linux.svg', test: /\blinux\b/i },
    { key: 'discord', label: 'Discord', src: 'assets/platforms/discord.svg', test: /\b(?:discord|rsdw)\b/i },
    { key: 'nexusmods', label: 'Nexus Mods', src: 'assets/platforms/nexusmods.svg', test: /\b(?:nexus|nexus mods|nexusmods)\b/i },
    { key: 'ue4ss', label: 'UE4SS', src: 'assets/platforms/ue4ss.png', test: /\bue4ss\b/i },
    { key: 'runeschema', label: 'RuneSchema', src: 'assets/platforms/runeschema.png', test: /\brune\s*schema\b|\bruneschema\b/i },
    { key: 'paks', label: 'PAKs', src: 'assets/platforms/paks.svg', test: /\bpaks?\b|\.pak\b|\.utoc\b|\.ucas\b/i },
  ];

  const byLabel = (value) => PLATFORMS.find((entry) => entry.test.test(String(value || '').trim())) || null;
  const publicEntry = (entry) => entry ? {
    key: entry.normalizedKey || entry.key,
    legacyKey: entry.normalizedKey ? entry.key : undefined,
    label: entry.label,
    src: entry.src,
    storeUrl: entry.storeUrl || '',
    footerStore: Boolean(entry.footerStore),
  } : null;

  window.DWS_PLATFORM_ASSETS = Object.freeze({
    list: PLATFORMS.map((entry) => Object.freeze(publicEntry(entry))),
    resolve(value) {
      return publicEntry(byLabel(value));
    },
  });

  function makeLogo(entry, className = 'badge-icon badge-icon-asset badge-icon-brand') {
    const img = document.createElement('img');
    img.className = className;
    img.src = new URL(entry.src, document.baseURI).href;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.dataset.platformKey = entry.normalizedKey || entry.key;
    img.style.filter = 'none';
    img.addEventListener('error', () => {
      img.remove();
      console.warn(`[Dragonwilds Sync] Missing baked platform/ecosystem asset: ${entry.normalizedKey || entry.key} (${entry.src})`);
    }, { once: true });
    return img;
  }

  function repairBrandIcons(card) {
    card.querySelectorAll('.badge, .back-badge, .world-platform-badge, .world-detail-chip').forEach((node) => {
      const entry = byLabel(node.textContent);
      if (!entry) return;
      const canonicalKey = entry.normalizedKey || entry.key;
      const old = node.querySelector(':scope > .badge-icon, :scope > .metric-icon, :scope > .world-detail-chip-icon');
      if (old?.dataset?.platformKey === canonicalKey) return;
      old?.remove();
      node.prepend(makeLogo(entry, node.classList.contains('world-detail-chip') ? 'world-detail-chip-icon badge-icon-brand' : undefined));
      node.dataset.platformKey = canonicalKey;
    });
  }

  if (baseCreateWorldCard) {
    createWorldCard = function createWorldCardWithCanonicalPlatformAssets(world) {
      const card = baseCreateWorldCard(world);
      repairBrandIcons(card);
      return card;
    };
  }

  // The first browser-draft schema used the key `nintendo`. Keep that serialized key
  // for v1 compatibility, but present it as Nintendo Switch 2 and use the Switch 2 mark.
  function upgradeWorldBuilderSwitch2(root = document) {
    root.querySelectorAll('[data-demo-platform="nintendo"]').forEach((input) => {
      if (input.dataset.platformCanonical === 'switch2') return;
      const wrapper = input.closest('.demo-platform');
      if (!wrapper) return;
      input.dataset.label = 'Nintendo Switch 2';
      input.dataset.platformCanonical = 'switch2';
      const image = wrapper.querySelector('img');
      if (image) {
        image.src = new URL('assets/platforms/switch2.svg', document.baseURI).href;
        image.alt = '';
        image.style.filter = 'none';
      }
      const text = wrapper.querySelector('span');
      if (text) text.textContent = 'Nintendo Switch 2';
    });
  }

  function installStoreFooter() {
    const footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.platform-store-footer')) return;
    const storeEntries = PLATFORMS.filter((entry) => entry.footerStore && entry.storeUrl);
    if (!storeEntries.length) return;

    const rail = document.createElement('div');
    rail.className = 'platform-store-footer';
    const heading = document.createElement('span');
    heading.className = 'platform-store-footer-label';
    heading.textContent = 'Dragonwilds stores';
    rail.appendChild(heading);

    const links = document.createElement('div');
    links.className = 'platform-store-footer-links';
    storeEntries.forEach((entry) => {
      const link = document.createElement('a');
      link.className = 'platform-store-link';
      link.href = entry.storeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = `Open RuneScape: Dragonwilds on ${entry.label}`;
      link.setAttribute('aria-label', `RuneScape: Dragonwilds on ${entry.label}`);
      const logo = makeLogo(entry, 'platform-store-logo');
      const text = document.createElement('span');
      text.textContent = entry.label;
      link.append(logo, text);
      links.appendChild(link);
    });
    rail.appendChild(links);

    const disclaimer = footer.querySelector('p');
    if (disclaimer) footer.insertBefore(rail, disclaimer);
    else footer.appendChild(rail);
  }

  function installStoreFooterStyles() {
    if (document.querySelector('#dws-platform-store-style')) return;
    const style = document.createElement('style');
    style.id = 'dws-platform-store-style';
    style.textContent = `
      .platform-store-footer{width:100%;display:flex;align-items:center;justify-content:center;gap:13px;flex-wrap:wrap;margin:15px 0 6px;padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
      .platform-store-footer-label{font-size:9px;font-weight:850;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)}
      .platform-store-footer-links{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap}
      .platform-store-link{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:6px 9px;border:1px solid var(--line);border-radius:9px;background:var(--panel-soft);color:var(--text);text-decoration:none;transition:transform .16s ease,border-color .16s ease,background .16s ease}
      .platform-store-link:hover{transform:translateY(-1px);border-color:var(--line-strong);background:color-mix(in srgb,var(--gold) 5%,var(--panel-soft))}
      .platform-store-logo{display:block;width:20px;height:20px;object-fit:contain;filter:none!important;opacity:1!important}
      .platform-store-link span{font-size:9px;font-weight:800;white-space:nowrap}
      @media(max-width:620px){.platform-store-footer{align-items:flex-start;flex-direction:column}.platform-store-footer-links{justify-content:flex-start}.platform-store-link span{display:none}.platform-store-link{padding:7px}}
    `;
    document.head.appendChild(style);
  }

  installStoreFooterStyles();
  installStoreFooter();
  upgradeWorldBuilderSwitch2();

  const observer = new MutationObserver(() => {
    upgradeWorldBuilderSwitch2();
    installStoreFooter();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  PLATFORMS.forEach((entry) => {
    // Preload canonical assets. The legacy Nintendo alias intentionally points at Switch 2.
    if (entry.normalizedKey && PLATFORMS.some((other) => other.key === entry.normalizedKey)) return;
    const img = new Image();
    img.src = new URL(entry.src, document.baseURI).href;
    img.onerror = () => console.warn(`[Dragonwilds Sync] Required platform/ecosystem asset failed to preload: ${entry.normalizedKey || entry.key}`);
  });
})();
