import { Website, normalizePath } from './Website.js';

/*
 * Fiktive Websites als reine HTML-Dateien.
 *
 *   src/sites/html/<domain>/index.html      -> Startseite   (https://<domain>/)
 *   src/sites/html/<domain>/kontakt.html    -> /kontakt
 *   src/sites/html/<domain>/artikel/x.html  -> /artikel/x
 *   src/sites/html/<domain>/style.css       -> CSS fuer alle Seiten der Domain (alle .css im Ordner)
 *   src/sites/html/<domain>/bild.jpg        -> Bilder, im HTML mit src="bild.jpg" einbinden
 *
 * Ordner mit "_" am Anfang (z. B. _geheim.de) sind nur ueber die Adresse erreichbar,
 * sie stehen nicht auf der Startseite des Browsers.
 *
 * Im HTML funktionieren: <title>, <style>, normale Links (kontakt.html oder /kontakt),
 * Bilder und <script> ohne src. Scripts laufen mit zwei Variablen:
 *   root  = die Seite (Shadow Root), z. B. root.querySelector('#knopf')
 *   site  = die Website-Instanz (site.go('/kontakt') navigiert)
 * Nicht unterstuetzt: <link>-Tags (das CSS kommt automatisch aus den .css-Dateien),
 * externe Scripts mit src, DOMContentLoaded (die Scripts laufen sofort).
 */

// Dateien werden zur Build-Zeit eingelesen, neue Dateien also nach dem Speichern einmal neu laden.
const pageFiles = import.meta.glob('./html/**/*.html', { query: '?raw', import: 'default', eager: true });
const styleFiles = import.meta.glob('./html/**/*.css', { query: '?raw', import: 'default', eager: true });
const assetFiles = import.meta.glob('./html/**/*.{png,jpg,jpeg,gif,webp,svg}', { query: '?url', import: 'default', eager: true });

const KEY = /^\.\/html\/([^/]+)\/(.+)$/;
const dirOf = (rest) => (rest.includes('/') ? rest.slice(0, rest.lastIndexOf('/')) : '');

/** Dateiname -> Seitenpfad: index.html -> /, artikel/index.html -> /artikel, kontakt.html -> /kontakt */
const pathOf = (rest) => normalizePath(rest);

function parsePage(source, rest, assets) {
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const title = doc.title?.trim() || null; // vor dem Entfernen von <title> lesen

  const styles = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  const scripts = [...doc.querySelectorAll('script')]
    .filter((s) => !s.getAttribute('src'))
    .map((s) => s.textContent);

  // Bild-Pfade auf die gebundelten Dateien umbiegen
  const base = `http://local/${dirOf(rest)}${dirOf(rest) ? '/' : ''}`;
  doc.querySelectorAll('[src]').forEach((el) => {
    const src = el.getAttribute('src');
    if (/^(https?:|data:|\/\/)/i.test(src)) return;
    const path = new URL(src, base).pathname.slice(1);
    if (assets[path]) el.setAttribute('src', assets[path]);
  });

  doc.querySelectorAll('head, style, script, link, meta, title').forEach((el) => el.remove());

  return {
    title,
    html: `${styles ? `<style>${styles}</style>` : ''}${doc.body.innerHTML}`,
    scripts,
  };
}

function buildSites() {
  // domain -> { css: [], assets: {}, pages: [{ rest, source }] }
  const domains = new Map();
  const entry = (domain) => {
    if (!domains.has(domain)) domains.set(domain, { css: [], assets: {}, pages: [] });
    return domains.get(domain);
  };

  for (const [key, css] of Object.entries(styleFiles)) {
    const [, domain] = key.match(KEY);
    entry(domain).css.push(css);
  }
  for (const [key, url] of Object.entries(assetFiles)) {
    const [, domain, rest] = key.match(KEY);
    entry(domain).assets[rest] = url;
  }
  for (const [key, source] of Object.entries(pageFiles)) {
    const [, domain, rest] = key.match(KEY);
    entry(domain).pages.push({ rest, source });
  }

  return [...domains].map(([domain, data]) => {
    const pages = {};
    for (const { rest, source } of data.pages) {
      const page = parsePage(source, rest, data.assets);
      pages[pathOf(rest)] = { title: page.title, html: page.html, scripts: page.scripts };
    }
    const siteTitle = pages['/']?.title ?? domain;

    return class HtmlSite extends Website {
      static domain = domain;
      static title = siteTitle;
      static icon = '🌐';
      static favorite = !domain.startsWith('_');
      static styles = data.css.join('\n');

      pages() { return pages; }
    };
  });
}

/** Alle Websites aus src/sites/html/ */
export const HTML_SITES = buildSites();
