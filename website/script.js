const RELEASE_API = 'https://api.github.com/repos/gh0sted5456-us/Dragonwilds-Sync/releases/latest';
const THEME_KEY = 'dragonwilds-sync-theme';
const CURRENT_CL_FALLBACK = 'CL-232224';
const SHARED_NAV_VERSION = 'nav-unified-20260827-9';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function sharedNavMarkup(page) {
  const routes = [['index.html','Home'],['downloads.html','Download'],['runeschema.html','RuneSchema'],['changelog.html','Changelog'],['docs.html','Docs']];
  return routes.map(([href,label]) => '<a href="'+href+'"'+(page===href?' aria-current="page"':href==='docs.html'&&!routes.some(([route])=>route===page)?' aria-current="location"':'')+'>'+label+'</a>').join('')+'<a href="https://github.com/gh0sted5456-us/Dragonwilds-Sync">GitHub ↗</a>';
}
function ensureSharedNavStyles() {}
function closeSharedNavGroups() {}
function bindSharedNav() {}

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
    const executable = (release.assets || []).find((asset) => /Portable.*\.exe$/i.test(String(asset?.name || '')) && asset?.browser_download_url)
      || (release.assets || []).find((asset) => /\.exe$/i.test(String(asset?.name || '')) && !/Headless/i.test(String(asset?.name || '')) && asset?.browser_download_url);
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

