/**
 * Fontaine Rue de Bertaimont : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs. Bertaimont → Bertémont déjà en TTS.
 * Usage: node scripts/fill-fontaine-bertaimont.mjs
 *
 * Sources : Yannart (monsblog, fig. 14) + Connaître la Wallonie n°31 + photo.
 * Ne pas voler : Fontaine de Messines, Saint-Nicolas, À la Bonne Femme, n°33.
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

const NAME = 'Fontaine Rue de Bertaimont';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Bertaimont 31, 7000 Mons.';
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

const FR_LONG_BODY = `Le panneau forme l’allège de la fenêtre du milieu, au premier étage : calcaire, contours chantournés. Deux vasques superposées. La haute, plus petite, sur un fût court. La basse, plus large. Anépigraphe : pas d’inscription.

Maison en pierre, style classique montois, deuxième tiers du XVIIIe. Trois niveaux, trois travées. À droite, plus large, en léger retrait : une porte, une baie à balcon. Classée en 1988.`;

/** Traductions figées. Pas de Fontaine de Messines, pas de n°33. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel forms the allège of the middle window, on the first floor: limestone, cut-out contours. Two basins one above the other. The upper one, smaller, on a short stem. The lower one, wider. Anépigraphe: no inscription.

A house in stone, Mons classical style, second third of the eighteenth century. Three storeys, three bays. On the right, wider, slightly recessed: a door, a balcony window. Listed in 1988.`,
  nl: `Het paneel vormt de allège van het middelste raam op de eerste verdieping: kalksteen, uitgezaagde contouren. Twee kommen boven elkaar. De bovenste, kleiner, op een korte stam. De onderste, breder. Anépigraphe: geen inscriptie.

Huis in steen, klassieke Montoise stijl, tweede derde van de achttiende eeuw. Drie niveaus, drie traveeën. Rechts, breder, licht terugliggend: een deur, een balkonvenster. Beschermd in 1988.`,
  de: `Die Tafel bildet die Allège des mittleren Fensters im ersten Stock: Kalkstein, geschweifte Konturen. Zwei Schalen übereinander. Die obere, kleiner, auf einem kurzen Schaft. Die untere, breiter. Anépigraphe: keine Inschrift.

Haus aus Stein, klassischer Mons-Stil, zweites Drittel des 18. Jahrhunderts. Drei Geschosse, drei Achsen. Rechts, breiter, leicht zurückgesetzt: eine Tür, ein Balkonfenster. Unter Schutz seit 1988.`,
  it: `Il pannello forma l'allège della finestra di mezzo, al primo piano: calcare, contorni sagomati. Due vasche sovrapposte. Quella alta, più piccola, su un fusto corto. Quella bassa, più larga. Anépigraphe: nessuna iscrizione.

Casa in pietra, stile classico montois, secondo terzo del XVIII secolo. Tre livelli, tre campate. A destra, più larga, in lieve rientro: una porta, una baia a balcone. Classificata nel 1988.`,
  es: `El panel forma el allège de la ventana del medio, en el primer piso: caliza, contornos recortados. Dos pilas superpuestas. La de arriba, más pequeña, sobre un fuste corto. La de abajo, más ancha. Anépigraphe: sin inscripción.

Casa de piedra, estilo clásico montois, segundo tercio del siglo XVIII. Tres niveles, tres crujías. A la derecha, más ancha, en ligero receso: una puerta, un vano a balcón. Catalogada en 1988.`,
  pl: `Panel tworzy allège środkowego okna na pierwszym piętrze: wapień, wycięte kontury. Dwie misy jedna nad drugą. Górna, mniejsza, na krótkim trzonie. Dolna, szersza. Anépigraphe: bez napisu.

Dom z kamienia, klasyczny styl montois, druga tercja XVIII wieku. Trzy kondygnacje, trzy osie. Po prawej, szersza, lekko cofnięta: drzwi, okno z balkonem. Zabytkowy od 1988.`,
  ar: `تشكّل اللوحة الأليج للنافذة الوسطى في الطابق الأول: حجر جيري، خطوط مقصوصة. حوضان فوق بعضهما. الأعلى أصغر، على ساق قصيرة. الأسفل أعرض. أنيبيغراف: بلا نقش.

منزل من حجر، الطراز الكلاسيكي المونتوي، الثلث الثاني من القرن الثامن عشر. ثلاثة طوابق، ثلاثة محاور. على اليمين، أعرض ومتراجع قليلاً: باب ونافذة بشرفة. صُنّف سنة 1988.`,
  cn: `这块石板构成一楼中间窗户下方的窗裙（allège）：石灰岩，镂刻轮廓。两只叠放的水盆。上面的更小，立在短柱上。下面的更宽。无铭文（anépigraphe）：一块字也没有。

一座石头房子，蒙斯古典风格，十八世纪第二个三分之一。三层，三开间。右侧更宽、略微后退：一扇门，一扇带阳台的窗。1988年列为保护建筑。`,
  jp: `パネルは1階中央の窓の下、窓台下の石板（allège）をなす：石灰岩、切り抜いた輪郭。重ねた二つの水盤。上は小さく、短い脚の上。下はより広い。銘なし（anépigraphe）。

石の家、モンスの古典様式、十八世紀の第二の三分の一。三層、三ベイ。右はより広く、少し後退：扉とバルコニーの窓。1988年に指定。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'fontaine_rue_de_bertaimont.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'fontaine_rue_de_bertaimont.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `FontaineRueDeBertaimont_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && /Bertaimont/.test(text)) {
    throw new Error('TTS FR Bertaimont non substitué : ' + text);
  }
  if (lang === 'fr' && !/Bertémont/.test(text)) {
    throw new Error('TTS FR sans Bertémont : ' + text);
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
