/* World Builder local-art preview guard.
   The core builder owns packaging. This layer only guarantees that locally
   selected icon/banner files visibly preview, even if the public sanitizer or
   fallback card renderer strips a data URL during a re-render. */
(() => {
  const mount = document.querySelector('#world-builder-demo');
  if (!mount) return;

  const state = { icon:'', banner:'' };
  const readers = new WeakMap();
  const isImageFile = (file) => {
    if (!file) return false;
    if (/^image\/(?:png|jpe?g|webp|gif)$/i.test(file.type || '')) return true;
    return /\.(?:png|jpe?g|webp|gif)$/i.test(file.name || '');
  };

  function markReady(input, ready) {
    const label = input?.closest('.demo-upload');
    if (label) label.dataset.previewReady = ready ? 'true' : 'false';
  }

  function applyPreview() {
    const card = mount.querySelector('#demo-card-host .world-card');
    if (!card) return;
    const front = card.querySelector('.world-card-front');
    if (!front) return;

    if (state.banner) {
      let media = front.querySelector('.world-card-media');
      if (!media) {
        media = document.createElement('div');
        media.className = 'world-card-media';
        const origin = front.querySelector('.world-origin-banner');
        if (origin) origin.insertAdjacentElement('afterend', media);
        else front.prepend(media);
      }
      let image = media.querySelector('.world-card-banner');
      if (!image) {
        image = document.createElement('img');
        image.className = 'world-card-banner';
        image.alt = '';
        media.prepend(image);
      }
      if (image.src !== state.banner) image.src = state.banner;
      media.querySelector('.world-card-banner-fallback')?.remove();
      if (!media.querySelector('.world-card-banner-blend')) {
        const blend = document.createElement('div');
        blend.className = 'world-card-banner-blend';
        media.appendChild(blend);
      }
    }

    if (state.icon) {
      const body = front.querySelector('.world-card-body');
      if (body) {
        let icon = body.querySelector('.world-icon');
        if (!icon || icon.tagName !== 'IMG') {
          const replacement = document.createElement('img');
          replacement.className = 'world-icon';
          replacement.alt = '';
          if (icon) icon.replaceWith(replacement); else body.prepend(replacement);
          icon = replacement;
        }
        if (icon.src !== state.icon) icon.src = state.icon;
      }
    }
  }

  function readPreview(input, kind) {
    const file = input.files?.[0];
    if (!file) {
      state[kind] = '';
      markReady(input, false);
      return;
    }
    if (!isImageFile(file)) return;
    const previous = readers.get(input);
    if (previous?.readyState === FileReader.LOADING) previous.abort();
    const reader = new FileReader();
    readers.set(input, reader);
    reader.onload = () => {
      const value = String(reader.result || '');
      if (!/^data:image\//i.test(value)) return;
      state[kind] = value;
      markReady(input, true);
      requestAnimationFrame(applyPreview);
    };
    reader.readAsDataURL(file);
  }

  mount.addEventListener('change', (event) => {
    if (event.target?.id === 'demo-icon-file') readPreview(event.target, 'icon');
    if (event.target?.id === 'demo-banner-file') readPreview(event.target, 'banner');
  }, true);

  mount.addEventListener('click', (event) => {
    if (event.target?.id === 'demo-reset') {
      state.icon = '';
      state.banner = '';
      markReady(mount.querySelector('#demo-icon-file'), false);
      markReady(mount.querySelector('#demo-banner-file'), false);
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (state.icon || state.banner) requestAnimationFrame(applyPreview);
  });
  observer.observe(mount, { childList:true, subtree:true });
})();
