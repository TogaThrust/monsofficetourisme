/**
 * The Bootle Arms : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs. Quiz : jumelage 1964 (plus 1975).
 * Usage: node scripts/fill-bootle-arms.mjs
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

const NAME = 'The Bootle Arms';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Nimy 14, 7000 Mons.';
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

const FR_LONG_BODY = `Le 20 juin 1964, Mons se lie à Bootle, port anglais aujourd’hui dans Sefton, aux portes de Liverpool. Ici, à l’angle du Gouvernement provincial, la place porte ce nom. L’enseigne ornait d’abord la taverne. En écho, Bootle a eu son pub « The Mons ». Deux villes, deux noms au-dessus d’une porte.

Le choix n’est pas un hasard de carte. Au début des années 1960, un préfet d’école de Bootle — originaire des Flandres — cherche le passé de sa commune. Il apprend que le Musée de la Guerre, ici, conserve des papiers allemands laissés après le conflit : plans de vol, cibles du Blitz de mai 1941 sur Liverpool et Bootle. Les bombardiers décollaient de Chièvres, à quelques kilomètres. Les archivistes montois restituent une partie de ces documents. L’amitié commence là.

Levez les yeux vers l’ancien îlot RTT, devenu Belgacom puis Proximus. Des bas-reliefs monumentaux racontent le Hainaut au travail : mineur, carrier, métallurgiste, verrier, céramiste, paysan. Darville, Harvent, Delneste, Gustave Jacobs. Après le départ de l’opérateur, le projet DouMons reconvertit le site. Les autorités wallonnes ont imposé de garder ces figures, de les réintégrer. Les visages du labeur restent sur la rue.`;

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

function fixBootleYear(bag) {
  const list = bag?.[NAME];
  if (!Array.isArray(list)) return 0;
  let n = 0;
  for (const q of list) {
    if (Array.isArray(q.options) && q.options[0] === '1975') {
      q.options[0] = '1964';
      n++;
    }
  }
  return n;
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  'You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep proper names exactly: Bootle, Sefton, Liverpool, Chièvres, RTT, Belgacom, Proximus, DouMons, Darville, Harvent, Delneste, Gustave Jacobs, The Mons, Musée de la Guerre, Mons. cn = Simplified Chinese. jp = Japanese.',
  `Translate this LONG visitor text into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "long": "..." }, "nl": { "long": "..." }, ... }
Keep the same facts. Do not invent. Keep paragraph breaks.
Do not add the address line; it will be appended.
Do not repeat the short-card facts: do not write "14 rue de Nimy", do not open with "coat of arms recalling the twinning".

long:
${FR_LONG_BODY}`,
  5500,
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
fs.writeFileSync(path.join(ROOT, 'data', 'the_bootle_arms.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'the_bootle_arms.txt'), txt);

let quizFixed = 0;
for (const lang of LANGS) {
  const p = path.join(ROOT, 'scripts', `quiz-${lang}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  quizFixed += fixBootleYear(data);
  writeJson(p, data);
}
for (const rel of [
  'quizData.js',
  'dist/quizData.js',
  'scripts/quiz-basreliefs-nord-fr.json',
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const raw = fs.readFileSync(p, 'utf8');
  if (rel.endsWith('.js')) {
    const data = JSON.parse(raw.replace(/^[^{]+/, '').replace(/;?\s*$/, ''));
    const n = fixBootleYear(data);
    quizFixed += n;
    const prefix = raw.match(/^[^{]*/)?.[0] || '';
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, `${prefix}${JSON.stringify(data, null, 2)}\n`);
    try { fs.unlinkSync(p); } catch {}
    fs.renameSync(tmp, p);
  } else {
    const data = JSON.parse(raw);
    quizFixed += fixBootleYear(data);
    writeJson(p, data);
  }
}
const quizTrPath = path.join(ROOT, 'translations/quiz_translations.json');
const quizTr = JSON.parse(fs.readFileSync(quizTrPath, 'utf8'));
for (const lang of Object.keys(quizTr)) {
  quizFixed += fixBootleYear(quizTr[lang]);
}
writeJson(quizTrPath, quizTr);
writeJson(path.join(ROOT, 'dist/translations/quiz_translations.json'), quizTr);
console.log('quiz years fixed', quizFixed);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `TheBootleArms_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size, lang === 'fr' && /Bouh teul/.test(text) ? '(Bouh teul)' : '');
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
