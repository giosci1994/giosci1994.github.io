/* Pagina Dev: il terminale nascosto.
   Si apre premendo ~ da qualsiasi punto della pagina, o col pulsante nell'intestazione.
   I comandi rispondono nella lingua scelta per il sito. */
(function () {
  const dlg = document.getElementById('term');
  const openBtn = document.getElementById('term-open');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  const out = document.getElementById('term-out');
  const body = document.getElementById('term-body');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-in');
  const tips = document.getElementById('term-tips');
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'it');

  const TXT = {
    it: {
      welcome: 'Benvenuto. Scrivi help per vedere i comandi, esc per chiudere.',
      help: [
        'Comandi:',
        '  ls               i progetti pubblicati',
        '  neofetch         l’homelab in breve',
        '  whoami           chi sono',
        '  contatti         dove trovarmi',
        '  cd chef          l’altra metà del sito',
        '  lang it | en     cambia lingua',
        '  sudo make coffee prova',
        '  clear            pulisce lo schermo',
        '  exit             chiude il terminale'
      ],
      legend: '● pubblicato   ◐ in sviluppo',
      whoami: ['Giovanni La Cascia. Chef de partie di giorno, homelabber di notte.', 'Cucino fine dining italiano e scrivo software per la casa.'],
      contacts: 'contatti',
      host: 'Host', before: 'Prima', services: 'Servizi', projects: 'Progetti', contrib: 'Contributi', since: 'dal',
      langs: 'Linguaggi', day: 'Di giorno', dayJob: 'chef de partie',
      onPage: 'sulla pagina',
      coffeePwd: '[sudo] password per giovanni: ••••••••',
      coffee: 'Fatto. Moka sul fuoco, tre minuti.', coffeeNote: '(il caffè non si compila)',
      sudoNo: 'giovanni non è nel file sudoers. L’episodio verrà segnalato.',
      cdChef: '→ in cucina…', cdHome: '→ a casa…', cdNo: d => `cd: ${d}: qui ci sono solo chef e home`,
      lsNo: a => `ls: ${a}: file o directory inesistente`,
      langOk: l => `lingua: ${l}`, langNo: 'uso: lang it | lang en',
      unknown: c => `${c}: comando non trovato. Prova help.`
    },
    en: {
      welcome: 'Welcome. Type help to see the commands, esc to close.',
      help: [
        'Commands:',
        '  ls               published projects',
        '  neofetch         the homelab at a glance',
        '  whoami           who I am',
        '  contact          where to find me',
        '  cd chef          the other half of the site',
        '  lang it | en     switch language',
        '  sudo make coffee try it',
        '  clear            clear the screen',
        '  exit             close the terminal'
      ],
      legend: '● released   ◐ in progress',
      whoami: ['Giovanni La Cascia. Chef de partie by day, homelabber by night.', 'I cook Italian fine dining and write software for the house.'],
      contacts: 'contact',
      host: 'Host', before: 'Before', services: 'Services', projects: 'Projects', contrib: 'Contributions', since: 'since',
      langs: 'Languages', day: 'By day', dayJob: 'chef de partie',
      onPage: 'on the page',
      coffeePwd: '[sudo] password for giovanni: ••••••••',
      coffee: 'Done. Moka pot on the stove, three minutes.', coffeeNote: '(coffee does not compile)',
      sudoNo: 'giovanni is not in the sudoers file. This incident will be reported.',
      cdChef: '→ to the kitchen…', cdHome: '→ going home…', cdNo: d => `cd: ${d}: only chef and home live here`,
      lsNo: a => `ls: ${a}: no such file or directory`,
      langOk: l => `language: ${l}`, langNo: 'usage: lang it | lang en',
      unknown: c => `${c}: command not found. Try help.`
    }
  };
  const T = () => TXT[lang()];

  const projects = () => Array.from(document.querySelectorAll('#projects .proj')).map(p => ({
    name: p.querySelector('h3').textContent.split(' — ')[0].trim(),
    wip: !!p.querySelector('.p-badge.wip')
  }));

  function neofetch() {
    const x = T(), s = window.devStats;
    const fmt = n => new Intl.NumberFormat(lang() === 'en' ? 'en-GB' : 'it-IT').format(n);
    const info = [
      ['', 'giovanni@homelab'],
      ['faint', '────────────────'],
      ['', `${x.host}: mini PC Intel N150`],
      ['', `${x.before}: Raspberry Pi`],
      ['', `${x.services}: Docker · Home Assistant · MQTT · Traefik · Pi-hole · Nextcloud · WireGuard`],
      ['', `${x.projects}: ${projects().length} ${x.onPage}`]
    ];
    if (s && s.contributions) info.push(['', `${x.contrib}: ${fmt(s.contributions.total)} ${x.since} ${s.contributions.since}`]);
    if (s && s.languages && s.languages.length) info.push(['', `${x.langs}: ${s.languages.filter(l => l.name !== 'Other').slice(0, 3).map(l => l.name).join(' · ')}`]);
    info.push(['', `${x.day}: ${x.dayJob}`]);
    const logo = ['┌────────────┐', '│ ▪ ▪ ▪   ≡≡ │', '├────────────┤', '│ ▪ ▪ ▪   ≡≡ │', '├────────────┤', '│ ▪ ▪ ▪   ≡≡ │', '└────────────┘'];
    const rows = [];
    for (let i = 0; i < Math.max(logo.length, info.length); i++) {
      rows.push(['pair', ['ok', (logo[i] || '').padEnd(16, ' ') + '  '], info[i] || ['', '']]);
    }
    return rows;
  }

  const COMMANDS = {
    help: () => T().help.map((l, i) => [i ? '' : 'muted', l]),
    ls: arg => (!arg || /^(progetti|projects|\.|~)$/.test(arg))
      ? projects().map(p => ['', (p.wip ? '◐ ' : '● ') + p.name]).concat([['faint', T().legend]])
      : [['warn', T().lsNo(arg)]],
    neofetch,
    whoami: () => T().whoami.map((l, i) => [i ? 'muted' : '', l]),
    contatti: () => [
      ['', 'email     giovanni.lacascia@outlook.com'],
      ['', 'github    github.com/giosci1994'],
      ['', 'linkedin  linkedin.com/in/giovannilacascia'],
      ['', 'instagram instagram.com/giovannilacascia']
    ],
    cd: arg => {
      if (arg === 'chef' || arg === 'chef.html') { setTimeout(() => { location.href = 'chef.html'; }, 450); return [['ok', T().cdChef]]; }
      if (!arg || arg === '~' || arg === '..' || arg === 'home' || arg === '/') { setTimeout(() => { location.href = 'index.html'; }, 450); return [['ok', T().cdHome]]; }
      return [['warn', T().cdNo(arg)]];
    },
    lang: arg => {
      const btn = document.getElementById(arg === 'en' ? 'lang-en' : arg === 'it' ? 'lang-it' : '');
      if (!btn) return [['warn', T().langNo]];
      btn.click();
      return [['ok', T().langOk(arg)]];
    },
    sudo: arg => (arg === 'make coffee'
      ? [['muted', T().coffeePwd], ['ok', T().coffee], ['faint', T().coffeeNote]]
      : [['warn', T().sudoNo]]),
    clear: () => { out.textContent = ''; return []; },
    exit: () => { setTimeout(() => dlg.close(), 120); return []; }
  };
  COMMANDS.aiuto = COMMANDS.help;
  COMMANDS.contact = COMMANDS.contatti;
  COMMANDS.contacts = COMMANDS.contatti;
  COMMANDS.dir = COMMANDS.ls;

  function print(rows) {
    rows.forEach(r => {
      const pre = document.createElement('pre');
      if (r[0] === 'pair') {
        const a = document.createElement('span'); a.className = r[1][0]; a.textContent = r[1][1];
        const b = document.createElement('span'); b.className = r[2][0]; b.textContent = r[2][1];
        pre.className = 'pair';
        pre.append(a, b);
      } else {
        if (r[0]) pre.className = r[0];
        pre.textContent = r[1];
      }
      out.appendChild(pre);
    });
  }

  const history = [];
  let hpos = 0;

  function run(line) {
    const clean = line.trim();
    const echo = document.createElement('pre');
    echo.className = 'cmd';
    echo.textContent = clean;
    out.appendChild(echo);
    if (clean) {
      history.push(clean);
      hpos = history.length;
      const [cmd, ...rest] = clean.split(/\s+/);
      const fn = COMMANDS[cmd.toLowerCase()];
      print(fn ? fn(rest.join(' ')) : [['warn', T().unknown(cmd)]]);
    }
    body.scrollTop = body.scrollHeight;
  }

  form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = ''; });

  const COMPLETE = ['help', 'ls', 'neofetch', 'whoami', 'contatti', 'contact', 'cd chef', 'lang it', 'lang en', 'sudo make coffee', 'clear', 'exit'];
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault(); hpos = Math.max(0, hpos - 1); input.value = history[hpos];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault(); hpos = Math.min(history.length, hpos + 1); input.value = history[hpos] || '';
    } else if (e.key === 'Tab' && input.value) {
      const hit = COMPLETE.find(c => c.startsWith(input.value.toLowerCase()) && c !== input.value);
      if (hit) { e.preventDefault(); input.value = hit; }
    }
  });

  body.addEventListener('click', () => {
    if (!String(window.getSelection())) input.focus({ preventScroll: true });
  });

  ['neofetch', 'ls', 'whoami', 'sudo make coffee', 'help'].forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => { run(c); input.focus({ preventScroll: true }); });
    tips.appendChild(b);
  });

  let started = false;
  function open() {
    if (dlg.open) return;
    document.documentElement.classList.add('term-open');
    dlg.showModal();
    if (!started) {
      started = true;
      print([['faint', T().welcome]]);
      run('neofetch');
    }
    input.focus({ preventScroll: true });
    body.scrollTop = body.scrollHeight;
  }

  dlg.addEventListener('close', () => document.documentElement.classList.remove('term-open'));
  dlg.querySelector('.term-close').addEventListener('click', () => dlg.close());
  // clic fuori dalla finestra chiude
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  if (openBtn) {
    openBtn.hidden = false;
    openBtn.addEventListener('click', open);
  }

  document.addEventListener('keydown', e => {
    if (dlg.open || e.defaultPrevented) return;
    const tgt = e.target;
    if (tgt && (tgt.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName))) return;
    const tilde = e.key === '~';
    const backquote = e.code === 'Backquote' && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (tilde || backquote) { e.preventDefault(); open(); }
  });
})();
