/**
 * A la Tette d'Or : texte long réécrit (sans répéter le court),
 * Tette/TETTE → Tètt en TTS, traductions 10 langues, MP3 court+long.
 * Usage: node scripts/fill-tette-dor.mjs
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

const NAME = "A la Tette d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 15, 7000 Mons.";
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

const FR_LONG_BODY = `En haut, gravé : TETTE. En dessous, un cartouche. La tête n’y est plus. On l’a burinée, ou le temps l’a mangée : pierre grise, surface râpée, une fente horizontale. L’inscription a tenu. Tette, en vieux français, en picard : la tête. Certains y ont lu le sein, le mamelon. Le nom est resté, l’image non.

On n’allait pas à un numéro. On se donnait rendez-vous « à la Tette d’Or ». Cette rue menait à la porte d’Havré, vers le château des ducs. Parcelles étroites, en lanières. Aux étages, on logeait ; en bas, les vitrines ont avancé, XVIIIe, XIXe.

L’or du nom promettait le luxe, ou l’auberge des marchands. Aujourd’hui, Oxfam-Magasins du monde : seconde main, commerce équitable. La pierre dit encore TETTE. Le rez-de-chaussée parle d’autre chose.`;

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

const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  "You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep TETTE and Tette exactly. Keep proper names exactly: Tette d'Or, Havré, Oxfam-Magasins du monde, Mons. The head was burined/defaced (not newly carved). The remaining sign is stone, not metal. cn = Simplified Chinese. jp = Japanese.",
  `Translate this LONG visitor text into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "long": "..." }, "nl": { "long": "..." }, ... }
Keep the same facts. Do not invent. Keep paragraph breaks.
Do not add the address line; it will be appended.
Do not repeat the short-card facts: do not write "15 rue d'Havré", do not open with "the head motif has been burined; the inscription remains".

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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_tette_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_tette_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const jobs = [
    { kind: 'short', text: ttsText(shorts[lang]?.[NAME] || shorts.fr[NAME], lang), out: path.join(ROOT, 'audio', `ALaTetteDOr_short_${lang}.mp3`) },
    { kind: 'long', text: ttsText(longs[lang][NAME], lang), out: path.join(ROOT, 'audio', `ALaTetteDOr_${lang}.mp3`) },
  ];
  for (const job of jobs) {
    if (!job.text) throw new Error('TTS vide ' + lang + ' ' + job.kind);
    try { fs.unlinkSync(job.out); } catch {}
    await synthesizeSpeechMp3(job.text, job.out, { lang: POLLY_LANG[lang] || lang });
    fs.copyFileSync(job.out, path.join(ROOT, 'dist', 'audio', path.basename(job.out)));
    console.log('audio', job.kind, lang, fs.statSync(job.out).size, /Tètt/.test(job.text) ? ' Tètt' : '');
  }
}

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
copyViaTmp(
  path.join(ROOT, 'translations/descriptions.json'),
  path.join(ROOT, 'dist/translations/descriptions.json'),
);
console.log('done');
