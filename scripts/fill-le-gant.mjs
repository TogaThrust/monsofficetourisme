/**
 * Le Gant : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-le-gant.mjs
 *
 * Sources : Yannart (monsblog, n°6) + photo POI images/Le_Gant.jpg
 *   + gevelstenen (Grand'Rue 95, motif « hand », OPSCHRIFT 1718).
 * Connaître la Wallonie : pas de fiche dédiée au n°95.
 * Ne pas voler : La Louve, autres POI Grand-Rue, Grand-Place, GPS.
 * Quiz : inchangé (gant / 1718 / Grand'Rue).
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

const NAME = 'Le Gant';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Grand'Rue 95, 7000 Mons.";
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

const FR_LONG_BODY = `Dans le crépi, un cartouche de pierre grise aux coins rentrants. Au centre, en relief, une main gauche gantée : pouce écarté à gauche, quatre doigts joints, un peu recourbés, poignet coupé net. Sous le motif, gravé seul, sans nom : 1718.

La pierre est apposée sur une maison au volume élancé. La bâtière aiguë, prise entre des pignons débordants à épis, indique une ossature du XVIIe siècle.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `In the plaster, a grey stone cartouche with inward-curving corners. At the centre, in relief, a gloved left hand: thumb spread to the left, four fingers together, slightly curved, the wrist cut short. Beneath the motif, carved alone, with no name: 1718.

The stone is set on a house of slender volume. The steep saddle roof, caught between overhanging gables with spike finials, points to a seventeenth-century frame.`,
  nl: `In de bepleistering, een cartouche van grijze steen met inwaarts gebogen hoeken. In het midden, in reliëf, een gehandschoende linkerhand: duim naar links gespreid, vier vingers bijeen, licht gebogen, de pols kort afgesneden. Onder het motief, alleen gegraveerd, zonder naam: 1718.

De steen is aangebracht op een huis met slank volume. De steile zadeldakvorm, gevat tussen uitstekende topgevels met pieken, wijst op een zeventiende-eeuws geraamte.`,
  de: `Im Putz eine Kartusche aus grauem Stein mit einwärts geschwungenen Ecken. In der Mitte, im Relief, eine behandschuhte linke Hand: Daumen nach links abgespreizt, vier Finger beisammen, leicht gekrümmt, das Handgelenk kurz abgeschnitten. Unter dem Motiv, allein gemeißelt, ohne Namen: 1718.

Der Stein sitzt an einem Haus von schlankem Volumen. Das spitze Satteldach, gefasst zwischen überstehenden Giebeln mit Spitzen, weist auf ein Gerüst des 17. Jahrhunderts.`,
  it: `Nell'intonaco, un cartiglio di pietra grigia dagli angoli rientranti. Al centro, in rilievo, una mano sinistra inguantata: pollice aperto a sinistra, quattro dita unite, un po' curve, polso tagliato netto. Sotto il motivo, inciso da solo, senza nome: 1718.

La pietra è apposta su una casa dal volume slanciato. Il tetto a due spioventi acuto, preso tra timpani sporgenti a spighe, indica un'ossatura del XVII secolo.`,
  es: `En el revoco, un cartucho de piedra gris de esquinas entrantes. En el centro, en relieve, una mano izquierda enguantada: pulgar abierto a la izquierda, cuatro dedos juntos, un poco curvos, muñeca cortada en seco. Bajo el motivo, grabado solo, sin nombre: 1718.

La piedra está apuesta sobre una casa de volumen esbelto. La cubierta a dos aguas aguda, presa entre piñones salientes con espigas, indica una osamenta del siglo XVII.`,
  pl: `W tynku kartusz z szarego kamienia o wklęsłych narożach. Pośrodku, w reliefie, lewa dłoń w rękawicy: kciuk rozwarty w lewo, cztery palce razem, lekko zagięte, nadgarstek ucięty równo. Pod motywem, wyryte samo, bez nazwy: 1718.

Kamień osadzono na domu o smukłej bryle. Ostry dach dwuspadowy, ujęty między wystającymi szczytami z grotami, wskazuje szkielet z XVII wieku.`,
  ar: `في البياض، خرطوش من حجر رمادي بزوايا داخلة. في الوسط، بارزاً، يد يسرى بقفاز: الإبهام مفتوح إلى اليسار، أربعة أصابع مجتمعة ومنحنية قليلاً، المعصم مقطوع قطعاً نظيفاً. تحت الزخرف، محفور وحده، بلا اسم: 1718.

الحجر مثبت على بيت ذي حجم ممشوق. السقف الحاد ذو المنحدرين، المحصور بين جملونات بارزة ذات رماح، يدل على هيكل من القرن السابع عشر.`,
  cn: `灰泥墙里，一块灰色石质饰框，四角内凹。正中浮雕：一只戴手套的左手，拇指朝左张开，四指并拢、略弯，腕口截得干净。纹样下方，单独刻着，没有店名：1718。

石板嵌在一座体量瘦高的房子上。尖陡的双坡屋顶，夹在带尖饰的出挑山墙之间，表明骨架属于十七世纪。`,
  jp: `漆喰の中に、四隅が内側へ湾曲した灰色の石のカルトゥーシュ。中央の浮彫は手袋をはめた左手：親指は左へ開き、四本の指はそろってやや曲がり、手首はきれいに切れている。モチーフの下、名はなく、年号だけが刻まれている：1718。

石は細長い家に据えられている。鋭い切妻屋根が、穂先飾りのある張り出した破風のあいだに収まり、十七世紀の骨格を示す。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'le_gant.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'le_gant.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `LeGant_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bCROIX D OR\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
  console.log('tts', lang, text.slice(0, 160).replace(/\n/g, ' '));
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
console.log('done');
