import { Website } from '../Website.js';
import css from './rezeptbox.css?inline';

// Beispiel fuer eine Seite mit eigenem JavaScript (mount): Portionen umrechnen.
const INGREDIENTS = [
  { name: 'Kartoffeln', per: 250, unit: 'g' },
  { name: 'Zwiebeln', per: 0.5, unit: 'Stk.' },
  { name: 'Gemüsebrühe', per: 200, unit: 'ml' },
  { name: 'Sahne', per: 50, unit: 'ml' },
];

export class Rezeptbox extends Website {
  static domain = 'rezeptbox.de';
  static title = 'Rezeptbox';
  static icon = '🍲';
  static styles = css;

  constructor(browser) {
    super(browser);
    this.portions = 2;
  }

  pages() {
    return {
      '/': {
        title: 'Kartoffelsuppe',
        html: `
          <header class="bar"><span class="brand">Rezeptbox</span><span class="slogan">Kochen ohne Nachdenken</span></header>
          <main class="wrap">
            <h1>Kartoffelsuppe &ndash; wie von Oma</h1>
            <div class="hero">FOTO PLATZHALTER</div>

            <div class="portions">
              Portionen:
              <button data-step="-1" aria-label="weniger">&minus;</button>
              <strong data-portions>${this.portions}</strong>
              <button data-step="1" aria-label="mehr">+</button>
            </div>

            <h2>Zutaten</h2>
            <ul class="ingredients" data-ingredients></ul>

            <h2>Zubereitung</h2>
            <ol>
              <li>Kartoffeln und Zwiebeln würfeln.</li>
              <li>Mit der Brühe 20 Minuten köcheln lassen.</li>
              <li>Pürieren, Sahne dazu, abschmecken.</li>
              <li title="Platzhalter-Hinweis: steckt in einem Tooltip">Mit Brot servieren.</li>
            </ol>
          </main>
          <footer class="foot">Platzhalter-Seite &middot; <a href="http://nachbarschaftsblatt.de">Nachbarschaftsblatt</a></footer>`,
      },
    };
  }

  mount() {
    this.$$('[data-step]').forEach((btn) => btn.addEventListener('click', () => {
      this.portions = Math.max(1, Math.min(12, this.portions + Number(btn.dataset.step)));
      this.draw();
    }));
    this.draw();
  }

  draw() {
    this.$('[data-portions]').textContent = this.portions;
    this.$('[data-ingredients]').innerHTML = INGREDIENTS.map(({ name, per, unit }) => {
      const amount = Math.round(per * this.portions * 10) / 10;
      return `<li><span class="amount">${String(amount).replace('.', ',')} ${unit}</span> ${name}</li>`;
    }).join('');
  }
}
