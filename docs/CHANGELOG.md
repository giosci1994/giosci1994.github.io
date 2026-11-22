# Changelog

All notable structural changes to `giosci1994.github.io` are documented in this file.

## [2026-11-22] — Hybrid Projects Showcase (`dev.html`)

### Added
- `scripts/update_projects.py`: zero-dependency Python 3.12+ stdlib indexer that fetches public `giosci1994` repositories tagged with `showcase` (or forced locally via `--include-repos`), maps raw topics/languages into clean macro-categories (`Windows`, `Home Assistant`, `Web App`, `Gaming`, `Utility`), keeps custom Open Graph images via GitHub GraphQL (with REST fallback), and builds deterministic `assets/projects.json`.
- `scripts/test_update_projects.py`: offline `unittest` suite covering topic filtering, exclusions, forks, macro-categories, license/OG handling, URL resolution, sorting, and GraphQL/REST pagination.
- `assets/projects.json`: initial generated catalog of the 7 showcase repositories.
- `assets/projects-overrides.json`: curated bilingual (`IT` copy + titles/badges/licenses) overrides for the showcase repositories.
- `assets/projects.js`: vanilla DOM renderer (`createElement`/`textContent` only, URL validation) for `#more-projects` (`#projects-filters` + `#projects-grid`) with live `site:langchange` sync.
- `.github/workflows/update-projects.yml`: scheduled (`0 3 * * *`), `workflow_dispatch`, and `repository_dispatch` (`projects-updated`) workflow keeping `assets/projects.json` updated.

### Changed
- `dev.html`: kept the upper `#projects` featured area as the full-width `Arborae` banner (`.proj.org-banner`) followed by a 3-column row (`d2ha`, `GymMaster`, `Floor3d Card`), moved the remaining projects into the automated `#more-projects` catalog below, and loaded `assets/projects.js`.
- `assets/i18n.js`: updated IT/EN copy for `GymMaster` and `Floor3d Card`, added `dev.more.*` keys, exposed `window.siteI18n = { getLang, t }`, dispatched `site:langchange` on `window`, and cleaned up unused project keys.
- `assets/dev-projects.js` & `assets/dev-terminal.js`: updated pointer spotlight delegation across `.dev-zone` cards and terminal project discovery across both `#projects` and `#projects-grid`.
- `style.css`: added styles and responsive rules for `.proj.org-banner`, `.more-projects`, `.filter-bar`, `.filter-pill`, `.proj-meta`, `.proj-bottom`, `.proj-empty`, and `.projects-loading`.
- `README.md`: documented the hybrid projects architecture, `showcase` topic, overrides file, local script usage, and GitHub Actions workflow.
