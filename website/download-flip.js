/* Main download / community-thanks flip card. */
(() => {
  const downloads = document.querySelector('#downloads');
  const oldPanel = downloads?.querySelector('.download-panel');
  if (!downloads || !oldPanel) return;

  const releaseApi = 'https://api.github.com/repos/gh0sted5456-us/Dragonwilds-Sync/releases/latest';
  const flip = document.createElement('div');
  flip.className = 'download-flip reveal visible';
  flip.dataset.releaseSurface = 'true';
  flip.innerHTML = `
    <div class="download-flip-inner">
      <section class="download-face main" aria-label="Desktop application downloads" aria-hidden="false">
        <div class="download-face-main">
          <div class="eyebrow">Main · Primary release</div>
          <h2>Ready when your world is.</h2>
          <p>Download the newest published Dragonwilds Sync desktop package for Windows or Ubuntu Linux. Main is the recommended release for normal use.</p>
          <div class="download-meta"><div><span>VERSION</span><strong data-main-version>Latest</strong></div><div><span>PUBLISHED</span><strong data-main-date>GitHub Releases</strong></div><div><span>PACKAGES</span><strong>EXE + AppImage</strong></div></div>
          <p>Dragonwilds Sync is a passion project. Donations help with hosting, tools, and development costs, but features will never be locked behind a paywall.</p>
        </div>
        <div class="download-face-side">
          <div class="download-platform-icons" aria-label="Supported platforms"><img src="assets/platforms/windows.svg" alt="Windows"><img src="assets/linux-brands/ubuntu.png" alt="Ubuntu Linux"><img src="assets/platforms/steam.svg" alt="Steam"></div>
          <img src="assets/application-icon.png" alt="Dragonwilds Sync icon">
          <div class="download-platform-actions">
            <a class="button button-full windows-download" data-windows-download href="https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases"><span><img src="assets/platforms/windows.svg" alt="" aria-hidden="true"><b>Windows</b><small>Portable EXE</small></span><span aria-hidden="true">↓</span></a>
            <small class="download-file-note" data-windows-file>Resolve latest Windows package</small>
            <a class="button button-full linux-download ubuntu-download" data-linux-download href="https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases"><span><img src="assets/linux-brands/ubuntu.png" alt="" aria-hidden="true"><b>Linux</b><small>Ubuntu AppImage</small></span><span aria-hidden="true">↓</span></a>
            <small class="download-file-note" data-linux-file>Resolve latest Linux package</small>
          </div>
          <a class="text-link" href="https://github.com/gh0sted5456-us/Dragonwilds-Sync/releases">Main release history</a>
        </div>
        <button class="channel-ribbon" type="button" data-channel-flip="thanks" aria-label="Show special thanks"><span class="ribbon-dot"></span>Special Thanks <span aria-hidden="true">↻</span></button>
      </section>
      <section class="download-face thanks" aria-label="Special thanks" aria-hidden="true" inert>
        <div class="download-face-main">
          <span class="download-channel-pill">Community acknowledgements</span>
          <h2>Special thanks.</h2>
          <p>Dragonwilds Sync exists because people shared tools, knowledge, testing time, and a place for the modding community to grow.</p>
          <div class="download-credit-list">
            <div><span class="download-credit-logo"><img src="assets/runeschema-logo.png" alt="" aria-hidden="true"></span><p><strong><a href="https://github.com/UnskippableCutscene" target="_blank" rel="noopener noreferrer">Snorkles <span aria-hidden="true">↗</span></a></strong><small>Creator of RuneSchema</small></p></div>
            <div><span class="download-credit-logo"><img src="assets/rsdw-logo.png" alt="" aria-hidden="true"></span><p><strong><a href="https://github.com/RSDWArchive" target="_blank" rel="noopener noreferrer">Hi im Tat <span aria-hidden="true">↗</span></a></strong><small>Creator and maintainer of RSDW</small></p></div>
            <div><span class="download-credit-logo"><img src="assets/platforms/discord.svg" alt="" aria-hidden="true"></span><p><strong><a href="https://discord.gg/gQ7uY2cQ3q" target="_blank" rel="noopener noreferrer">Dragonwilds Modding Community <span aria-hidden="true">↗</span></a></strong><small>For the collaboration, testing, and shared knowledge</small></p></div>
          </div>
        </div>
        <div class="download-face-side download-thanks-side">
          <img src="assets/application-icon.png" alt="Dragonwilds Sync icon">
          <span>COMMUNITY BUILT</span>
          <strong>Thank you for making this ecosystem possible.</strong>
        </div>
        <button class="channel-ribbon" type="button" data-channel-flip="main" aria-label="Return to the executable download"><span class="ribbon-dot"></span>Back to Download <span aria-hidden="true">↻</span></button>
      </section>
    </div>`;

  oldPanel.replaceWith(flip);

  const setSide = (requestedSide) => {
    const showThanks = requestedSide === 'thanks';
    flip.classList.toggle('flipped', showThanks);
    const mainFace = flip.querySelector('.download-face.main');
    const thanksFace = flip.querySelector('.download-face.thanks');
    mainFace?.setAttribute('aria-hidden', String(showThanks));
    thanksFace?.setAttribute('aria-hidden', String(!showThanks));
    if (mainFace) mainFace.inert = showThanks;
    if (thanksFace) thanksFace.inert = !showThanks;
  };

  flip.querySelectorAll('[data-channel-flip]').forEach((button) => button.addEventListener('click', () => setSide(button.dataset.channelFlip)));

  fetch(releaseApi, { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => { if (!response.ok) throw new Error('release lookup failed'); return response.json(); })
    .then((release) => {
      const date = new Date(release.published_at || release.created_at);
      const assets = release.assets || [];
      const named = (pattern) => assets.find((asset) => pattern.test(String(asset?.name || '')) && asset?.browser_download_url);
      const executable = named(/Portable.*\.exe$/i) || named(/\.exe$/i);
      const appImage = named(/Ubuntu.*\.AppImage$/i) || named(/\.AppImage$/i);
      const windowsHeadless = named(/^Dragonwilds Sync Headless-.*\.exe$/i);
      const linuxHeadless = named(/^Dragonwilds-Sync-Headless-Ubuntu-/i);
      const windowsChecksum = named(/^checksums-windows\.sha256$/i);
      const linuxChecksum = named(/^checksums-linux\.sha256$/i);
      flip.querySelector('[data-main-version]').textContent = release.tag_name || release.name || 'Latest';
      flip.querySelector('[data-main-date]').textContent = Number.isNaN(date.getTime()) ? 'Latest release' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      if (executable) {
        document.querySelectorAll('[data-windows-download],[data-windows-quick-download]').forEach((link) => { link.href = executable.browser_download_url; link.setAttribute('download', ''); });
        document.querySelectorAll('[data-windows-file],[data-windows-quick-file]').forEach((note) => { note.textContent = executable.name; });
      }
      if (appImage) {
        document.querySelectorAll('[data-linux-download],[data-linux-quick-download]').forEach((link) => { link.href = appImage.browser_download_url; link.setAttribute('download', ''); });
        document.querySelectorAll('[data-linux-file],[data-linux-quick-file]').forEach((note) => { note.textContent = appImage.name; });
      }
      if (windowsHeadless) document.querySelectorAll('[data-headless-windows-download]').forEach((link) => { link.href = windowsHeadless.browser_download_url; link.setAttribute('download', ''); });
      if (linuxHeadless) document.querySelectorAll('[data-headless-linux-download]').forEach((link) => { link.href = linuxHeadless.browser_download_url; link.setAttribute('download', ''); });
      if (windowsChecksum) document.querySelectorAll('[data-windows-checksum]').forEach((link) => { link.href = windowsChecksum.browser_download_url; });
      if (linuxChecksum) document.querySelectorAll('[data-linux-checksum]').forEach((link) => { link.href = linuxChecksum.browser_download_url; });
    }).catch(() => {
      flip.querySelector('[data-main-version]').textContent = 'Latest available';
      flip.querySelector('[data-main-date]').textContent = 'Open Release History';
    });

  setSide('main');
})();
