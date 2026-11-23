/**
 * Basisklasse fuer fiktive Websites, die nur im Code existieren (keine echte Domain, kein Netzwerk).
 * Der Browser findet sie ueber die Adresse oder die Favoriten und zeigt sie in einem
 * eigenen Shadow DOM an, die CSS der Seite kollidiert also nicht mit dem Rest.
 *
 * Neue Seite anlegen:
 *   1. Ordner src/sites/meine-seite/ mit MeineSeite.js (und optional einer .css)
 *   2. Klasse in src/sites/index.js eintragen
 *
 *   import { Website } from '../Website.js';
 *   import css from './meine-seite.css?inline';
 *
 *   export class MeineSeite extends Website {
 *     static domain = 'meine-seite.de';   // so tippt man sie in die Adressleiste
 *     static title = 'Meine Seite';       // Name in den Favoriten
 *     static icon = '📰';                  // optional
 *     static favorite = true;             // false = nur ueber Adresse oder Link erreichbar
 *     static styles = css;                // optional: CSS der Seite
 *
 *     pages() {                           // Pfad -> HTML oder { title, html }
 *       return {
 *         '/': `<h1>Hallo</h1><a href="/kontakt">Kontakt</a>`,
 *         '/kontakt': { title: 'Kontakt', html: `<h1>Kontakt</h1>` },
 *       };
 *     }
 *
 *     mount(path) {                       // optional: JS nach dem Rendern
 *       this.$('h1')?.addEventListener('click', () => alert('Hi'));
 *     }
 *   }
 *
 * Links: <a href="/kontakt"> bleibt auf der Seite, <a href="http://andere-seite.de"> springt
 * zu einer anderen Seite aus dem Register. Fuer Raetsel kannst du alles Moegliche verstecken:
 * HTML-Kommentare, unsichtbaren Text, data-Attribute, nicht verlinkte Unterseiten usw.
 */
export class Website {
  static domain = 'example.de';
  static title = 'Website';
  static icon = '🌐';
  static favorite = true;
  static styles = '';

  constructor(browser) {
    this.browser = browser;
    this.root = null; // ShadowRoot, wird vom Browser gesetzt
  }

  // ---- Hooks zum Ueberschreiben ----

  /** Pfad -> HTML-String oder { title, html }. Funktionen sind auch erlaubt. */
  pages() { return { '/': '<h1>Leere Seite</h1>' }; }

  /** Optional: JS nach dem Rendern. this.root ist das ShadowRoot. */
  mount() {}

  /** Seite fuer unbekannte Pfade. */
  notFound(path) {
    return {
      title: '404',
      html: `<div class="not-found">
        <h1>404</h1>
        <p>Diese Seite gibt es auf ${this.constructor.domain} nicht.</p>
        <p><code>${path}</code></p>
        <a href="/">Zur Startseite</a>
      </div>`,
    };
  }

  // ---- Helfer ----

  $(selector) { return this.root.querySelector(selector); }
  $$(selector) { return [...this.root.querySelectorAll(selector)]; }

  /** Navigiert innerhalb dieser Seite (z. B. aus mount() heraus). */
  go(path) { this.browser.openSite(this.constructor.domain, path); }

  /** Loest einen Pfad auf. Gibt { title, html, found } zurueck. */
  resolve(path) {
    const pages = this.pages();
    const key = Object.keys(pages).find((p) => normalizePath(p) === path);
    if (key === undefined) return { ...this.notFound(path), found: false };

    let page = pages[key];
    if (typeof page === 'function') page = page();
    if (typeof page === 'string') page = { html: page };
    return { title: page.title ?? null, html: page.html, scripts: page.scripts ?? [], found: true };
  }
}

/**
 * Macht aus Adressen einen einheitlichen Seitenpfad:
 *   '/kontakt/' -> '/kontakt', '' -> '/', 'kontakt.html' -> '/kontakt', '/artikel/index.html' -> '/artikel'
 */
export function normalizePath(path) {
  let p = String(path).trim().replace(/^\/+/, '').replace(/\/+$/, '');
  p = p.replace(/\.html?$/i, '');
  p = p === 'index' ? '' : p.replace(/\/index$/, '');
  return '/' + p.replace(/\/+$/, '');
}
