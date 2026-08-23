/* Website Draft presentation layer.
   The .rsdwl exporter already writes trustMode=website-draft and metadata.websiteDraft=true.
   This layer makes that lifecycle explicit to the user without changing the package format. */
(() => {
  const mount = document.querySelector('#world-builder-demo');
  if (!mount) return;

  const install = () => {
    const saveButton = mount.querySelector('#demo-save-world');
    if (!saveButton || saveButton.dataset.draftOnboarding === 'true') return false;
    saveButton.dataset.draftOnboarding = 'true';
    saveButton.textContent = 'Save Draft (.rsdwl) ↓';
    saveButton.title = 'Export a Website Draft that Dragonwilds Sync will finish configuring locally before first launch.';

    const saveStep = mount.querySelector('#demo-save-drop')?.closest('.demo-step');
    if (saveStep && !mount.querySelector('.world-draft-next-step')) {
      const note = document.createElement('div');
      note.className = 'world-draft-next-step';
      note.innerHTML = `
        <div class="world-draft-next-step-badge">DRAFT</div>
        <div>
          <strong>Finish setup in Dragonwilds Sync</strong>
          <p>Importing this file creates a local World Draft. The app will walk through the dedicated-server location, included or attached save, UE4SS/RuneSchema requirements, ports, fresh credentials, publication choice, Remote Server Manager, and the first launch.</p>
        </div>`;
      saveStep.insertAdjacentElement('afterend', note);
    }

    const heading = mount.querySelector('.home-demo-heading .section-heading');
    if (heading && !heading.querySelector('.world-draft-heading-note')) {
      const line = document.createElement('p');
      line.className = 'world-draft-heading-note';
      line.innerHTML = '<strong>Exported files are World Drafts.</strong> They are visible/editable after import, but Dragonwilds Sync completes local setup before the World can run.';
      heading.appendChild(line);
    }

    return true;
  };

  if (install()) return;
  const observer = new MutationObserver(() => {
    if (install()) observer.disconnect();
  });
  observer.observe(mount, { childList: true, subtree: true });
})();
