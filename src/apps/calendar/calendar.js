import { AppWindow } from '../../ui/AppWindow.js';
import { CAL_EVENTS } from '../../igor/index.js';
import { MONTHS, pad } from '../../clock.js';
import './calendar.css';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export class Calendar extends AppWindow {
  static id = 'calendar';
  static title = 'Kalender';
  static icon = '📅';
  static width = 680;
  static height = 460;

  constructor(manager) {
    super(manager);
    const today = new Date();
    this.today = today;
    this.year = today.getFullYear();
    this.month = today.getMonth();
    this.selectedDay = today.getDate();
  }

  render() {
    return `
      <div class="cal">
        <div class="cal-left">
          <div class="cal-head">
            <button class="cal-nav cal-prev" aria-label="Vorheriger Monat">&#8249;</button>
            <strong class="cal-title"></strong>
            <button class="cal-nav cal-next" aria-label="Nächster Monat">&#8250;</button>
          </div>
          <div class="cal-grid">
            ${WEEKDAYS.map((d) => `<div class="cal-wd">${d}</div>`).join('')}
          </div>
        </div>
        <div class="cal-right">
          <div class="agenda-date"></div>
          <div class="agenda-list"></div>
        </div>
      </div>`;
  }

  mount() {
    this.$('.cal-prev').addEventListener('click', () => this.shiftMonth(-1));
    this.$('.cal-next').addEventListener('click', () => this.shiftMonth(1));
    this.draw();
  }

  shiftMonth(delta) {
    this.month += delta;
    if (this.month < 0) { this.month = 11; this.year--; }
    if (this.month > 11) { this.month = 0; this.year++; }

    // Gewaehlten Tag behalten, aber an die Monatslaenge anpassen
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    this.selectedDay = Math.min(this.selectedDay, daysInMonth);
    this.draw();
  }

  draw() {
    const { year, month, today, selectedDay } = this;
    const grid = this.$('.cal-grid');
    this.$('.cal-title').textContent = `${MONTHS[month]} ${year}`;
    grid.querySelectorAll('.cal-day').forEach((el) => el.remove());

    // Montag als erster Tag der Woche
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('button');
      cell.className = 'cal-day';
      cell.textContent = day;
      cell.setAttribute('aria-label', `${day}. ${MONTHS[month]}`);

      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      if (isToday) cell.classList.add('today');
      if (day === selectedDay) cell.classList.add('selected');
      if (this.eventsFor(day).length) cell.classList.add('has-event');

      cell.addEventListener('click', () => {
        this.selectedDay = day;
        grid.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));
        cell.classList.add('selected');
        this.showAgenda();
      });

      grid.appendChild(cell);
    }

    this.showAgenda();
  }

  eventsFor(day) {
    const key = `${pad(this.month + 1)}-${pad(day)}`;
    return CAL_EVENTS[key] ?? [];
  }

  showAgenda() {
    const { year, month, selectedDay } = this;
    const dow = new Date(year, month, selectedDay).getDay();
    const events = this.eventsFor(selectedDay);

    this.$('.agenda-date').innerHTML = `
      <span class="agenda-day">${selectedDay}</span>
      <span class="agenda-meta">${WEEKDAYS_LONG[dow]}<br>${MONTHS[month]} ${year}</span>`;

    const list = this.$('.agenda-list');
    if (!events.length) {
      list.innerHTML = `<div class="agenda-empty">Keine Termine an diesem Tag.</div>`;
      return;
    }

    list.innerHTML = events.map((ev) => `
      <div class="agenda-item">
        <div class="agenda-time">${ev.time ?? 'ganztägig'}</div>
        <div class="agenda-body">
          <div class="agenda-title">${ev.title}</div>
          ${ev.note ? `<div class="agenda-note">${ev.note}</div>` : ''}
        </div>
      </div>`).join('');
  }
}
