import { iconFor, KIND_LABELS } from '../../os/filesystem.js';
import { esc } from '../../utils.js';

const meta = (pairs) => `
  <dl class="pv-meta">
    ${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
  </dl>`;

function codeLines(text) {
  return text.split('\n').map((line, i) => `
    <div class="ln"><span class="no">${i + 1}</span><span class="tx">${esc(line) || '&nbsp;'}</span></div>`).join('');
}

/** HTML fuer den Vorschaubereich rechts. */
export function renderPreview(node) {
  const head = `<div class="pv-head"><span>${iconFor(node)}</span><span class="pv-name">${esc(node.name)}</span></div>`;

  if (node.type === 'folder') {
    const count = node.children.length;
    return `${head}
      ${meta([['Typ', 'Ordner'], ['Elemente', String(count)]])}
      <div class="pv-none"><span>&#128193;</span>${count === 1 ? '1 Element' : `${count} Elemente`}</div>`;
  }

  const info = meta([['Größe', node.size], ['Geändert', node.modified], ['Typ', node.mime ?? KIND_LABELS[node.kind]]]);

  if (node.kind === 'text') {
    return `${head}${info}<div class="pv-code">${codeLines(node.content ?? '')}</div>`;
  }
  if (node.kind === 'image') {
    return `${head}${info}<div class="pv-image">BILD-PLATZHALTER</div>`;
  }
  if (node.kind === 'video') {
    return `${head}${info}<div class="pv-image">&#9654; VIDEO-PLATZHALTER</div>`;
  }
  return `${head}${info}
    <div class="pv-none"><span>${iconFor(node)}</span>Keine Vorschau verfügbar</div>`;
}
