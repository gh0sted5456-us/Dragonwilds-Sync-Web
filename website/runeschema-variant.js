(() => {
  const versionLink = document.querySelector("[data-runeschema-version]");
  const downloadLink = document.querySelector("[data-runeschema-download]");
  const releaseTitle = document.querySelector("[data-runeschema-title]");
  const codenameLabel = document.querySelector("[data-runeschema-codename]");
  if (!versionLink && !downloadLink) return;

  const releasesApi = "https://api.github.com/repos/gh0sted5456-us/RuneSchema/releases?per_page=20";
  const releaseHistory = "https://github.com/gh0sted5456-us/RuneSchema/releases";
  const loadCurrentExperimentalRelease = async () => {
    try {
      const response = await fetch(releasesApi, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error("RuneSchema release metadata is unavailable");

      const releases = await response.json();
      const release = releases
        .filter((candidate) =>
          candidate &&
          !candidate.draft &&
          candidate.prerelease &&
          /experimental/i.test(`${candidate.name || ""} ${candidate.tag_name || ""}`)
        )
        .sort((left, right) => {
          const leftDate = Date.parse(left.published_at || left.created_at || 0) || 0;
          const rightDate = Date.parse(right.published_at || right.created_at || 0) || 0;
          return rightDate - leftDate;
        })[0];
      if (!release) throw new Error("No experimental RuneSchema prerelease was found");

      const tag = String(release.tag_name || "").trim();
      if (!tag) throw new Error("The RuneSchema prerelease has no tag");
      const releaseName = String(release.name || "").trim();
      const versionNumber = releaseName.match(/\b\d+\.\d+\.\d+\b/)?.[0] || tag.match(/\b\d+\.\d+\.\d+\b/)?.[0];
      const displayVersion = versionNumber ? `v${versionNumber}` : (/^v/i.test(tag) ? tag : `v${tag}`);
      const codename = releaseName.split(/\s+[—–-]\s+/).slice(1).join(" - ").trim();
      const packageAsset = (release.assets || []).find((asset) =>
        /^RuneSchema-.*Experimental\.zip$/i.test(String(asset?.name || "")) &&
        asset?.browser_download_url
      );

      if (versionLink) {
        versionLink.textContent = `Current prerelease: ${displayVersion}`;
        versionLink.href = release.html_url || releaseHistory;
        versionLink.dataset.releaseSource = "github";
        versionLink.title = "Version automatically resolved from GitHub Releases";
      }
      if (downloadLink) {
        downloadLink.textContent = `Download ${displayVersion}`;
        downloadLink.href = packageAsset?.browser_download_url || release.html_url || releaseHistory;
        downloadLink.dataset.releaseSource = "github";
      }
      if (releaseTitle && versionNumber) {
        releaseTitle.replaceChildren(document.createTextNode(`RuneSchema ${versionNumber} Experimental `));
        if (codename) {
          const codenameBadge = document.createElement("span");
          codenameBadge.className = "runeschema-codename";
          codenameBadge.textContent = codename;
          releaseTitle.append(codenameBadge);
        }
      }
      if (codenameLabel && codename) codenameLabel.textContent = `Experimental codename: ${codename}`;
      if (versionNumber) {
        document.querySelectorAll("[data-runeschema-comparison-version]").forEach((label) => {
          label.textContent = versionNumber;
        });
        document.querySelectorAll("[data-runeschema-comparison]").forEach((comparison) => {
          comparison.setAttribute("aria-label", `Official RuneSchema and ${versionNumber} Experimental feature comparison`);
        });
      }
      if (codename) {
        document.querySelectorAll("[data-runeschema-comparison-codename]").forEach((label) => {
          label.textContent = codename;
        });
      }
    } catch (_) {
      // Keep the known-good links and version baked into the placard.
    }
  };

  loadCurrentExperimentalRelease();
})();

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
