/* Downloads-page Linux host compatibility presentation. */
(() => {
  const host = document.getElementById('linux-detection-downloads');
  if (!host) return;
  const state = { model: null, selected: 0 };
  const suppliedMarks = Object.freeze({
    ubuntu: 'assets/linux-brands/ubuntu.png',
    bazzite: 'assets/linux-brands/bazzite.png',
    zorin: 'assets/linux-brands/zorin.png'
  });
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  const iconFor = (key) => {
    const safeKey = /^[a-z0-9-]+$/i.test(String(key || '')) ? String(key).toLowerCase() : 'linux';
    return suppliedMarks[safeKey] || `assets/distros/${safeKey}.svg`;
  };
  function render() {
    const data = state.model?.linuxDetection;
    if (!data) return;
    const sample = data.examples[state.selected] || data.detected;
    const ancestry = (sample.distro_id_like || []).join(' / ') || 'No parent IDs reported';
    host.innerHTML = `<section class="linux-detection" aria-labelledby="linux-detection-title">
      <div class="linux-detection__hero"><div class="linux-detection__mark"><img data-distro-icon src="${esc(iconFor(sample.distro_icon))}" alt="${esc(sample.short_name || sample.distro_name)} logo"></div><div><span class="linux-kicker">RICH HOST DETECTION</span><h2 id="linux-detection-title">${esc(sample.distro_name)}</h2><p>Dragonwilds Sync reads the standard Linux release identity, normalizes vendor aliases, and keeps the runtime decision separate from the host logo.</p></div><span class="linux-support ${sample.ubuntu_supported ? 'is-supported' : ''}">${sample.ubuntu_supported ? 'SUPPORTED BASELINE' : 'COMMUNITY PATH'}</span></div>
      <div class="linux-facts"><div><span>Canonical ID</span><strong>${esc(sample.distro)}</strong></div><div><span>Family</span><strong>${esc(sample.distro_family || 'unknown')}</strong></div><div><span>Version</span><strong>${esc(sample.distro_version || 'rolling')}</strong></div><div><span>Codename</span><strong>${esc(sample.distro_codename || 'not reported')}</strong></div><div><span>ID_LIKE ancestry</span><strong>${esc(ancestry)}</strong></div><div><span>Icon match</span><strong>${sample.distro_known ? 'Exact distro mark' : 'Family fallback'}</strong></div></div>
      <div class="linux-runtime-grid"><article><span class="linux-kicker">SERVER HOST</span><h3>Native Linux</h3><p>Uses <code>RSDragonwildsServer.sh</code> and LinuxServer configuration. Win64 injection DLLs are never copied into a native ELF tree.</p></article><article><span class="linux-kicker">GAME CLIENT</span><h3>Proton / Wine</h3><p>Keeps the Windows PE x64 ABI, so signed UE4SS and RuneSchema Win64 variants remain eligible with explicit compatibility settings.</p></article><article><span class="linux-kicker">PUBLIC DIRECTORY</span><h3>Privacy-safe badge</h3><p>Publishes only OS family, friendly distro label, version, family, icon key, and support flags. Usernames, paths, hostnames, and kernel builds stay private.</p></article></div>
      <div class="linux-samples"><span>Try a detected host</span>${data.examples.map((item,index)=>`<button type="button" class="${index===state.selected?'is-active':''}" data-linux-sample="${index}" aria-pressed="${index===state.selected}"><img data-distro-icon src="${esc(iconFor(item.distro_icon))}" alt="">${esc(item.short_name||item.distro_name)}</button>`).join('')}</div>
      <footer><span>${esc(data.catalog_count)} baked distro marks</span><span>${esc(data.families.length)} normalized families</span><span><code>/etc/os-release</code> with <code>/usr/lib/os-release</code> fallback</span></footer>
    </section>`;
    host.querySelectorAll('[data-distro-icon]').forEach((image) => image.addEventListener('error', () => { image.src = 'assets/distros/linux.svg'; }, { once: true }));
    host.querySelectorAll('[data-linux-sample]').forEach((button) => button.addEventListener('click', () => { state.selected = Number(button.dataset.linuxSample) || 0; render(); }));
  }
  fetch('assets/launcher-preview.json?v=7', { cache: 'no-cache' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Linux compatibility model unavailable')))
    .then((model) => { state.model = model; render(); })
    .catch(() => { host.innerHTML = '<div class="downloads-linux-error"><strong>Linux compatibility details are temporarily unavailable.</strong><span>The Windows and Ubuntu downloads above remain available.</span></div>'; });
})();