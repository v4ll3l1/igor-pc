// ============================================================
//  IGORS DATEN: alles, was auf diesem PC "liegt", an einem Ort.
//
//  profile.js   Benutzername, Kennwort, Anzeigename
//  files.js     Dateisystem (Ordner, Dateien, Textinhalte) + Seitenleiste
//  calendar.js  Kalendertermine
//  browser.js   Browser-Favoriten
//
//  Die Fiktiven Webseiten liegen extra in src/sites/ (eigene Domains).
//  Die Mechanik (Fenster, Apps, Dateisystem-Helfer) liegt NICHT hier.
// ============================================================

import { findNodeIn } from '../os/filesystem.js';
import { ROOT } from './files.js';

export * from './profile.js';
export * from './files.js';
export * from './calendar.js';
export * from './browser.js';

/** Knoten in Igors Dateisystem per Pfad (Array von Namen) oder null. */
export const findNode = (path) => findNodeIn(ROOT, path);
