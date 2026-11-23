const labelOf = (App) => App.label ?? App.title;

/** Desktop-Icons. Klick ruft onOpen(appId) auf. */
export class Desktop {
  constructor({ root, apps, onOpen }) {
    this.onOpen = onOpen;
    root.innerHTML = apps
      .map((App) => `<button class="icon" data-open="${App.id}"><span>${App.icon}</span>${labelOf(App)}</button>`)
      .join('');

    root.addEventListener('click', (e) => {
      const target = e.target.closest('[data-open]');
      if (target) this.onOpen(target.dataset.open);
    });
  }
}
