/* Pagina Dev: la mappa dell'homelab.
   Mentre si scorre la sezione resta ferma, i passi (li .lab-step in dev.html) accendono
   i pezzi uno alla volta e sulle linee accese viaggiano i "pacchetti".
   Sul telefono lo schema resta a misura leggibile e la vista si sposta sul passo in corso.
   Senza JS i passi restano una lista normale. */
(function () {
  const section = document.getElementById('lab');
  const svg = document.getElementById('lab-map');
  const view = document.getElementById('lab-view');
  const list = document.getElementById('lab-steps');
  const dotsEl = document.getElementById('lab-dots');
  if (!section || !svg || !view || !list || !dotsEl) return;

  const t = (key, fallback) => (window.siteT && window.siteT(key)) || fallback;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone = window.matchMedia('(max-width: 700px)');
  const NS = 'http://www.w3.org/2000/svg';
  const W = 760, H = 540;

  // centro x, centro y, larghezza, altezza (unità del viewBox)
  const NODES = {
    floor:     { at: [85, 62, 150, 52], title: 'floor3d-card', sub: 'dev.lab.n.floor' },
    net:       { at: [380, 62, 160, 52], title: 'Internet', sub: 'dev.lab.n.net' },
    pc:        { at: [675, 62, 150, 52], title: 'PC Windows', sub: 'PC-MQTT-Notifier' },
    nextcloud: { at: [205, 210, 150, 50], title: 'Nextcloud', sub: 'dev.lab.n.nextcloud' },
    traefik:   { at: [380, 210, 150, 50], title: 'Traefik', sub: 'reverse proxy' },
    pihole:    { at: [555, 210, 150, 50], title: 'Pi-hole', sub: 'dev.lab.n.pihole' },
    ha:        { at: [380, 310, 150, 50], title: 'Home Assistant', sub: 'dev.lab.n.ha' },
    mqtt:      { at: [555, 310, 150, 50], title: 'dev.lab.n.mqtt.t', sub: 'dev.lab.n.mqtt' },
    wireguard: { at: [380, 410, 150, 50], title: 'WireGuard', sub: 'VPN' },
    d2ha:      { at: [555, 410, 150, 50], title: 'd2ha', sub: 'container → HA' },
    casa:      { at: [85, 500, 150, 52], title: 'dev.lab.n.casa.t', sub: 'dev.lab.n.casa' },
    rpi:       { at: [675, 500, 150, 52], title: 'Raspberry Pi', sub: 'dev.lab.n.rpi', ghost: true }
  };
  const HOST = { x: 120, y: 130, w: 520, h: 330 };

  // percorsi disegnati a mano: nessuna linea attraversa un riquadro
  const EDGES = {
    'rpi-host': 'M675,474 C675,462 640,460 610,460',
    'casa-ha': 'M85,474 C85,400 215,318 305,318',
    'ha-mqtt': 'M455,310 L480,310',
    'd2ha-mqtt': 'M555,385 L555,335',
    'mqtt-pc': 'M630,310 C670,310 675,240 675,88',
    'ha-floor': 'M305,302 C175,302 85,230 85,88',
    'net-traefik': 'M380,88 L380,185',
    'traefik-nextcloud': 'M305,210 L280,210',
    'traefik-ha': 'M380,235 L380,285'
  };
  const GHOST_EDGES = new Set(['rpi-host']);

  const steps = Array.from(list.querySelectorAll('.lab-step')).map(li => ({
    li,
    on: li.dataset.on.split(' ').filter(Boolean),
    now: li.dataset.now.split(' ').filter(Boolean),
    edges: li.dataset.edges.split(' ').filter(Boolean)
  }));
  if (!steps.length) return;

  const label = v => (v.startsWith('dev.') ? t(v, '') : v);
  const make = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- disegno ---------- */
  const groups = {};
  const paths = {};
  let packets;

  function draw() {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.textContent = '';

    const host = make('g', { class: 'lab-host', 'data-k': 'host' }, svg);
    make('rect', { class: 'lab-host-box', x: HOST.x, y: HOST.y, width: HOST.w, height: HOST.h, rx: 24 }, host);
    make('text', { class: 'lab-host-title', x: HOST.x + 22, y: HOST.y + 28 }, host).textContent = 'mini PC · Intel N150';
    const tag = make('g', { class: 'lab-host-tag', transform: `translate(${HOST.x + HOST.w - 82} ${HOST.y + 13})` }, host);
    make('rect', { width: 64, height: 21, rx: 6 }, tag);
    make('text', { x: 32, y: 14.5, 'text-anchor': 'middle' }, tag).textContent = 'DOCKER';
    groups.host = host;

    const edgeLayer = make('g', {}, svg);
    for (const id in EDGES) {
      paths[id] = make('path', { id: 'lab-e-' + id, class: 'lab-edge' + (GHOST_EDGES.has(id) ? ' ghost' : ''), d: EDGES[id] }, edgeLayer);
    }
    packets = make('g', {}, svg);

    for (const k in NODES) {
      const n = NODES[k], [x, y, w, h] = n.at;
      const g = make('g', { class: 'lab-node' + (n.ghost ? ' ghost' : ''), 'data-k': k, transform: `translate(${x} ${y})` }, svg);
      make('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12 }, g);
      make('circle', { class: 'led', cx: -w / 2 + 16, cy: 0, r: 3.6 }, g);
      make('text', { class: 'n-title', x: -w / 2 + 28, y: -3 }, g);
      make('text', { class: 'n-sub', x: -w / 2 + 28, y: 15 }, g);
      groups[k] = g;
    }
    texts();
  }

  function texts() {
    for (const k in NODES) {
      const g = groups[k];
      g.querySelector('.n-title').textContent = label(NODES[k].title);
      g.querySelector('.n-sub').textContent = label(NODES[k].sub);
    }
    steps.forEach((s, n) => {
      dots[n].setAttribute('aria-label', `${t('dev.lab.step', 'Passo')} ${n + 1}: ${s.li.querySelector('h3').textContent}`);
    });
  }

  /* ---------- passi ---------- */
  const dots = steps.map((s, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => goTo(n));
    dotsEl.appendChild(b);
    return b;
  });

  let current = -1;

  function show(i, force) {
    if (i === current && !force) return;
    current = i;
    const lit = new Set(['host']), edges = new Set();
    steps.forEach((s, n) => {
      if (n > i) return;
      s.on.forEach(k => lit.add(k));
      s.edges.forEach(e => edges.add(e));
    });
    const now = new Set(steps[i].now);
    for (const k in groups) {
      groups[k].classList.toggle('on', lit.has(k));
      groups[k].classList.toggle('now', now.has(k));
    }
    packets.textContent = '';
    for (const id in paths) {
      const on = edges.has(id);
      paths[id].classList.toggle('on', on && !GHOST_EDGES.has(id));
      if (on && !GHOST_EDGES.has(id) && !reduce.matches) {
        const dot = make('circle', { class: 'lab-packet', r: 3.4 }, packets);
        const len = paths[id].getTotalLength();
        const m = make('animateMotion', { dur: Math.max(0.9, len / 90).toFixed(2) + 's', repeatCount: 'indefinite', begin: '0s' }, dot);
        make('mpath', { href: '#lab-e-' + id }, m);
      }
    }
    steps.forEach((s, n) => s.li.classList.toggle('now', n === i));
    dots.forEach((b, n) => {
      b.classList.toggle('now', n === i);
      b.classList.toggle('seen', n < i);
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    aim(i);
  }

  // telefono: la "telecamera" inquadra i pezzi del passo in corso
  function aim(i) {
    if (!phone.matches) { svg.style.transform = ''; return; }
    const k = svg.getBoundingClientRect().width / W;
    const vw = view.clientWidth, vh = view.clientHeight;
    const boxOf = key => (key === 'host' ? [HOST.x + HOST.w / 2, HOST.y + HOST.h / 2, HOST.w, HOST.h] : NODES[key] && NODES[key].at);
    const grow = (b, key) => {
      const n = boxOf(key);
      if (!n) return b;
      return [Math.min(b[0], n[0] - n[2] / 2), Math.min(b[1], n[1] - n[3] / 2), Math.max(b[2], n[0] + n[2] / 2), Math.max(b[3], n[1] + n[3] / 2)];
    };
    // prima i pezzi del passo; quelli di contorno solo se ci stanno nella stessa inquadratura
    let b = steps[i].now.reduce(grow, [Infinity, Infinity, -Infinity, -Infinity]);
    steps[i].on.forEach(key => {
      const wider = grow(b, key);
      if ((wider[2] - wider[0]) * k <= vw - 16 && (wider[3] - wider[1]) * k <= vh - 16) b = wider;
    });
    const cx = (b[0] + b[2]) / 2 * k, cy = (b[1] + b[3]) / 2 * k;
    const tx = Math.min(0, Math.max(vw - W * k, vw / 2 - cx));
    const ty = Math.min(0, Math.max(vh - H * k, vh / 2 - cy));
    svg.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
  }

  /* ---------- scorrimento ---------- */
  function span() { return section.offsetHeight - window.innerHeight; }

  function goTo(n) {
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + span() * (n + 0.5) / steps.length, behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  function size() {
    // uno schermo fermo più poco più di mezzo schermo per ogni passo
    section.style.height = Math.round(window.innerHeight * (1 + 0.55 * (steps.length - 1))) + 'px';
  }

  function onScroll() {
    const s = span();
    const p = s > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / s)) : 0;
    show(Math.min(steps.length - 1, Math.floor(p * steps.length)));
  }

  section.classList.add('live');
  draw();
  size();
  onScroll();
  if (current < 0) show(0);

  let raf = 0;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', () => { size(); onScroll(); aim(current); });
  phone.addEventListener('change', () => aim(current));
  reduce.addEventListener('change', () => show(current, true));
  document.addEventListener('langchange', texts);
})();
