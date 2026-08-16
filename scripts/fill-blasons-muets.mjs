/**
 * Blasons muets : texte long réécrit, traductions 10 langues, MP3 court+long.
 * Usage: node scripts/fill-blasons-muets.mjs
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

const NAME = 'Blasons muets';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue du Miroir 8, 7000 Mons.';
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

const FR_SHORT =
  'Au 8 rue du Miroir, levez la tête : au-dessus de la porte, un phylactère porte 1545, flanqué de deux écus sans figures. Ce sont des blasons muets.';

const FR_LONG_BODY = `Vous êtes devant une maison gothique, au 8 rue du Miroir. Pierre bleue et brique enduite : le XVIe siècle montois, encore lisible malgré les siècles. David Longhet, qui sera échevin en 1551, l’a fait bâtir ; la date 1545 est gravée au-dessus de la porte, sur un phylactère.

C’est là que se trouvent les blasons muets. Deux écus encadrent le bandeau daté, mais leurs champs sont vides : pas d’armes, pas de figures. En héraldique, un écu muet attend encore son identité, ou la tait. Le linteau, légèrement écrasé, porte une moulure en accolade ; le fleuron du milieu s’appuie sur le phylactère. Une plaque rappelle qu’il s’agit d’une maison gothique.

Levez ensuite le regard vers la façade. Trois niveaux, trois travées. Aux étages inférieurs, des arcs à trois lobes avancent en encorbellement, posés sur des culots prismatiques. Les grandes fenêtres ont des encadrements gothiques, des seuils en cordon, des trumeaux de pierre. Tout en haut, les baies se font plus basses, plus calmes, sous une corniche profilée et une croupe percée d’une lucarne.

Le bâtiment a brûlé en 1974. La restauration de 1982 l’a rendu à la ville ; il sert aujourd’hui de bureaux. Classé monument depuis 1959, il mélange le gothique du chantier d’origine et des ajouts du XVIIIe siècle : une fenêtre de type tournaisien, une petite baie de brique, des modillons sculptés sous la corniche. Prenez le temps de lire les écus vides. Ils parlent justement parce qu’ils ne montrent rien.`;

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

setDesc(shorts, 'fr', FR_SHORT);
setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  'You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep proper names: Mons, David Longhet, Miroir. cn = Simplified Chinese. jp = Japanese.',
  `Translate this visitor card into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "short": "...", "long": "..." }, "nl": { "short": "...", "long": "..." }, ... }
Keep the same facts. Do not invent. Keep paragraph breaks in "long". Do not add the address line; it will be appended.

short:
${FR_SHORT}

long:
${FR_LONG_BODY}`,
  5000,
);

for (const lang of LANGS.filter((l) => l !== 'fr')) {
  const bag = parsed[lang] || {};
  const trShort = String(bag.short || '').trim();
  const trLong = String(bag.long || '').trim();
  if (!trShort || !trLong) {
    console.warn('empty', lang);
    continue;
  }
  setDesc(shorts, lang, trShort);
  setDesc(longs, lang, `${trLong}\n\n${ADDRESS_LABEL[lang]} ${ADDRESS}`);
  console.log('ok', lang, trShort.length, trLong.length);
}

writeJson(path.join(ROOT, 'translations/descriptions_short.json'), shorts);
writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
const txt = longs.fr[NAME].replace(/\n/g, '\r\n');
fs.writeFileSync(path.join(ROOT, 'data', 'blasons_muets.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'blasons_muets.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
const files = [];
for (const lang of LANGS) {
  files.push({
    label: `short ${lang}`,
    lang,
    text: ttsText(shorts[lang][NAME], lang),
    out: path.join(ROOT, 'audio', `BlasonsMuets_short_${lang}.mp3`),
  });
  files.push({
    label: `long ${lang}`,
    lang,
    text: ttsText(longs[lang][NAME], lang),
    out: path.join(ROOT, 'audio', `BlasonsMuets_${lang}.mp3`),
  });
}
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const job of files) {
  if (fs.existsSync(job.out)) fs.unlinkSync(job.out);
  await synthesizeSpeechMp3(job.text, job.out, { lang: POLLY_LANG[job.lang] || job.lang });
  fs.copyFileSync(job.out, path.join(ROOT, 'dist', 'audio', path.basename(job.out)));
  console.log('audio', job.label, fs.statSync(job.out).size);
}

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}
copyViaTmp(path.join(ROOT, 'translations/descriptions_short.json'), path.join(ROOT, 'dist/translations/descriptions_short.json'));
copyViaTmp(path.join(ROOT, 'translations/descriptions.json'), path.join(ROOT, 'dist/translations/descriptions.json'));
console.log('done');
