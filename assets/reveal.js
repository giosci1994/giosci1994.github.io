/* Entrata delle sezioni con Motion (motion.dev), facoltativa.
   Senza Motion, con il movimento ridotto o in caso di errore la pagina resta com'è: tutto visibile.
   La classe motion-ready la mette lo script nell'head e la toglie da sé dopo 1,5 s. */
(function () {
  const root = document.documentElement;
  const M = window.Motion;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  clearTimeout(window.__glcReveal);
  if (!M || reduce || !M.animate || !M.inView || !root.classList.contains('motion-ready')) {
    root.classList.remove('motion-ready');
    return;
  }

  const ease = [0.22, 1, 0.36, 1];
  const blocks = Array.prototype.slice.call(document.querySelectorAll('.reveal:not(.plates)'));
  const grids = Array.prototype.slice.call(document.querySelectorAll('.plates'));
  const all = blocks.slice();
  grids.forEach(function (g) { all.push.apply(all, g.querySelectorAll('.plate')); });

  // Lo stato iniziale passa dalla classe agli stili in linea, poi ogni blocco sale di 8px mentre appare.
  all.forEach(function (el) { el.style.opacity = '0'; });
  root.classList.remove('motion-ready');
  const show = function (list) { list.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; }); };

  let batch = 0;
  let batchTimer = null;
  try {
    blocks.forEach(function (el) {
      M.inView(el, function () {
        const delay = Math.min(batch, 5) * 0.05;
        batch += 1;
        clearTimeout(batchTimer);
        batchTimer = setTimeout(function () { batch = 0; }, 120);
        M.animate(el, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
          { duration: 0.4, delay: delay, ease: ease });
      }, { amount: 0.15 });
    });
    // I piatti entrano uno dopo l'altro, con un ritardo piccolo e un tetto
    grids.forEach(function (g) {
      const plates = Array.prototype.slice.call(g.querySelectorAll('.plate'));
      M.inView(g, function () {
        plates.forEach(function (el, i) {
          M.animate(el, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
            { duration: 0.4, delay: Math.min(i, 10) * 0.04, ease: ease });
        });
      }, { amount: 0.1 });
    });
  } catch (e) {
    show(all);
  }
})();
