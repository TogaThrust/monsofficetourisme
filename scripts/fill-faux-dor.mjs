/**
 * A la Faux d'Or : texte long réécrit (sans répéter le court),
 * A LA FAUX D OR lu À la Faux d'Or en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-faux-dor.mjs
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

const NAME = "A la Faux d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 115, 7000 Mons.";
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

const FR_LONG_BODY = `Le panneau tient le centre de l’allège, au premier étage : un rectangle de calcaire, polychrome, cerné de briques. La pierre a été bouchardée : piquetée, rêche. En haut, une faux en léger relief, lame à l’horizontale. Il reste du jaune, par plaques, sur le talon et le fil. Dessous, gravé : A LA FAUX D OR. Plus bas, le millésime.

Maison de style classique montois. À la fin du XVIIIe, Joseph Cowet y vendait des pains d’épices.`;

/** Traductions figées : inscription A LA FAUX D OR inchangée. faux = scythe, pas sickle. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the centre of the allège, on the first floor: a rectangle of polychrome limestone, edged with brick. The stone has been bush-hammered: pitted, rough. At the top, a scythe in low relief, blade horizontal. Yellow colour still clings, in patches, to the heel and the edge. Below, carved: A LA FAUX D OR. Lower still, the year.

A house in Mons classical style. At the end of the eighteenth century, Joseph Cowet sold gingerbread there.`,
  nl: `Het paneel zit in het midden van de allège, op de eerste verdieping: een rechthoek van polychroom kalksteen, omlijst met baksteen. De steen is gebouchardeerd: gepikt, ruw. Bovenaan een zeis in licht reliëf, het blad horizontaal. Er blijft geel, in vlekken, op de hiel en de snede. Daaronder gegraveerd: A LA FAUX D OR. Nog lager het jaartal.

Een huis in klassieke Montoise stijl. Eind achttiende eeuw verkocht Joseph Cowet er peperkoek.`,
  de: `Die Tafel sitzt in der Mitte der Allège im ersten Stock: ein Rechteck aus polychromem Kalkstein, von Ziegeln gefasst. Der Stein wurde bossiert: genarbt, rau. Oben eine Sense in flachem Relief, die Klinge waagerecht. Gelb hält sich noch, fleckenweise, an Absatz und Schneide. Darunter eingemeißelt: A LA FAUX D OR. Weiter unten die Jahreszahl.

Ein Haus im klassischen Mons-Stil. Ende des 18. Jahrhunderts verkaufte Joseph Cowet dort Lebkuchen.`,
  it: `Il pannello occupa il centro dell'allège, al primo piano: un rettangolo di calcare policromo, cinto di mattoni. La pietra è stata bocciardata: picchiettata, ruvida. In alto, una falce in basso rilievo, lama orizzontale. Resta del giallo, a chiazze, sul tallone e sul filo. Sotto, inciso: A LA FAUX D OR. Più in basso, il millesimo.

Casa in stile classico montois. Alla fine del XVIII secolo, Joseph Cowet vi vendeva pan di zenzero.`,
  es: `El panel ocupa el centro del allège, en el primer piso: un rectángulo de caliza policromada, cercado de ladrillos. La piedra ha sido abujardada: picada, áspera. Arriba, una guadaña en bajo relieve, hoja horizontal. Queda amarillo, a manchas, en el talón y el filo. Debajo, grabado: A LA FAUX D OR. Más abajo, el milésimo.

Casa de estilo clásico montois. A finales del XVIII, Joseph Cowet vendía allí pan de especias.`,
  pl: `Panel zajmuje środek allège na pierwszym piętrze: prostokąt z polichromowanego wapienia, obramowany cegłą. Kamień został zbouchardowany: nakłuty, szorstki. U góry kosa w płaskim reliefie, ostrze poziomo. Został żółty, plamami, na pięcie i ostrzu. Poniżej wyryte: A LA FAUX D OR. Niżej data.

Dom w klasycznym stylu montois. Pod koniec XVIII wieku Joseph Cowet sprzedawał tu piernik.`,
  ar: `تشغل اللوحة وسط الأليج في الطابق الأول: مستطيل من الحجر الجيري متعدد الألوان، محاط بالآجر. الحجر مبوشرد: منقّر، خشن. في الأعلى منجل بارز قليلاً، نصله أفقي. يبقى أصفر، بقعاً، على الكعب والحد. تحته محفور: A LA FAUX D OR. أسفل ذلك السنة.

منزل على الطراز الكلاسيكي المونتوي. في أواخر القرن الثامن عشر كان Joseph Cowet يبيع فيه خبز الزنجبيل.`,
  cn: `石板占据一楼窗裙（allège）正中：一块带彩绘的石灰岩长方形，四周砌着砖。石头被凿毛了：麻点，粗糙。上方是一把浅浮雕长柄镰刀，刀身横放。黄色还留着，一块一块，在刀跟和刃上。下面刻着：A LA FAUX D OR。再下面是年号。

一座蒙斯古典风格的房屋。十八世纪末，Joseph Cowet 在此售卖姜饼。`,
  jp: `パネルは1階の窓台下の石板（allège）の中央を占める：彩色された石灰岩の長方形で、煉瓦に縁取られている。石はブシャルド仕上げ：点々と荒れ、ざらざらしている。上に浅浮き彫りの大鎌、刃は横向き。黄色がまだ、斑に、踵と刃に残る。下に刻まれている：A LA FAUX D OR。さらに下に年号。

モンスの古典様式の家。十八世紀末、Joseph Cowet はここでジンジャーブレッドを売っていた。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_faux_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_faux_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaFauxDOr_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
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
