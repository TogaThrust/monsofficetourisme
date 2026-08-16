/**
 * Chateau de le Marcote : texte long réécrit (sans répéter le court),
 * CHATEAU / DE LE / MARCOTE lus château / de le / Marcote en TTS,
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-chateau-marcote.mjs
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

const NAME = 'Chateau de le Marcote';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue des Marcottes 33, 7000 Mons.';
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

const FR_LONG_BODY = `Dans l’axe, au-dessus du rez-de-chaussée, un panneau de calcaire en forme de mitre tronquée, scellé dans la brique. En haut, largement espacé : 1689, un trait horizontal. Au centre, un relief : trois belettes de profil, qui courent de gauche à droite, l’une derrière l’autre. Sous le motif, deux lignes capitales : LE CHATEAU DE, puis LE MARCOTE. Tout en bas, plus petit : RECONSTRUIT EN 1820.

Le millésime du sommet est celui de la pierre. La dernière ligne, une rajoute, dit que l’habitation a été reconstruite. On lit donc, sur le même calcaire, la date de l’enseigne et celle du chantier du XIXe.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `On the axis, above the ground floor, a limestone panel in the shape of a truncated mitre, set in the brick. At the top, widely spaced: 1689, a horizontal stroke. In the centre, a relief: three weasels in profile, running from left to right, one behind the other. Under the motif, two lines in capitals: LE CHATEAU DE, then LE MARCOTE. At the very bottom, smaller: RECONSTRUIT EN 1820.

The year at the top is that of the stone. The last line, an addition, says the dwelling was rebuilt. On the same limestone one therefore reads the date of the sign and that of the nineteenth-century works.`,
  nl: `In de as, boven de begane grond, een kalkstenen paneel in de vorm van een afgeknotte mijter, gevat in de baksteen. Bovenaan, wijd uiteen: 1689, een horizontale streep. In het midden een reliëf: drie wezels in profiel, die van links naar rechts rennen, de ene achter de andere. Onder het motief, twee regels in kapitalen: LE CHATEAU DE, daarna LE MARCOTE. Helemaal onderaan, kleiner: RECONSTRUIT EN 1820.

Het jaartal bovenaan is dat van de steen. De laatste regel, een toevoeging, zegt dat de woning is herbouwd. Op dezelfde kalksteen leest men dus de datum van het uithangbord en die van de negentiende-eeuwse werken.`,
  de: `In der Achse, über dem Erdgeschoss, eine Kalksteintafel in Form einer gestutzten Mitra, in den Ziegel gesetzt. Oben, weit auseinander: 1689, ein waagrechter Strich. In der Mitte ein Relief: drei Wiesel im Profil, die von links nach rechts laufen, eines hinter dem anderen. Unter dem Motiv zwei Zeilen in Versalien: LE CHATEAU DE, dann LE MARCOTE. Ganz unten, kleiner: RECONSTRUIT EN 1820.

Die Jahreszahl oben ist die des Steins. Die letzte Zeile, ein Zusatz, sagt, dass die Wohnung wiederaufgebaut wurde. Auf demselben Kalkstein liest man also das Datum des Schildes und das der Arbeiten des 19. Jahrhunderts.`,
  it: `Sull'asse, sopra il piano terra, un pannello di calcare a forma di mitra tronca, murato nel mattone. In alto, ben distanziato: 1689, un tratto orizzontale. Al centro, un rilievo: tre donnole di profilo, che corrono da sinistra a destra, l'una dietro l'altra. Sotto il motivo, due righe in capitali: LE CHATEAU DE, poi LE MARCOTE. In fondo, più piccolo: RECONSTRUIT EN 1820.

Il millesimo in cima è quello della pietra. L'ultima riga, un'aggiunta, dice che l'abitazione è stata ricostruita. Sullo stesso calcare si leggono dunque la data dell'insegna e quella del cantiere dell'Ottocento.`,
  es: `En el eje, por encima de la planta baja, un panel de caliza en forma de mitra truncada, encajado en el ladrillo. Arriba, bien espaciado: 1689, un trazo horizontal. En el centro, un relieve: tres comadrejas de perfil, que corren de izquierda a derecha, una detrás de otra. Bajo el motivo, dos líneas en capitales: LE CHATEAU DE, luego LE MARCOTE. Abajo del todo, más pequeño: RECONSTRUIT EN 1820.

El milésimo de la cima es el de la piedra. La última línea, un añadido, dice que la vivienda fue reconstruida. En la misma caliza se leen, pues, la fecha de la enseña y la de la obra del siglo XIX.`,
  pl: `W osi, nad parterem, wapienna płyta w kształcie ściętej mitry, osadzona w cegle. U góry, szeroko rozstawione: 1689, pozioma kreska. Na środku relief: trzy łasice z profilu, biegnące od lewej do prawej, jedna za drugą. Pod motywem dwa wiersze kapitalikami: LE CHATEAU DE, potem LE MARCOTE. Na samym dole, mniejsze: RECONSTRUIT EN 1820.

Rocznik u szczytu należy do kamienia. Ostatni wiersz, dopisek, mówi, że mieszkanie odbudowano. Na tym samym wapieniu czyta się więc datę szyldu i datę dziewiętnastowiecznych robót.`,
  ar: `على المحور، فوق الطابق الأرضي، لوحة من الحجر الجيري على شكل تاج أسقف مقطوع، مثبتة في الآجر. في الأعلى، متباعدة: 1689، خط أفقي. في الوسط، نحت بارز: ثلاثة بنات عرس جانبياً، تركض من اليسار إلى اليمين، واحدة خلف الأخرى. تحت الزخرفة، سطران بأحرف كبيرة: LE CHATEAU DE، ثم LE MARCOTE. في الأسفل تماماً، أصغر: RECONSTRUIT EN 1820.

السنة في القمة هي سنة الحجر. السطر الأخير، إضافة لاحقة، يقول إن المسكن أُعيد بناؤه. على الحجر الجيري نفسه تُقرأ إذن تاريخ اللافتة وتاريخ ورشة القرن التاسع عشر.`,
  cn: `正中轴上，底楼上方，一块截顶主教冠形的石灰岩板，嵌在砖墙里。顶端疏朗地刻着：1689，一道横线。中央浮雕：三只黄鼠狼侧身，从左向右奔跑，一只跟着一只。纹样下方两行大写：LE CHATEAU DE，然后是 LE MARCOTE。最底下，字更小：RECONSTRUIT EN 1820.

顶端的年号属于这块石头。最下一行是后加的，写明住宅曾重建。同一块石灰岩上，因此既能读到招牌的日期，也能读到十九世纪工程的日期。`,
  jp: `軸線上、一階の上、截頭の司教冠形をした石灰岩の板が、煉瓦に嵌められている。上に、間隔をあけて：1689、横線。中央に浮き彫り：横向きのイタチが三匹、左から右へ、一列に走っている。図の下、大文字二行：LE CHATEAU DE、次いで LE MARCOTE。一番下、より小さく：RECONSTRUIT EN 1820。

頂の年紀は石のものである。最後の行は追記で、住居が再建されたと記す。同じ石灰岩に、看板の日付と十九世紀の工事の日付とが読める。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'chateau_de_le_marcote.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'chateau_de_le_marcote.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ChateauDeLeMarcote_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /Bertaimont/.test(text)) {
      throw new Error('TTS FR mal lu (Clef/TETE/Bertaimont) : ' + text);
    }
    if (/\bCHATEAU\b/.test(text) || /\bMARCOTE\b/.test(text) || /\bDE LE\b/.test(text)) {
      throw new Error('TTS FR inscription non substituée : ' + text);
    }
    if (!/château/.test(text) || !/Marcote/.test(text)) {
      throw new Error('TTS FR substitutions manquantes : ' + text);
    }
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
