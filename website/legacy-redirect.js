(() => {
  const target = document.currentScript.dataset.destination;
  const hash = location.hash;
  location.replace((hash.startsWith('#runeschema-') ? 'runeschema-authoring.html' : target) + hash);
})();
