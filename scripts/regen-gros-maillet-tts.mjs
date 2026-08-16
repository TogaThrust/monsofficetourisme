/**
 * Le Gros Maillet : régénère les MP3 longs (10 langues) sans réécrire le texte affiché.
 * FR : IHS → I H S ; n° 71 et 89 → numéros 71 et 89.
 * Usage: node scripts/regen-gros-maillet-tts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { pronounceForTts } from './tts-pronounce.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FACTORY = 'C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory';
config({ path: path.join(FACTORY, '.env') });

const NAME = 'Le Gros Maillet';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const N_PAIR = /n[°º]s?\s*(\d+)\s+(et|and|en|und|e|y|i)\s+(\d+)/g;
const PLURAL = {
  en: 'numbers',
  nl: 'nummers',
  de: 'Nummern',
  it: 'numeri',
  es: 'números',
  pl: 'numery',
};

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}

function ttsText(raw, lang = 'fr') {
  let text = pronounceForTts(
    String(raw || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim(),
    lang,
  );
  if (lang !== 'fr' && PLURAL[lang]) {
    text = text.replace(N_PAIR, (_, a, conj, b) => `${PLURAL[lang]} ${a} ${conj} ${b}`);
  }
  return text;
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
const displayed = String(longs.fr?.[NAME] || '');
if (!displayed.includes('les IHS des n° 71 et 89.')) {
  throw new Error('Texte affiché FR inattendu (IHS / n° 71 et 89).');
}

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });

let frExact = '';
for (const lang of LANGS) {
  const raw = longs[lang]?.[NAME];
  if (!raw) throw new Error('Description manquante ' + lang);
  const text = ttsText(raw, lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bIHS\b/.test(text)) {
    throw new Error('IHS non épelé (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (/n°\s*71/.test(text)) {
      throw new Error('n° 71 reste dans le TTS FR : ' + text);
    }
    if (!/I H S/.test(text) || !/numéros 71 et 89/.test(text)) {
      throw new Error('TTS FR sans I H S / numéros 71 et 89 : ' + text);
    }
    if (
      /\bClef\b/.test(text) ||
      /\bTETE\b/.test(text) ||
      /\bTETTE\b/.test(text) ||
      /Bertaimont/.test(text) ||
      /\bGillis\b/.test(text) ||
      /\bHarvent\b/.test(text) ||
      /CROIX D OR/.test(text) ||
      /\bChisaire\b/.test(text)
    ) {
      throw new Error('TTS FR mal lu (Clef/TETE/Gillis/Harvent/CROIX/Chisaire) : ' + text);
    }
    frExact = text;
    console.log('TTS FR:\n' + text);
  }
  console.log('tts', lang, text.slice(0, 180).replace(/\n/g, ' '));
  const out = path.join(ROOT, 'audio', `LeGrosMaillet_${lang}.mp3`);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
}

fs.mkdirSync(path.join(ROOT, 'dist', 'scripts'), { recursive: true });
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('FR_EXACT_SENTENCE', (frExact.match(/[^.\n]*I H S[^.\n]*\./) || [''])[0]);
console.log('done');
