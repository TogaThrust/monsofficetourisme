/**
 * La Croix d'Or Havre : texte long réécrit (sans répéter le court),
 * LA CROIX D OR lu La Croix d'Or en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-croix-dor-havre.mjs
 *
 * Distinct de « A la Croix d'Or Croix-Place » (1936). Ne pas mélanger.
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

const NAME = "La Croix d'Or Havre";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 117, 7000 Mons.";
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

const FR_LONG_BODY = `Le panneau tient l’allège, sous l’appui, au premier étage : un carré de calcaire, dans la brique, entre deux chaînes de pierre. Une croix en relief, dorée, les bras en fleurs de lys stylisées. Le millésime se coupe autour du bras du haut : 17 à gauche, 66 à droite. En bas, gravé : LA CROIX D OR.

Maison de type tournaisien, bâtie en 1706 : il n’en reste que le premier étage. Le rez-de-chaussée et le second ont été transformés au XXe siècle. L’enseigne a été restaurée avec soin en 2006.`;

/** Traductions figées. Inscription gravée LA CROIX D OR inchangée. Pas Croix-Place. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the allège, under the sill, on the first floor: a square of limestone, in the brick, between two stone quoins. A cross in relief, gilded, the arms in stylized fleurs-de-lis. The date splits around the upper arm: 17 to the left, 66 to the right. At the bottom, carved: LA CROIX D OR.

A Tournai-type house, built in 1706: only the first floor remains. The ground floor and the second storey were altered in the 20th century. The sign was carefully restored in 2006.`,
  nl: `Het paneel vormt de allège, onder de vensterbank, op de eerste verdieping: een vierkant van kalksteen, in de baksteen, tussen twee hoekkettingen. Een kruis in reliëf, verguld, de armen in gestileerde lelies. Het jaartal splitst zich rond de bovenste arm: 17 links, 66 rechts. Onderaan gegraveerd: LA CROIX D OR.

Huis van het Doornikse type, gebouwd in 1706: alleen de eerste verdieping blijft over. Het gelijkvloers en de tweede verdieping zijn in de 20e eeuw verbouwd. Het uithangbord werd in 2006 zorgvuldig gerestaureerd.`,
  de: `Die Tafel bildet die Allège, unter dem Sims, im ersten Stock: ein Quadrat aus Kalkstein, im Ziegel, zwischen zwei Eckquadern. Ein Kreuz im Relief, vergoldet, die Arme in stilisierten Lilien. Die Jahreszahl teilt sich um den oberen Arm: 17 links, 66 rechts. Unten eingemeißelt: LA CROIX D OR.

Haus vom Tournai-Typ, gebaut 1706: nur das erste Stockwerk bleibt. Erdgeschoss und zweites Geschoss wurden im 20. Jahrhundert umgebaut. Das Schild wurde 2006 sorgfältig restauriert.`,
  it: `Il pannello occupa l'allège, sotto l'appoggio, al primo piano: un quadrato di calcare, nel mattone, tra due cantonali. Una croce in rilievo, dorata, le braccia a gigli stilizzati. Il millesimo si spezza attorno al braccio alto: 17 a sinistra, 66 a destra. In basso, inciso: LA CROIX D OR.

Casa di tipo tornacense, costruita nel 1706: ne resta solo il primo piano. Il piano terra e il secondo sono stati trasformati nel XX secolo. L'insegna è stata restaurata con cura nel 2006.`,
  es: `El panel ocupa el allège, bajo el antepecho, en el primer piso: un cuadrado de caliza, en el ladrillo, entre dos sillares de esquina. Una cruz en relieve, dorada, los brazos en flores de lis estilizadas. La fecha se parte en torno al brazo de arriba: 17 a la izquierda, 66 a la derecha. Abajo, grabado: LA CROIX D OR.

Casa de tipo tornesino, construida en 1706: solo queda el primer piso. La planta baja y el segundo se transformaron en el siglo XX. El letrero se restauró con cuidado en 2006.`,
  pl: `Panel zajmuje allège, pod parapetem, na pierwszym piętrze: kwadrat z wapienia, w cegle, między dwoma boniokami. Krzyż w reliefie, złocony, ramiona w stylizowane lilie. Data rozdziela się wokół górnego ramienia: 17 po lewej, 66 po prawej. Na dole wyryte: LA CROIX D OR.

Dom typu tournai, zbudowany w 1706: pozostało tylko pierwsze piętro. Parter i drugie piętro przebudowano w XX wieku. Szyld starannie odrestaurowano w 2006.`,
  ar: `تشغل اللوحة الأليج، تحت عتبة النافذة، في الطابق الأول: مربع من الحجر الجيري، في الآجر، بين سلسلتين حجريتين. صليب نافر، مذهب، الذراعان بتنسيق زنبق منمّق. السنة المنحوتة تنقسم حول الذراع العليا: 17 يساراً، 66 يميناً. في الأسفل محفور: LA CROIX D OR.

منزل من طراز تورنيه، بُني سنة 1706: لم يبقَ منه إلا الطابق الأول. الطابق الأرضي والثاني حُوِّلا في القرن العشرين. رُمِّمت اللافتة بعناية سنة 2006.`,
  cn: `石板占据窗裙（allège），在窗台下，二层：一块石灰岩方板，嵌在砖墙里，两侧是石质墙角链。一枚浮雕十字架，镀金，臂端是风格化的百合。年号在上臂两侧分开：左17，右66。下方刻着：LA CROIX D OR.

一座图尔奈式房屋，建于1706年：只剩下二层。底层和三层在二十世纪被改建。招牌于2006年精心修复。`,
  jp: `パネルは窓台下の石板（allège）を占める、2階：石灰岩の正方形、煉瓦の中、両側は石の隅石。浮き彫りの十字架、金彩、腕は様式化した百合。年号は上の腕の左右に分かれる：左に17、右に66。下に刻まれている：LA CROIX D OR.

トゥルネー型の家、1706年築：残っているのは2階だけ。地上階と3階は20世紀に改変された。看板は2006年に丁寧に修復された。`,
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

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
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
fs.writeFileSync(path.join(ROOT, 'data', 'la_croix_dor_havre.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'la_croix_dor_havre.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `LaCroixDOrHavre_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  copyViaTmp(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
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
