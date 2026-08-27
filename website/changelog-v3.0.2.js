(() => {
  const root = document.querySelector('#v302-changelog');
  if (!root) return;
  const escapeHtml = (value) => {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  };
  fetch('assets/changelog-v3.0.2.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const releases = Array.isArray(payload?.releases) ? payload.releases : [];
      const total = releases.reduce((count, release) => count + (Array.isArray(release?.highlights) ? release.highlights.length : 0), 0);
      root.innerHTML = `<div class="changelog-summary"><div><span>COMPLETE RELEASE RECORD</span><strong>${total} changes</strong></div><div><span>MERGED MILESTONES</span><strong>${releases.length}</strong></div><div><span>RELEASE</span><strong>v3.0.2</strong></div></div><div class="changelog-groups">${releases.map((release, index) => {
        const highlights = Array.isArray(release?.highlights) ? release.highlights : [];
        return `<details class="changelog-group" ${index === 0 ? 'open' : ''}><summary><span><b>${escapeHtml(release.version || 'Milestone')}</b><small>${escapeHtml(release.date || '')}</small></span><em>${highlights.length} changes</em></summary><ul>${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>`;
      }).join('')}</div>`;
    })
    .catch(() => {
      root.innerHTML = '<div class="changelog-error"><strong>The v3.0.2 changelog could not be loaded.</strong><span>Use Release history for the GitHub copy.</span></div>';
    });
})();
