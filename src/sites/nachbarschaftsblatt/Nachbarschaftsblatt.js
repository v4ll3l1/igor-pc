import { Website } from '../Website.js';
import css from './nachbarschaftsblatt.css?inline';

// Beispiel fuer eine Seite mit mehreren Unterseiten und versteckten Hinweisen.
export class Nachbarschaftsblatt extends Website {
  static domain = 'nachbarschaftsblatt.de';
  static title = 'Nachbarschaftsblatt';
  static icon = '📰';
  static styles = css;

  pages() {
    const header = `
      <header class="top">
        <a class="logo" href="/">Nachbarschaftsblatt</a>
        <nav><a href="/">Aktuell</a><a href="/archiv">Archiv</a><a href="/kontakt">Kontakt</a></nav>
      </header>`;
    const footer = `<footer class="foot">&copy; 2026 Nachbarschaftsblatt &middot; Platzhalter-Seite</footer>`;
    const wrap = (inner) => `${header}<main class="content">${inner}</main>${footer}`;

    return {
      '/': {
        title: 'Aktuell',
        html: wrap(`
          <h1>Aktuelles aus der Nachbarschaft</h1>
          <article class="teaser">
            <h2><a href="/artikel/seltsamer-abend">Seltsamer Abend in der Villa am Park</a></h2>
            <p class="meta">23. November 2026 &middot; Lokales</p>
            <p>Lorem ipsum dolor sit amet, ein Platzhalter-Teaser. Anwohner berichten von Licht, Stimmen und einem Auto, das nie wieder wegfuhr.</p>
          </article>
          <article class="teaser">
            <h2>Straßenfest fällt aus</h2>
            <p class="meta">20. November 2026 &middot; Vereine</p>
            <p>Platzhalter-Text. Wegen Unwetter und anderer Umstände.</p>
          </article>`),
      },

      '/artikel/seltsamer-abend': {
        title: 'Seltsamer Abend in der Villa am Park',
        html: wrap(`
          <h1>Seltsamer Abend in der Villa am Park</h1>
          <p class="meta">23. November 2026 &middot; Lokales</p>
          <div class="img-placeholder">FOTO PLATZHALTER</div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hier steht später der echte Artikel mit allen Details zum Abend.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem. <a href="/archiv">Mehr dazu im Archiv.</a></p>
          <!-- Platzhalter-Hinweis 1: Kommentare im Quelltext sieht nur, wer in den Code schaut. -->
          <p class="invisible">Platzhalter-Hinweis 2: unsichtbarer Text, nur durch Markieren sichtbar.</p>
          <p class="meta" data-hinweis="Platzhalter-Hinweis 3: steckt in einem data-Attribut">Autor: Redaktion</p>`),
      },

      '/archiv': {
        title: 'Archiv',
        html: wrap(`
          <h1>Archiv</h1>
          <ul class="list">
            <li>Oktober 2026 &ndash; Platzhalter</li>
            <li>September 2026 &ndash; Platzhalter</li>
            <li>August 2026 &ndash; Platzhalter</li>
          </ul>`),
      },

      '/kontakt': {
        title: 'Kontakt',
        html: wrap(`
          <h1>Kontakt</h1>
          <p>Redaktion Nachbarschaftsblatt<br>Musterstraße 13<br>12345 Musterstadt</p>
          <p>Mail: redaktion@nachbarschaftsblatt.de (Platzhalter)</p>
          <p>Mehr Rezepte? Schau bei <a href="http://rezeptbox.de">rezeptbox.de</a> vorbei.</p>`),
      },

      // Nicht verlinkt, nur ueber die Adresse erreichbar: nachbarschaftsblatt.de/intern
      '/intern': {
        title: 'Intern',
        html: wrap(`
          <h1>Nur für die Redaktion</h1>
          <p>Platzhalter-Seite, die nirgends verlinkt ist. Gut für Rätsel, die man erst finden muss.</p>`),
      },
    };
  }
}
