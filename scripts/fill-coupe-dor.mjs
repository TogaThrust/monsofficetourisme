/**
 * A la Coupe d'Or : texte long réécrit (sans répéter le court),
 * couppe lu coupe en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-coupe-dor.mjs
 *
 * Sources : Yannart (monsblog, fig. 15) + photo (coupe à couvercle, tripartite, sans lettres).
 * Connaître la Wallonie : pas de fiche dédiée.
 * Ne pas voler : Grande Triperie, Croix-Place, Saint-Antoine n°37, scission de voirie.
 * Quiz Q2 : answer 0 (XVIIIe), pas 2 (XVIIe). Ordre des options inchangé.
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

const NAME = "A la Coupe d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Coupe 17, 7000 Mons.';
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

const FR_LONG_BODY = `Le panneau tient l’allège du deuxième niveau, sous l’appui : trois blocs de calcaire, dans la brique. Au centre, en haut-relief, une coupe à couvercle : bol bombé, bouton au sommet, nœud sur la tige, pied large. De part et d’autre, deux pierres aux bords chantournés, sans lettres.

Deuxième tiers du XVIIIe. Grande demeure dédoublée, façade de la fin du siècle. Les archives notent « de la couppe d’or ».`;

/** Traductions figées. Pas d’inscription A LA COUPE D OR (pierre anépigraphe). Pas de scission de rue. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the allège of the second level, under the sill: three limestone blocks, in the brick. In the centre, in high relief, a cup with a lid: a bulging bowl, a knob at the top, a knop on the stem, a wide foot. On either side, two stones with cut-out edges, no letters.

Second third of the eighteenth century. A large house split in two, façade from the end of the century. The archives note « de la couppe d’or ».`,
  nl: `Het paneel vormt de allège van het tweede niveau, onder de vensterbank: drie blokken kalksteen, in de baksteen. In het midden, in hoogreliëf, een coupe met deksel: bolle kom, knop bovenop, knoop op de steel, brede voet. Aan weerszijden twee stenen met uitgezaagde randen, zonder letters.

Tweede derde van de achttiende eeuw. Groot in twee gedeeld huis, gevel van het einde van de eeuw. De archieven noteren « de la couppe d’or ».`,
  de: `Die Tafel bildet die Allège des zweiten Geschosses, unter dem Sims: drei Kalksteinblöcke, im Ziegel. In der Mitte, im Hochrelief, eine Coupe mit Deckel: bauchige Schale, Knauf oben, Nodus am Stiel, breiter Fuß. Beiderseits zwei Steine mit geschweiften Rändern, ohne Buchstaben.

Zweites Drittel des 18. Jahrhunderts. Großes, geteiltes Haus, Fassade vom Ende des Jahrhunderts. Die Archive notieren « de la couppe d’or ».`,
  it: `Il pannello occupa l'allège del secondo livello, sotto l'appoggio: tre blocchi di calcare, nel mattone. Al centro, in alto rilievo, una coppa con coperchio: coppa bombata, bottone in cima, nodo sullo stelo, piede largo. Da una parte e dall'altra, due pietre dai bordi sagomati, senza lettere.

Secondo terzo del XVIII secolo. Grande dimora sdoppiata, facciata della fine del secolo. Gli archivi annotano « de la couppe d’or ».`,
  es: `El panel ocupa el allège del segundo nivel, bajo el antepecho: tres bloques de caliza, en el ladrillo. En el centro, en alto relieve, una copa con tapa: cuenco abombado, botón en la cima, nudo en el tallo, pie ancho. A uno y otro lado, dos piedras de bordes recortados, sin letras.

Segundo tercio del siglo XVIII. Gran morada desdoblada, fachada de finales de siglo. Los archivos anotan « de la couppe d’or ».`,
  pl: `Panel zajmuje allège drugiego poziomu, pod parapetem: trzy bloki wapienia, w cegle. Na środku, w wysokim reliefie, czara z pokrywą: wypukła czasza, guz na szczycie, węzeł na trzonie, szeroka stopa. Po obu stronach dwa kamienie o wyciętych krawędziach, bez liter.

Druga tercja XVIII wieku. Wielka siedziba rozdzielona na dwoje, fasada z końca stulecia. Archiwa notują « de la couppe d’or ».`,
  ar: `تشغل اللوحة الأليج في المستوى الثاني، تحت عتبة النافذة: ثلاثة كتل من الحجر الجيري، في الآجر. في الوسط، نحت بارز، كأس بغطاء: وعاء محدّب، زرّ في القمة، عقدة على الساق، قاعدة عريضة. على الجانبين حجران بحواف مقصوصة، بلا حروف.

الثلث الثاني من القرن الثامن عشر. مسكن كبير مقسوم اثنين، واجهة أواخر القرن. تذكر الأرشيفات « de la couppe d’or ».`,
  cn: `石板占据二层窗裙（allège），在窗台下：三块石灰岩，嵌在砖墙里。正中高浮雕，带盖的杯：鼓腹、顶上有钮、茎上有结、宽足。两侧两块石头，边缘挖成曲线，没有文字。

十八世纪第二个三分之一。一座被一分为二的大宅，立面属世纪末。档案写作 « de la couppe d’or ».`,
  jp: `パネルは第二層の窓台下の石板（allège）を占める：石灰岩の三つの塊、煉瓦の中。中央は高浮彫、蓋つきの杯：膨らんだ鉢、頂の鈕、茎の節、広い足。左右は縁を切り欠いた石、文字なし。

十八世紀の第二の三分の一。二つに分けられた大きな住まい、世紀末のファサード。古文書は « de la couppe d’or » と記す。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_coupe_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_coupe_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaCoupeDOr_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bcouppe\b/.test(text) || /\bClef\b/.test(text) || /\bTETE\b/.test(text))) {
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
