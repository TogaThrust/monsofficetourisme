/**
 * A la Clef d'Or : texte long réécrit (sans répéter le court),
 * Clef/CLEF lu Clé en TTS, traductions 10 langues, MP3 court+long.
 * Usage: node scripts/fill-clef-dor.mjs
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

const NAME = "A la Clef d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 44, 7000 Mons.";
const ADDRESS_LABEL = {
  fr: 'Adresse :',
  en: 'Address:',
  nl: 'Adres:',
  de: 'Adresse:',
  it: 'Indirizzo:',
  es: 'Dirección:',
  pl: 'Adres:',
  ar: 'العنوان :',
  cn: '地址：',
  jp: '住所：',
};

const FR_LONG_BODY = `Le panneau tient l’allège de la fenêtre de droite, au premier étage : calcaire aux contours chantournés, dans la brique. La clé est à l’horizontale, un peu de biais. L’anneau, à droite, se perd en volutes. Le panneton, à gauche, a un petit cœur. Le ruban fait un nœud au milieu ; deux pans retombent. En bas : A LA CLEF, puis D’OR. Clef, l’ancienne graphie.

Fin du XVIIIe : les orfèvres Ablay, de 1786 à 1797. Puis Elias, en 1806. Au milieu du XIXe, une pharmacie. L’enseigne a été restaurée en 1935.`;

function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  try { fs.unlinkSync(file); } catch {}
  fs.renameSync(tmp, file);
}

function setDesc(store, lang, text) {
  if (!store[lang]) store[lang] = {};
  store[lang][NAME] = text;
  const alias = LANG_ALIASES[lang];
  if (alias) {
    if (!store[alias]) store[alias] = {};
    store[alias][NAME] = text;
  }
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

async function chatJson(system, user, maxTokens = 4000) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) throw new Error('Pas de clé OpenAI');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  return JSON.parse(json.choices?.[0]?.message?.content || '{}');
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));

setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  "You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep proper names exactly: Ablay, Elias, Mons. Keep the carved inscription exactly as A LA CLEF and D'OR (do not modernize Clef to clé in the written text). cn = Simplified Chinese. jp = Japanese. allège = stone panel under a window. panneton = the bit of a key.",
  `Translate this LONG visitor text into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "long": "..." }, "nl": { "long": "..." }, ... }
Keep the same facts. Do not invent. Keep paragraph breaks.
Do not add the address line; it will be appended.
Do not repeat the short-card facts: do not write "44 rue d'Havré", do not open with "ornate key hanging from a ribbon".
Do not mention the millésime MDCCXII, 1712, Antoine Clesse, Albert Dehaene, À la Lunette d'Or, or a current restaurant.
Keep A LA CLEF and D'OR unchanged in every language.

long:
${FR_LONG_BODY}`,
  5000,
);

for (const lang of LANGS.filter((l) => l !== 'fr')) {
  const bag = parsed[lang] || {};
  const trLong = String(bag.long || '').trim();
  if (!trLong) {
    console.warn('empty', lang);
    continue;
  }
  setDesc(longs, lang, `${trLong}\n\n${ADDRESS_LABEL[lang]} ${ADDRESS}`);
  console.log('ok', lang, trLong.length);
}

writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
const txt = longs.fr[NAME].replace(/\n/g, '\r\n');
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_clef_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_clef_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaClefDOr_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
}

for (const lang of LANGS) {
  const raw = shorts[lang]?.[NAME] || shorts[LANG_ALIASES[lang]]?.[NAME];
  if (!raw) {
    console.warn('no short', lang);
    continue;
  }
  const out = path.join(ROOT, 'audio', `ALaClefDOr_short_${lang}.mp3`);
  const text = ttsText(raw, lang);
  if (!text) throw new Error('TTS short vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio short', lang, fs.statSync(out).size);
}

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}
copyViaTmp(
  path.join(ROOT, 'translations/descriptions.json'),
  path.join(ROOT, 'dist/translations/descriptions.json'),
);
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('done');
