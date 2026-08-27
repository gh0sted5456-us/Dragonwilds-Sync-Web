(() => {
  const root = document.querySelector('#release-changelog');
  if (!root) return;

  const escapeHtml = (value) => {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  };

  fetch('assets/release-changelog.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((release) => {
      const highlights = Array.isArray(release?.highlights) ? release.highlights : [];
      root.innerHTML = `<div class="changelog-summary"><div><span>RELEASE</span><strong>v${escapeHtml(release.version || '—')}</strong></div><div><span>STATUS</span><strong>${escapeHtml(release.status || '—')}</strong></div><div><span>PUBLISHED</span><strong>${escapeHtml(release.date || '—')}</strong></div></div><div class="changelog-current"><div class="changelog-current__heading"><span>STABLE RELEASE</span><h3>${escapeHtml(release.title || 'Release notes')}</h3><p>${highlights.length} verified changes promoted from the testing branch.</p></div><ul>${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`;
    })
    .catch(() => {
      root.innerHTML = '<div class="changelog-error"><strong>The current changelog could not be loaded.</strong><span>Use Release history for the GitHub copy.</span></div>';
    });
})();
