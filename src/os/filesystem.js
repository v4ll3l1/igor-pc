// Die "Mechanik" des virtuellen Dateisystems. Hier stehen KEINE Inhalte,
// die liegen in src/igor/files.js.
//
// Ordner: folder(name, [kinder])
// Datei:  file(name, { kind, size, modified, mime, content? })
//   kind: 'text' | 'image' | 'video' | 'archive' | 'document' | 'app' | 'other'
//   content: nur bei kind 'text', wird in der Vorschau mit Zeilennummern gezeigt.

export const folder = (name, children = []) => ({ type: 'folder', name, children });
export const file = (name, meta) => ({ type: 'file', name, ...meta });

/** Liefert den Knoten zu einem Pfad (Array von Namen, ab root) oder null. */
export function findNodeIn(root, path) {
  let node = root;
  for (const name of path) {
    if (node.type !== 'folder') return null;
    node = node.children.find((c) => c.name === name);
    if (!node) return null;
  }
  return node;
}

const ICONS = {
  folder: '📁', text: '📝', image: '🖼️', video: '🎞️',
  archive: '🗜️', document: '📄', app: '⚙️', other: '📄',
};

export const iconFor = (node) => (node.type === 'folder' ? ICONS.folder : ICONS[node.kind] ?? ICONS.other);

export const KIND_LABELS = {
  text: 'Textdatei', image: 'Bild', video: 'Video', archive: 'Archiv',
  document: 'Dokument', app: 'Programm', other: 'Datei',
};
