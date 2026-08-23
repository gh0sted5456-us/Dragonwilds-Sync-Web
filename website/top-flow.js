/* Homepage information hierarchy cleanup. */
(() => {
  const main = document.querySelector('main');
  const headerNav = document.querySelector('#main-nav:not([data-shared-nav])');
  const hero = document.querySelector('.hero');
  const network = document.querySelector('.network-section');
  const features = document.querySelector('#features');
  const webgui = document.querySelector('#webgui');
  const downloads = document.querySelector('#downloads');
  const community = document.querySelector('#community');

  // Only rewrite the landing-page navigation here. Directory and World Builder
  // pages own their own explicit navigation so page-local current-state markers
  // remain correct.
  if (headerNav && hero) {
    headerNav.innerHTML = `
      <div class="nav-home"><a href="index.html">Home <span aria-hidden="true"></span></a><div class="nav-home-menu"><a href="#webgui">WebGUI</a><a href="#downloads">Downloads</a><a href="#community">Community</a></div></div>
      <a href="world-builder.html">World Builder</a>
      <a href="servers.html">Servers</a>
      <a href="helpy.html">Helpy</a>
      <a href="launcher-preview.html">Preview Launcher</a>
      <a class="nav-github" href="https://github.com/gh0sted5456-us/Dragonwilds-Sync">GitHub <span aria-hidden="true">↗</span></a>`;
  }

  if (hero) {
    const eyebrow = hero.querySelector('.hero-copy .eyebrow');
    const heading = hero.querySelector('.hero-copy h1');
    const lede = hero.querySelector('.hero-lede');
    const meta = hero.querySelector('.hero-meta');
    const strip = hero.querySelector('.hero-strip');
    const actions = hero.querySelector('.hero-actions');

    if (eyebrow) eyebrow.innerHTML = '<span class="status-dot"></span> Dragonwilds clients · servers · mods';
    if (heading) heading.innerHTML = 'One launcher for your<br><span>Dragonwilds world.</span>';
    if (lede) lede.textContent = 'Sync clients, manage dedicated servers, keep mods aligned, discover public Worlds, and hand off securely to remote server management — without juggling separate tools.';
    if (meta) meta.innerHTML = '<span>Windows desktop</span><i></i><span>Dedicated server tools</span><i></i><span>Open source</span>';
    if (strip) strip.innerHTML = '<span>SYNC CLIENTS</span><span>RUN SERVERS</span><span>MANAGE MODS</span><span>REMOTE ADMIN</span>';

    if (actions) {
      actions.innerHTML = `
        <a class="button button-primary" href="#downloads">Download Dragonwilds Sync <span aria-hidden="true">↓</span></a>
        <a class="button button-secondary" href="world-builder.html">Build a World <span aria-hidden="true">→</span></a>
        <a class="button button-secondary" href="servers.html">Browse Servers <span aria-hidden="true">→</span></a>`;
    }
  }

  // Landing-page reading order only. The World Builder is deliberately its own page.
  if (main && hero) {
    let anchor = hero;
    [network, features, webgui, downloads, community].filter(Boolean).forEach((section) => {
      anchor.insertAdjacentElement('afterend', section);
      anchor = section;
    });
  }

  if (network && hero) {
    const heading = network.querySelector('.network-heading h2');
    const message = network.querySelector('#network-message');
    if (heading) heading.textContent = 'Network at a glance.';
    if (message && /Connecting/i.test(message.textContent || '')) message.textContent = 'Live public Worlds and server-build information.';
  }

  if (features && hero) {
    const eyebrow = features.querySelector('.section-heading .eyebrow');
    const heading = features.querySelector('.section-heading h2');
    const copy = features.querySelector('.section-heading p');
    if (eyebrow) eyebrow.textContent = 'What Dragonwilds Sync handles';
    if (heading) heading.innerHTML = 'The repetitive server work,<br>handled in one place.';
    if (copy) copy.textContent = 'The desktop application, public directory, and WebGUI share the same lifecycle and synchronization model instead of behaving like separate server managers.';
  }
})();
