/* Pagina Chef: il tagliere delle comande — zero build step.
   Senza JavaScript (o con il movimento ridotto) il tagliere è piatto e le comande si scorrono di lato.
   Con la classe .live la sezione resta ferma sullo schermo: lo scroll verticale fa avanzare il
   tagliere, visto in prospettiva, e la comanda al centro si alza verso chi guarda. */
(function () {
  const section = document.getElementById('journey');
  if (!section) return;
  const viewport = document.getElementById('journey-viewport');
  const track = document.getElementById('journey-track');
  const tiles = document.getElementById('journey-tiles');
  const facesBox = document.getElementById('journey-faces');
  const shadesBox = document.getElementById('journey-shades');
  const rail = document.getElementById('journey-rail');
  const hint = document.getElementById('journey-hint');
  const stops = [...track.querySelectorAll('.stop')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';

  let live = false;
  let maxShift = 1;
  let shifts = [0, 1];
  let total = 1;
  let start = 0;
  let target = 0;
  let current = 0;
  let frame = 0;
  let centers = [];
  let ticks = [];

  const clamp = (v) => Math.min(1, Math.max(0, v));

  // Sagoma del tagliere (corpo, manico raccordato, foro), disegnata a tessere: una superficie 3D
  // lunga migliaia di pixel non viene disegnata per intero da tutti i browser.
  function drawBoard() {
    const css = getComputedStyle(section);
    const handle = parseFloat(css.getPropertyValue('--handle')) || 150;
    // misure "piatte" del layout: con la prospettiva i rettangoli sullo schermo sono deformati
    const trackH = track.offsetHeight;
    const left = parseFloat(getComputedStyle(tiles).left) || 24;
    const W = Math.round(track.scrollWidth - left - 24);
    const top = Math.round(trackH * 0.06);
    const H = Math.round(trackH * 0.88);

    const tw = 700;
    tiles.textContent = '';
    for (const box of [tiles, facesBox, shadesBox]) box.style.top = top + 'px';
    for (let x0 = 0; x0 < W; x0 += tw) {
      const w = Math.min(tw + 1, W - x0);
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', w);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', `${x0} 0 ${w} ${H}`);
      svg.style.left = x0 + 'px';
      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#board-art');
      svg.appendChild(use);
      tiles.appendChild(svg);
    }

    const r = Math.min(30, H * 0.08);
    const hh = Math.max(64, Math.min(150, H * 0.34));
    const hy = (H - hh) / 2;
    const f = Math.min(34, hh * 0.32);
    const bx = handle;
    const e = hh / 2;
    const outline = [
      `M${bx + r},0 H${W - r} A${r},${r} 0 0 1 ${W},${r} V${H - r} A${r},${r} 0 0 1 ${W - r},${H}`,
      `H${bx + r} A${r},${r} 0 0 1 ${bx},${H - r} V${hy + hh + f} Q${bx},${hy + hh} ${bx - f},${hy + hh}`,
      `H${e} A${e},${e} 0 0 1 ${e},${hy} H${bx - f} Q${bx},${hy} ${bx},${hy - f} V${r} A${r},${r} 0 0 1 ${bx + r},0 Z`
    ].join(' ');
    const hr = hh * 0.17;
    const hx = e + 4;
    const hcy = hy + hh / 2;
    const hole = `M${hx - hr},${hcy} a${hr},${hr} 0 1 0 ${2 * hr},0 a${hr},${hr} 0 1 0 ${-2 * hr},0 Z`;

    $('board-top').setAttribute('d', outline + ' ' + hole);
    $('board-sheen').setAttribute('d', outline + ' ' + hole);
    $('board-bevel').setAttribute('d', outline);
    // parete interna del foro: dall'alto si vede quella sul lato lontano
    $('board-hole-wall').setAttribute('cx', hx);
    $('board-hole-wall').setAttribute('cy', hcy);
    $('board-hole-wall').setAttribute('r', live ? hr : 0); // visto dritto dall'alto la parete non si vede
    // texture centrata in altezza sulla tavola
    $('board-wood').setAttribute('y', Math.round((H - 640) / 2));

    // marchio a fuoco vicino al manico
    const mx = bx + 62;
    const my = H / 2;
    const mr = 33;
    for (const [id, rad] of [['board-mark-ring1', mr], ['board-mark-ring2', mr - 5]]) {
      $(id).setAttribute('cx', mx);
      $(id).setAttribute('cy', my);
      $(id).setAttribute('r', rad);
    }
    $('board-mark-name').setAttribute('x', mx);
    $('board-mark-name').setAttribute('y', my + 4);
    $('board-mark-since').setAttribute('x', mx);
    $('board-mark-since').setAttribute('y', my + 15);

    drawEdge({ W, H, r, hh, hy, f, bx, e });
  }

  // Spessore del bordo: facce rivolte verso chi guarda (normale verso il basso) e ombra sul bancone.
  function drawEdge({ W, H, r, hh, hy, f, bx, e }) {
    facesBox.textContent = '';
    shadesBox.textContent = '';
    if (!live) return;
    const arc = (cx, cy, rad, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / n;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a), Math.cos(a), Math.sin(a)];
    });
    const fillet = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const p0 = [bx, hy + hh + f];
      const c = [bx, hy + hh];
      const p2 = [bx - f, hy + hh];
      const px = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0];
      const py = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1];
      const tx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0]);
      const ty = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1]);
      const len = Math.hypot(tx, ty) || 1;
      let nx = -ty / len;
      let ny = tx / len;
      if (nx * -0.7 + ny * 0.7 < 0) { nx = -nx; ny = -ny; }
      return [px, py, nx, ny];
    });
    const pieces = [
      arc(W - r, H - r, r, 0, Math.PI / 2, 8),
      [[W - r, H, 0, 1], [bx + r, H, 0, 1]],
      arc(bx + r, H - r, r, Math.PI / 2, Math.PI, 8),
      fillet,
      [[bx - f, hy + hh, 0, 1], [e, hy + hh, 0, 1]],
      arc(e, hy + e, e, Math.PI / 2, Math.PI, 12)
    ];
    const lit = [146, 96, 54];
    const dim = [84, 52, 26];
    // l'ombra è opaca (mescolata al colore della carta): i pezzi si sovrappongono senza giunte
    const paper = [246, 239, 227];
    const ink = [44, 22, 4];
    const mix = (a) => paper.map((v, j) => Math.round(v + (ink[j] - v) * a));
    for (const piece of pieces) {
      for (let i = 0; i < piece.length - 1; i++) {
        let [x1, y1, n1x, n1y] = piece[i];
        let [x2, y2, n2x, n2y] = piece[i + 1];
        const nx = (n1x + n2x) / 2;
        const ny = (n1y + n2y) / 2;
        if (ny < 0.04) continue;
        let dx = x2 - x1;
        let dy = y2 - y1;
        if (-dy * nx + dx * ny < 0) { [x1, y1, x2, y2] = [x2, y2, x1, y1]; dx = -dx; dy = -dy; }
        const len = Math.hypot(dx, dy);
        if (len < 0.5) continue;
        const k = Math.pow(Math.min(1, ny), 0.7);
        const c = lit.map((v, j) => Math.round(dim[j] + (v - dim[j]) * k));
        const d = c.map((v) => Math.round(v * 0.72));
        const ang = Math.atan2(dy, dx).toFixed(4);
        // anche le facce lunghe vanno spezzate, per lo stesso motivo delle tessere
        const parts = Math.ceil(len / 280);
        for (let j = 0; j < parts; j++) {
          const px = x1 + (dx * j) / parts;
          const py = y1 + (dy * j) / parts;
          const plen = len / parts;
          const face = document.createElement('i');
          face.className = 'face';
          face.style.left = px.toFixed(1) + 'px';
          face.style.top = py.toFixed(1) + 'px';
          face.style.width = (plen + 0.8).toFixed(1) + 'px';
          face.style.transform = `rotate(${ang}rad) rotateX(-90deg)`;
          face.style.background = `linear-gradient(rgb(${c}), rgb(${d}))`;
          facesBox.appendChild(face);
          const shade = document.createElement('i');
          shade.className = 'shade';
          shade.style.left = px.toFixed(1) + 'px';
          shade.style.top = py.toFixed(1) + 'px';
          shade.style.width = (plen + 1).toFixed(1) + 'px';
          const a = 0.36 * (0.35 + 0.65 * k);
          shade.style.background = `linear-gradient(rgb(${mix(a)}), rgb(${mix(a * 0.28)}) 45%, rgb(${paper}))`;
          shade.style.transform = `translateZ(calc(-1 * var(--edge))) rotate(${ang}rad)`;
          shadesBox.appendChild(shade);
        }
      }
    }
  }

  function layout() {
    live = !reduce.matches;
    section.classList.toggle('live', live);
    drawBoard();
    ticks.forEach((t) => t.remove());
    ticks = [];
    if (!live) {
      section.style.height = '';
      return;
    }
    const vw = viewport.clientWidth;
    maxShift = Math.max(1, track.scrollWidth - vw);
    centers = stops.map((s) => s.offsetLeft + s.offsetWidth / 2);
    // tappe: inizio, ogni comanda al centro, fine; ogni tappa vale lo stesso tratto di scroll
    shifts = [0, ...centers.map((c) => Math.min(maxShift, Math.max(0, c - vw / 2))), maxShift];
    total = Math.max(320, window.innerHeight * 0.7) * (shifts.length - 1);
    section.style.height = total + window.innerHeight + 'px';
    start = section.getBoundingClientRect().top + window.scrollY;

    ticks = stops.map((s, i) => {
      const dot = document.createElement('i');
      dot.className = 'tick';
      dot.style.left = ((i + 1) / (shifts.length - 1)) * 100 + '%';
      const label = document.createElement('span');
      label.textContent = s.querySelector('.t-period').textContent.trim().slice(0, 4);
      dot.appendChild(label);
      rail.appendChild(dot);
      return dot;
    });
    target = current = clamp((window.scrollY - start) / total);
    render(current);
  }

  // Tra due tappe il tagliere resta fermo all'inizio e alla fine del tratto: la comanda sosta al centro.
  function dwell(f) {
    const a = 0.22;
    const b = 0.78;
    if (f <= a) return 0;
    if (f >= b) return 1;
    const t = (f - a) / (b - a);
    return t * t * (3 - 2 * t);
  }

  function shiftAt(p) {
    const n = shifts.length - 1;
    const x = p * n;
    const k = Math.min(n - 1, Math.floor(x));
    return shifts[k] + (shifts[k + 1] - shifts[k]) * dwell(x - k);
  }

  function render(p) {
    const vw = viewport.clientWidth;
    const shift = shiftAt(p);
    track.style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
    rail.style.setProperty('--p', p.toFixed(4));
    const middle = shift + vw / 2;
    const n = shifts.length - 1;
    stops.forEach((s, i) => {
      // solo la comanda vicina al centro si alza; le altre restano stese sul legno
      const d = Math.min(1, Math.abs(centers[i] - middle) / Math.max(180, vw * 0.24));
      s.style.setProperty('--focus', (1 - d * d * (3 - 2 * d)).toFixed(3));
      if (ticks[i]) ticks[i].classList.toggle('passed', p >= (i + 1) / n - 0.22 / n);
    });
    hint.classList.toggle('gone', p > 0.015);
  }

  function step() {
    current += (target - current) * 0.16;
    if (Math.abs(target - current) < 0.0004) current = target;
    render(current);
    frame = current === target ? 0 : requestAnimationFrame(step);
  }

  function onScroll() {
    if (!live) return;
    target = clamp((window.scrollY - start) / total);
    if (!frame) frame = requestAnimationFrame(step);
  }

  let resizeFrame = 0;
  function relayout() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!live) track.style.transform = '';
      layout();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  // cambiando lingua le comande cambiano misura
  document.addEventListener('langchange', relayout);
  reduce.addEventListener('change', () => {
    track.style.transform = '';
    stops.forEach((s) => s.style.removeProperty('--focus'));
    relayout();
  });
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
})();
