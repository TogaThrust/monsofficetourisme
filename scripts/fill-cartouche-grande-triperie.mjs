/**
 * Cartouche et blason Grande Triperie : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-cartouche-grande-triperie.mjs
 *
 * Sources : Yannart (monsblog, n°49) + photo POI (portail, bas en haut).
 * Connaître la Wallonie : pas de fiche dédiée au n°13.
 * Ne pas voler : Petite Triperie ; Coupe d'Or / scission de rue ;
 *   Sœurs Noires / Martin's Dream n°17 ; Cité UMons ; autres porches.
 * Quiz : inchangé (mascaron / XVIIIe / Rue de la Grande Triperie).
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

const NAME = 'Cartouche et blason Grande Triperie';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Grande Triperie 13, 7000 Mons.';
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

const FR_LONG_BODY = `L’arc du portail est à bossage, les claveaux à arêtes abattues. Au centre, une clé en console : trois moulures horizontales. Au-dessus, un riche encadrement de volutes et de feuilles, un médaillon ovale aujourd’hui lisse, un mascaron couronné d’un soleil. Plus haut, un écu à trois figures en forme de croix, une couronne ; de part et d’autre, deux chiens lionnés, dressés, grimaçants. Le millésime 1701 s’y lit.

Hôtel de la seconde moitié du XVIIe. Pas une enseigne de boutique : le décor du portail, les armes de la maison.`;

/** Traductions figées. Portail d’hôtel, pas enseigne commerciale. Vocabulaire Yannart : chiens lionnés. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The portal arch is rusticated, the voussoirs with bevelled edges. In the centre, a console keystone: three horizontal mouldings. Above, a rich frame of volutes and leaves, an oval medallion now smooth, a mascaron crowned by a sun. Higher still, a shield with three cross-shaped figures, a crown; on either side, two lionné dogs, rampant, grimacing. The year 1701 is read on this stone.

A townhouse of the second half of the seventeenth century. Not a shop sign: the decoration of the portal, the arms of the house.`,
  nl: `De boog van het portaal is in bossage, de sluitstenen met afgeschuinde kanten. In het midden een console-sluitsteen: drie horizontale lijsten. Daarboven een rijke omlijsting van voluten en bladeren, een ovaal medaillon nu glad, een mascaron gekroond door een zon. Hoger, een schild met drie kruisvormige figuren, een kroon; aan weerszijden twee lionné honden, opgericht, grijnzend. Het jaartal 1701 is erop te lezen.

Hôtel uit de tweede helft van de zeventiende eeuw. Geen winkeluithangbord: het decor van het portaal, de wapens van het huis.`,
  de: `Der Portalbogen ist rustiziert, die Wölbsteine mit abgeschrägten Kanten. In der Mitte ein Konsolenschlussstein: drei horizontale Gesimse. Darüber ein reicher Rahmen aus Voluten und Blättern, ein ovales Medaillon heute glatt, ein Maskaron von einer Sonne bekrönt. Höher ein Schild mit drei kreuzförmigen Figuren, eine Krone; beiderseits zwei lionné Hunde, aufgerichtet, grimassierend. Die Jahreszahl 1701 ist darauf zu lesen.

Stadtpalais aus der zweiten Hälfte des 17. Jahrhunderts. Kein Ladenschild: der Schmuck des Portals, die Wappen des Hauses.`,
  it: `L'arco del portale è a bugnato, i conci dai bordi smussati. Al centro, una chiave a mensola: tre modanature orizzontali. Sopra, una ricca cornice di volute e foglie, un medaglione ovale oggi liscio, un mascherone coronato da un sole. Più in alto, uno scudo con tre figure a forma di croce, una corona; da una parte e dall'altra, due cani lionné, eretti, sghignazzanti. Il millesimo 1701 si legge sulla pietra.

Hôtel della seconda metà del XVII secolo. Non un'insegna di bottega: il decoro del portale, le armi della casa.`,
  es: `El arco del portal es de almohadillado, las dovelas de aristas rebajadas. En el centro, una clave en ménsula: tres molduras horizontales. Encima, un rico marco de volutas y hojas, un medallón oval hoy liso, un mascarón coronado por un sol. Más arriba, un escudo con tres figuras en forma de cruz, una corona; a uno y otro lado, dos perros lionné, erguidos, mueca. El milésimo 1701 se lee en la piedra.

Hôtel de la segunda mitad del siglo XVII. No es un letrero de tienda: el decorado del portal, las armas de la casa.`,
  pl: `Łuk portalu jest rustykowany, kliniec o ściętych krawędziach. Na środku zwornik w konsoli: trzy poziome gzymsy. Wyżej bogata oprawa wolut i liści, owalny medalion dziś gładki, maszkaron zwieńczony słońcem. Jeszcze wyżej tarcza z trzema figurami w kształcie krzyża, korona; po obu stronach dwa psy lionné, wspięte, grymas. Millésime 1701 czyta się na kamieniu.

Hôtel z drugiej połowy XVII wieku. Nie szyld sklepu: wystrój portalu, herby domu.`,
  ar: `قوس البوابة ذو بروز (bossage)، وحجارة العقد مشطوفة الحواف. في الوسط، مفتاح عقد على شكل رفّ: ثلاث حليات أفقية. فوقه إطار غني من حلزونات وأوراق، ميدالية بيضاوية ملساء اليوم، قناع حجري توّجته شمس. أعلى من ذلك، درع بثلاث أشكال على هيئة صليب، وتاج؛ وعلى الجانبين كلبان lionné، منتصبان، متجهمان. تُقرأ السنة 1701 على الحجر.

قصر حضري من النصف الثاني للقرن السابع عشر. ليست لافتة دكان: زينة البوابة، أسلحة البيت.`,
  cn: `门廊的拱券是凸石砌法（bossage），楔石棱角被削去。正中是托座式拱心石：三道水平线脚。其上是涡卷与叶饰的厚框，一块如今光洁的椭圆圆牌，一张面具，顶上有一轮太阳。再往上，一面盾，三枚十字形图记，一顶冠；两侧两只作狮姿的犬，直立，咧嘴。石上读得出年号1701。

十七世纪下半叶的府邸。不是店铺招牌：门廊的装饰，宅第的纹章。`,
  jp: `門廊のアーチはボサージュ、楔石は稜を削っている。中央は持ち送りの要石：水平のモールディングが三つ。その上は渦巻きと葉の厚い枠、今は滑らかな楕円のメダリオン、仮面、頂に太陽。さらに上、盾に十字形の図が三つ、冠；左右に獅子の構えの犬が二匹、直立し、顔を歪める。石に1701の年紀が読める。

十七世紀後半の館。店の看板ではない：門廊の装飾、家の紋。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'cartouche_et_blason_grande_triperie.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'cartouche_et_blason_grande_triperie.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `CartoucheEtBlasonGrandeTriperie_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bCROIX D OR\b/.test(text) || /\bIHS\b/.test(text) || /\bBertaimont\b/.test(text) || /\bGillis\b/.test(text) || /\bHarvent\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
  console.log('tts', lang, text.slice(0, 140).replace(/\n/g, ' '));
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
