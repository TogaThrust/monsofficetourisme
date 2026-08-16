/**
 * A la Couronne Grand Rue : texte long réécrit (sans répéter le court),
 * A LA COURONE lu À la Couronne en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-couronne-grand-rue.mjs
 *
 * Sources : Yannart (monsblog, n°20) + photo POI images/A_la_Couronne_Grand_Rue.jpg
 *   + gevelstenen (Grand'Rue 102, motif « kroon », OPSCHRIFT A LA COURONE).
 * Connaître la Wallonie : pas de fiche dédiée au n°102
 *   (ne pas voler Hôtel de la Couronne impériale / Rue de la Couronne).
 * Ne pas voler : Impériale Grand-Place 24 ; BF IHS IL ; Le Gant ;
 *   étymologie Blancs Mouchons ; Trouée d’Havré.
 * Quiz Q2 : answer 0 (XVIIIe, Yannart), pas 2 (XIXe). Ordre inchangé.
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

const NAME = 'A la Couronne Grand Rue';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Grand'Rue 102, 7000 Mons.";
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

const FR_LONG_BODY = `Le panneau tient l’allège de la fenêtre du milieu, au premier étage : un rectangle de pierre grise, bord simple, un peu taché à droite. Au-dessus, en relief, une couronne dorée. Cinq pointes visibles, chacune coiffée d’une perle ; les trois du milieu plus hautes que les deux des bords. En dessous, dans une bande en creux, gravé en capitales : A LA COURONE. Un seul N.

La pierre s’encastre dans une maison du XVIIIe siècle, à l’angle de la rue des Blancs Mouchons. Façade de brique claire, bandeaux de pierre qui encadrent le panneau, au-dessus et au-dessous.`;

/** Traductions figées. Inscription pierre : A LA COURONE (un N). Pas Impériale / Gant / IHS. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the allège of the middle window on the first floor: a rectangle of grey stone, a simple border, a little stained on the right. Above, in relief, a gilded crown. Five points visible, each tipped with a pearl; the three in the middle taller than the two at the sides. Below, in a recessed band, carved in capitals: A LA COURONE. A single N.

The stone is set into an eighteenth-century house, at the corner of the rue des Blancs Mouchons. A façade of light brick, stone bands that frame the panel, above and below.`,
  nl: `Het paneel vormt de allège van het middelste raam op de eerste verdieping: een rechthoek van grijze steen, eenvoudige rand, rechts wat gevlekt. Daarboven, in reliëf, een vergulde kroon. Vijf punten zichtbaar, elk bekroond met een parel; de drie in het midden hoger dan de twee aan de zijkanten. Daaronder, in een verzonken band, in kapitalen gegraveerd: A LA COURONE. Eén enkele N.

De steen is ingezet in een huis uit de achttiende eeuw, op de hoek van de rue des Blancs Mouchons. Gevel van lichte baksteen, stenen banden die het paneel omlijsten, boven en onder.`,
  de: `Die Tafel bildet die Allège des mittleren Fensters im ersten Stock: ein Rechteck aus grauem Stein, einfacher Rand, rechts etwas fleckig. Darüber, im Relief, eine vergoldete Krone. Fünf Spitzen sichtbar, jede mit einer Perle bekrönt; die drei in der Mitte höher als die zwei an den Seiten. Darunter, in einem vertieften Band, in Kapitalen gemeißelt: A LA COURONE. Ein einziges N.

Der Stein sitzt in einem Haus des 18. Jahrhunderts, an der Ecke der rue des Blancs Mouchons. Fassade aus hellem Ziegel, Steinbänder, die die Tafel oben und unten rahmen.`,
  it: `Il pannello occupa l'allège della finestra centrale al primo piano: un rettangolo di pietra grigia, bordo semplice, un po' macchiato a destra. Sopra, in rilievo, una corona dorata. Cinque punte visibili, ciascuna sormontata da una perla; le tre di mezzo più alte delle due ai lati. Sotto, in una fascia incavata, inciso in capitali: A LA COURONE. Una sola N.

La pietra è incastonata in una casa del XVIII secolo, all'angolo della rue des Blancs Mouchons. Facciata di mattone chiaro, fasce di pietra che inquadrano il pannello, sopra e sotto.`,
  es: `El panel ocupa el allège de la ventana del medio, en el primer piso: un rectángulo de piedra gris, borde simple, un poco manchado a la derecha. Encima, en relieve, una corona dorada. Cinco puntas visibles, cada una coronada por una perla; las tres del centro más altas que las dos de los lados. Debajo, en una banda hundida, grabado en capitales: A LA COURONE. Una sola N.

La piedra está encajada en una casa del siglo XVIII, en la esquina de la rue des Blancs Mouchons. Fachada de ladrillo claro, bandas de piedra que enmarcan el panel, arriba y abajo.`,
  pl: `Panel zajmuje allège środkowego okna na pierwszym piętrze: prostokąt z szarego kamienia, prosta krawędź, po prawej trochę poplamiony. Powyżej, w reliefie, złocona korona. Pięć widocznych szpiców, każdy zwieńczony perłą; trzy środkowe wyższe niż dwa skrajne. Poniżej, w wklęsłym pasie, wyryte kapitalikami: A LA COURONE. Jedno tylko N.

Kamień osadzono w domu z XVIII wieku, na rogu rue des Blancs Mouchons. Elewacja z jasnej cegły, kamienne gzymsy, które oprawiają panel, u góry i u dołu.`,
  ar: `تشغل اللوحة الأليج للنافذة الوسطى في الطابق الأول: مستطيل من حجر رمادي، حاشية بسيطة، ملطّخة قليلاً إلى اليمين. فوقها، بارزاً، تاج مذهّب. خمس رؤوس ظاهرة، كل رأس تعلوه لؤلؤة؛ الثلاثة في الوسط أعلى من الاثنتين على الجانبين. تحتها، في شريط غائر، محفور بأحرف كبيرة: A LA COURONE. حرف N واحد فقط.

الحجر مركّب في بيت من القرن الثامن عشر، عند زاوية rue des Blancs Mouchons. واجهة من آجر فاتح، أحزمة حجر تؤطر اللوحة، من فوق ومن تحت.`,
  cn: `这块石板占据一楼中间窗户下方的窗裙（allège）：灰色石质长方形，边框简单，右侧略有污斑。上方浮雕一顶鎏金冠。可见五个尖端，每个尖端顶着一颗珠；中间三个比两边两个更高。下方凹带里，大写刻着：A LA COURONE。只有一个N。

石板嵌在一座十八世纪的房子上，位于 rue des Blancs Mouchons 街角。浅色砖墙，上下两条石带框住这块板。`,
  jp: `パネルは1階中央の窓の下、窓台下の石板（allège）を占める：灰色の石の長方形、縁は単純、右が少し汚れている。上は浮彫の金の冠。尖りが五つ見え、それぞれに真珠；中央の三つは両端の二つより高い。下の凹んだ帯に、大文字で刻まれている：A LA COURONE。Nは一つだけ。

石は十八世紀の家に嵌められている。rue des Blancs Mouchons の角。明るい煉瓦のファサード、パネルを上下で囲む石の帯。`,
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
    obj[NAME][1].answer = 0;
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_couronne_grand_rue.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_couronne_grand_rue.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaCouronneGrandRue_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bCROIX D OR\b/.test(text) || /\bA LA COURONE\b/.test(text) || /\bA LA COURONNE\b/.test(text) || /\bIHS\b/.test(text) || /\bGillis\b/.test(text) || /\bHarvent\b/.test(text) || /\bBertaimont\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
  console.log('tts', lang, text.slice(0, 180).replace(/\n/g, ' '));
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
