/**
 * A la Licorne : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-licorne.mjs
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

const NAME = 'A la Licorne';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 116, 7000 Mons.";
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

const FR_LONG_BODY = `L’écu tient la clé de la porte cochère : un bloc de pierre, calé dans la brique, au faîte de l’arc. Un cheval dressé, sculpté dans le champ. Au-dessus, un heaume de face, visière à barreaux. Des lambrequins retombent de part et d’autre.

Grosse maison de la seconde moitié du XVIIe. Dans la seconde moitié du XVIe, cet hôtel appartenait à Michel de Liège, puis à sa veuve. De 1925 à 1937, le bâtiment fut le local du Cercle militaire de Mons.`;

/** Traductions figées. Noms propres inchangés : Michel de Liège, Cercle militaire de Mons. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The shield holds the keystone of the carriage door: a block of stone, set in the brick, at the crown of the arch. A rearing horse, carved in the field. Above it, a helmet facing forward, visor with bars. Mantling falls on either side.

A large house from the second half of the seventeenth century. In the second half of the sixteenth, this townhouse belonged to Michel de Liège, then to his widow. From 1925 to 1937, the building was the premises of the Cercle militaire de Mons.`,
  nl: `Het wapenschild vormt de sluitsteen van de koetspoort: een blok steen, gevat in de baksteen, op de kruin van de boog. Een steigerend paard, gehouwen in het veld. Daarboven een helm van voren, vizier met staven. Dekkleden vallen langs weerszijden.

Groot huis uit de tweede helft van de zeventiende eeuw. In de tweede helft van de zestiende behoorde dit hôtel toe aan Michel de Liège, daarna aan zijn weduwe. Van 1925 tot 1937 was het gebouw het lokaal van de Cercle militaire de Mons.`,
  de: `Der Schild bildet den Schlussstein der Toreinfahrt: ein Steinblock, in den Ziegel gesetzt, am Scheitel des Bogens. Ein steigendes Pferd, ins Feld gemeißelt. Darüber ein Helm von vorn, Visier mit Stäben. Helmdecken fallen zu beiden Seiten.

Großes Haus aus der zweiten Hälfte des 17. Jahrhunderts. In der zweiten Hälfte des 16. gehörte dieses Hôtel Michel de Liège, dann seiner Witwe. Von 1925 bis 1937 war das Gebäude das Lokal des Cercle militaire de Mons.`,
  it: `Lo scudo occupa la chiave del portone: un blocco di pietra, calato nel mattone, in cima all’arco. Un cavallo rampante, scolpito nel campo. Sopra, un elmo di fronte, visiera a sbarre. I lambrequins ricadono da una parte e dall’altra.

Grossa casa della seconda metà del XVII secolo. Nella seconda metà del XVI, questo hôtel apparteneva a Michel de Liège, poi alla sua vedova. Dal 1925 al 1937 l’edificio fu la sede del Cercle militaire de Mons.`,
  es: `El escudo ocupa la clave de la puerta cochera: un bloque de piedra, calzado en el ladrillo, en la cima del arco. Un caballo rampante, esculpido en el campo. Encima, un yelmo de frente, visera de barrotes. Los lambrequines caen a uno y otro lado.

Gran casa de la segunda mitad del siglo XVII. En la segunda mitad del XVI, este hôtel pertenecía a Michel de Liège, luego a su viuda. De 1925 a 1937, el edificio fue el local del Cercle militaire de Mons.`,
  pl: `Tarcza zajmuje zwornik bramy przejazdowej: blok kamienia, osadzony w cegle, u szczytu łuku. Koń wspięty, rzeźbiony w polu. Nad nim hełm en face, zasłona z prętów. Labry opadają po obu stronach.

Duży dom z drugiej połowy XVII wieku. W drugiej połowie XVI to hôtel należało do Michel de Liège, potem do jego wdowy. W latach 1925–1937 budynek był siedzibą Cercle militaire de Mons.`,
  ar: `يمسك الدرع مفتاح باب العربات: كتلة من الحجر، مثبتة في الآجر، في قمة القوس. حصان منتصب، منحوت في الحقل. فوقه خوذة من الأمام، قناع بقضبان. تسقط الـ lambrequins من الجانبين.

بيت كبير من النصف الثاني للقرن السابع عشر. في النصف الثاني من القرن السادس عشر، كان هذا الـ hôtel ملكاً لـ Michel de Liège، ثم لأرملته. من 1925 إلى 1937، كان المبنى مقرّ Cercle militaire de Mons.`,
  cn: `纹章盾占据马车门的拱心石：一块石头，嵌在砖里，在拱顶。一匹后腿直立的马，刻在盾面上。上方是正面的头盔，栅条面甲。盔饰飘带向两侧垂落。

十七世纪下半叶的大宅。十六世纪下半叶，这座hôtel属于Michel de Liège，后来属于他的遗孀。1925至1937年，楼里是Cercle militaire de Mons的会所。`,
  jp: `紋章の盾は車寄せの門の要石を占める：石の塊が煉瓦に嵌まり、アーチの頂にある。後脚で立つ馬が、盾面に彫られている。その上は正面の兜、格子の面頬。マントリングが両側に垂れる。

十七世紀後半の大きな家。十六世紀後半、このhôtelはMichel de Liègeのもので、のちその未亡人のものとなった。1925年から1937年まで、建物はCercle militaire de Monsの会館だった。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_licorne.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_licorne.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaLicorne_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  const dest = path.join(ROOT, 'dist', 'audio', path.basename(out));
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(out));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
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
console.log('done');
