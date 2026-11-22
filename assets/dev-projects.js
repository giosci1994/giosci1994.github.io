/* Pagina Dev: luce che segue il puntatore sulle schede dei progetti (statiche e dinamiche). */
(function () {
  const scope = document.querySelector('.dev-zone');
  if (!scope) return;

  scope.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest('.proj:not(.proj-empty)');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();
