import { Nachbarschaftsblatt } from './nachbarschaftsblatt/Nachbarschaftsblatt.js';
import { Rezeptbox } from './rezeptbox/Rezeptbox.js';
import { HTML_SITES } from './htmlsites.js';

/**
 * Alle fiktiven Websites:
 *  - Klassen (Nachbarschaftsblatt, Rezeptbox): volle Kontrolle ueber Logik und JS
 *  - HTML-Ordner unter src/sites/html/: einfach Dateien ablegen, siehe htmlsites.js
 */
export const SITES = [Nachbarschaftsblatt, Rezeptbox, ...HTML_SITES];

const stripWww = (host) => host.toLowerCase().replace(/^www\./, '');

const byDomain = new Map(SITES.map((Site) => [stripWww(Site.domain), Site]));
if (byDomain.size !== SITES.length) console.warn('Mehrere Websites teilen sich dieselbe Domain!');

/** Findet die Website zu einer Domain (www. wird ignoriert) oder undefined. */
export const findSite = (host) => byDomain.get(stripWww(host));
