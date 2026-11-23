import { AppWindow } from '../../ui/AppWindow.js';
import { FAVORITES } from '../../igor/index.js';
import { SITES, findSite } from '../../sites/index.js';
import { normalizePath } from '../../sites/Website.js';
import { esc } from '../../utils.js';
import './browser.css';

/** Grund-CSS in jedem Shadow DOM. Die Seiten bringen ihr eigenes CSS mit. */
const SITE_BASE_CSS = `
  :host {
    all: initial;
    display: block;
    box-sizing: border-box;
    min-height: 100%;
    background: #fff;
    color: #1b1b1f;
    font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-user-select: text;
    user-select: text;
  }
  *, *::before, *::after { box-sizing: inherit; }
  img { max-width: 100%; }
  a { color: #0b57d0; }
`;

/** Vergleichbare Form einer Adresse: ohne Protokoll, www und Schluss-Slash, klein geschrieben. */
const normalize = (s) => s.trim().toLowerCase()
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .replace(/\/+$/, '');

const hostOf = (url) => url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');

/** Zerlegt eine Eingabe in Host und Pfad (ohne Protokoll, Query und Hash). */
function parseAddress(raw) {
  const s = raw.trim().replace(/^[a-z]+:\/\//i, '');
  const [, host = '', path = ''] = s.match(/^([^/?#]*)([^?#]*)/) ?? [];
  return { host: host.toLowerCase().replace(/^www\./, ''), path: normalizePath(path) };
}

const siteUrl = (domain, path) => `https://${domain}${path === '/' ? '' : path}`;

export class Browser extends AppWindow {
  static id = 'browser';
  static title = 'Browser';
  static icon = '🌐';
  static width = 720;
  static height = 480;
  static flush = true;

  constructor(manager) {
    super(manager);
    this.history = [{ kind: 'home' }];
    this.pos = 0;
  }

  render() {
    return `
      <div class="br">
        <div class="br-bar">
          <button class="br-nav" data-act="back" aria-label="Zurück">&#8249;</button>
          <button class="br-nav" data-act="fwd" aria-label="Vor">&#8250;</button>
          <button class="br-nav" data-act="home" aria-label="Startseite">&#8962;</button>
          <input class="br-url" type="text" spellcheck="false" autocomplete="off"
                 placeholder="Adresse eingeben" aria-label="Adresse">
          <button class="br-nav" data-act="external" hidden title="In neuem Tab öffnen" aria-label="In neuem Tab öffnen">&#8599;</button>
        </div>
        <div class="br-page"></div>
      </div>`;
  }

  mount() {
    this.$('[data-act="back"]').addEventListener('click', () => this.step(-1));
    this.$('[data-act="fwd"]').addEventListener('click', () => this.step(1));
    this.$('[data-act="home"]').addEventListener('click', () => this.navigate({ kind: 'home' }));
    this.$('[data-act="external"]').addEventListener('click', () => {
      const entry = this.history[this.pos];
      if (entry.kind === 'fav') window.open(FAVORITES[entry.index].url, '_blank', 'noopener');
    });
    this.$('.br-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitUrl(e.target.value);
    });
    this.show(this.history[this.pos]);
  }

  // ---- Navigation ----

  navigate(entry) {
    this.history = this.history.slice(0, this.pos + 1);
    this.history.push(entry);
    this.pos = this.history.length - 1;
    this.show(entry);
  }

  step(delta) {
    const next = this.pos + delta;
    if (next < 0 || next >= this.history.length) return;
    this.pos = next;
    this.show(this.history[this.pos]);
  }

  /** Adresse aus der Leiste oder einem Link: erst fiktive Seiten, dann echte Favoriten. */
  submitUrl(raw) {
    const input = raw.trim();
    if (!input) return;

    const { host, path } = parseAddress(input);
    const Site = findSite(host);
    if (Site) return this.openSite(Site.domain, path);

    const index = FAVORITES.findIndex((f) => normalize(f.url) === normalize(input));
    if (index >= 0) this.navigate({ kind: 'fav', index });
    else this.navigate({ kind: 'error', input });
  }

  openSite(domain, path = '/') {
    this.navigate({ kind: 'site', domain, path: normalizePath(path) });
  }

  openFavorite(index) {
    this.navigate({ kind: 'fav', index });
  }

  // ---- Anzeige ----

  show(entry) {
    const page = this.$('.br-page');
    const url = this.$('.br-url');
    this.$('[data-act="back"]').disabled = this.pos === 0;
    this.$('[data-act="fwd"]').disabled = this.pos === this.history.length - 1;
    this.$('[data-act="external"]').hidden = entry.kind !== 'fav';
    page.classList.toggle('frame', entry.kind === 'fav');
    page.classList.toggle('site', entry.kind === 'site');
    page.scrollTop = 0;

    if (entry.kind === 'home') this.showHome(page, url);
    if (entry.kind === 'site') this.showSite(page, url, entry);
    if (entry.kind === 'fav') this.showFavorite(page, url, entry);
    if (entry.kind === 'error') this.showError(page, url, entry);
  }

  showHome(page, url) {
    this.setTitle(this.constructor.title);
    url.value = '';

    const cards = [
      ...SITES.filter((Site) => Site.favorite).map((Site) => ({
        attr: `data-site="${esc(Site.domain)}"`, icon: Site.icon, title: Site.title, host: Site.domain,
      })),
      ...FAVORITES.map((f, i) => ({
        attr: `data-fav="${i}"`, icon: '🌐', title: f.title, host: hostOf(f.url),
      })),
    ];

    page.innerHTML = `
      <div class="br-home">
        <h3>Favoriten</h3>
        <div class="fav-grid">
          ${cards.map((c) => `
            <button class="fav-card" ${c.attr}>
              <span class="fav-icon">${c.icon}</span>
              <span class="fav-title">${esc(c.title)}</span>
              <span class="fav-host">${esc(c.host)}</span>
            </button>`).join('')}
        </div>
      </div>`;

    page.querySelectorAll('[data-site]').forEach((btn) =>
      btn.addEventListener('click', () => this.openSite(btn.dataset.site)));
    page.querySelectorAll('[data-fav]').forEach((btn) =>
      btn.addEventListener('click', () => this.openFavorite(Number(btn.dataset.fav))));
  }

  /** Fiktive Website: im Shadow DOM rendern, Links und Formulare abfangen. */
  showSite(page, url, entry) {
    const Site = findSite(entry.domain);
    const site = new Site(this);
    const result = site.resolve(entry.path);

    const fullTitle = !result.title ? Site.title
      : result.title.includes(Site.title) ? result.title
      : `${result.title} – ${Site.title}`;
    this.setTitle(fullTitle);
    url.value = siteUrl(Site.domain, entry.path);

    const host = document.createElement('div');
    host.className = 'br-site';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${SITE_BASE_CSS}${Site.styles ?? ''}</style>${result.html}`;
    site.root = root;

    root.addEventListener('click', (e) => {
      const link = e.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (/^(mailto|tel|javascript):/i.test(href)) return;
      e.preventDefault();

      if (href.startsWith('#')) {
        root.querySelector(`#${CSS.escape(href.slice(1))}`)?.scrollIntoView();
        return;
      }
      const target = new URL(href, siteUrl(Site.domain, entry.path));
      this.submitUrl(target.host + target.pathname);
    });
    root.addEventListener('submit', (e) => e.preventDefault());

    page.replaceChildren(host);

    // Inline-Scripts aus HTML-Seiten: laufen mit root (Shadow Root) und site
    for (const code of result.scripts ?? []) {
      try {
        new Function('root', 'site', code)(root, site);
      } catch (err) {
        console.error(`Skript auf ${Site.domain}${entry.path}:`, err);
      }
    }
    site.mount(entry.path);
  }

  /** Echte Seite aus den Favoriten, per iframe. */
  showFavorite(page, url, entry) {
    const fav = FAVORITES[entry.index];
    this.setTitle(fav.title);
    url.value = fav.url;
    page.innerHTML = `<iframe class="br-frame" src="${esc(fav.url)}" title="${esc(fav.title)}"
                              referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }

  showError(page, url, entry) {
    this.setTitle(this.constructor.title);
    url.value = entry.input;
    page.innerHTML = `
      <div class="br-msg">
        <div class="msg-icon">&#9888;&#65039;</div>
        <h3>Diese Seite ist nicht erreichbar</h3>
        <p>Die Suche ist auf diesem Gerät deaktiviert. Wähle eine Seite aus den Favoriten.</p>
        <p class="msg-url">${esc(entry.input)}</p>
        <button class="br-btn" data-home>Zu den Favoriten</button>
      </div>`;
    this.$('[data-home]').addEventListener('click', () => this.navigate({ kind: 'home' }));
  }
}
