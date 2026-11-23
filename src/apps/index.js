import { Files } from './files/files.js';
import { Notes } from './notes/notes.js';
import { Calendar } from './calendar/calendar.js';
import { Trash } from './trash/trash.js';
import { Browser } from './browser/browser.js';

/**
 * Alle Apps in der Reihenfolge von Desktop und Startmenue.
 * Jede App liegt in einem eigenen Ordner (Klasse + CSS). Neue App = Ordner anlegen und hier eintragen.
 */
export const APPS = [Files, Notes, Calendar, Browser, Trash];
