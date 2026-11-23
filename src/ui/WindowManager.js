const $ = (sel, root = document) => root.querySelector(sel);

const MIN_W = 280;
const MIN_H = 180;

/** Ziehen an der Titelleiste. */
function makeDraggable(win, handle, { hasMaximized }) {
  let sx, sy, ox, oy, dragging = false;
  handle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || hasMaximized()) return;
    e.preventDefault(); // verhindert Textauswahl beim Ziehen
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    ox = win.offsetLeft; oy = win.offsetTop;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    win.style.left = ox + e.clientX - sx + 'px';
    win.style.top = Math.max(0, oy + e.clientY - sy) + 'px';
  });
  const stop = () => { dragging = false; };
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
}

/** Groesse aendern am Griff unten rechts. */
function makeResizable(win, grip, container) {
  let sx, sy, ow, oh, resizing = false;
  grip.addEventListener('pointerdown', (e) => {
    if (win.classList.contains('maximized')) return;
    e.preventDefault();
    resizing = true;
    sx = e.clientX; sy = e.clientY;
    ow = win.offsetWidth; oh = win.offsetHeight;
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    // Nicht ueber den Desktop-Rand hinaus
    const maxW = container.clientWidth - win.offsetLeft - 8;
    const maxH = container.clientHeight - win.offsetTop - 8;
    win.style.width = Math.max(MIN_W, Math.min(ow + e.clientX - sx, maxW)) + 'px';
    win.style.height = Math.max(MIN_H, Math.min(oh + e.clientY - sy, maxH)) + 'px';
  });
  const stop = () => { resizing = false; };
  grip.addEventListener('pointerup', stop);
  grip.addEventListener('pointercancel', stop);
}

/**
 * Verwaltet alle offenen Fenster: Erstellen, Fokus, Minimieren,
 * Maximieren, Schliessen und die Taskleisten-Buttons.
 */
export class WindowManager {
  constructor({ container, taskbar }) {
    this.container = container;
    this.taskbar = taskbar;
    this.z = 10;
    this.activeId = null;
    this.entries = new Map(); // id -> { app, el, btn, minimized }
  }

  /** Oeffnet eine App (Klasse). Ist sie schon offen, wird sie nach vorne geholt. */
  open(AppClass) {
    const id = AppClass.id;
    if (this.entries.has(id)) return this.focus(id);

    const app = new AppClass(this);
    const el = this.buildWindow(app, id);
    app.root = $('.win-content', el);
    app.root.innerHTML = app.render();
    app.mount();

    const btn = this.buildTaskButton(app, id);

    const offset = this.entries.size * 30;
    el.style.left = Math.min(130 + offset, Math.max(0, window.innerWidth - 320)) + 'px';
    el.style.top = 50 + offset + 'px';

    this.container.appendChild(el);
    this.entries.set(id, { app, el, btn, minimized: false });
    this.focus(id);
    return app;
  }

  focus(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.minimized = false;
    entry.el.classList.remove('minimized');
    this.activeId = id;
    entry.el.style.zIndex = ++this.z;
    this.refresh();
  }

  minimize(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.minimized = true;
    entry.el.classList.add('minimized');
    if (this.activeId === id) this.focusTopmost();
    else this.refresh();
  }

  toggleMaximize(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.el.classList.toggle('maximized');
    $('.maximize', entry.el).textContent = entry.el.classList.contains('maximized') ? '❐' : '☐';
    this.focus(id);
  }

  setTitle(id, text) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.app.title = text;
    $('.win-name', entry.el).textContent = text;
    entry.btn.title = text;
  }

  close(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.app.unmount();
    entry.el.remove();
    entry.btn.remove();
    this.entries.delete(id);
    if (this.activeId === id) this.focusTopmost();
  }

  closeAll() {
    [...this.entries.keys()].forEach((id) => this.close(id));
    this.activeId = null;
  }

  // ---- intern ----

  refresh() {
    this.entries.forEach((entry, id) => {
      const isActive = id === this.activeId && !entry.minimized;
      entry.el.classList.toggle('focused', isActive);
      entry.btn.classList.toggle('active', isActive);
    });
  }

  /** Fokus an das oberste noch sichtbare Fenster geben. */
  focusTopmost() {
    let topId = null;
    let topZ = -1;
    this.entries.forEach((entry, id) => {
      const z = Number(entry.el.style.zIndex) || 0;
      if (!entry.minimized && z > topZ) { topZ = z; topId = id; }
    });
    this.activeId = topId;
    this.refresh();
  }

  buildWindow(app, id) {
    const C = app.constructor;
    const el = document.createElement('div');
    el.className = 'win';
    el.style.setProperty('--w', (C.width ?? 460) + 'px');
    if (C.height) el.style.height = C.height + 'px';
    if (C.flush) el.classList.add('flush');

    el.innerHTML = `
      <div class="win-title">
        <span class="win-icon">${C.icon}</span>
        <span class="win-name"></span>
        <span class="win-ctl">
          <button class="minimize" aria-label="Minimieren">&#8211;</button>
          <button class="maximize" aria-label="Maximieren">&#9744;</button>
          <button class="close" aria-label="Schließen">&#10005;</button>
        </span>
      </div>
      <div class="win-content"></div>
      <div class="resize-grip" title="Größe ändern" aria-hidden="true"></div>`;

    $('.win-name', el).textContent = app.title;

    el.addEventListener('pointerdown', () => this.focus(id));
    $('.minimize', el).addEventListener('click', () => this.minimize(id));
    $('.maximize', el).addEventListener('click', () => this.toggleMaximize(id));
    $('.close', el).addEventListener('click', () => this.close(id));
    $('.win-title', el).addEventListener('dblclick', (e) => {
      if (!e.target.closest('button')) this.toggleMaximize(id);
    });

    makeDraggable(el, $('.win-title', el), { hasMaximized: () => el.classList.contains('maximized') });
    makeResizable(el, $('.resize-grip', el), this.container);
    return el;
  }

  buildTaskButton(app, id) {
    const btn = document.createElement('button');
    btn.className = 'tb-btn open';
    btn.title = app.title;
    btn.innerHTML = app.constructor.icon;
    btn.addEventListener('click', () => {
      const entry = this.entries.get(id);
      // Aktives Fenster -> minimieren, sonst nach vorne holen
      if (id === this.activeId && !entry.minimized) this.minimize(id);
      else this.focus(id);
    });
    this.taskbar.appendChild(btn);
    return btn;
  }
}
