(() => {
  const dialogs = document.querySelectorAll(".runeschema-dialog");
  document.querySelectorAll("[data-runeschema-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", () => document.getElementById(trigger.dataset.runeschemaDialog)?.showModal());
  });
  dialogs.forEach((dialog) => {
    dialog.querySelectorAll("[data-runeschema-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });

  const gallery = [
    {title:"Overview", src:"assets/runeschema-experimental-v8/overview.png", alt:"RuneSchema 0.6.1 Experimental Overview page", caption:"Runtime status, detected mods, tooling state, and active paths."},
    {title:"Settings", src:"assets/runeschema-experimental-v8/settings.png", alt:"RuneSchema 0.6.1 Experimental Settings page", caption:"Core options, experimental drop scaling, tooling controls, and mods.txt behavior."},
    {title:"Generators", src:"assets/runeschema-experimental-v8/generators.png", alt:"RuneSchema 0.6.1 Experimental Generators page", caption:"On-demand JSON schemas and optional sanitized FModel draft snippets."},
    {title:"Load Order", src:"assets/runeschema-experimental-v8/load-order.png", alt:"RuneSchema 0.6.1 Experimental Load Order page", caption:"Enable, disable, reorder, reconcile, refresh, and save the visible mods.txt contract."},
    {title:"Compatibility", src:"assets/runeschema-experimental-v8/compatibility.png", alt:"RuneSchema 0.6.1 Experimental Compatibility page", caption:"Configure and run advisory collision reports only when requested."}
  ];
  const galleryDialog = document.getElementById("runeschema-gallery-dialog");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let galleryIndex = 0;
  let galleryTimer = null;

  const renderGallery = () => {
    const item = gallery[galleryIndex];
    if (!galleryDialog || !item) return;
    const image = galleryDialog.querySelector("[data-gallery-preview]");
    image.src = item.src;
    image.alt = item.alt;
    galleryDialog.querySelector("#runeschema-gallery-dialog-title").textContent = item.title;
    galleryDialog.querySelector("[data-gallery-caption]").textContent = item.caption;
    galleryDialog.querySelector("[data-gallery-position]").textContent = `${galleryIndex + 1} of ${gallery.length}`;
  };
  const setPlayingState = (playing) => {
    const control = galleryDialog?.querySelector("[data-gallery-play]");
    if (!control) return;
    control.textContent = playing ? "Pause slideshow" : "Play slideshow";
    control.setAttribute("aria-pressed", String(playing));
  };
  const stopRotation = () => {
    if (galleryTimer) window.clearInterval(galleryTimer);
    galleryTimer = null;
    setPlayingState(false);
  };
  const startRotation = () => {
    stopRotation();
    if (reduceMotion.matches || !galleryDialog?.open) return;
    galleryTimer = window.setInterval(() => {
      galleryIndex = (galleryIndex + 1) % gallery.length;
      renderGallery();
    }, 5000);
    setPlayingState(true);
  };
  const moveGallery = (offset) => {
    galleryIndex = (galleryIndex + offset + gallery.length) % gallery.length;
    renderGallery();
    if (galleryTimer) startRotation();
  };

  document.querySelectorAll("[data-gallery-index]").forEach((button) => button.addEventListener("click", () => {
    galleryIndex = Number(button.dataset.galleryIndex) || 0;
    renderGallery();
    galleryDialog?.showModal();
    startRotation();
  }));
  galleryDialog?.querySelector("[data-gallery-previous]")?.addEventListener("click", () => moveGallery(-1));
  galleryDialog?.querySelector("[data-gallery-next]")?.addEventListener("click", () => moveGallery(1));
  galleryDialog?.querySelector("[data-gallery-play]")?.addEventListener("click", () => galleryTimer ? stopRotation() : startRotation());
  galleryDialog?.addEventListener("close", stopRotation);
  reduceMotion.addEventListener?.("change", () => { if (reduceMotion.matches) stopRotation(); });
})();

(() => {
  const dialog = document.getElementById("runeschema-json-dialog");
  if (!dialog) return;
  const tabs = [...dialog.querySelectorAll("[data-json-tab]")];
  const panels = [...dialog.querySelectorAll("[data-json-panel]")];
  const status = dialog.querySelector("[data-json-copy-status]");
  const activate = (key, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.jsonTab === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.jsonPanel !== key; });
    if (status) status.textContent = "";
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.jsonTab));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next].dataset.jsonTab, true);
    });
  });
  dialog.querySelector("[data-json-copy]")?.addEventListener("click", async () => {
    const code = panels.find((panel) => !panel.hidden)?.querySelector("code")?.textContent || "";
    try { await navigator.clipboard.writeText(code); if (status) status.textContent = "Copied."; }
    catch { if (status) status.textContent = "Copy was blocked; select the code manually."; }
  });
})();
