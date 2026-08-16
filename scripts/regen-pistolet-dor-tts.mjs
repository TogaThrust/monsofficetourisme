/**
 * Au Pistolet d'Or : régénère les MP3 longs (10 langues)
 * sans réécrire le texte affiché.
 * FR : avec le n°33 / avec le n° 33 → au numéro 33
 *   (avant le générique n°\s*(\d+) → numéro $1 ; pas « avec le numéro 33 »).
 * Usage: node scripts/regen-pistolet-dor-tts.mjs
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

const NAME = "Au Pistolet d'Or";
const BASE = 'AuPistoletDOr';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const POLLY_LANG = { jp: 'ja', cn: 'cn' };

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}

function ttsText(raw, lang = 'fr') {
  return pronounceForTts(
    String(raw || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim(),
    lang,
  );
}

function assertFrTts(displayed, text) {
  if (!displayed.includes('avec le n°33')) {
    throw new Error('Texte affiché FR inattendu (avec le n°33).');
  }
  if (/n°\s*33/.test(text) || /avec le n°/.test(text)) {
    throw new Error('n°33 / avec le n° restent dans le TTS FR : ' + text);
  }
  if (/avec le numéro 33/.test(text)) {
    throw new Error('TTS FR a laissé « avec le numéro 33 » : ' + text);
  }
  if (!/au numéro 33/.test(text)) {
    throw new Error('TTS FR sans « au numéro 33 » : ' + text);
  }
  if (
    /\bIHS\b/.test(text) ||
    /\bClef\b/.test(text) ||
    /\bTETE\b/.test(text) ||
    /\bTETTE\b/.test(text) ||
    /\bAV LION\b/.test(text) ||
    /\bD OR\b/.test(text)
  ) {
    throw new Error('TTS FR mal lu (IHS/Clef/TETE/TETTE/AV LION/D OR) : ' + text);
  }
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
const displayed = String(longs.fr?.[NAME] || '');
if (!displayed.includes('avec le n°33')) {
  throw new Error('Texte affiché FR inattendu (avec le n°33).');
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
  if (lang === 'fr') {
    assertFrTts(displayed, text);
    frExact = text;
    console.log('TTS FR:\n' + text);
  }
  console.log('tts', BASE, lang, text.slice(0, 180).replace(/\n/g, ' '));
  const out = path.join(ROOT, 'audio', `${BASE}_${lang}.mp3`);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', BASE, lang, fs.statSync(out).size);
}

fs.mkdirSync(path.join(ROOT, 'dist', 'scripts'), { recursive: true });
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('FR_EXACT', (frExact.match(/[^.\n]*au numéro 33[^.\n]*\./) || [''])[0]);
console.log('done');
