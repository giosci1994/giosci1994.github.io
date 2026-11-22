/* Catalogo automatico "Altri progetti" — legge assets/projects.json + assets/projects-overrides.json (zero build step) */
(function () {
  const FALLBACK_TEXT = {
    'dev.more.all': 'Tutti',
    'dev.more.live': 'Live',
    'dev.more.repo': 'Repo',
    'dev.more.no_desc': 'Nessuna descrizione disponibile.',
    'dev.more.empty.title': 'Nessun progetto trovato',
    'dev.more.empty.desc': 'Ogni repository pubblico contrassegnato con il topic showcase comparirà qui automaticamente.',
    'dev.more.error': 'Impossibile caricare i progetti in questo momento.',
    'dev.cat.Gaming': 'Giochi'
  };

  function getLang() {
    if (window.siteI18n && typeof window.siteI18n.getLang === 'function') {
      return window.siteI18n.getLang();
    }
    return document.documentElement.lang === 'en' ? 'en' : 'it';
  }

  function t(key) {
    if (window.siteI18n && typeof window.siteI18n.t === 'function') {
      return window.siteI18n.t(key);
    }
    return FALLBACK_TEXT[key] || key;
  }

  function translateCategory(cat) {
    const key = 'dev.cat.' + cat;
    const translated = t(key);
    return translated && translated !== key ? translated : cat;
  }

  function isSafeHttpUrl(value) {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  function safeHttpsImageUrl(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!/^https:\/\//i.test(trimmed) || /["'()\\\r\n]/.test(trimmed)) return null;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' ? parsed.href : null;
    } catch (e) {
      return null;
    }
  }

  function normalizeUrl(value) {
    return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  }

  const filtersEl = document.getElementById('projects-filters');
  const gridEl = document.getElementById('projects-grid');
  if (!gridEl) return;

  const state = {
    status: 'loading',
    projects: [],
    overrides: {},
    activeCategory: 'all'
  };

  function resolveProject(project) {
    const ov = (project && typeof project.name === 'string' && state.overrides[project.name]) || {};
    const rawCats = Array.isArray(ov.categories) && ov.categories.length > 0
      ? ov.categories
      : (Array.isArray(project.categories) ? project.categories : []);
    const categories = rawCats
      .filter(cat => typeof cat === 'string' && cat.trim() !== '')
      .map(cat => cat.trim());

    const lang = getLang();
    const fallbackDesc = typeof project.description === 'string' ? project.description.trim() : '';
    const descIt = typeof ov.description_it === 'string' ? ov.description_it.trim() : '';
    const descEn = typeof ov.description_en === 'string' ? ov.description_en.trim() : '';
    const description = lang === 'it'
      ? (descIt || fallbackDesc || t('dev.more.no_desc'))
      : (descEn || fallbackDesc || t('dev.more.no_desc'));

    const title = (typeof ov.title === 'string' && ov.title.trim()) ||
      (typeof project.title === 'string' && project.title.trim()) ||
      (typeof project.name === 'string' && project.name.trim()) ||
      'Project';

    const badge = (typeof ov.badge === 'string' && ov.badge.trim()) || categories[0] || '';
    const image = safeHttpsImageUrl(ov.image) || safeHttpsImageUrl(project.image);
    const language = typeof project.language === 'string' ? project.language.trim() : '';
    const license = (typeof ov.license === 'string' && ov.license.trim()) ||
      (typeof project.license === 'string' ? project.license.trim() : '');

    return {
      name: project.name || '',
      title,
      badge,
      description,
      categories,
      image,
      language,
      license,
      url: typeof project.url === 'string' ? project.url.trim() : '',
      repo: typeof project.repo === 'string' ? project.repo.trim() : ''
    };
  }

  function createActionLink(href, label, variantClass) {
    const link = document.createElement('a');
    link.className = 'dev-btn ' + variantClass;
    link.setAttribute('href', href.trim());
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noreferrer noopener');
    link.textContent = label;
    return link;
  }

  function renderEmptyCard(badgeText, titleText, descText) {
    const card = document.createElement('article');
    card.className = 'proj proj-empty';

    const top = document.createElement('div');
    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'p-badge grey';
      badge.textContent = badgeText;
      top.appendChild(badge);
    }
    if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText;
      top.appendChild(heading);
    }
    const desc = document.createElement('p');
    desc.textContent = descText;
    top.appendChild(desc);

    card.appendChild(top);
    return card;
  }

  function renderProjectCard(item) {
    const card = document.createElement('article');
    card.className = 'proj';
    if (item.image) {
      card.style.setProperty('--bg-img', 'url("' + item.image + '")');
    }

    const top = document.createElement('div');
    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'p-badge grey';
      badge.textContent = item.badge;
      top.appendChild(badge);
    }

    const heading = document.createElement('h3');
    heading.textContent = item.title;
    top.appendChild(heading);

    const desc = document.createElement('p');
    desc.textContent = item.description;
    top.appendChild(desc);

    card.appendChild(top);

    const metaParts = [];
    if (item.language) metaParts.push(item.language);
    if (item.license) metaParts.push(item.license);

    const hasRepo = isSafeHttpUrl(item.repo);
    const hasLive = isSafeHttpUrl(item.url) && normalizeUrl(item.url) !== normalizeUrl(item.repo);

    if (metaParts.length > 0 || hasLive || hasRepo) {
      const bottom = document.createElement('div');
      bottom.className = 'proj-bottom';

      if (metaParts.length > 0) {
        const meta = document.createElement('p');
        meta.className = 'proj-meta';
        meta.textContent = metaParts.join(' · ');
        bottom.appendChild(meta);
      }

      if (hasLive || hasRepo) {
        const links = document.createElement('div');
        links.className = 'proj-links';
        if (hasLive) links.appendChild(createActionLink(item.url, t('dev.more.live'), 'solid'));
        if (hasRepo) links.appendChild(createActionLink(item.repo, t('dev.more.repo'), 'line'));
        bottom.appendChild(links);
      }

      card.appendChild(bottom);
    }

    return card;
  }

  function renderFilters(categories) {
    if (!filtersEl) return;
    filtersEl.replaceChildren();

    if (categories.length === 0) {
      filtersEl.hidden = true;
      return;
    }

    filtersEl.hidden = false;

    const options = [{ key: 'all', label: t('dev.more.all') }].concat(
      categories.map(cat => ({ key: cat, label: translateCategory(cat) }))
    );

    options.forEach(opt => {
      const btn = document.createElement('button');
      const isActive = state.activeCategory === opt.key;
      btn.type = 'button';
      btn.className = isActive ? 'filter-pill active' : 'filter-pill';
      btn.setAttribute('aria-pressed', String(isActive));
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (state.activeCategory === opt.key) return;
        state.activeCategory = opt.key;
        render();
      });
      filtersEl.appendChild(btn);
    });
  }

  function render() {
    if (state.status === 'loading') return;

    if (state.status === 'error') {
      if (filtersEl) {
        filtersEl.replaceChildren();
        filtersEl.hidden = true;
      }
      gridEl.replaceChildren(renderEmptyCard(null, null, t('dev.more.error')));
      return;
    }

    const resolved = state.projects.map(resolveProject);
    const categories = Array.from(
      new Set(resolved.flatMap(item => item.categories))
    ).sort((a, b) => a.localeCompare(b));

    if (state.activeCategory !== 'all' && !categories.includes(state.activeCategory)) {
      state.activeCategory = 'all';
    }

    renderFilters(categories);

    const visible = state.activeCategory === 'all'
      ? resolved
      : resolved.filter(item => item.categories.includes(state.activeCategory));

    if (visible.length === 0) {
      gridEl.replaceChildren(
        renderEmptyCard('showcase', t('dev.more.empty.title'), t('dev.more.empty.desc'))
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    visible.forEach(item => fragment.appendChild(renderProjectCard(item)));
    gridEl.replaceChildren(fragment);
  }

  window.addEventListener('site:langchange', render);

  const fetchProjects = fetch('assets/projects.json').then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });

  const fetchOverrides = fetch('assets/projects-overrides.json')
    .then(res => (res.ok ? res.json() : {}))
    .catch(() => ({}));

  Promise.all([fetchProjects, fetchOverrides])
    .then(([projectsData, overridesData]) => {
      state.projects = projectsData && Array.isArray(projectsData.projects) ? projectsData.projects : [];
      state.overrides = overridesData && typeof overridesData === 'object' && !Array.isArray(overridesData)
        ? overridesData
        : {};
      state.status = 'ready';
      render();
    })
    .catch(() => {
      state.status = 'error';
      render();
    });
})();
