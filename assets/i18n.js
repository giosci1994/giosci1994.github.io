/* i18n condiviso + boot (lang switch, reveal, anno) — zero build step */
(function () {
  const I18N = {
    it: {
      // --- hero / chooser ---
      'chef.kicker': 'di giorno',
      'chef.title': 'Lo Chef',
      'chef.tagline': 'Fine dining italiano, pasta fresca fatta a mano e griglia a carbone. Da Roma a Copenhagen, passando per Firenze e la Sicilia.',
      'chef.cta': 'Il percorso in cucina',
      'dev.kicker': '// di notte',
      'dev.title': 'Il Dev',
      'dev.tagline': 'IT enthusiast · Homelab & Automation. Container, domotica e software open source nati da problemi veri di casa.',
      'dev.cta': './progetti',
      'hero.sub': 'chef di professione · dev per passione',
      // --- nav ---
      'nav.home': '← Home',
      'nav.tochef': 'Lo Chef →',
      'nav.todev': 'Il Dev →',
      // --- chef page ---
      'chef.s.kicker': 'La cucina',
      'chef.s.title': 'Dieci anni tra i fornelli',
      'chef.s.lead': 'Laureato in Arti Culinarie all’Accademia Italiana di Cucina di Firenze, ho cucinato in hotel cinque stelle, ristoranti fine dining e resort — dall’Italia al Regno Unito, fino alla Danimarca.',
      'chef.t1': 'Pasta artigianale prodotta ogni giorno (pappardelle, gnudi, gnocchi), cotture alla griglia a carbone Josper, materie prime da piccoli produttori italiani.',
      'chef.t2': 'Responsabile della partita dei primi in un resort wellness 4 stelle sul Garda: risotti, pasta fresca e specialità locali ad alto volume.',
      'chef.t3': 'Capo partita e turnante in resort.',
      'chef.t4': 'Cucina italiana d’esportazione nel Regno Unito.',
      'chef.t5': 'Prime esperienze di responsabilità: gestione cucina, menù e brigata.',
      'chef.t5b': 'Capo partita in un ristorante di pesce fiorentino.',
      'chef.r5b': 'Capo Partita',
      'chef.t6': 'Capo partita: antipasti e secondi di pesce.',
      'chef.edu.title': 'Formazione',
      'chef.edu.p1': '<strong>Laurea in Arti Culinarie</strong> (EQF 6) — Accademia Italiana di Cucina “Cordon Bleu”, Firenze · accreditata EABHES · 2016–2019.',
      'chef.edu.p2': 'Masterclass di haute cuisine con chef stellati, gastronomia molecolare, panificazione con lievito madre, pasticceria e cioccolateria artigianale.',
      'chef.spec.title': 'Specialità',
      'chef.c1': 'Pasta fresca', 'chef.c2': 'Griglia Josper', 'chef.c3': 'Fine dining',
      'chef.c4': 'Gastronomia molecolare', 'chef.c5': 'Lievito madre', 'chef.c6': 'HACCP',
      'chef.ig': 'I piatti su Instagram',
      // --- dev page ---
      'dev.s.title': 'Homelab, domotica e open source',
      'dev.s.lead': 'Non sviluppatore di mestiere — appassionato vero. Un Raspberry Pi trasformato in un homelab completo, e la voglia di risolvere problemi reali con software fatto bene.',
      'dev.p1': 'Monitoraggio e controllo dei container Docker con web UI moderna e autodiscovery MQTT per Home Assistant. Il progetto di punta di Arborae.',
      'dev.p2': 'Organizzazione open source fondata con Baldo: software pulito, modulare e documentato.',
      'dev.p3': 'Script e tool Windows per sbloccare il supporto sperimentale NVMe nativo, con rollback e release automatiche.',
      'dev.p4': 'Appliance modulare per Home Assistant: deploy semplificato, wizard e App Store per container.',
      'dev.wip': 'In sviluppo', 'dev.wip2': 'In sviluppo',
      'dev.p5.title': 'Web-App Palestra',
      'dev.p5': 'Gestione schede e allenamenti in palestra. In cottura a bassa temperatura: non ancora pubblica.',
      'dev.p6': 'Raspberry Pi con Docker: Home Assistant, Traefik, Pi-hole, Nextcloud, WireGuard, tunnel Cloudflare e molto altro — tutto in casa.',
      // --- footer / meta ---
      'footer.note': 'fatto con ❤️ tra fornelli e container',
      '_meta.title.home': 'Giovanni La Cascia — Chef & Dev',
      '_meta.title.chef': 'Giovanni La Cascia — Lo Chef',
      '_meta.title.dev': 'Giovanni La Cascia — Il Dev',
      '_meta.desc.home': 'Giovanni La Cascia — Chef & IT enthusiast. Fine dining italiano di giorno, homelab e automazioni di notte.',
      '_meta.desc.chef': 'Il percorso in cucina di Giovanni La Cascia: fine dining italiano, da Roma a Copenhagen.',
      '_meta.desc.dev': 'I progetti di Giovanni La Cascia: homelab, domotica e software open source.'
    },
    en: {
      'chef.kicker': 'by day',
      'chef.title': 'The Chef',
      'chef.tagline': 'Italian fine dining, handmade fresh pasta and charcoal grilling. From Rome to Copenhagen, via Florence and Sicily.',
      'chef.cta': 'My journey in the kitchen',
      'dev.kicker': '// by night',
      'dev.title': 'The Dev',
      'dev.tagline': 'IT enthusiast · Homelab & Automation. Containers, home automation and open-source software born from real household problems.',
      'dev.cta': './projects',
      'hero.sub': 'chef by trade · dev by passion',
      'nav.home': '← Home',
      'nav.tochef': 'The Chef →',
      'nav.todev': 'The Dev →',
      'chef.s.kicker': 'The kitchen',
      'chef.s.title': 'Ten years behind the stove',
      'chef.s.lead': 'With a Bachelor’s in Culinary Arts from the Italian Culinary Academy in Florence, I have cooked in five-star hotels, fine dining restaurants and resorts — across Italy, the UK and Denmark.',
      'chef.t1': 'Artisanal pasta made daily (pappardelle, gnudi, gnocchi), Josper charcoal grill cooking, ingredients from small Italian producers.',
      'chef.t2': 'Ran the primi piatti station at a 4-star wellness resort on Lake Garda: risottos, fresh pasta and local specialities at high volume.',
      'chef.t3': 'Chef de partie and tournant at a resort.',
      'chef.t4': 'Italian cuisine abroad, in the UK.',
      'chef.t5': 'First leadership role: running the kitchen, menus and brigade.',
      'chef.t5b': 'Chef de partie at a Florentine seafood restaurant.',
      'chef.r5b': 'Chef de Partie',
      'chef.t6': 'Station chef: appetizers and fish mains.',
      'chef.edu.title': 'Education',
      'chef.edu.p1': '<strong>Bachelor’s Degree in Culinary Arts</strong> (EQF 6) — Italian Culinary Academy “Cordon Bleu”, Florence · EABHES accredited · 2016–2019.',
      'chef.edu.p2': 'Haute cuisine masterclasses with Michelin-starred chefs, molecular gastronomy, sourdough baking, pastry and artisanal chocolaterie.',
      'chef.spec.title': 'Specialities',
      'chef.c1': 'Fresh pasta', 'chef.c2': 'Josper grill', 'chef.c3': 'Fine dining',
      'chef.c4': 'Molecular gastronomy', 'chef.c5': 'Sourdough', 'chef.c6': 'HACCP',
      'chef.ig': 'My dishes on Instagram',
      'dev.s.title': 'Homelab, home automation & open source',
      'dev.s.lead': 'Not a developer by trade — a true enthusiast. A Raspberry Pi turned into a full homelab, and the urge to solve real problems with well-crafted software.',
      'dev.p1': 'Monitor and control Docker containers with a modern web UI and MQTT autodiscovery for Home Assistant. Arborae’s flagship project.',
      'dev.p2': 'Open-source organization founded with Baldo: clean, modular, documented software.',
      'dev.p3': 'Windows scripts and tools to unlock experimental native NVMe support, with rollback and automated releases.',
      'dev.p4': 'Modular appliance for Home Assistant: simplified deploys, wizards and a container App Store.',
      'dev.wip': 'In progress', 'dev.wip2': 'In progress',
      'dev.p5.title': 'Gym Web-App',
      'dev.p5': 'Workout plans and training management. Slow-cooking sous-vide: not public yet.',
      'dev.p6': 'Raspberry Pi running Docker: Home Assistant, Traefik, Pi-hole, Nextcloud, WireGuard, Cloudflare tunnels and much more — all self-hosted.',
      'footer.note': 'made with ❤️ between stoves and containers',
      '_meta.title.home': 'Giovanni La Cascia — Chef & Dev',
      '_meta.title.chef': 'Giovanni La Cascia — The Chef',
      '_meta.title.dev': 'Giovanni La Cascia — The Dev',
      '_meta.desc.home': 'Giovanni La Cascia — Chef & IT enthusiast. Italian fine dining by day, homelab and automation by night.',
      '_meta.desc.chef': 'Giovanni La Cascia’s journey in the kitchen: Italian fine dining, from Rome to Copenhagen.',
      '_meta.desc.dev': 'Giovanni La Cascia’s projects: homelab, home automation and open-source software.'
    }
  };

  const HTML_KEYS = new Set(['chef.edu.p1', 'chef.edu.p2']);
  const PAGE = document.body.dataset.page || 'home';

  function setLang(lang) {
    const dict = I18N[lang] || I18N.it;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!(key in dict)) return;
      if (HTML_KEYS.has(key)) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });
    document.title = dict['_meta.title.' + PAGE];
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', dict['_meta.desc.' + PAGE]);
    const bIt = document.getElementById('lang-it');
    const bEn = document.getElementById('lang-en');
    if (bIt) bIt.classList.toggle('active', lang === 'it');
    if (bEn) bEn.classList.toggle('active', lang === 'en');
    try { localStorage.setItem('lang', lang); } catch (e) { }
  }

  const bIt = document.getElementById('lang-it');
  const bEn = document.getElementById('lang-en');
  if (bIt) bIt.addEventListener('click', () => setLang('it'));
  if (bEn) bEn.addEventListener('click', () => setLang('en'));

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { }
  if (saved === 'en') setLang('en');

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }
})();
