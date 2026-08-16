/**
 * A la Tete Saint-Jean : texte long réécrit (sans répéter le court),
 * TETE/Taette lus Tête, Clef lu Clé, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-tete-saint-jean.mjs
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

const NAME = 'A la Tete Saint-Jean';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Clef 9, 7000 Mons.';
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

const FR_LONG_BODY = `Au-dessus de la porte, une tête en ronde-bosse, calcaire, isolée sur son plateau. De part et d’autre, sur le cordon, gravé : A LA TETE. Puis SAINT JEAN. Regravé, doré. L’ancienne graphie : Taette.

Maison toute en pierre, 1766 dans l’entablement. Trois niveaux, des cordons épais. Classée en 1990.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Above the door, a head in the round, limestone, isolated on its platter. On either side, on the band, carved: A LA TETE. Then SAINT JEAN. Re-cut, gilded. The old spelling: Taette.

A house all in stone, 1766 in the entablature. Three storeys, thick bands. Listed in 1990.`,
  nl: `Boven de deur, een hoofd in ronde-bosse, kalksteen, alleen op zijn schaal. Aan weerszijden, op de cordon, gegraveerd: A LA TETE. Daarna SAINT JEAN. Opnieuw gegraveerd, verguld. De oude spelling: Taette.

Huis helemaal in steen, 1766 in het entablement. Drie niveaus, dikke cordons. Beschermd in 1990.`,
  de: `Über der Tür ein Kopf in Rundplastik, Kalkstein, allein auf seinem Teller. Beiderseits, auf dem Band, gemeißelt: A LA TETE. Dann SAINT JEAN. Neu graviert, vergoldet. Die alte Schreibweise: Taette.

Haus ganz aus Stein, 1766 im Gebälk. Drei Geschosse, dicke Bänder. Unter Schutz seit 1990.`,
  it: `Sopra la porta, una testa a tutto tondo, calcare, isolata sul suo piatto. Da una parte e dall'altra, sul cordone, inciso: A LA TETE. Poi SAINT JEAN. Rinciso, dorato. La grafia antica: Taette.

Casa tutta in pietra, 1766 nell'entablamento. Tre livelli, cordoni spessi. Classificata nel 1990.`,
  es: `Encima de la puerta, una cabeza de bulto redondo, caliza, aislada sobre su plato. A uno y otro lado, en el cordón, grabado: A LA TETE. Luego SAINT JEAN. Regrabado, dorado. La grafía antigua: Taette.

Casa toda de piedra, 1766 en el entablamento. Tres niveles, cordones gruesos. Catalogada en 1990.`,
  pl: `Nad drzwiami głowa w pełnym reliefie, wapień, sama na misie. Po obu stronach, na gzymsie, wyryte: A LA TETE. Potem SAINT JEAN. Wyryte na nowo, złocone. Dawna pisownia: Taette.

Dom cały z kamienia, 1766 w belkowaniu. Trzy kondygnacje, grube gzymsy. Zabytkowy od 1990.`,
  ar: `فوق الباب، رأس نحت مجسّم، حجر جيري، وحده على طبقه. على الجانبين، على الإفريز، محفور: A LA TETE. ثم SAINT JEAN. أُعيد حفره وطُلي بالذهب. الكتابة القديمة: Taette.

منزل كله حجر، 1766 في الإفريز العلوي. ثلاثة طوابق، أحزمة سميكة. صُنّف سنة 1990.`,
  cn: `门上方，一块圆雕头像，石灰岩，单独搁在盘子上。两侧饰带上刻着：A LA TETE。然后是 SAINT JEAN。重新刻过，镀金。旧写法：Taette。

整座房子都是石头，檐口刻着1766。三层，粗石带。1990年列为保护建筑。`,
  jp: `扉の上、円刻の頭、石灰岩、皿の上にひとつ。両側の帯に刻まれている：A LA TETE。それから SAINT JEAN。彫り直し、金彩。古い綴り：Taette。

家はすべて石、エンタブラチュアに1766。三層、太い帯。1990年に指定。`,
};

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

function patchQuizObj(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj[NAME]) && obj[NAME][1] && typeof obj[NAME][1].answer === 'number') {
    obj[NAME][1].answer = 2;
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) patchQuizObj(v);
  }
}

function patchQuizJs(file) {
  if (!fs.existsSync(file)) return;
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^(window\.quizData\s*=\s*)([\s\S]*?)(;?\s*)$/);
  if (!m) throw new Error('quizData parse fail ' + file);
  const data = JSON.parse(m[2]);
  patchQuizObj(data);
  const out = m[1] + JSON.stringify(data, null, 2) + ';\n';
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, out);
  try { fs.unlinkSync(file); } catch {}
  fs.renameSync(tmp, file);
  console.log('quiz XVIIIe', path.basename(file), path.dirname(file) === path.join(ROOT, 'dist') ? 'dist' : 'root');
}

function patchQuizJson(file) {
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  patchQuizObj(data);
  writeJson(file, data);
  console.log('quiz XVIIIe', path.basename(file));
}

const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

for (const lang of LANGS) {
  const body = LONG_BODY[lang];
  if (!body) throw new Error('missing long ' + lang);
  setDesc(longs, lang, `${body}\n\n${ADDRESS_LABEL[lang]} ${ADDRESS}`);
  console.log('ok', lang, body.length);
}

writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
const txt = longs.fr[NAME].replace(/\n/g, '\r\n');
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_tete_saint-jean.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_tete_saint-jean.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaTeteSaintJean_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTaette\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
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
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);

patchQuizJs(path.join(ROOT, 'quizData.js'));
patchQuizJs(path.join(ROOT, 'dist', 'quizData.js'));
patchQuizJson(path.join(ROOT, 'translations', 'quiz_translations.json'));
patchQuizJson(path.join(ROOT, 'dist', 'translations', 'quiz_translations.json'));
for (const l of LANGS) {
  patchQuizJson(path.join(ROOT, 'scripts', `quiz-${l}.json`));
}

console.log('done');
