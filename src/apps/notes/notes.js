import { AppWindow } from '../../ui/AppWindow.js';
import { findNode } from '../../igor/index.js';
import { esc } from '../../utils.js';
import './notes.css';

export class Notes extends AppWindow {
  static id = 'notes';
  static title = 'notizen.txt';
  static label = 'Notizen';
  static icon = '📝';

  render() {
    // Der Text kommt aus dem virtuellen Dateisystem (Dokumente/notizen.txt)
    const note = findNode(['Dokumente', 'notizen.txt']);
    return `<div class="text-area">${esc(note?.content ?? '')}</div>`;
  }
}
