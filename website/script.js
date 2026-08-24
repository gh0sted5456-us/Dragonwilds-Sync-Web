const RELEASE_API = 'https://api.github.com/repos/gh0sted5456-us/Dragonwilds-Sync/releases/latest';
const THEME_KEY = 'dragonwilds-sync-theme';
const CURRENT_CL_FALLBACK = 'CL-232224';
const SHARED_NAV_VERSION = 'nav-unified-20260823-7';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function sharedNavMarkup(page) {
  const active = (...names) => names.includes(page) ? ' aria-current="page"' : '';
  const experienceActive = ['experience.html', 'setup.html', 'world-builder.html', 'launcher-preview.html'].includes(page);
  const learnMoreActive = ['about.html', 'helpy.html'].includes(page);
  const moddingActive = ['modding.html', 'mod-packaging.html', 'runeschema.html', 'for-modders.html'].includes(page);
  const chevron = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  return `
    <div class="nav-group nav-home" data-nav-group>
      <div class="nav-group-main">
        <a class="nav-group-link" href="index.html"${active('index.html')}>Home</a>
        <button class="nav-disclosure" type="button" aria-expanded="false" aria-label="Open Home menu">${chevron}</button>
      </div>
      <div class="nav-group-menu" role="menu">
        <a role="menuitem" href="downloads.html"${active('downloads.html')}>Downloads</a>
        <a role="menuitem" href="downloads.html#windows-download">Windows</a>
        <a role="menuitem" href="downloads.html#linux-download">Linux</a>
      </div>
    </div>
    <div class="nav-group nav-experience" data-nav-group>
      <div class="nav-group-main">
        <a class="nav-group-link" href="experience.html"${experienceActive ? ' aria-current="page"' : ''}>Experience</a>
        <button class="nav-disclosure" type="button" aria-expanded="false" aria-label="Open Experience menu">${chevron}</button>
      </div>
      <div class="nav-group-menu" role="menu">
        <a role="menuitem" href="setup.html"${active('setup.html')}>Setup Instructions</a>
        <a role="menuitem" href="setup.html#networking"${active('setup.html')}>Connection &amp; Ports</a>
        <a role="menuitem" href="world-builder.html"${active('world-builder.html')}>World Builder</a>
        <a role="menuitem" href="launcher-preview.html"${active('launcher-preview.html')}>Preview Launcher</a>
      </div>
    </div>
    <div class="nav-group nav-learn-more" data-nav-group>
      <div class="nav-group-main">
        <a class="nav-group-link" href="about.html"${learnMoreActive ? ' aria-current="page"' : ''}>Learn More</a>
        <button class="nav-disclosure" type="button" aria-expanded="false" aria-label="Open Learn More menu">${chevron}</button>
      </div>
      <div class="nav-group-menu" role="menu">
        <a role="menuitem" href="about.html"${active('about.html')}>About</a>
        <a role="menuitem" href="helpy.html"${active('helpy.html')}>Help</a>
      </div>
    </div>
    <div class="nav-group nav-modding" data-nav-group>
      <div class="nav-group-main">
        <a class="nav-group-link" href="modding.html"${moddingActive ? ' aria-current="page"' : ''}>Modding</a>
        <button class="nav-disclosure" type="button" aria-expanded="false" aria-label="Open Modding menu">${chevron}</button>
      </div>
      <div class="nav-group-menu" role="menu">
        <a role="menuitem" href="modding.html"${active('modding.html')}>Modding Hub</a>
        <a role="menuitem" href="mod-packaging.html"${active('mod-packaging.html')}>Mod Packaging</a>
        <a role="menuitem" href="runeschema.html#runeschema-flavors"${active('runeschema.html')}>RuneSchema Lab</a>
      </div>
    </div>
    <a class="nav-github" href="https://github.com/gh0sted5456-us/Dragonwilds-Sync">GitHub <span aria-hidden="true">↗</span></a>
  `;
}

function ensureSharedNavStyles() {
  if ($('#shared-nav-styles')) return;
  const style = document.createElement('style');
  style.id = 'shared-nav-styles';
  style.textContent = `
    .main-nav{overflow:visible!important}
    .nav-group{position:relative;display:flex;align-items:center;border-radius:10px}
    .nav-group-main{display:flex;align-items:center;border-radius:10px;transition:background .16s ease}
    .nav-group-link{padding-right:5px!important}
    .nav-disclosure{width:27px;height:34px;margin:0 2px 0 -2px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:background .16s ease,color .16s ease}
    .nav-disclosure:hover,.nav-disclosure:focus-visible{background:var(--panel-soft);color:var(--text);outline:none}
    .nav-disclosure svg{width:11px;height:11px;transition:transform .16s ease}
    .nav-group.open .nav-disclosure svg{transform:rotate(180deg)}
    .nav-group-menu{position:absolute;top:calc(100% + 8px);left:0;z-index:80;min-width:205px;padding:7px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--surface) 95%,transparent);backdrop-filter:blur(var(--glass-blur)) saturate(140%);box-shadow:0 16px 42px rgba(0,0,0,.28);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-4px);transition:opacity .14s ease,transform .14s ease,visibility .14s ease}
    .nav-group-menu::before{content:"";position:absolute;left:0;right:0;top:-12px;height:12px}
    .nav-group-menu a{display:flex!important;align-items:center;min-height:38px;padding:9px 10px!important;border-radius:8px;white-space:nowrap}
    .nav-group-menu a[aria-current="page"]{color:var(--text);background:color-mix(in srgb,var(--gold) 9%,var(--panel-soft))}
    .nav-group.open .nav-group-menu,.nav-group:focus-within .nav-group-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}
    .main-nav>a[aria-current="page"],.nav-group-link[aria-current="page"]{color:var(--text);background:color-mix(in srgb,var(--gold) 9%,var(--panel-soft))}
    @media (hover:hover) and (pointer:fine) and (min-width:901px){
      .nav-group:hover .nav-group-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}
      .nav-group:hover .nav-group-main{background:var(--panel-soft)}
    }
    @media(max-width:900px){
      .main-nav.open{overflow-y:auto!important;max-height:min(72vh,620px)}
      .nav-group{display:block;width:100%}
      .nav-group-main{display:grid;grid-template-columns:minmax(0,1fr) 44px;width:100%}
      .nav-group-link{padding:11px 12px!important}
      .nav-disclosure{width:40px;height:40px;margin:0;justify-self:end}
      .nav-group-menu{position:static;min-width:0;width:100%;max-height:0;overflow:hidden;padding:0 7px;border:0;border-radius:0;background:transparent;box-shadow:none;backdrop-filter:none;opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:max-height .2s ease,padding .2s ease}
      .nav-group-menu::before{display:none}
      .nav-group.open .nav-group-menu{max-height:320px;padding:4px 7px 8px}
      .nav-group-menu a{padding-left:20px!important;border-left:1px solid var(--line);border-radius:0 8px 8px 0}
    }
  `;
  document.head.appendChild(style);
}

function closeSharedNavGroups(except = null) {
  $$('[data-nav-group].open').forEach((group) => {
    if (group === except) return;
    group.classList.remove('open');
    $('.nav-disclosure', group)?.setAttribute('aria-expanded', 'false');
  });
}

function bindSharedNav(nav) {
  if (nav.dataset.sharedNavBound === SHARED_NAV_VERSION) return;
  nav.dataset.sharedNavBound = SHARED_NAV_VERSION;

  $$('[data-nav-group]', nav).forEach((group) => {
    const button = $('.nav-disclosure', group);
    button?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !group.classList.contains('open');
      closeSharedNavGroups(group);
      group.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });
}

function configureSharedNavigation(root = document) {
  ensureSharedNavStyles();
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navs = [...new Set([
    ...$$('.main-nav[data-shared-nav="1"]', root),
    ...$$('.site-header .main-nav', root)
  ])];

  navs.forEach((nav) => {
    if (nav.dataset.sharedNavVersion !== SHARED_NAV_VERSION) {
      nav.setAttribute('data-shared-nav', '1');
      nav.innerHTML = sharedNavMarkup(page);
      nav.dataset.sharedNavVersion = SHARED_NAV_VERSION;
      delete nav.dataset.sharedNavBound;
    }
    bindSharedNav(nav);
  });
}

configureSharedNavigation();

if (!document.documentElement.dataset.sharedNavGlobalEvents) {
  document.documentElement.dataset.sharedNavGlobalEvents = '1';
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.main-nav')) closeSharedNavGroups();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSharedNavGroups();
  });
}

const sharedNavObserver = new MutationObserver((mutations) => {
  const needsRefresh = mutations.some((mutation) => [...mutation.addedNodes].some((node) => {
    if (!(node instanceof Element)) return false;
    return node.matches?.('.main-nav,.site-header') || node.querySelector?.('.main-nav');
  }));
  if (needsRefresh) configureSharedNavigation();
});
sharedNavObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('beforeunload', () => sharedNavObserver.disconnect());

function setTheme(theme, persist = true) {
  const allowed = ['dark', 'white', 'glass'];
  const next = allowed.includes(theme) ? theme : 'dark';
  document.documentElement.dataset.theme = next;
  $$('.theme-switcher [data-theme-choice]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === next));
  });
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = next === 'white' ? '#f4f3ef' : next === 'glass' ? '#0b1117' : '#0b0d0f';
  if (persist) localStorage.setItem(THEME_KEY, next);
}

setTheme(localStorage.getItem(THEME_KEY) || 'dark', false);
$$('.theme-switcher [data-theme-choice]').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeChoice)));

const navToggle = $('.nav-toggle');
const nav = $('.main-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    if (!open) closeSharedNavGroups();
  });
  $$('a', nav).forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    closeSharedNavGroups();
  }));
}

const revealItems = $$('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

function safeText(value, fallback = '—', max = 180) {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text.slice(0, max) : fallback;
}

function safeList(value, maxItems = 12) {
  return Array.isArray(value) ? value.slice(0, maxItems).map((item) => safeText(item, '', 80)).filter(Boolean) : [];
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTimestamp(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n > 1e12 ? n : n * 1000;
}

function relativeTime(value) {
  const timestamp = normalizeTimestamp(value);
  if (!timestamp) return 'Unknown';
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function canonicalCl(value) {
  const match = String(value || '').trim().match(/^cl-?(\d{4,})$/i);
  return match ? `CL-${match[1]}` : '';
}

function publishCurrentCl(value) {
  const cl = canonicalCl(value) || CURRENT_CL_FALLBACK;
  window.DWS_CURRENT_CL = cl;
  $$('[data-current-cl]').forEach((node) => { node.textContent = cl; });
  window.dispatchEvent(new CustomEvent('dws-current-cl', { detail: { cl } }));
  return cl;
}

publishCurrentCl(CURRENT_CL_FALLBACK);

function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function appendChips(container, values, emptyText = 'None published') {
  const list = values.length ? values : [emptyText];
  list.forEach((value) => container.appendChild(makeEl('span', '', value)));
}

async function loadLatestRelease() {
  const releaseVersion = $('#release-version');
  const releaseDate = $('#release-date');
  const releaseLink = $('#release-link');
  if (!releaseVersion && !releaseDate && !releaseLink) return;
  try {
    const response = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error('No public release');
    const release = await response.json();
    const date = new Date(release.published_at || release.created_at);
    if (releaseVersion) releaseVersion.textContent = safeText(release.tag_name || release.name, 'Latest');
    if (releaseDate) releaseDate.textContent = Number.isNaN(date.getTime()) ? 'GitHub Releases' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const executable = (release.assets || []).find((asset) => /\.exe$/i.test(String(asset?.name || '')) && asset?.browser_download_url);
    if (releaseLink && executable) {
      releaseLink.href = executable.browser_download_url;
      releaseLink.setAttribute('download', '');
    }
  } catch (_) {
    if (releaseVersion) releaseVersion.textContent = 'Latest available';
    if (releaseDate) releaseDate.textContent = 'GitHub Releases';
  }
}

loadLatestRelease();



