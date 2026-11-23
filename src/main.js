import './style.css';
import { onTick, formatHM, formatHMS, formatDateLong, formatDateShort, pad } from './clock.js';
import { initLogin, hasSession } from './login.js';
import { WindowManager } from './ui/WindowManager.js';
import { Desktop } from './ui/Desktop.js';
import { StartMenu } from './ui/StartMenu.js';
import { APPS } from './apps/index.js';
import { DISPLAY_NAME, PC_NAME } from './igor/index.js';

const $ = (sel) => document.querySelector(sel);

// Name und PC-Titel kommen aus src/igor/profile.js
$('#start-user-name').textContent = DISPLAY_NAME;
document.title = PC_NAME;

const loginScreen = $('#login-screen');
const desktopScreen = $('#desktop-screen');

// ---------- Live-Uhr ----------
onTick((now) => {
  $('#lock-time').innerHTML = `${formatHM(now)}<span class="sec">:${pad(now.getSeconds())}</span>`;
  $('#lock-date').textContent = formatDateLong(now);
  $('#tray-time').textContent = formatHMS(now);
  $('#tray-date').textContent = formatDateShort(now);
});

// ---------- Fenster, Desktop, Startmenue ----------
const wm = new WindowManager({ container: $('#windows'), taskbar: $('#task-buttons') });
const appById = Object.fromEntries(APPS.map((A) => [A.id, A]));

function openApp(id) {
  wm.open(appById[id]);
  start.noteOpened(id);
}

new Desktop({ root: $('#desktop'), apps: APPS, onOpen: openApp });
const start = new StartMenu({
  root: $('#start-menu'),
  button: $('#start-btn'),
  apps: APPS,
  onOpen: openApp,
  onLogout: logout,
});

// ---------- Login / Logout ----------
function showDesktop() {
  loginScreen.hidden = true;
  desktopScreen.hidden = false;
}

const login = initLogin({ onSuccess: showDesktop });

function logout() {
  start.close();
  wm.closeAll();
  desktopScreen.hidden = true;
  loginScreen.hidden = false;
  login.lock();
}

if (hasSession()) showDesktop();
