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
      'chef.r6': 'Cuoco',
      // --- tagliere delle comande ---
      'chef.board.school': 'Scuola',
      'chef.board.since': 'DAL 2016',
      'chef.board.hint': 'Scorri',
      'chef.city.firenze': 'Firenze',
      'chef.city.roma': 'Roma',
      'chef.edu.role': 'Laurea in Arti Culinarie',
      'chef.edu.place': 'Accademia Italiana di Cucina “Cordon Bleu”',
      'chef.edu.ticket': 'EQF 6, accreditata EABHES. Masterclass con chef stellati, gastronomia molecolare, lievito madre, pasticceria e cioccolateria.',
      'chef.contact.title': 'Contatti',
      'chef.contact.text': 'Cerchi un cuoco per la tua brigata, un evento o una collaborazione? Scrivimi.',
      'chef.spec.title': 'Specialità',
      'chef.c1': 'Pasta fresca', 'chef.c2': 'Griglia Josper', 'chef.c3': 'Fine dining',
      'chef.c4': 'Gastronomia molecolare', 'chef.c5': 'Lievito madre', 'chef.c6': 'HACCP',
      'chef.ig': 'I piatti su Instagram',
      'chef.plates.kicker': 'Dal pass',
      'chef.plates.title': 'I piatti',
      'chef.plates.lead': 'Una selezione dei piatti che ho cucinato negli anni, dalla scuola alle brigate. Tocca una foto per vederla intera.',
      'chef.behind.title': 'Dietro le quinte',
      'chef.behind.lead': 'La parte che in sala non si vede: macelleria e preparazioni.',
      'chef.v1': 'Sezionatura di mezzo maiale',
      'chef.v2': 'Dal cosciotto allo spezzatino',
      'chef.v3': 'Sfilettare un pesce intero',
      'chef.plate.alt': 'Un piatto di Giovanni La Cascia',
      'chef.clip.play': 'Riproduci',
      'chef.clip.pause': 'Metti in pausa',
      'chef.lb.close': 'Chiudi',
      'chef.lb.prev': 'Foto precedente',
      'chef.lb.next': 'Foto successiva',
      // --- dev page ---
      'dev.s.title': 'Homelab, domotica e open source',
      'dev.s.lead': 'Non sviluppatore di mestiere — appassionato vero. Un homelab completo, nato su un Raspberry Pi e oggi su un mini PC Intel N150, e la voglia di risolvere problemi reali con software fatto bene.',
      'dev.p1': 'Monitoraggio e controllo dei container Docker con web UI moderna e autodiscovery MQTT per Home Assistant. Il progetto di punta di Arborae.',
      'dev.p2': 'Organizzazione open source fondata con Baldo: software pulito, modulare e documentato.',
      'dev.p3': 'Script e tool Windows per sbloccare il supporto sperimentale NVMe nativo, con rollback e release automatiche.',
      'dev.wip': 'In sviluppo', 'dev.wip2': 'In sviluppo',
      'dev.p5.title': 'Web-App Palestra',
      'dev.p5': 'Piattaforma a microservizi per la gestione della palestra: schede e allenamenti, dashboard web, bot Telegram e scraper automatico.',
      'dev.kitchen.title': 'Kitchen App',
      'dev.kitchen': 'Applicazione web per la gestione della cucina e delle ricette.',
      'dev.spotify.title': 'Widget Spotify',
      'dev.spotify': 'Widget in tempo reale per Spotify.',
      'dev.floor3d': 'Il digital twin 3D della casa in Home Assistant: fork di floor3d-card con librerie aggiornate, editor visuale, mappe dei sensori, allarmi, cielo e meteo. Nella lista ufficiale di HACS.',
      'dev.mqtt': 'Notifiche di MQTT e Home Assistant in sovrimpressione su Windows: leggere, personalizzabili, con sfondi animati.',
      'dev.translation': 'Traduzione',
      'dev.rejuv': 'Traduzione amatoriale completa di Pokémon Rejuvenation in italiano: dialoghi, interfaccia, oggetti, mosse e Pokédex, il 99,9% dei testi. Su Windows, Linux, macOS, Android e iOS.',
      'dev.site': 'Sito',
      'dev.term.open': 'apri il terminale',
      'dev.term.title': 'Terminale',
      'dev.term.close': 'Chiudi il terminale',
      'dev.term.input': 'Comando',
      'dev.lab.title': 'Come gira casa mia',
      'dev.lab.lead': 'Un mini PC, qualche container e tanti messaggi MQTT. Scorri: i pezzi si accendono uno alla volta e i dati iniziano a viaggiare.',
      'dev.lab.s1.t': 'Il mini PC',
      'dev.lab.s1': 'Un Intel N150 acceso giorno e notte, con ogni servizio nel suo container Docker. Tutto è partito da un Raspberry Pi.',
      'dev.lab.s2': 'Il cervello della casa: legge i sensori, accende le luci, fa partire le automazioni.',
      'dev.lab.s3.t': 'Broker MQTT',
      'dev.lab.s3': 'Il postino. Ogni servizio pubblica e ascolta messaggi su argomenti, senza dover conoscere gli altri.',
      'dev.lab.s4': 'Il progetto di punta di Arborae: ogni container Docker entra in Home Assistant con l’autodiscovery MQTT. Stato, risorse, avvio e stop da un’unica dashboard.',
      'dev.lab.s5': 'Le notifiche della casa arrivano sul PC Windows, in sovrimpressione sopra tutto il resto.',
      'dev.lab.s6': 'La casa in 3D dentro la dashboard: ogni stanza si colora con i suoi sensori. È nella lista ufficiale di HACS.',
      'dev.lab.s7.t': 'Traefik e il tunnel',
      'dev.lab.s7': 'Il tunnel Cloudflare porta i servizi fuori casa senza aprire porte sul router. Traefik smista ogni richiesta al container giusto, Nextcloud compreso.',
      'dev.lab.s8': 'Pi-hole filtra pubblicità e tracker per tutta la rete di casa. WireGuard è la VPN per rientrare quando sono fuori.',
      'dev.lab.dots': 'Passi della mappa',
      'dev.lab.step': 'Passo',
      'dev.lab.n.floor': 'la casa in 3D',
      'dev.lab.n.net': 'tunnel Cloudflare',
      'dev.lab.n.nextcloud': 'i file di casa',
      'dev.lab.n.pihole': 'filtro DNS',
      'dev.lab.n.ha': 'il cervello',
      'dev.lab.n.mqtt.t': 'Broker MQTT',
      'dev.lab.n.mqtt': 'il postino',
      'dev.lab.n.casa.t': 'Casa',
      'dev.lab.n.casa': 'sensori e luci',
      'dev.lab.n.rpi': 'dov’è iniziato',
      'dev.f.label': 'Filtra i progetti',
      'dev.f.all': 'Tutti',
      'dev.f.web': 'Web app',
      'dev.f.games': 'Giochi',
      'dev.st.title': 'Un anno di commit',
      'dev.st.lead': 'I numeri del mio profilo GitHub, aggiornati ogni giorno.',
      'dev.st.total': 'contributi dal {y}',
      'dev.st.year': 'nel {y}',
      'dev.st.streak': 'giorni di fila, il record',
      'dev.st.repos': 'repository pubblici',
      'dev.st.langs': 'Linguaggi',
      'dev.st.other': 'Altri',
      'dev.st.weekly': 'Contributi a settimana · ultimi 12 mesi',
      'dev.st.updated': 'aggiornato il {d}',
      'dev.st.profile': 'profilo GitHub',
      'dev.st.bar': '{d}: {n} contributi',
      'dev.st.aria': 'Contributi a settimana negli ultimi 12 mesi: {n} in totale.',
      'dev.p6': 'Nato su un Raspberry Pi, oggi su un mini PC Intel N150 con Docker: Home Assistant, Traefik, Pi-hole, Nextcloud, WireGuard, tunnel Cloudflare e molto altro — tutto in casa.',
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
      'chef.r6': 'Cook',
      'chef.board.school': 'School',
      'chef.board.since': 'SINCE 2016',
      'chef.board.hint': 'Scroll',
      'chef.city.firenze': 'Florence',
      'chef.city.roma': 'Rome',
      'chef.edu.role': 'Bachelor’s in Culinary Arts',
      'chef.edu.place': 'Italian Culinary Academy “Cordon Bleu”',
      'chef.edu.ticket': 'EQF 6, EABHES accredited. Masterclasses with Michelin-starred chefs, molecular gastronomy, sourdough, pastry and artisanal chocolate.',
      'chef.contact.title': 'Contact',
      'chef.contact.text': 'Looking for a chef for your brigade, an event or a collaboration? Get in touch.',
      'chef.spec.title': 'Specialities',
      'chef.c1': 'Fresh pasta', 'chef.c2': 'Josper grill', 'chef.c3': 'Fine dining',
      'chef.c4': 'Molecular gastronomy', 'chef.c5': 'Sourdough', 'chef.c6': 'HACCP',
      'chef.ig': 'My dishes on Instagram',
      'chef.plates.kicker': 'From the pass',
      'chef.plates.title': 'The plates',
      'chef.plates.lead': 'A selection of dishes I have cooked over the years, from culinary school to the brigades. Tap a photo to see it in full.',
      'chef.behind.title': 'Behind the scenes',
      'chef.behind.lead': 'The part guests never see: butchery and prep.',
      'chef.v1': 'Breaking down half a pig',
      'chef.v2': 'From leg to stew',
      'chef.v3': 'Filleting a whole fish',
      'chef.plate.alt': 'A dish by Giovanni La Cascia',
      'chef.clip.play': 'Play',
      'chef.clip.pause': 'Pause',
      'chef.lb.close': 'Close',
      'chef.lb.prev': 'Previous photo',
      'chef.lb.next': 'Next photo',
      'dev.s.title': 'Homelab, home automation & open source',
      'dev.s.lead': 'Not a developer by trade — a true enthusiast. A full homelab that started on a Raspberry Pi and now runs on an Intel N150 mini PC, and the urge to solve real problems with well-crafted software.',
      'dev.p1': 'Monitor and control Docker containers with a modern web UI and MQTT autodiscovery for Home Assistant. Arborae’s flagship project.',
      'dev.p2': 'Open-source organization founded with Baldo: clean, modular, documented software.',
      'dev.p3': 'Windows scripts and tools to unlock experimental native NVMe support, with rollback and automated releases.',
      'dev.wip': 'In progress', 'dev.wip2': 'In progress',
      'dev.p5.title': 'Gym Web-App',
      'dev.p5': 'Microservice platform for gym management: workout plans, web dashboard, Telegram bot and automated scraper.',
      'dev.kitchen.title': 'Kitchen App',
      'dev.kitchen': 'Web application for kitchen and recipe management.',
      'dev.spotify.title': 'Spotify Widget',
      'dev.spotify': 'Real-time widget for Spotify.',
      'dev.floor3d': 'A 3D digital twin of your home for Home Assistant: a fork of floor3d-card with updated libraries, a visual editor, sensor maps, alarms, sky and weather. In the official HACS store.',
      'dev.mqtt': 'MQTT and Home Assistant notifications as a lightweight, customizable overlay on Windows, with animated backgrounds.',
      'dev.translation': 'Translation',
      'dev.rejuv': 'A complete fan translation of Pokémon Rejuvenation into Italian: dialogue, UI, items, moves and Pokédex, 99.9% of the text. On Windows, Linux, macOS, Android and iOS.',
      'dev.site': 'Website',
      'dev.term.open': 'open the terminal',
      'dev.term.title': 'Terminal',
      'dev.term.close': 'Close the terminal',
      'dev.term.input': 'Command',
      'dev.lab.title': 'How my home runs',
      'dev.lab.lead': 'A mini PC, a few containers and plenty of MQTT messages. Scroll: the pieces light up one by one and the data starts to flow.',
      'dev.lab.s1.t': 'The mini PC',
      'dev.lab.s1': 'An Intel N150 running day and night, with every service in its own Docker container. It all started on a Raspberry Pi.',
      'dev.lab.s2': 'The brain of the house: it reads the sensors, switches the lights and runs the automations.',
      'dev.lab.s3.t': 'MQTT broker',
      'dev.lab.s3': 'The postman. Every service publishes and listens to messages on topics, without needing to know the others.',
      'dev.lab.s4': 'Arborae’s flagship project: every Docker container shows up in Home Assistant through MQTT autodiscovery. Status, resources, start and stop from a single dashboard.',
      'dev.lab.s5': 'Home notifications pop up on the Windows PC, on top of everything else.',
      'dev.lab.s6': 'The house in 3D inside the dashboard: every room lights up with its own sensors. It’s in the official HACS store.',
      'dev.lab.s7.t': 'Traefik and the tunnel',
      'dev.lab.s7': 'The Cloudflare tunnel takes the services outside the house without opening ports on the router. Traefik routes every request to the right container, Nextcloud included.',
      'dev.lab.s8': 'Pi-hole blocks ads and trackers for the whole home network. WireGuard is the VPN that gets me back in when I’m away.',
      'dev.lab.dots': 'Map steps',
      'dev.lab.step': 'Step',
      'dev.lab.n.floor': 'the house in 3D',
      'dev.lab.n.net': 'Cloudflare tunnel',
      'dev.lab.n.nextcloud': 'home files',
      'dev.lab.n.pihole': 'DNS filter',
      'dev.lab.n.ha': 'the brain',
      'dev.lab.n.mqtt.t': 'MQTT broker',
      'dev.lab.n.mqtt': 'the postman',
      'dev.lab.n.casa.t': 'Home',
      'dev.lab.n.casa': 'sensors and lights',
      'dev.lab.n.rpi': 'where it began',
      'dev.f.label': 'Filter projects',
      'dev.f.all': 'All',
      'dev.f.web': 'Web apps',
      'dev.f.games': 'Games',
      'dev.st.title': 'A year of commits',
      'dev.st.lead': 'The numbers from my GitHub profile, refreshed every day.',
      'dev.st.total': 'contributions since {y}',
      'dev.st.year': 'in {y}',
      'dev.st.streak': 'days in a row, my record',
      'dev.st.repos': 'public repositories',
      'dev.st.langs': 'Languages',
      'dev.st.other': 'Other',
      'dev.st.weekly': 'Contributions per week · last 12 months',
      'dev.st.updated': 'updated {d}',
      'dev.st.profile': 'GitHub profile',
      'dev.st.bar': '{d}: {n} contributions',
      'dev.st.aria': 'Contributions per week over the last 12 months: {n} in total.',
      'dev.p6': 'Started on a Raspberry Pi, now an Intel N150 mini PC running Docker: Home Assistant, Traefik, Pi-hole, Nextcloud, WireGuard, Cloudflare tunnels and much more — all self-hosted.',
      'footer.note': 'made with ❤️ between stoves and containers',
      '_meta.title.home': 'Giovanni La Cascia — Chef & Dev',
      '_meta.title.chef': 'Giovanni La Cascia — The Chef',
      '_meta.title.dev': 'Giovanni La Cascia — The Dev',
      '_meta.desc.home': 'Giovanni La Cascia — Chef & IT enthusiast. Italian fine dining by day, homelab and automation by night.',
      '_meta.desc.chef': 'Giovanni La Cascia’s journey in the kitchen: Italian fine dining, from Rome to Copenhagen.',
      '_meta.desc.dev': 'Giovanni La Cascia’s projects: homelab, home automation and open-source software.'
    }
  };

  const HTML_KEYS = new Set([]);
  // per gli script di pagina che compongono testi al volo (es. Riproduci/Pausa)
  window.siteT = key => (I18N[document.documentElement.lang] || I18N.it)[key];
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
    // testi alternativi ed etichette per i lettori di schermo
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (key in dict) el.setAttribute('alt', dict[key]);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label');
      if (key in dict) el.setAttribute('aria-label', dict[key]);
    });
    document.title = dict['_meta.title.' + PAGE];
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', dict['_meta.desc.' + PAGE]);
    const bIt = document.getElementById('lang-it');
    const bEn = document.getElementById('lang-en');
    if (bIt) bIt.classList.toggle('active', lang === 'it');
    if (bEn) bEn.classList.toggle('active', lang === 'en');
    try { localStorage.setItem('lang', lang); } catch (e) { }
    // chi ha testi che cambiano misura (il tagliere della pagina Chef) si ricalcola
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
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
