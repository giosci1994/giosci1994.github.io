/* Pagina Dev: la mappa dell'homelab.
   Mentre si scorre la sezione resta ferma, i passi (li .lab-step in dev.html) accendono
   i pezzi uno alla volta e sulle linee accese viaggiano i "pacchetti".
   Sul telefono c'è uno schema compatto a tre colonne, sempre intero: le linee corrono
   negli spazi tra i riquadri. Senza JS i passi restano una lista normale. */
(function () {
  const section = document.getElementById('lab');
  const svg = document.getElementById('lab-map');
  const list = document.getElementById('lab-steps');
  const dotsEl = document.getElementById('lab-dots');
  if (!section || !svg || !list || !dotsEl) return;

  const t = (key, fallback) => (window.siteT && window.siteT(key)) || fallback;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone = window.matchMedia('(max-width: 700px)');
  const NS = 'http://www.w3.org/2000/svg';

  // due schemi: d = desktop/tablet, m = telefono. Per ogni riquadro: centro x, centro y, larghezza, altezza
  const LAYOUT = {
    d: { w: 760, h: 540, host: [120, 130, 520, 330], chip: { r: 12, title: 13.5, sub: 11, led: true } },
    m: { w: 360, h: 352, host: [4, 60, 352, 232], chip: { r: 10, title: 11, sub: 0, led: false } }
  };
  const NODES = {
    floor:     { title: 'floor3d-card', sub: 'dev.lab.n.floor', d: [85, 62, 150, 52], m: [60, 330, 100, 36] },
    net:       { title: 'Internet', sub: 'dev.lab.n.net', d: [380, 62, 160, 52], m: [180, 24, 100, 36] },
    pc:        { title: 'PC Windows', sub: 'PC-MQTT-Notifier', d: [675, 62, 150, 52], m: [300, 24, 100, 36] },
    nextcloud: { title: 'Nextcloud', sub: 'dev.lab.n.nextcloud', d: [205, 210, 150, 50], m: [60, 110, 100, 36] },
    traefik:   { title: 'Traefik', sub: 'reverse proxy', d: [380, 210, 150, 50], m: [180, 110, 100, 36] },
    pihole:    { title: 'Pi-hole', sub: 'dev.lab.n.pihole', d: [555, 210, 150, 50], m: [300, 110, 100, 36] },
    ha:        { title: 'Home Assistant', sub: 'dev.lab.n.ha', d: [380, 310, 150, 50], m: [180, 180, 100, 36] },
    mqtt:      { title: 'dev.lab.n.mqtt.t', sub: 'dev.lab.n.mqtt', d: [555, 310, 150, 50], m: [300, 180, 100, 36] },
    wireguard: { title: 'WireGuard', sub: 'VPN', d: [380, 410, 150, 50], m: [180, 250, 100, 36] },
    d2ha:      { title: 'd2ha', sub: 'container → HA', d: [555, 410, 150, 50], m: [300, 250, 100, 36] },
    casa:      { title: 'dev.lab.n.casa.t', sub: 'dev.lab.n.casa', d: [85, 500, 150, 52], m: [180, 330, 100, 36] },
    rpi:       { title: 'Raspberry Pi', sub: 'dev.lab.n.rpi', d: [675, 500, 150, 52], m: [300, 330, 100, 36], ghost: true }
  };

  // percorsi disegnati a mano: nessuna linea attraversa un riquadro o un'altra linea
  const EDGES = {
    'rpi-host': { d: 'M675,474 C675,462 640,460 610,460', m: 'M300,312 V292' },
    'casa-ha': { d: 'M85,474 C85,400 215,318 305,318', m: 'M130,330 H126 Q120,330 120,324 V196 Q120,190 126,190 H130' },
    'ha-mqtt': { d: 'M455,310 L480,310', m: 'M230,180 H250' },
    'd2ha-mqtt': { d: 'M555,385 L555,335', m: 'M300,232 V198' },
    'mqtt-pc': { d: 'M630,310 C670,310 675,240 675,88', m: 'M262,162 V151 Q262,145 256,145 H246 Q240,145 240,139 V30 Q240,24 246,24 H250' },
    'ha-floor': { d: 'M305,302 C175,302 85,230 85,88', m: 'M130,172 H66 Q60,172 60,178 V312' },
    'net-traefik': { d: 'M380,88 L380,185', m: 'M180,42 V92' },
    'traefik-nextcloud': { d: 'M305,210 L280,210', m: 'M130,110 H110' },
    'traefik-ha': { d: 'M380,235 L380,285', m: 'M180,128 V162' }
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

  const dots = steps.map((s, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => goTo(n));
    dotsEl.appendChild(b);
    return b;
  });

  /* ---------- disegno ---------- */
  let groups = {}, paths = {}, packets, key = '';

  function draw() {
    key = phone.matches ? 'm' : 'd';
    const L = LAYOUT[key], c = L.chip, small = key === 'm';
    svg.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    svg.classList.toggle('compact', small);
    svg.textContent = '';
    groups = {}; paths = {};

    const [hx, hy, hw, hh] = L.host;
    const host = make('g', { class: 'lab-host', 'data-k': 'host' }, svg);
    make('rect', { class: 'lab-host-box', x: hx, y: hy, width: hw, height: hh, rx: small ? 18 : 24 }, host);
    make('text', { class: 'lab-host-title', x: hx + (small ? 12 : 22), y: hy + (small ? 19 : 28) }, host).textContent = 'mini PC · Intel N150';
    const tw = small ? 52 : 64, th = small ? 17 : 21;
    const tag = make('g', { class: 'lab-host-tag', transform: `translate(${hx + hw - tw - (small ? 10 : 18)} ${hy + (small ? 7 : 13)})` }, host);
    make('rect', { width: tw, height: th, rx: 5 }, tag);
    make('text', { x: tw / 2, y: th / 2 + (small ? 3.2 : 3.8), 'text-anchor': 'middle' }, tag).textContent = 'DOCKER';
    groups.host = host;

    const edgeLayer = make('g', {}, svg);
    for (const id in EDGES) {
      paths[id] = make('path', { id: 'lab-e-' + id, class: 'lab-edge' + (GHOST_EDGES.has(id) ? ' ghost' : ''), d: EDGES[id][key] }, edgeLayer);
    }
    packets = make('g', {}, svg);

    for (const k in NODES) {
      const n = NODES[k], [x, y, w, h] = n[key];
      const g = make('g', { class: 'lab-node' + (n.ghost ? ' ghost' : ''), 'data-k': k, transform: `translate(${x} ${y})` }, svg);
      make('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: c.r }, g);
      if (c.led) {
        make('circle', { class: 'led', cx: -w / 2 + 16, cy: 0, r: 3.6 }, g);
        make('text', { class: 'n-title', x: -w / 2 + 28, y: -3, style: `font-size:${c.title}px` }, g);
        make('text', { class: 'n-sub', x: -w / 2 + 28, y: 15, style: `font-size:${c.sub}px` }, g);
      } else {
        // telefono: solo il nome, centrato; il ruolo lo spiega il testo sotto la mappa
        make('text', { class: 'n-title', x: 0, y: (c.title * 0.36).toFixed(1), 'text-anchor': 'middle', style: `font-size:${c.title}px` }, g);
      }
      groups[k] = g;
    }
    texts();
  }

  function texts() {
    for (const k in groups) {
      if (k === 'host') continue;
      groups[k].querySelector('.n-title').textContent = label(NODES[k].title);
      const sub = groups[k].querySelector('.n-sub');
      if (sub) sub.textContent = label(NODES[k].sub);
    }
    steps.forEach((s, n) => {
      dots[n].setAttribute('aria-label', `${t('dev.lab.step', 'Passo')} ${n + 1}: ${s.li.querySelector('h3').textContent}`);
    });
  }

  /* ---------- passi ---------- */
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
      const on = edges.has(id) && !GHOST_EDGES.has(id);
      paths[id].classList.toggle('on', on);
      if (on && !reduce.matches) {
        const dot = make('circle', { class: 'lab-packet', r: key === 'm' ? 2.8 : 3.4 }, packets);
        const len = paths[id].getTotalLength();
        const m = make('animateMotion', { dur: Math.max(0.9, len / (key === 'm' ? 60 : 90)).toFixed(2) + 's', repeatCount: 'indefinite', begin: '0s' }, dot);
        make('mpath', { href: '#lab-e-' + id }, m);
      }
    }
    steps.forEach((s, n) => s.li.classList.toggle('now', n === i));
    dots.forEach((b, n) => {
      b.classList.toggle('now', n === i);
      b.classList.toggle('seen', n < i);
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
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
  window.addEventListener('resize', () => { size(); onScroll(); });
  phone.addEventListener('change', () => { draw(); show(current, true); });
  reduce.addEventListener('change', () => show(current, true));
  document.addEventListener('langchange', texts);
})();
