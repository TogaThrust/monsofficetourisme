/**
 * Au Lion d'Or + Millesime MDCCXII : régénère les MP3 longs (10 langues)
 * sans réécrire le texte affiché.
 * FR : n°40 / n°50 → numéro 40 / numéro 50 (après le cas pluriel n° 71 et 89).
 * Usage: node scripts/regen-lion-dor-tts.mjs
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

const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const POLLY_LANG = { jp: 'ja', cn: 'cn' };

const POIS = [
  {
    name: "Au Lion d'Or",
    base: 'AuLionDOr',
    displayedMustInclude: 'du n°40 au n°50',
  },
  {
    name: 'Millesime MDCCXII',
    base: 'MillesimeMDCCXII',
    displayedMustInclude: 'du n°40 au n°50',
  },
];

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

function assertFrTts(name, displayed, text) {
  if (/n°\s*40/.test(text) || /n°\s*50/.test(text)) {
    throw new Error('n°40 / n° 40 restent dans le TTS FR (' + name + ') : ' + text);
  }
  if (!/numéro 40/.test(text) || !/numéro 50/.test(text)) {
    throw new Error('TTS FR sans numéro 40 / numéro 50 (' + name + ') : ' + text);
  }
  if (displayed.includes('n° 71 et 89') && !/numéros 71 et 89/.test(text)) {
    throw new Error('TTS FR a cassé numéros 71 et 89 (' + name + ') : ' + text);
  }
  if (
    /\bIHS\b/.test(text) ||
    /\bClef\b/.test(text) ||
    /\bTETE\b/.test(text) ||
    /\bTETTE\b/.test(text) ||
    /\bAV LION\b/.test(text) ||
    /\bD OR\b/.test(text)
  ) {
    throw new Error('TTS FR mal lu (IHS/Clef/TETE/TETTE/AV LION/D OR) (' + name + ') : ' + text);
  }
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });

for (const poi of POIS) {
  const displayed = String(longs.fr?.[poi.name] || '');
  if (!displayed.includes(poi.displayedMustInclude)) {
    throw new Error('Texte affiché FR inattendu (' + poi.name + ').');
  }
  console.log('\n=== ' + poi.name + ' ===');
  for (const lang of LANGS) {
    const raw = longs[lang]?.[poi.name];
    if (!raw) throw new Error('Description manquante ' + poi.name + ' ' + lang);
    const text = ttsText(raw, lang);
    if (!text) throw new Error('TTS vide ' + poi.name + ' ' + lang);
    if (lang === 'fr') {
      assertFrTts(poi.name, displayed, text);
      console.log('TTS FR:\n' + text);
    }
    console.log('tts', poi.base, lang, text.slice(0, 180).replace(/\n/g, ' '));
    const out = path.join(ROOT, 'audio', `${poi.base}_${lang}.mp3`);
    try { fs.unlinkSync(out); } catch {}
    await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
    fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
    console.log('audio long', poi.base, lang, fs.statSync(out).size);
  }
}

fs.mkdirSync(path.join(ROOT, 'dist', 'scripts'), { recursive: true });
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('done');
