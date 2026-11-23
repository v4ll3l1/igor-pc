import { AppWindow } from '../../ui/AppWindow.js';
import { ROOT, SIDEBAR, findNode } from '../../igor/index.js';
import { iconFor } from '../../os/filesystem.js';
import { esc } from '../../utils.js';
import { renderPreview } from './preview.js';
import './files.css';

/** Ordner zuerst, dann alphabetisch. */
const listOf = (folder) => [...folder.children].sort((a, b) =>
  (a.type === b.type ? 0 : a.type === 'folder' ? -1 : 1) || a.name.localeCompare(b.name, 'de'));

const samePath = (a, b) => a.length === b.length && a.every((n, i) => n === b[i]);

/**
 * Dateimanager im Spaltenstil: Seitenleiste, Pfadleiste, eine Spalte pro Ordnerebene
 * und rechts eine Vorschau. this.path ist die Auswahlkette vom Wurzelordner aus.
 */
export class Files extends AppWindow {
  static id = 'files';
  static title = 'Dateien';
  static label = 'Dateien';
  static icon = '📁';
  static width = 960;
  static height = 580;
  static flush = true;

  constructor(manager) {
    super(manager);
    this.path = ['Dokumente'];
  }

  render() {
    return `
      <div class="fm" tabindex="0">
        <div class="fm-top"><div class="fm-crumbs"></div></div>
        <div class="fm-main">
          <nav class="fm-side">
            ${SIDEBAR.map((section) => `
              <div class="side-title">${section.title}</div>
              ${section.items.map((item) => `
                <button class="side-item" data-path="${esc(JSON.stringify(item.path))}">
                  <span>${item.icon}</span><span class="side-label">${esc(item.label)}</span>
                </button>`).join('')}
            `).join('')}
          </nav>
          <div class="fm-cols"></div>
          <aside class="fm-preview"></aside>
        </div>
        <div class="fm-keys">
          <span><kbd>&uarr;&darr;</kbd>Navigieren</span>
          <span><kbd>&rarr;</kbd>Öffnen</span>
          <span><kbd>&larr;</kbd>Zurück</span>
          <span><kbd>Enter</kbd>Öffnen</span>
        </div>
      </div>`;
  }

  mount() {
    this.fm = this.$('.fm');

    this.$('.fm-side').addEventListener('click', (e) => {
      const item = e.target.closest('.side-item');
      if (!item) return;
      this.path = JSON.parse(item.dataset.path);
      this.draw();
    });

    this.$('.fm-crumbs').addEventListener('click', (e) => {
      const crumb = e.target.closest('[data-depth]');
      if (!crumb) return;
      this.path = this.path.slice(0, Number(crumb.dataset.depth));
      this.draw();
    });

    this.$('.fm-cols').addEventListener('click', (e) => {
      const row = e.target.closest('.fm-row');
      if (!row) return;
      this.path = [...this.path.slice(0, Number(row.dataset.depth)), row.dataset.name];
      this.draw();
    });

    this.fm.addEventListener('keydown', (e) => this.onKey(e));
    this.draw();
  }

  // ---- Tastatur ----

  onKey(e) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;
    e.preventDefault();

    if (e.key === 'ArrowLeft') {
      this.path = this.path.slice(0, -1);
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      const node = findNode(this.path);
      if (node?.type === 'folder' && node.children.length) {
        this.path = [...this.path, listOf(node)[0].name];
      }
    } else {
      // Hoch/Runter: Geschwister in der aktuellen Spalte
      const parent = findNode(this.path.slice(0, -1));
      const siblings = listOf(parent);
      const current = this.path.at(-1);
      const index = current ? siblings.findIndex((n) => n.name === current) : -1;
      const next = e.key === 'ArrowDown' ? index + 1 : index - 1;
      const target = siblings[Math.max(0, Math.min(next, siblings.length - 1))];
      if (target) this.path = [...this.path.slice(0, -1), target.name];
    }
    this.draw();
  }

  // ---- Anzeige ----

  /** Die sichtbaren Spalten: eine pro Ordner entlang der Auswahlkette. */
  columns() {
    const cols = [];
    let node = ROOT;
    for (let depth = 0; ; depth++) {
      const selected = this.path[depth] ?? null;
      cols.push({ node, selected, depth });
      if (!selected) break;
      const next = listOf(node).find((c) => c.name === selected);
      if (!next || next.type !== 'folder') break;
      node = next;
    }
    return cols;
  }

  draw() {
    this.drawCrumbs();
    this.drawColumns();
    this.drawPreview();

    this.$$('.side-item').forEach((btn) =>
      btn.classList.toggle('active', samePath(JSON.parse(btn.dataset.path), this.path)));

    this.fm.focus({ preventScroll: true }); // Tastatursteuerung bleibt aktiv
  }

  drawCrumbs() {
    const names = [ROOT.name, ...this.path];
    this.$('.fm-crumbs').innerHTML = names.map((name, i) => `
      ${i ? '<span class="fm-sep">/</span>' : ''}
      <span class="fm-crumb${i === names.length - 1 ? ' current' : ''}" data-depth="${i}">${esc(name)}</span>`).join('');
  }

  drawColumns() {
    const cols = this.columns();
    const activeDepth = Math.max(0, this.path.length - 1);
    const wrap = this.$('.fm-cols');

    wrap.innerHTML = cols.map(({ node, selected, depth }) => {
      const items = listOf(node);
      return `
        <div class="fm-col${depth === activeDepth ? ' active' : ''}">
          <div class="fm-col-head">${esc(node.name)}</div>
          <div class="fm-list">
            ${items.length ? items.map((child) => `
              <div class="fm-row${child.name === selected ? ' sel' : ''}" data-depth="${depth}" data-name="${esc(child.name)}">
                <span class="ico">${iconFor(child)}</span>
                <span class="nm">${esc(child.name)}</span>
                ${child.type === 'folder' ? '<span class="chev">&rsaquo;</span>' : ''}
              </div>`).join('') : '<div class="fm-empty">Dieser Ordner ist leer.</div>'}
          </div>
        </div>`;
    }).join('');

    // Ausgewaehlte Zeilen sichtbar halten, zur letzten Spalte scrollen
    wrap.querySelectorAll('.fm-list').forEach((list) => {
      const row = list.querySelector('.sel');
      if (!row) return;
      if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop - 4;
      else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight + 4;
      }
    });
    wrap.scrollLeft = wrap.scrollWidth;
  }

  drawPreview() {
    this.$('.fm-preview').innerHTML = renderPreview(findNode(this.path) ?? ROOT);
  }
}
