/**
 * A Saint-Antoine : texte long réécrit (sans répéter le court),
 * A SAINT ANTOINE lu À Saint-Antoine en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-saint-antoine.mjs
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

const NAME = 'A Saint-Antoine';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Coupe 37, 7000 Mons.';
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

const FR_LONG_BODY = `Le panneau tient l’allège de la fenêtre de gauche, au premier étage : un rectangle de calcaire, scellé dans la brique. Antoine l’Ermite, à droite, capuchon, habit, barbu, de profil vers la gauche. À ses pieds, le cochon, lui aussi de profil. À gauche, une chapelle à toit en pente ; des arbres encadrent le champ. Pas une lettre sur la pierre.

Maison de style classique montois, première moitié du XVIIIe. Brique et pierre. Deux allèges sous les baies de l’étage : le relief à gauche, le calcaire nu à droite.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the allège of the left-hand window on the first floor: a rectangle of limestone, set into the brick. Anthony the Hermit, on the right, hood, habit, bearded, in profile facing left. At his feet, the pig, also in profile. On the left, a chapel with a pitched roof; trees frame the field. Not a letter on the stone.

A house in Mons classical style, first half of the eighteenth century. Brick and stone. Two allèges under the first-floor bays: the relief on the left, bare limestone on the right.`,
  nl: `Het paneel vormt de allège van het linker raam op de eerste verdieping: een rechthoek van kalksteen, in de baksteen gezet. Antonius de Kluizenaar, rechts, kap, habijt, bebaard, in profiel naar links. Aan zijn voeten het varken, eveneens in profiel. Links een kapel met zadeldak; bomen omkaderen het veld. Geen letter op de steen.

Huis in klassieke Montoise stijl, eerste helft van de achttiende eeuw. Baksteen en steen. Twee allèges onder de vensters van de verdieping: het reliëf links, kale kalksteen rechts.`,
  de: `Die Tafel bildet die Allège des linken Fensters im ersten Stock: ein Rechteck aus Kalkstein, in den Ziegel gesetzt. Antonius der Einsiedler, rechts, Kapuze, Habit, bärtig, im Profil nach links. Zu seinen Füßen das Schwein, ebenfalls im Profil. Links eine Kapelle mit Satteldach; Bäume fassen das Feld. Kein Buchstabe auf dem Stein.

Haus im klassischen Mons-Stil, erste Hälfte des 18. Jahrhunderts. Ziegel und Stein. Zwei Allèges unter den Fenstern des Stocks: das Relief links, nackter Kalkstein rechts.`,
  it: `Il pannello occupa l'allège della finestra di sinistra al primo piano: un rettangolo di calcare, sigillato nel mattone. Antonio l'Eremita, a destra, cappuccio, abito, barbuto, di profilo verso sinistra. Ai suoi piedi il maiale, anch'esso di profilo. A sinistra, una cappella dal tetto a spiovente; alberi incorniciano il campo. Nessuna lettera sulla pietra.

Casa in stile classico montois, prima metà del XVIII secolo. Mattone e pietra. Due allèges sotto le campate del piano: il rilievo a sinistra, il calcare nudo a destra.`,
  es: `El panel ocupa el allège de la ventana de la izquierda, en el primer piso: un rectángulo de caliza, trabado en el ladrillo. Antonio el Ermitaño, a la derecha, capucha, hábito, barbado, de perfil hacia la izquierda. A sus pies, el cerdo, también de perfil. A la izquierda, una capilla de tejado a dos aguas; árboles enmarcan el campo. Ni una letra en la piedra.

Casa de estilo clásico montois, primera mitad del siglo XVIII. Ladrillo y piedra. Dos allèges bajo los vanos del piso: el relieve a la izquierda, la caliza desnuda a la derecha.`,
  pl: `Panel zajmuje allège lewego okna na pierwszym piętrze: prostokąt z wapienia, osadzony w cegle. Antoni Pustelnik, po prawej, kaptur, habit, brodaty, z profilu w lewo. U jego stóp świnia, też z profilu. Po lewej kaplica o spadzistym dachu; drzewa kadrują pole. Ani jednej litery na kamieniu.

Dom w klasycznym stylu montois, pierwsza połowa XVIII wieku. Cegła i kamień. Dwa allèges pod oknami piętra: relief po lewej, nagi wapień po prawej.`,
  ar: `تشغل اللوحة الأليج للنافذة اليسرى في الطابق الأول: مستطيل من الحجر الجيري، مثبت في الآجر. أنطونيوس الناسك، إلى اليمين، قلنسوة، ثوب رهباني، ملتحٍ، جانبياً نحو اليسار. عند قدميه الخنزير، هو أيضاً جانبياً. إلى اليسار كنيسة صغيرة بسقف مائل؛ أشجار تؤطّر الحقل. لا حرف على الحجر.

منزل على الطراز الكلاسيكي المونتوي، النصف الأول من القرن الثامن عشر. آجر وحجر. أليجان تحت فتحات الطابق: النحت على اليسار، الحجر الجيري العاري على اليمين.`,
  cn: `这块石板占据一楼左侧窗户下方的窗裙（allège）：一块嵌在砖里的石灰岩长方形。隐修士安东尼在右，兜帽、修士服、有须，侧面朝左。脚边是猪，也是侧面。左边一座坡顶小堂；树木框住画面。石头上一个字也没有。

一座蒙斯古典风格的房屋，十八世纪上半叶。砖和石。楼层窗下两块窗裙：左边是浮雕，右边是光石灰岩。`,
  jp: `パネルは1階左の窓の下、窓台下の石板（allège）を占める：煉瓦に嵌められた石灰岩の長方形。隠者アントニウスは右、頭巾、修道服、髭、横顔は左向き。足元に豚、同じく横顔。左に勾配屋根の小聖堂；木々が画面を縁取る。石に文字はない。

モンスの古典様式の家、十八世紀前半。煉瓦と石。階の窓下に二つのallège：左が浮き彫り、右はむき出しの石灰岩。`,
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
  console.log('quiz XVIIIe', path.basename(file));
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_saint-antoine.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_saint-antoine.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ASaintAntoine_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bA SAINT ANTOINE\b/.test(text))) {
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
