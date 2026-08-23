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
    {title:"Overview", src:"assets/runeschema-experimental-v8/overview.png", alt:"Experimental RuneSchema Overview page", caption:"Runtime status, detected mods, tooling state, and active paths."},
    {title:"Settings", src:"assets/runeschema-experimental-v8/settings.png", alt:"Experimental RuneSchema Settings page", caption:"Core options, experimental drop scaling, tooling controls, and mods.txt behavior."},
    {title:"Generators", src:"assets/runeschema-experimental-v8/generators.png", alt:"Experimental RuneSchema Generators page", caption:"On-demand JSON schemas and optional sanitized FModel draft snippets."},
    {title:"Load Order", src:"assets/runeschema-experimental-v8/load-order.png", alt:"Experimental RuneSchema Load Order page", caption:"Enable, disable, reorder, reconcile, refresh, and save the visible mods.txt contract."},
    {title:"Compatibility", src:"assets/runeschema-experimental-v8/compatibility.png", alt:"Experimental RuneSchema Compatibility page", caption:"Configure and run advisory collision reports only when requested."}
  ];
  const galleryDialog = document.getElementById("runeschema-gallery-dialog");
  let galleryIndex = 0;
  const renderGallery = () => {
    const item = gallery[galleryIndex];
    if (!galleryDialog || !item) return;
    const image = galleryDialog.querySelector("[data-gallery-preview]");
    image.src = item.src; image.alt = item.alt;
    galleryDialog.querySelector("#runeschema-gallery-dialog-title").textContent = item.title;
    galleryDialog.querySelector("[data-gallery-caption]").textContent = item.caption;
  };
  document.querySelectorAll("[data-gallery-index]").forEach((button) => button.addEventListener("click", () => {
    galleryIndex = Number(button.dataset.galleryIndex) || 0; renderGallery(); galleryDialog?.showModal();
  }));
  galleryDialog?.querySelector("[data-gallery-previous]")?.addEventListener("click", () => { galleryIndex = (galleryIndex + gallery.length - 1) % gallery.length; renderGallery(); });
  galleryDialog?.querySelector("[data-gallery-next]")?.addEventListener("click", () => { galleryIndex = (galleryIndex + 1) % gallery.length; renderGallery(); });
})();
