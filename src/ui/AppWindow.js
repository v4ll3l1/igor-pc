/**
 * Basisklasse fuer jede App.
 *
 * Der WindowManager uebernimmt Titelleiste, Buttons, Verschieben, Groesse,
 * Fokus und Taskleiste. Eine App definiert nur Name, Icon, Groesse und Inhalt:
 *
 *   export class Notes extends AppWindow {
 *     static id = 'notes';          // eindeutige ID
 *     static title = 'Notizen';     // Fenstertitel
 *     static icon = '📝';           // Icon (Emoji oder HTML)
 *     static label = 'Notizen';     // optional: Name auf Desktop/Startmenue
 *     static width = 380;           // optional: Startbreite in px
 *     static height = 300;          // optional: Starthoehe in px
 *     static flush = true;          // optional: Inhalt ohne Innenabstand bis an den Rand
 *
 *     render() {                    // HTML fuer den Inhalt
 *       return `<p>Hallo</p>`;
 *     }
 *     mount() {                     // optional: Events verdrahten
 *       this.$('p').addEventListener('click', () => this.setTitle('Geklickt'));
 *     }
 *     unmount() {}                  // optional: Timer etc. aufraeumen
 *   }
 */
export class AppWindow {
  static id = 'app';
  static title = 'Fenster';
  static label = null;
  static icon = '🪟';
  static width = 460;
  static height = null;
  static flush = false;

  constructor(manager) {
    this.manager = manager;
    this.title = this.constructor.title;
    this.root = null; // wird vom Manager gesetzt (der Inhaltsbereich)
  }

  // ---- Hooks zum Ueberschreiben ----
  render() { return ''; }
  mount() {}
  unmount() {}

  // ---- Helfer fuer die App ----
  $(selector) { return this.root.querySelector(selector); }
  $$(selector) { return [...this.root.querySelectorAll(selector)]; }

  setTitle(text) { this.manager.setTitle(this.constructor.id, text); }
  focus() { this.manager.focus(this.constructor.id); }
  minimize() { this.manager.minimize(this.constructor.id); }
  close() { this.manager.close(this.constructor.id); }
}
