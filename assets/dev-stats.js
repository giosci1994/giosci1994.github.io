/* Pagina Dev: i numeri del profilo GitHub, disegnati nella pagina.
   I dati sono stats.json, che il workflow del repository giosci1994/giosci1994 rigenera
   ogni giorno sul branch output. Se il file non arriva la sezione resta nascosta. */
(function () {
  const SRC = 'https://raw.githubusercontent.com/giosci1994/giosci1994/output/stats.json';
  const PROFILE = 'https://github.com/giosci1994';
  const section = document.getElementById('numeri');
  const body = document.getElementById('stats-body');
  if (!section || !body || !window.fetch) return;

  const NS = 'http://www.w3.org/2000/svg';
  const t = (key, fallback) => (window.siteT && window.siteT(key)) || fallback;
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'it');
  const locale = () => (lang() === 'en' ? 'en-GB' : 'it-IT');
  const fmt = n => new Intl.NumberFormat(locale()).format(n);
  const pct = n => new Intl.NumberFormat(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n * 100) + '%';
  const day = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const dayFmt = () => new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short' });
  const range = (a, b) => {
    const d1 = day(a), d2 = day(b);
    if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
      const m = new Intl.DateTimeFormat(locale(), { month: 'short' }).format(d2).replace('.', '');
      return `${d1.getDate()}–${d2.getDate()} ${m}`;
    }
    return dayFmt().format(d1) + ' – ' + dayFmt().format(d2);
  };

  let data = null;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const sv = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  function tile(num, label, sub) {
    const d = el('div', 'stat');
    d.append(el('span', 'stat-num', num), el('span', 'stat-label', label));
    if (sub) d.append(el('span', 'stat-sub', sub));
    return d;
  }

  function niceMax(v) {
    if (v <= 4) return 4;
    const step = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= v) return m * step;
    return 10 * step;
  }

  function chart(weeks, width) {
    const h = width < 520 ? 170 : 200;
    const pad = { l: 34, r: 8, t: 22, b: 24 };
    const pw = width - pad.l - pad.r, ph = h - pad.t - pad.b;
    const counts = weeks.map(w => w.count);
    const sorted = counts.slice().sort((a, b) => b - a);
    // una settimana fuori scala non deve schiacciare tutte le altre
    const ref = sorted[0] > 2 * sorted[1] && sorted[1] > 0 ? sorted[1] : sorted[0];
    const max = niceMax(ref || 1);
    const total = counts.reduce((a, b) => a + b, 0);

    const svg = sv('svg', { class: 'activity', viewBox: `0 0 ${width} ${h}`, width, height: h, role: 'img',
      'aria-label': fill(t('dev.st.aria', '{n}'), { n: fmt(total) }) });
    [0, max / 2, max].forEach(v => {
      const y = pad.t + ph - (v / max) * ph;
      sv('line', { class: 'grid', x1: pad.l, x2: width - pad.r, y1: y, y2: y }, svg);
      sv('text', { class: 'axis', x: pad.l - 8, y: y + 4, 'text-anchor': 'end' }, svg).textContent = fmt(v);
    });

    const band = pw / weeks.length, bw = Math.max(2, band * 0.62);
    const months = new Intl.DateTimeFormat(locale(), { month: 'short' });
    let lastMonth = -1, lastLabelX = -Infinity;
    weeks.forEach((w, i) => {
      const x = pad.l + i * band + (band - bw) / 2;
      const over = w.count > max;
      const bh = Math.max(w.count ? 2 : 0, (Math.min(w.count, max) / max) * ph);
      const r = sv('rect', { class: 'bar' + (i === weeks.length - 1 ? ' last' : '') + (over ? ' over' : ''),
        x: x.toFixed(1), y: (pad.t + ph - bh).toFixed(1), width: bw.toFixed(1), height: bh.toFixed(1), rx: Math.min(2, bw / 2) }, svg);
      sv('title', {}, r).textContent = fill(t('dev.st.bar', '{d}: {n}'), { d: range(w.start, w.end), n: fmt(w.count) });
      if (over) {
        sv('text', { class: 'over-label', x: (x + bw / 2).toFixed(1), y: pad.t - 8, 'text-anchor': 'middle' }, svg).textContent = '↑ ' + fmt(w.count);
      }
      const m = day(w.start).getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        const lx = x + bw / 2;
        if (i > 0 && lx - lastLabelX > (width < 520 ? 44 : 30)) {
          sv('text', { class: 'axis', x: lx.toFixed(1), y: h - 6, 'text-anchor': 'middle' }, svg).textContent = months.format(day(w.start)).replace('.', '');
          lastLabelX = lx;
        }
      }
    });
    sv('line', { class: 'base', x1: pad.l, x2: width - pad.r, y1: pad.t + ph, y2: pad.t + ph }, svg);
    return { svg, total };
  }

  function render() {
    if (!data) return;
    const c = data.contributions, s = data.streak.longest;
    body.textContent = '';

    const tiles = el('div', 'stat-tiles');
    tiles.append(
      tile(fmt(c.total), fill(t('dev.st.total', 'contributi dal {y}'), { y: c.since })),
      tile(fmt(c.thisYear), fill(t('dev.st.year', 'nel {y}'), { y: c.year })),
      tile(fmt(s.length), t('dev.st.streak', 'giorni di fila, il record'), s.length ? range(s.start, s.end) : ''),
      tile(fmt(data.repos), t('dev.st.repos', 'repository pubblici'))
    );

    const panels = el('div', 'stat-panels');

    const langs = el('figure', 'stat-panel langs');
    langs.append(el('figcaption', '', t('dev.st.langs', 'Linguaggi')));
    const barEl = el('div', 'lang-bar');
    const listEl = el('ul', 'lang-list');
    data.languages.forEach(l => {
      const name = l.name === 'Other' ? t('dev.st.other', 'Altri') : l.name;
      const color = l.color || 'var(--dark-muted)';
      const seg = el('span');
      seg.style.flexBasis = (l.share * 100) + '%';
      seg.style.background = color;
      barEl.append(seg);
      const li = el('li');
      const dot = el('i'); dot.style.background = color;
      li.append(dot, el('span', 'lang-name', name), el('span', 'lang-pct', pct(l.share)));
      listEl.append(li);
    });
    barEl.setAttribute('aria-hidden', 'true');
    langs.append(barEl, listEl);

    const act = el('figure', 'stat-panel act');
    const cap = el('figcaption');
    const plot = el('div', 'act-plot');
    act.append(cap, plot);
    panels.append(langs, act);

    const foot = el('p', 'stats-foot');
    foot.append(fill(t('dev.st.updated', 'aggiornato il {d}'), {
      d: new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(day(data.updated))
    }) + ' · ');
    const a = el('a', '', t('dev.st.profile', 'profilo GitHub') + ' ↗');
    a.href = PROFILE; a.target = '_blank'; a.rel = 'noreferrer';
    foot.append(a);

    body.append(tiles, panels, foot);

    // il grafico si disegna alla larghezza vera, così le scritte restano leggibili anche sul telefono
    const { svg, total } = chart(data.weekly, Math.max(260, Math.floor(plot.clientWidth)));
    plot.append(svg);
    cap.append(el('span', '', t('dev.st.weekly', 'Contributi a settimana · ultimi 12 mesi')), el('b', '', fmt(total)));
  }

  let lastWidth = 0;
  window.addEventListener('resize', () => {
    const w = body.clientWidth;
    if (data && Math.abs(w - lastWidth) > 8) { lastWidth = w; render(); }
  });
  document.addEventListener('langchange', render);

  fetch(SRC, { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(json => {
      if (!json || !json.contributions || !Array.isArray(json.weekly) || !json.weekly.length) throw new Error('stats.json incompleto');
      data = json;
      window.devStats = json;
      section.hidden = false;
      lastWidth = body.clientWidth;
      render();
      document.dispatchEvent(new CustomEvent('devstats', { detail: json }));
    })
    .catch(() => { /* niente dati, niente sezione */ });
})();
