import { USERNAME, PASSWORD } from './igor/index.js';

const $ = (sel) => document.querySelector(sel);

const SESSION_KEY = 'igor-session';

export const hasSession = () => sessionStorage.getItem(SESSION_KEY) === '1';

/**
 * Sperrbildschirm + Anmeldung.
 * onSuccess wird nach erfolgreichem Login aufgerufen.
 */
export function initLogin({ onSuccess }) {
  const screen = $('#login-screen');
  const lockView = $('#lock-view');
  const card = $('#login-card');
  const form = $('#login-form');
  const userInput = $('#username');
  const passInput = $('#password');
  const errorEl = $('#login-error');

  let unlocked = false;

  function showLogin() {
    if (unlocked) return;
    unlocked = true;
    screen.classList.add('unlocked');
    setTimeout(() => userInput.focus(), 250);
  }

  function showLock() {
    unlocked = false;
    screen.classList.remove('unlocked');
    form.reset();
    errorEl.hidden = true;
  }

  function fail(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    passInput.value = '';
    card.classList.remove('shake');
    void card.offsetWidth; // Animation neu starten
    card.classList.add('shake');
    passInput.focus();
  }

  lockView.addEventListener('click', showLogin);
  document.addEventListener('keydown', (e) => {
    if (screen.hidden || unlocked) return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
    showLogin();
  });

  $('#login-back').addEventListener('click', showLock);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = userInput.value.trim().toLowerCase();
    const pass = passInput.value;

    if (!user || !pass) return fail('Bitte Benutzername und Kennwort eingeben.');
    if (user !== USERNAME) return fail('Unbekannter Benutzername.');
    if (pass !== PASSWORD) return fail('Das Kennwort ist falsch. Bitte erneut versuchen.');

    sessionStorage.setItem(SESSION_KEY, '1');
    onSuccess();
  });

  return {
    /** Zurueck zum Sperrbildschirm (Abmelden). */
    lock() {
      sessionStorage.removeItem(SESSION_KEY);
      showLock();
    },
  };
}
