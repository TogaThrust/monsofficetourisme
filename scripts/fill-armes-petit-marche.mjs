/**
 * Armes de Mons Petit Marche : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Quiz : sculpture XVIe (plus XVIIIe).
 * Usage: node scripts/fill-armes-petit-marche.mjs
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

const NAME = 'Armes de Mons Petit Marche';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Nimy 83, 7000 Mons.';
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

const FR_LONG_BODY = `Ce n’est plus un passage. L’arc est muré : à gauche, la brique courbe encore, dans un mur de moellons et de mortier. Au sommet, la clé tient. Pierre grise, demi-relief, usée. Une ville fortifiée, deux tourelles à toits en pointe, la porte ouverte. Au-dessus, un petit écu : les lions du Hainaut. Le chien sous la herse — fidélité des Montois aux comtes — se devine plus qu’il ne se lit. XVIe siècle. Ici, les armes de la ville marquaient un passage public, pas une enseigne de métier.

On disait déjà « Petit Marchiet » en 1548 — la cour d’aujourd’hui. Une placette, un marché secondaire, des issues vers la rue. On retrouve ces armes sur d’autres édifices publics. Celles-ci n’ont pas quitté le mur : le passage s’est fermé, la pierre est restée.

Levez les yeux au fond de la cour. La pierre ne crie plus. Elle tient.`;

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

function is16thCenturyOption(opt) {
  const s = String(opt);
  if (s.includes('XVIIIe') || s.includes('XVIII')) return false;
  if (/\b18\b|18th|18e |18\.|18世纪|18世紀|الثامن عشر/.test(s)) return false;
  if (s.includes('XVIe') || /\bXVI\b/.test(s)) return true;
  if (/16th|16e |16\.|16世纪|16世紀|السادس عشر/.test(s)) return true;
  if (/secolo XVI|siglo XVI|XVI wiek|16de/.test(s)) return true;
  return false;
}

function fixCentury(bag) {
  const list = bag?.[NAME];
  if (!Array.isArray(list)) return 0;
  let n = 0;
  for (const q of list) {
    if (!Array.isArray(q.options)) continue;
    const idx = q.options.findIndex(is16thCenturyOption);
    if (idx >= 0 && q.answer !== idx) {
      q.answer = idx;
      n++;
    }
  }
  return n;
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

setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  'You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep proper names exactly: Petit Marchiet, Hainaut, Mons. The sculpture is 16th century (XVIe), not 18th. Keep « herse » as portcullis. cn = Simplified Chinese. jp = Japanese.',
  `Translate this LONG visitor text into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "long": "..." }, "nl": { "long": "..." }, ... }
Keep the same facts. Do not invent. Keep paragraph breaks.
Do not add the address line; it will be appended.
Do not repeat the short-card facts: do not write "83 rue de Nimy", do not open with "coat of arms of Mons on an arch keystone".
Do not mention 1841, 1842, Grande Boucherie, or rue de la Clef.

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
fs.writeFileSync(path.join(ROOT, 'data', 'armes_de_mons_petit_marche.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'armes_de_mons_petit_marche.txt'), txt);

let quizFixed = 0;
for (const lang of LANGS) {
  const p = path.join(ROOT, 'scripts', `quiz-${lang}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  quizFixed += fixCentury(data);
  writeJson(p, data);
}
for (const rel of [
  'quizData.js',
  'dist/quizData.js',
  'scripts/quiz-basreliefs-nord-fr.json',
  'scripts/.basreliefs-quiz-fr.json',
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const raw = fs.readFileSync(p, 'utf8');
  if (rel.endsWith('.js')) {
    const data = JSON.parse(raw.replace(/^[^{]+/, '').replace(/;?\s*$/, ''));
    quizFixed += fixCentury(data);
    const prefix = raw.match(/^[^{]*/)?.[0] || '';
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, `${prefix}${JSON.stringify(data, null, 2)}\n`);
    try { fs.unlinkSync(p); } catch {}
    fs.renameSync(tmp, p);
  } else {
    const data = JSON.parse(raw);
    quizFixed += fixCentury(data);
    writeJson(p, data);
  }
}
const quizTrPath = path.join(ROOT, 'translations/quiz_translations.json');
const quizTr = JSON.parse(fs.readFileSync(quizTrPath, 'utf8'));
for (const lang of Object.keys(quizTr)) {
  quizFixed += fixCentury(quizTr[lang]);
}
writeJson(quizTrPath, quizTr);
writeJson(path.join(ROOT, 'dist/translations/quiz_translations.json'), quizTr);
console.log('quiz centuries fixed', quizFixed);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ArmesDeMonsPetitMarche_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
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
copyViaTmp(path.join(ROOT, 'quizData.js'), path.join(ROOT, 'dist/quizData.js'));
console.log('done');
