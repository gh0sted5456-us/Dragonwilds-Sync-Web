/* Exact project-provided UE4SS and RuneSchema artwork for browser surfaces. */
(() => {
  const EXACT_ECOSYSTEM_ASSETS = Object.freeze({
    ue4ss: 'assets/platforms/ue4ss.webp',
    runeschema: 'assets/platforms/runeschema.png',
    paks: 'assets/platforms/paks.svg',
  });

  window.DWS_ECOSYSTEM_ASSETS = EXACT_ECOSYSTEM_ASSETS;

  function repair(root = document) {
    root.querySelectorAll('[data-demo-mod-family]').forEach((button) => {
      const key = String(button.dataset.demoModFamily || '').toLowerCase();
      const src = EXACT_ECOSYSTEM_ASSETS[key];
      if (!src) return;
      const image = button.querySelector('img');
      if (!image) return;
      const next = new URL(src, document.baseURI).href;
      if (image.src !== next) image.src = next;
      image.alt = '';
      image.style.filter = 'none';
      image.style.objectFit = 'contain';
      image.dataset.ecosystemAsset = key;
    });
  }

  repair();
  const observer = new MutationObserver(() => repair());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
