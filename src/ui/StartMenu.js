const labelOf = (App) => App.label ?? App.title;

const RECENT_KEY = 'igor-recent';
const MAX_RECENT = 5;

/** Startmenue: angeheftete Apps, Suche und die zuletzt geoeffneten Apps als Hinweis. */
export class StartMenu {
  constructor({ root, button, apps, onOpen, onLogout }) {
    this.root = root;
    this.button = button;
    this.onOpen = onOpen;
    this.apps = new Map(apps.map((App) => [App.id, App]));
    this.recent = this.loadRecent();

    this.grid = root.querySelector('#start-grid');
    this.recentList = root.querySelector('#start-recent');
    this.search = root.querySelector('#start-search');

    this.grid.innerHTML = apps
      .map((App) => `<li data-open="${App.id}"><span>${App.icon}</span>${labelOf(App)}</li>`)
      .join('');
    this.renderRecent();

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    this.search.addEventListener('input', () => this.filter(this.search.value));
    root.addEventListener('click', (e) => {
      const target = e.target.closest('[data-open]');
      if (!target) return;
      this.onOpen(target.dataset.open);
      this.close();
    });
    root.querySelector('#logout').addEventListener('click', onLogout);

    document.addEventListener('click', (e) => {
      if (this.isOpen && !root.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  get isOpen() { return !this.root.hidden; }

  open() {
    this.root.hidden = false;
    this.button.classList.add('active');
    this.search.value = '';
    this.filter('');
    this.search.focus();
  }

  close() {
    this.root.hidden = true;
    this.button.classList.remove('active');
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  /** Merkt sich eine gerade geoeffnete App, neueste zuerst, ohne Dubletten. */
  noteOpened(id) {
    if (!this.apps.has(id)) return;
    this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, MAX_RECENT);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(this.recent));
    this.renderRecent();
  }

  filter(query) {
    const q = query.trim().toLowerCase();
    const apply = (list) => {
      let visible = 0;
      list.querySelectorAll('[data-open]').forEach((el) => {
        const match = q === '' || el.textContent.toLowerCase().includes(q);
        el.hidden = !match;
        if (match) visible++;
      });
      return visible;
    };
    // Ueberschriften nur ausblenden, wenn eine Suche laeuft und nichts trifft
    this.grid.previousElementSibling.hidden = q !== '' && apply(this.grid) === 0;
    this.recentList.previousElementSibling.hidden = q !== '' && apply(this.recentList) === 0;
    const empty = this.recentList.querySelector('.recent-empty');
    if (empty) empty.hidden = q !== '';
  }

  renderRecent() {
    if (!this.recent.length) {
      this.recentList.innerHTML = `<li class="recent-empty">Noch nichts geöffnet.</li>`;
      return;
    }
    this.recentList.innerHTML = this.recent.map((id) => {
      const App = this.apps.get(id);
      return `<li data-open="${id}"><span>${App.icon}</span>${labelOf(App)}</li>`;
    }).join('');
  }

  loadRecent() {
    try {
      const ids = JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? '[]');
      return Array.isArray(ids) ? ids.filter((id) => this.apps.has(id)).slice(0, MAX_RECENT) : [];
    } catch {
      return [];
    }
  }
}
