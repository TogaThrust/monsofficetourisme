/**
 * A la Grande Rose : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-grande-rose.mjs
 *
 * Sources : Yannart (monsblog, fig. 2) + Connaître la Wallonie (Halle des Pelletiers) + photo.
 * Mons, Hainaut — pas Châlons / Reims / Jacobins.
 * Ne pas voler : autres roses, Le MUR n°37, n°32, façade rue des Clercs hors rose.
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

const NAME = 'A la Grande Rose';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Poterie 2, 7000 Mons.';
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

const FR_LONG_BODY = `Le médaillon, circulaire, tient le tympan de brique au-dessus de la porte cintrée : une rose épanouie, en haut-relief. Cœur serré, trois rangs de pétales charnus, une rainure au bord de chacun. Entre les pétales du pourtour, des sépales en pointe. On distingue les pistils. Anépigraphe : pas une lettre sur la pierre.

Aile gauche, en retrait, type tournaisien du XVIIIe, briques et pierre bleue. Deux niveaux, soubassement de pierre, bandeau d’allège. Quelques marches. On l’a dite Halle des Pelletiers : à tort. Classée en 1959. Un acte de 1380 cite déjà, ici, une enseigne analogue.`;

/** Traductions figées. Photo anépigraphe. Pas Châlons, pas Jacobins, pas XVIe (déjà au court). */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The medallion, circular, holds the brick tympanum above the arched door: a full-blown rose, in high relief. Tight heart, three ranks of fleshy petals, a groove at the edge of each. Between the outer petals, pointed sepals. The pistils can be made out. Anépigraphe: not a letter on the stone.

Left wing, set back, Tournaisian type of the eighteenth century, brick and blue stone. Two storeys, stone basement, allège band. A few steps. It has been called Halle des Pelletiers: wrongly. Listed in 1959. A deed of 1380 already cites, here, a similar sign.`,
  nl: `Het medaillon, cirkelvormig, vult het bakstenen tympaan boven de gebogen deur: een uitgebloeide roos, in hoogreliëf. Strak hart, drie rijen vlezige bloembladen, een groef aan de rand van elk. Tussen de buitenste bladen, spitse kelkbladen. De stampers zijn te onderscheiden. Anépigraphe: geen letter op de steen.

Linkervleugel, terugliggend, Doorniks type uit de achttiende eeuw, baksteen en blauwe steen. Twee niveaus, stenen soubassement, allège-band. Enkele treden. Men noemde haar Halle des Pelletiers: ten onrechte. Beschermd in 1959. Een akte van 1380 noemt hier al een soortgelijk uithangbord.`,
  de: `Das Medaillon, kreisrund, füllt das Ziegel-Tympanon über der Rundbogentür: eine voll erblühte Rose, in Hochrelief. Enges Herz, drei Reihen fleischiger Blütenblätter, eine Rille am Rand jedes Blattes. Zwischen den äußeren Blättern spitze Kelchblätter. Die Stempel sind zu erkennen. Anépigraphe: kein Buchstabe auf dem Stein.

Linker Flügel, zurückgesetzt, tournaiischer Typ des 18. Jahrhunderts, Ziegel und Blaustein. Zwei Geschosse, steinerner Sockel, Allège-Band. Einige Stufen. Man nannte sie Halle des Pelletiers: zu Unrecht. Unter Schutz seit 1959. Eine Urkunde von 1380 nennt hier schon ein ähnliches Schild.`,
  it: `Il medaglione, circolare, occupa il timpano di mattoni sopra la porta ad arco: una rosa sbocciata, in altorilievo. Cuore stretto, tre ranghi di petali carnosi, una scanalatura sul bordo di ciascuno. Tra i petali del contorno, sepali a punta. Si distinguono i pistilli. Anépigraphe: nessuna lettera sulla pietra.

Ala sinistra, in rientro, tipo tornacense del XVIII secolo, mattoni e pietra blu. Due livelli, zoccolo di pietra, fascia d'allège. Qualche scalino. È stata detta Halle des Pelletiers: a torto. Classificata nel 1959. Un atto del 1380 cita già, qui, un'insegna analoga.`,
  es: `El medallón, circular, ocupa el tímpano de ladrillo encima de la puerta de arco: una rosa abierta, en alto relieve. Corazón apretado, tres hileras de pétalos carnosos, un surco en el borde de cada uno. Entre los pétalos del contorno, sépalos en punta. Se distinguen los pistilos. Anépigraphe: ni una letra en la piedra.

Ala izquierda, en receso, tipo tornacense del siglo XVIII, ladrillo y piedra azul. Dos niveles, zócalo de piedra, banda de allège. Unos peldaños. Se la llamó Halle des Pelletiers: por error. Catalogada en 1959. Un acta de 1380 cita ya, aquí, una enseña análoga.`,
  pl: `Medalion, okrągły, wypełnia ceglane tympanon nad łukowymi drzwiami: róża w pełnym rozkwicie, w wysokim reliefie. Ścisły środek, trzy rzędy mięsistych płatków, rowek na krawędzi każdego. Między zewnętrznymi płatkami spiczaste działki kielicha. Widać słupki. Anépigraphe: ani litery na kamieniu.

Lewe skrzydło, cofnięte, typ tournaisien z XVIII wieku, cegła i niebieski kamień. Dwie kondygnacje, kamienny cokół, pas allège. Kilka stopni. Nazywano ją Halle des Pelletiers: mylnie. Zabytkowa od 1959. Akt z 1380 wymienia tu już podobny szyld.`,
  ar: `الميدالية، دائرية، تملأ طبلة الآجر فوق الباب المقوس: وردة متفتحة، نحت بارز عالٍ. قلب متراص، ثلاثة صفوف من بتلات لحميّة، أخدود على حافة كل واحدة. بين بتلات المحيط، كأسيات مدببة. تُميَّز المدقات. أنيبيغراف: ولا حرف على الحجر.

الجناح الأيسر، متراجع، طراز تورنيزي من القرن الثامن عشر، آجر وحجر أزرق. طابقان، قاعدة حجرية، شريط الأليج. بضع درجات. سُميت Halle des Pelletiers: خطأ. صُنّفت سنة 1959. عقد من سنة 1380 يذكر هنا سلفاً لافتة مماثلة.`,
  cn: `圆形石徽嵌在拱门上方的砖砌拱心：一朵盛开的玫瑰，高浮雕。花心收紧，三层肥厚花瓣，每瓣边缘一道凹槽。外圈花瓣之间，尖形萼片。能看出雌蕊。无铭文（anépigraphe）：石头上一个字也没有。

左翼后退，十八世纪图尔奈式，砖与蓝石。两层，石砌勒脚，窗裙饰带（allège）。几级台阶。曾被称作 Halle des Pelletiers：弄错了。1959年列为保护建筑。1380年的一份契据已在此处记载一块同类招牌。`,
  jp: `円形のメダイヨンが、アーチ扉の上の煉瓦のタンパンを占める：咲き開いたバラ、高浮彫。締まった芯、三列の肉厚な花弁、各弁の縁に一条の溝。外周の花弁のあいだ、尖った萼片。雌しべが見分けられる。銘なし（anépigraphe）：石に一字もない。

左翼、後退、十八世紀のトゥルネー式、煉瓦と青石。二層、石の基壇、窓台下の帯（allège）。数段の階段。Halle des Pelletiers と呼ばれた：誤り。1959年に指定。1380年の証書が、すでにここで同様の看板に触れている。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_grande_rose.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_grande_rose.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaGrandeRose_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text))) {
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
console.log('done');
