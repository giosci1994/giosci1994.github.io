/* Pagina Chef: galleria dei piatti (con ingrandimento) e video "Dietro le quinte".
   Senza JS i riquadri restano link all'immagine intera e i video si avviano a mano. */
(function () {
  const t = (key, fallback) => (window.siteT && window.siteT(key)) || fallback;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- ingrandimento ---------- */
  const grid = document.getElementById('plates');
  const box = document.getElementById('plate-box');

  // ordine di entrata dei riquadri (vedi .plate in style.css)
  if (grid) grid.querySelectorAll('.plate').forEach((li, n) => li.style.setProperty('--i', n));

  if (grid && box && typeof box.showModal === 'function') {
    const links = Array.from(grid.querySelectorAll('.plate-link'));
    const img = box.querySelector('.lb-img');
    const count = box.querySelector('.lb-count');
    let current = 0;
    let swiped = false;
    let x0 = null;

    const thumb = n => links[n].querySelector('img');

    function show(n) {
      current = (n + links.length) % links.length;
      const th = thumb(current);
      img.src = links[current].getAttribute('href');
      img.alt = th.alt;
      img.width = th.getAttribute('width');
      img.height = th.getAttribute('height');
      count.textContent = (current + 1) + ' / ' + links.length;
      // le vicine si scaricano in anticipo, così lo scorrimento non resta vuoto
      [current + 1, current - 1].forEach(k => {
        const near = new Image();
        near.src = links[(k + links.length) % links.length].getAttribute('href');
      });
    }

    function open(n) {
      show(n);
      document.documentElement.classList.add('lb-open');
      box.showModal();
    }

    links.forEach((a, n) => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(n);
    }));

    box.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
    box.querySelector('.lb-close').addEventListener('click', () => box.close());

    // clic sul fondo (fuori dalla foto e dai pulsanti) chiude
    box.addEventListener('click', e => {
      if (swiped) { swiped = false; return; }
      if (e.target === box || e.target.classList.contains('lb-stage')) box.close();
    });

    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });

    // scorrimento col dito
    box.addEventListener('pointerdown', e => { x0 = e.pointerType === 'mouse' ? null : e.clientX; });
    box.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 48) { swiped = true; show(current + (dx < 0 ? 1 : -1)); }
    });

    box.addEventListener('close', () => {
      document.documentElement.classList.remove('lb-open');
      // torna alla foto su cui si era arrivati, portandola in vista se serve
      links[current].focus();
    });
  }

  /* ---------- video: partono muti quando sono in vista ---------- */
  const clips = Array.from(document.querySelectorAll('.clip'));

  clips.forEach(fig => {
    const video = fig.querySelector('video');
    const btn = fig.querySelector('.clip-toggle');
    if (!video || !btn) return;
    // con "riduci movimento" non partono da soli
    let held = reduce.matches;
    let inView = false;

    function sync() {
      const playing = !video.paused;
      fig.classList.toggle('playing', playing);
      btn.setAttribute('aria-label', playing ? t('chef.clip.pause', 'Pause') : t('chef.clip.play', 'Play'));
    }

    function play() {
      const p = video.play();
      if (p && p.catch) p.catch(() => { sync(); });
    }

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    document.addEventListener('langchange', sync);

    function toggle() {
      if (video.paused) { held = false; play(); }
      else { held = true; video.pause(); }
    }

    btn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => {
          inView = entry.isIntersecting;
          if (inView && !held) play();
          else if (!inView && !video.paused) video.pause();
        });
      }, { threshold: 0.5 }).observe(video);
    }

    reduce.addEventListener('change', () => {
      held = reduce.matches;
      if (held) video.pause();
      else if (inView) play();
    });

    sync();
  });
})();
