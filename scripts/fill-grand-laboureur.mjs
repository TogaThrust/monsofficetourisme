/**
 * Au Grand Laboureur : texte long réécrit (sans répéter le court),
 * Clef lu Clé en TTS (déjà dans tts-pronounce.mjs), traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-grand-laboureur.mjs
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

const NAME = 'Au Grand Laboureur';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Clef 30, 7000 Mons.';
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

const FR_LONG_BODY = `Deux lignes, capitales. AU GRAND. Dessous : LABOUREUR. Le U est un U, pas un V. Dalle de pierre rectangulaire, encastrée dans un second cadre : allège de la fenêtre du milieu, au premier étage. Lettres en relief, serif. Sous le panneau, un cordon mouluré.

Maison de style classique montois, première moitié du XVIIIe. Brique et pierre. L’enseigne primitive était Le Laboureur.`;

/** Traductions figées. Graphie d’inscription inchangée : AU GRAND / LABOUREUR. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Two lines, capitals. AU GRAND. Below: LABOUREUR. The U is a U, not a V. A rectangular stone slab, set into a second frame: the allège of the middle window, on the first floor. Letters in relief, serif. Under the panel, a moulded band.

A house in Mons classical style, first half of the eighteenth century. Brick and dressed stone. The original sign was Le Laboureur.`,
  nl: `Twee regels, kapitalen. AU GRAND. Daaronder: LABOUREUR. De U is een U, geen V. Rechthoekige stenen plaat, gevat in een tweede kader: allège van het middelste raam, op de eerste verdieping. Letters in reliëf, schreef. Onder het paneel een geprofileerde cordon.

Huis in klassieke Montoise stijl, eerste helft van de achttiende eeuw. Baksteen en natuursteen. Het oorspronkelijke uithangbord was Le Laboureur.`,
  de: `Zwei Zeilen, Versalien. AU GRAND. Darunter: LABOUREUR. Das U ist ein U, kein V. Rechteckige Steinplatte, in einen zweiten Rahmen gesetzt: Allège des mittleren Fensters, im ersten Stock. Buchstaben im Relief, Serifen. Unter der Tafel ein profiliertes Band.

Haus im klassischen Mons-Stil, erste Hälfte des 18. Jahrhunderts. Ziegel und Werkstein. Die ursprüngliche Bezeichnung war Le Laboureur.`,
  it: `Due righe, maiuscole. AU GRAND. Sotto: LABOUREUR. La U è una U, non una V. Lastra di pietra rettangolare, incastonata in una seconda cornice: allège della finestra di mezzo, al primo piano. Lettere in rilievo, serif. Sotto il pannello, un cordone sagomato.

Casa in stile classico montois, prima metà del XVIII secolo. Mattone e pietra. L'insegna primitiva era Le Laboureur.`,
  es: `Dos líneas, mayúsculas. AU GRAND. Debajo: LABOUREUR. La U es una U, no una V. Losa de piedra rectangular, encajada en un segundo marco: allège de la ventana del medio, en el primer piso. Letras en relieve, serif. Bajo el panel, un cordón moldurado.

Casa de estilo clásico montois, primera mitad del siglo XVIII. Ladrillo y piedra. La enseña primitiva era Le Laboureur.`,
  pl: `Dwa wiersze, kapitaliki. AU GRAND. Poniżej: LABOUREUR. U to U, nie V. Prostokątna płyta kamienna, osadzona w drugiej ramie: allège środkowego okna, na pierwszym piętrze. Litery w reliefie, szeryfowe. Pod panelem profilowany gzyms.

Dom w klasycznym stylu montois, pierwsza połowa XVIII wieku. Cegła i kamień. Pierwotny szyld: Le Laboureur.`,
  ar: `سطران، حروف كبيرة. AU GRAND. أسفله: LABOUREUR. حرف الـ U هو U، وليس V. لوح حجري مستطيل، مُثبَّت في إطار ثانٍ: أليج النافذة الوسطى في الطابق الأول. حروف بارزة، بزوائد serif. تحت اللوحة، حزام مقولب.

منزل على الطراز الكلاسيكي المونتوي، النصف الأول من القرن الثامن عشر. آجر وحجر. اللافتة الأولى كانت Le Laboureur.`,
  cn: `两行，大写。AU GRAND。下面：LABOUREUR。U是U，不是V。一块长方形石板，嵌在第二道框里：一楼中间窗户下的窗裙（allège）。浮雕字母，衬线体。石板下方，一条线脚石带。

蒙斯古典风格的房屋，十八世纪上半叶。砖与石。最初的招牌是 Le Laboureur。`,
  jp: `二行、大文字。AU GRAND。下に：LABOUREUR。UはUであり、Vではない。長方形の石板が、第二の枠に嵌められている：一階中央の窓の下、窓台下の石板（allège）。浮き彫りの文字、セリフ体。パネルの下に、型取りされた帯。

モンスの古典様式の家、十八世紀前半。煉瓦と石。当初の看板は Le Laboureur。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'au_grand_laboureur.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'au_grand_laboureur.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `AuGrandLaboureur_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && /\bClef\b/.test(text)) {
    throw new Error('TTS FR mal lu (Clef) : ' + text);
  }
  console.log('tts', lang, text.slice(0, 80).replace(/\n/g, ' '));
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
