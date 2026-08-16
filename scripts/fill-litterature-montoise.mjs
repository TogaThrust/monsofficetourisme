/**
 * Bas-relief litterature montoise : texte long réécrit (sans répéter le court),
 * J BTE lu Jean-Baptiste, Jacobs lu Jacobss (pas Jakob),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-litterature-montoise.mjs
 *
 * Sources : photo locale (jardin, mur de chapelle) + BE-monumen (cette plaque).
 * Wikipedia Jacobs : liste l’œuvre, sans date d’inauguration.
 * Ne pas voler : Mayeur / Ropieur, Charles Simonet, autres Jacobs, chapelle-prison comme fiche.
 * Écarter : bios des 4, clarinette, 24 sept. 1933, jardin 1930-1936, Cayaux, ironie prison.
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

const NAME = 'Bas-relief litterature montoise';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Jardin du Mayeur, 7000 Mons.';
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

const FR_LONG_BODY = `Au fond du Jardin du Mayeur, scellé au mur de brique de la chapelle de l’ancienne prison, entre les baies en ogive. Quatre portraits en bas-relief, chacun dans un panneau rectangulaire en retrait. En haut à gauche, trois-quarts vers la droite, lunettes rondes : HENRI DELMOTTE, 1798 1836. En haut à droite, trois-quarts vers la gauche : CHARLES LE TELLIER, 1807 1870. En bas à gauche, lunettes : J BTE DESCAMPS, 1809 1886. En bas à droite, moustache : PIERRE MOUTRIEUX, 1824 1908. Au centre, cinq lignes : AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Signé Gust. Jacobs.

Le bronze, vertical, a pris une patine verte. Il tient le bâtiment de brique rouge qui ferme le jardin, derrière l’hôtel de ville.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `At the back of the Jardin du Mayeur, set into the brick wall of the former prison chapel, between the pointed-arch windows. Four portraits in bas-relief, each in a recessed rectangular panel. Top left, three-quarter view to the right, round spectacles: HENRI DELMOTTE, 1798 1836. Top right, three-quarter view to the left: CHARLES LE TELLIER, 1807 1870. Bottom left, spectacles: J BTE DESCAMPS, 1809 1886. Bottom right, moustache: PIERRE MOUTRIEUX, 1824 1908. In the centre, five lines: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Signed Gust. Jacobs.

The bronze, vertical, has taken a green patina. It holds the red-brick building that closes the garden, behind the town hall.`,
  nl: `Achterin de Jardin du Mayeur, gevat in de bakstenen muur van de kapel van de voormalige gevangenis, tussen de spitsboogvensters. Vier portretten in bas-reliëf, elk in een verdiept rechthoekig paneel. Linksboven, driekwart naar rechts, ronde bril: HENRI DELMOTTE, 1798 1836. Rechtsboven, driekwart naar links: CHARLES LE TELLIER, 1807 1870. Linksonder, bril: J BTE DESCAMPS, 1809 1886. Rechtsonder, snor: PIERRE MOUTRIEUX, 1824 1908. In het midden, vijf regels: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Gesigneerd Gust. Jacobs.

Het brons, verticaal, heeft een groene patina gekregen. Het houdt het rode bakstenen gebouw dat de tuin afsluit, achter het stadhuis.`,
  de: `Hinten im Jardin du Mayeur, in die Ziegelmauer der Kapelle des ehemaligen Gefängnisses gesetzt, zwischen den Spitzbogenfenstern. Vier Porträts im Flachrelief, jedes in einem vertieften rechteckigen Feld. Oben links, Dreiviertel nach rechts, runde Brille: HENRI DELMOTTE, 1798 1836. Oben rechts, Dreiviertel nach links: CHARLES LE TELLIER, 1807 1870. Unten links, Brille: J BTE DESCAMPS, 1809 1886. Unten rechts, Schnurrbart: PIERRE MOUTRIEUX, 1824 1908. In der Mitte fünf Zeilen: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Signiert Gust. Jacobs.

Die Bronze, senkrecht, hat eine grüne Patina angenommen. Sie hält das rote Ziegelgebäude, das den Garten schließt, hinter dem Rathaus.`,
  it: `In fondo al Jardin du Mayeur, murato nel muro di mattoni della cappella dell'antica prigione, tra le baie ogivali. Quattro ritratti in bassorilievo, ciascuno in un pannello rettangolare rientrante. In alto a sinistra, tre quarti verso destra, occhiali tondi: HENRI DELMOTTE, 1798 1836. In alto a destra, tre quarti verso sinistra: CHARLES LE TELLIER, 1807 1870. In basso a sinistra, occhiali: J BTE DESCAMPS, 1809 1886. In basso a destra, baffi: PIERRE MOUTRIEUX, 1824 1908. Al centro, cinque righe: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Firmato Gust. Jacobs.

Il bronzo, verticale, ha preso una patina verde. Tiene l'edificio di mattoni rossi che chiude il giardino, dietro l'hôtel de ville.`,
  es: `Al fondo del Jardin du Mayeur, sellado en el muro de ladrillo de la capilla de la antigua prisión, entre los vanos ojivales. Cuatro retratos en bajorrelieve, cada uno en un panel rectangular rehundido. Arriba a la izquierda, tres cuartos hacia la derecha, gafas redondas: HENRI DELMOTTE, 1798 1836. Arriba a la derecha, tres cuartos hacia la izquierda: CHARLES LE TELLIER, 1807 1870. Abajo a la izquierda, gafas: J BTE DESCAMPS, 1809 1886. Abajo a la derecha, bigote: PIERRE MOUTRIEUX, 1824 1908. En el centro, cinco líneas: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Firmado Gust. Jacobs.

El bronce, vertical, ha tomado una pátina verde. Sujeta el edificio de ladrillo rojo que cierra el jardín, detrás del ayuntamiento.`,
  pl: `W głębi Jardin du Mayeur, osadzony w ceglanym murze kaplicy dawnego więzienia, między ostrołukowymi oknami. Cztery portrety w płaskorzeźbie, każdy w wklęsłym prostokątnym panelu. U góry po lewej, trzy czwarte w prawo, okrągłe okulary: HENRI DELMOTTE, 1798 1836. U góry po prawej, trzy czwarte w lewo: CHARLES LE TELLIER, 1807 1870. Na dole po lewej, okulary: J BTE DESCAMPS, 1809 1886. Na dole po prawej, wąsy: PIERRE MOUTRIEUX, 1824 1908. Na środku pięć wierszy: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. Sygnowane Gust. Jacobs.

Brąz, pionowy, pokrył się zieloną patyną. Trzyma czerwony ceglany budynek zamykający ogród, za ratuszem.`,
  ar: `في عمق Jardin du Mayeur، مثبت في جدار الآجر لكنيسة السجن القديمة، بين الفتحات المدببة. أربعة بورتريهات نحت بارز، كل واحد في لوحة مستطيلة غائرة. أعلى اليسار، ثلاثة أرباع نحو اليمين، نظارات مستديرة: HENRI DELMOTTE، 1798 1836. أعلى اليمين، ثلاثة أرباع نحو اليسار: CHARLES LE TELLIER، 1807 1870. أسفل اليسار، نظارات: J BTE DESCAMPS، 1809 1886. أسفل اليمين، شارب: PIERRE MOUTRIEUX، 1824 1908. في الوسط، خمسة أسطر: AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE. التوقيع Gust. Jacobs.

البرونز العمودي اكتسب زنجاراً أخضر. يمسك مبنى الآجر الأحمر الذي يغلق الحديقة، خلف دار البلدية.`,
  cn: `在Jardin du Mayeur深处，嵌在旧监狱小堂的砖墙上，尖拱窗之间。四幅浅浮雕肖像，各在一块凹进的长方形框里。左上，四分之三向右，圆眼镜：HENRI DELMOTTE，1798 1836。右上，四分之三向左：CHARLES LE TELLIER，1807 1870。左下，眼镜：J BTE DESCAMPS，1809 1886。右下，胡须：PIERRE MOUTRIEUX，1824 1908。正中五行：AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE。署名 Gust. Jacobs。

这块竖向青铜已生绿锈。它钉在封住花园的红砖建筑上，在市政厅背后。`,
  jp: `Jardin du Mayeurの奥、旧牢の礼拝堂の煉瓦壁に嵌められ、尖頭アーチの窓のあいだ。浅浮き彫りの肖像が四つ、それぞれ凹んだ長方形の枠に。左上、四分の三右向き、丸眼鏡：HENRI DELMOTTE、1798 1836。右上、四分の三左向き：CHARLES LE TELLIER、1807 1870。左下、眼鏡：J BTE DESCAMPS、1809 1886。右下、口ひげ：PIERRE MOUTRIEUX、1824 1908。中央、五行：AUX CRÉATEURS DE LA LITTÉRATURE MONTOISE。署名 Gust. Jacobs。

縦の青銅は緑青を帯びている。庭を閉じる赤煉瓦の建物を押さえ、市庁舎の裏にある。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'bas-relief_litterature_montoise.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'bas-relief_litterature_montoise.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `BasReliefLitteratureMontoise_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bJ BTE\b/.test(text) || /\bJ\.-B\.\b/.test(text)) {
    throw new Error('J BTE non substitué (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /Bertaimont/.test(text) || /\bIHS\b/.test(text) || /\bGillis\b/.test(text)) {
      throw new Error('TTS FR mal lu (Clef/TETE/Bertaimont/IHS/Gillis) : ' + text);
    }
    if (/\bJacobs\b/.test(text) || /Jakob/i.test(text)) {
      throw new Error('TTS FR Jacobs/Jakob : ' + text);
    }
    if (!/Jean-Baptiste/.test(text) || !/Jacobss/.test(text)) {
      throw new Error('TTS FR substitutions manquantes : ' + text);
    }
    console.log('TTS FR:\n' + text);
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
