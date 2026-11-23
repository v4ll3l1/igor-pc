// Igors Dateisystem: alles, was in der Datei-App und in Notizen zu sehen ist.
// Neue Datei oder neuer Ordner = einfach hier eintragen.
// Format-Erklaerung steht in src/os/filesystem.js.

import { folder, file } from '../os/filesystem.js';

export const ROOT = folder('Igor', [
  folder('Dokumente', [
    folder('Projekte', [
      folder('Ideen', [
        file('ideen.txt', {
          kind: 'text', size: '1 KB', modified: '02.11.2026 21:14', mime: 'text/plain',
          content: 'Ideen (Platzhalter)\n\n- Irgendwas mit einem Dinner\n- Jemand ist nicht pünktlich\n- Der Butler weiß mehr, als er sagt',
        }),
      ]),
      file('todo.txt', {
        kind: 'text', size: '412 B', modified: '09.11.2026 08:03', mime: 'text/plain',
        content: 'TODO (Platzhalter)\n\n[x] Einladungen verschicken\n[ ] Wein besorgen\n[ ] Alibi überprüfen\n[ ] Nicht vergessen: niemandem trauen',
      }),
    ]),
    file('notizen.txt', {
      kind: 'text', size: '1 KB', modified: '13.11.2026 18:47', mime: 'text/plain',
      content: 'Platzhalter-Text.\nHier kommt später Igors Notiz hin.',
    }),
    file('platzhalter_1.doc', { kind: 'document', size: '24 KB', modified: '05.11.2026 14:22', mime: 'application/msword' }),
    file('platzhalter_2.doc', { kind: 'document', size: '31 KB', modified: '06.11.2026 16:40', mime: 'application/msword' }),
  ]),

  folder('Downloads', [
    file('setup_platzhalter.exe', { kind: 'app', size: '48,2 MB', modified: '01.11.2026 10:11', mime: 'application/x-msdownload' }),
    file('archiv.zip', { kind: 'archive', size: '3,1 MB', modified: '03.11.2026 19:58', mime: 'application/zip' }),
  ]),

  folder('Bilder', [
    folder('Urlaub', [
      file('strand_1.jpg', { kind: 'image', size: '2,1 MB', modified: '14.08.2026 12:30', mime: 'image/jpeg' }),
      file('strand_2.jpg', { kind: 'image', size: '1,9 MB', modified: '14.08.2026 12:31', mime: 'image/jpeg' }),
    ]),
    file('foto_platzhalter.jpg', { kind: 'image', size: '2,4 MB', modified: '10.11.2026 20:05', mime: 'image/jpeg' }),
  ]),

  folder('Videos', [
    file('video_platzhalter.mp4', { kind: 'video', size: '128 MB', modified: '07.11.2026 22:19', mime: 'video/mp4' }),
  ]),

  file('log.txt', {
    kind: 'text', size: '2 KB', modified: '13.11.2026 23:31', mime: 'text/plain',
    content: [
      '[19:00] System gestartet',
      '[19:02] Benutzer igor angemeldet',
      '[19:15] Datei geöffnet: notizen.txt',
      '[19:48] Verbindung zu unbekanntem Gerät',
      '[20:31] Datei verschoben: platzhalter_2.doc',
      '[21:07] Papierkorb geleert',
      '[22:40] Anmeldung fehlgeschlagen (3 Versuche)',
      '[23:30] Eingehender Anruf: Nummer unterdrückt',
      '[23:31] System heruntergefahren',
    ].join('\n'),
  }),
]);

/** Orte in der Seitenleiste. path = Namen vom Wurzelordner aus. */
export const SIDEBAR = [
  { title: 'Orte', items: [
    { label: 'Home', icon: '🏠', path: [] },
    { label: 'Dokumente', icon: '📄', path: ['Dokumente'] },
    { label: 'Downloads', icon: '⬇️', path: ['Downloads'] },
    { label: 'Bilder', icon: '🖼️', path: ['Bilder'] },
    { label: 'Videos', icon: '🎞️', path: ['Videos'] },
  ] },
  { title: 'Angeheftet', items: [
    { label: 'Projekte', icon: '📌', path: ['Dokumente', 'Projekte'] },
    { label: 'Urlaub', icon: '📌', path: ['Bilder', 'Urlaub'] },
  ] },
  { title: 'Geräte', items: [
    { label: 'Lokaler Datenträger (C:)', icon: '💾', path: [] },
  ] },
];
