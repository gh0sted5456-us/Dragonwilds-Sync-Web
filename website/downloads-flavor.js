(() => {
  const cards = [...document.querySelectorAll('[data-rune-flip]')];
  cards.forEach((card) => {
    const front = card.querySelector('.rune-flip-front');
    const back = card.querySelector('.rune-flip-back');
    const showCode = card.querySelector('[data-rune-show-code]');
    const showFront = card.querySelector('[data-rune-show-front]');
    const copy = card.querySelector('[data-rune-copy-code]');
    const status = card.querySelector('[data-rune-copy-status]');
    const code = card.querySelector('#runeschema-scale-example');

    const setFlipped = (flipped, focusTarget = true) => {
      card.classList.toggle('flipped', flipped);
      front?.setAttribute('aria-hidden', String(flipped));
      back?.setAttribute('aria-hidden', String(!flipped));
      if (front) front.inert = flipped;
      if (back) back.inert = !flipped;
      if (focusTarget) (flipped ? showFront : showCode)?.focus();
    };

    showCode?.addEventListener('click', () => setFlipped(true));
    showFront?.addEventListener('click', () => setFlipped(false));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && card.classList.contains('flipped')) {
        event.preventDefault();
        setFlipped(false);
      }
    });

    copy?.addEventListener('click', async () => {
      const value = code?.textContent || '';
      try {
        await navigator.clipboard.writeText(value);
        if (status) status.textContent = 'Example JSON copied.';
      } catch (_) {
        if (status) status.textContent = 'Clipboard access was unavailable. Select the JSON to copy it manually.';
      }
    });
    setFlipped(false, false);
  });
})();
