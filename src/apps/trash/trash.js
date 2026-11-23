import { AppWindow } from '../../ui/AppWindow.js';
import './trash.css';

export class Trash extends AppWindow {
  static id = 'trash';
  static title = 'Papierkorb';
  static icon = '🗑️';
  static width = 380;

  render() {
    return `<div class="empty-state"><span>&#128465;&#65039;</span>Der Papierkorb ist leer.</div>`;
  }
}
