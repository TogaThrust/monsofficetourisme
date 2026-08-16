/**
 * 16 IHS 93 : texte long réécrit (sans répéter le court),
 * IHS → I H S en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-16-ihs-93.mjs
 *
 * Sources : Yannart (monsblog, fig. 51) + photo (clé, graphie 16 IHS 93).
 * Connaître la Wallonie : IHS 1749 au n°27 = autre maison, ne pas voler.
 * Ne pas voler : BF IHS IL, IHS Nimy 71, IHS dans un soleil.
 * Écarter : siège 1691 / Louis XIV (date sur la pierre ≠ histoire de guerre).
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

const NAME = '16 IHS 93';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue des Groseilliers 38, 7000 Mons.';
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

const FR_LONG_BODY = `Au-dessus de la porte, la clé de voûte : un bloc de pierre grise, scellé dans l’arc de brique. Un médaillon, double cercle. Au centre, IHS en capitales ; la barre du H porte une petite croix. Sous les lettres, trois clous. Quatre fleurs à six pétales, aux quatre points. En bas, la date est fendue autour du trigramme : 16 à gauche, 93 à droite. Graphie exacte : 16 IHS 93.

Maison modeste. Les trois lettres sont le trigramme du nom de Jésus : Iesus Hominum Salvator ; on appelait ce type d’enseigne « Au Saint Nom de Jésus ».`;

/** Traductions figées. Pas de siège 1691. Pas d’autres IHS (Grand-Rue, Nimy, n°27). */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Above the door, the keystone: a block of grey stone, set in the brick arch. A medallion, a double circle. At the centre, IHS in capitals; the bar of the H bears a small cross. Under the letters, three nails. Four six-petalled flowers, at the four points. At the bottom, the date is split around the trigram: 16 to the left, 93 to the right. Exact lettering: 16 IHS 93.

A modest house. The three letters are the trigram of the name of Jesus: Iesus Hominum Salvator; this type of sign was called « Au Saint Nom de Jésus ».`,
  nl: `Boven de deur, de sluitsteen: een blok grijze steen, gevat in de bakstenen boog. Een medaillon, dubbele cirkel. In het midden, IHS in kapitalen; de dwarsbalk van de H draagt een klein kruis. Onder de letters, drie spijkers. Vier bloemen met zes bloemblaadjes, op de vier punten. Onderaan is de datum gesplitst rond het trigram: 16 links, 93 rechts. Exacte schrijfwijze: 16 IHS 93.

Bescheiden huis. De drie letters zijn het trigram van de naam van Jezus: Iesus Hominum Salvator; dit type uithangbord heette « Au Saint Nom de Jésus ».`,
  de: `Über der Tür der Schlussstein: ein Block grauen Steins, im Ziegelbogen gesetzt. Ein Medaillon, Doppelkreis. In der Mitte IHS in Majuskeln; der Balken des H trägt ein kleines Kreuz. Unter den Buchstaben drei Nägel. Vier sechsblättrige Blüten an den vier Punkten. Unten ist das Datum um das Trigramm gespalten: 16 links, 93 rechts. Genaue Schreibung: 16 IHS 93.

Bescheidenes Haus. Die drei Buchstaben sind das Trigramm des Namens Jesu: Iesus Hominum Salvator; diese Art von Schild hieß « Au Saint Nom de Jésus ».`,
  it: `Sopra la porta, la chiave di volta: un blocco di pietra grigia, inserito nell'arco di mattoni. Un medaglione, doppio cerchio. Al centro, IHS in capitali; la barra della H porta una piccola croce. Sotto le lettere, tre chiodi. Quattro fiori a sei petali, ai quattro punti. In basso, la data è spezzata intorno al trigramma: 16 a sinistra, 93 a destra. Grafia esatta: 16 IHS 93.

Casa modesta. Le tre lettere sono il trigramma del nome di Gesù: Iesus Hominum Salvator; questo tipo d'insegna si chiamava « Au Saint Nom de Jésus ».`,
  es: `Encima de la puerta, la clave: un bloque de piedra gris, encajado en el arco de ladrillo. Un medallón, doble círculo. En el centro, IHS en capitales; la barra de la H lleva una pequeña cruz. Bajo las letras, tres clavos. Cuatro flores de seis pétalos, en los cuatro puntos. Abajo, la fecha está partida en torno al trigrama: 16 a la izquierda, 93 a la derecha. Grafía exacta: 16 IHS 93.

Casa modesta. Las tres letras son el trigrama del nombre de Jesús: Iesus Hominum Salvator; este tipo de enseña se llamaba « Au Saint Nom de Jésus ».`,
  pl: `Nad drzwiami, zwornik: blok szarego kamienia, osadzony w ceglanym łuku. Medalion, podwójne koło. W środku IHS kapitalikami; poprzeczka H niesie mały krzyż. Pod literami trzy gwoździe. Cztery kwiaty o sześciu płatkach, na czterech punktach. Na dole data jest rozcięta wokół trigramu: 16 po lewej, 93 po prawej. Dokładna pisownia: 16 IHS 93.

Skromny dom. Trzy litery to trigram imienia Jezusa: Iesus Hominum Salvator; ten typ szyldu nazywano « Au Saint Nom de Jésus ».`,
  ar: `فوق الباب، حجر المفتاح: كتلة من الحجر الرمادي، مثبتة في قوس الآجر. ميدالية، دائرة مزدوجة. في الوسط، IHS بأحرف كبيرة؛ عارضة حرف H تحمل صليباً صغيراً. تحت الحروف، ثلاثة مسامير. أربع زهرات بست بتلات، عند النقاط الأربع. في الأسفل، التاريخ مشقوق حول الثلاثي: 16 يساراً، 93 يميناً. الكتابة الدقيقة: 16 IHS 93.

بيت متواضع. الحروف الثلاثة هي ثلاثي اسم يسوع: Iesus Hominum Salvator؛ كان هذا النوع من اللافتات يُدعى « Au Saint Nom de Jésus ».`,
  cn: `门上方，拱心石：一块灰石，嵌在砖拱里。一块圆徽，双圈。正中是大写的 IHS；H 的横杠托着一小十字架。字母下方，三枚钉子。四朵六瓣小花，分列四点。底部，日期在三联字母两侧劈开：左边 16，右边 93。准确写法：16 IHS 93。

一座朴素的房子。这三个字母是耶稣之名的三联符：Iesus Hominum Salvator；这类招牌称作 « Au Saint Nom de Jésus »。`,
  jp: `扉の上、要石：灰色の石の塊、煉瓦のアーチに填められている。メダリオン、二重の円。中央に大文字の IHS。H の横棒に小さな十字架。文字の下に三本の釘。六点花が四つ、四つの位置に。下部で、日付はトリグラムの左右に割れている：左に 16、右に 93。正確な表記：16 IHS 93。

質素な家。三文字はイエスの名のトリグラム：Iesus Hominum Salvator。この種の看板は « Au Saint Nom de Jésus » と呼ばれた。`,
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
fs.writeFileSync(path.join(ROOT, 'data', '16_ihs_93.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', '16_ihs_93.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `16IHS93_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bIHS\b/.test(text)) {
    throw new Error('IHS non épelé (' + lang + ') : ' + text);
  }
  if (!/I H S/.test(text)) {
    throw new Error('I H S manquant (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /Bertaimont/.test(text)) {
      throw new Error('TTS FR mal lu (Clef/TETE/Bertaimont) : ' + text);
    }
    console.log('TTS FR (IHS → I H S):\n' + text);
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
