/* Pagina Dev: filtri per argomento sulle schede dei progetti e luce che segue il puntatore.
   Le categorie stanno in data-cats su ogni .proj di dev.html. */
(function () {
  const grid = document.getElementById('projects');
  const bar = document.getElementById('proj-filters');
  if (!grid || !bar) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(grid.querySelectorAll('.proj'));
  const buttons = Array.from(bar.querySelectorAll('button'));
  const cats = c => (c.dataset.cats || '').split(' ').filter(Boolean);

  // quante schede per filtro, contate dalla pagina così restano sempre giuste
  buttons.forEach(b => {
    const k = b.dataset.k;
    const n = k === 'all' ? cards.length : cards.filter(c => cats(c).includes(k)).length;
    b.querySelector('b').textContent = n;
    if (!n) b.hidden = true;
  });
  bar.hidden = false;

  function apply(key) {
    // FLIP: posizioni prima del cambio, poi ogni scheda scivola al suo nuovo posto
    const before = new Map(cards.map(c => [c, c.hidden ? null : c.getBoundingClientRect()]));
    cards.forEach(c => {
      c.hidden = key !== 'all' && !cats(c).includes(key);
      // una scheda che compare non deve restare invisibile in attesa dell'animazione d'ingresso
      if (!c.hidden) c.classList.add('visible');
    });
    grid.classList.toggle('filtered', key !== 'all');
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
    if (reduce.matches || !grid.animate) return;
    cards.forEach(c => {
      if (c.hidden) return;
      const old = before.get(c);
      const now = c.getBoundingClientRect();
      if (!old) {
        c.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 320, easing: 'ease-out' });
        return;
      }
      const dx = old.left - now.left, dy = old.top - now.top;
      const sx = old.width / now.width, sy = old.height / now.height;
      if (!dx && !dy && sx === 1 && sy === 1) return;
      c.animate([
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: 'top left', transform: 'none' }
      ], { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
    });
  }

  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.k)));

  // la luce: la posizione del puntatore finisce in --mx/--my, il resto è CSS
  cards.forEach(c => {
    c.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
