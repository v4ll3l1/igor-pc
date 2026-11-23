// Live-Uhr: ein einziger Timer, der genau auf den Sekundenwechsel taktet.
// Alle Anzeigen melden sich mit onTick() an.

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const pad = (n) => String(n).padStart(2, '0');

export const formatHM = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const formatHMS = (d) => `${formatHM(d)}:${pad(d.getSeconds())}`;
export const formatDateLong = (d) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
export const formatDateShort = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

const listeners = new Set();

/** Registriert eine Funktion, die jede Sekunde mit dem aktuellen Date aufgerufen wird. */
export function onTick(fn) {
  listeners.add(fn);
  fn(new Date());
  return () => listeners.delete(fn);
}

function loop() {
  const now = new Date();
  listeners.forEach((fn) => fn(now));
  setTimeout(loop, 1000 - now.getMilliseconds());
}
loop();
