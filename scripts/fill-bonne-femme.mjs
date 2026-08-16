/**
 * A la Bonne Femme : texte long réécrit (sans répéter le court),
 * A LA BONNE FEMME lu À la Bonne Femme en TTS, quiz pierre, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-bonne-femme.mjs
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

const NAME = 'A la Bonne Femme';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue Spira 6, 7000 Mons.';
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

const FR_LONG_BODY = `Dans le soubassement, à l’angle de la ruelle Spira et de la chasse Montignies : une dalle de pierre, encastrée. Quatre lignes, capitales : A LA BONNE FEMME. Puis 1723. Le A sans accent. Sur le champ, plus de figure.

Maison d’une sage-femme. L’inscription était surmontée d’une femme sans tête. Ce relief n’est plus sur la pierre.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `In the plinth, at the corner of ruelle Spira and the chasse Montignies: a stone slab, set in. Four lines, capitals: A LA BONNE FEMME. Then 1723. The A without an accent. On the field, no figure left.

A midwife's house. The inscription was surmounted by a headless woman. That relief is no longer on the stone.`,
  nl: `In de plint, op de hoek van de ruelle Spira en de chasse Montignies: een stenen plaat, ingemetseld. Vier regels, kapitalen: A LA BONNE FEMME. Daarna 1723. De A zonder accent. Op het veld geen figuur meer.

Huis van een vroedvrouw. Boven de inscriptie stond een vrouw zonder hoofd. Dat reliëf zit niet meer op de steen.`,
  de: `Im Sockel, an der Ecke von ruelle Spira und chasse Montignies: eine Steinplatte, eingesetzt. Vier Zeilen, Versalien: A LA BONNE FEMME. Dann 1723. Das A ohne Akzent. Auf dem Feld keine Figur mehr.

Haus einer Hebamme. Die Inschrift war von einer kopflosen Frau überragt. Dieses Relief ist nicht mehr auf dem Stein.`,
  it: `Nel basamento, all'angolo della ruelle Spira e della chasse Montignies: una lastra di pietra, incassata. Quattro righe, maiuscole: A LA BONNE FEMME. Poi 1723. La A senza accento. Sul campo, più nessuna figura.

Casa di una ostetrica. L'iscrizione era sormontata da una donna senza testa. Quel rilievo non è più sulla pietra.`,
  es: `En el zócalo, en la esquina de la ruelle Spira y la chasse Montignies: una losa de piedra, encajada. Cuatro líneas, mayúsculas: A LA BONNE FEMME. Luego 1723. La A sin acento. En el campo, ya no hay figura.

Casa de una comadrona. La inscripción estaba coronada por una mujer sin cabeza. Ese relieve ya no está en la piedra.`,
  pl: `W cokole, na rogu ruelle Spira i chasse Montignies: płyta kamienna, wmurowana. Cztery wiersze, kapitaliki: A LA BONNE FEMME. Potem 1723. A bez akcentu. Na polu nie ma już figury.

Dom położnej. Napis był zwieńczony kobietą bez głowy. Tej rzeźby nie ma już na kamieniu.`,
  ar: `في القاعدة، عند زاوية ruelle Spira وchasse Montignies: بلاطة حجرية، مغروسة. أربعة أسطر، حروف كبيرة: A LA BONNE FEMME. ثم 1723. حرف A بلا نبرة. على الحقل، لم تعد هناك صورة.

بيت قابلة. كان النقش يعلوه تمثيل امرأة بلا رأس. هذا النحت لم يعد على الحجر.`,
  cn: `在墙基里，ruelle Spira与chasse Montignies的转角：一块嵌进去的石板。四行大写：A LA BONNE FEMME。然后是1723。A没有重音。石面上再没有人形。

接生婆的房子。铭文上方曾经有一个无头女人。那浮雕已不在这块石头上。`,
  jp: `基礎の石に、ruelle Spiraとchasse Montigniesの角：はめ込まれた石板。四行の大文字：A LA BONNE FEMME。それから1723。Aにアクセントはない。面に、もう像はない。

助産婦の家だった。銘の上には、頭のない女が載っていた。その浮き彫りは、もう石にない。`,
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
  if (Array.isArray(obj[NAME]) && obj[NAME][0] && typeof obj[NAME][0].answer === 'number') {
    obj[NAME][0].answer = 2;
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
  console.log('quiz pierre', path.basename(file), path.dirname(file) === path.join(ROOT, 'dist') ? 'dist' : 'root');
}

function patchQuizJson(file) {
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  patchQuizObj(data);
  writeJson(file, data);
  console.log('quiz pierre', path.basename(file));
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_bonne_femme.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_bonne_femme.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaBonneFemme_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bA LA BONNE FEMME\b/.test(text) || !/À la Bonne Femme/.test(text))) {
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
