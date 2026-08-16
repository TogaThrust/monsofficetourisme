/**
 * Loge maconnique Rue Chisaire : texte long réécrit (sans répéter le court),
 * Chisaire lu Chizèr en TTS FR, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-loge-chisaire.mjs
 *
 * Sources : Connaître la Wallonie (fiche IPW) + classement 53053-CLT-0122-01
 *   (façades et toitures, 19 avril 1982, n° 16) + Yannart monsblog n°59
 *   (ornements de CETTE façade, 1890, Puchot, Parfaite Union / Concorde)
 *   + photo POI images/Loge_maconnique_Rue_Chisaire.jpg (plaque faïence,
 *   pas la façade du temple — ne pas décrire la plaque comme le POI).
 * Ne pas voler : Cour du Dromadaire / rue des Fripiers ; gare ; intérieur
 *   (Journées du Patrimoine / Mons 2015) ; autres loges / Grand Orient.
 * Écarter : plus ancienne d’Europe continentale, matricule n°1, querelle 1896,
 *   Joseph II, clandestinité, Révolution ; pylônes Louxor, uræus, lotus/papyrus
 *   en cours, équerre-compas ×3, Sagesse-Force-Beauté ; paradoxe secret/gare.
 * Court actuel : « Symboles maçonniques sur la façade du 2 rue Chisaire. »
 *   Ne pas ouvrir par ces faits ; n°2 du court = Yannart, classement = n°16.
 * Quiz : inchangé (symboles / 1776 / Rue Chisaire) — pas de 1721 dans le long.
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

const NAME = 'Loge maconnique Rue Chisaire';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue Chisaire 16, 7000 Mons.';
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

const FR_LONG_BODY = `La façade avance un avant-corps de pierre claire. Deux colonnes cannelées encadrent l’étage ; au-dessus, une haute corniche à gorge. Sous la corniche, des disques solaires ailés, sculptés, les ailes ouvertes. Des baies à petits bois en réseau géométrique. Le vocabulaire est néo-égyptien, plus net en hauteur qu’au rez-de-chaussée.

Hector Puchot construit l’immeuble en 1890, pour la loge La Parfaite Union, dite aussi La Concorde. Les façades et les toitures sont classées monument le 19 avril 1982.`;

/** Traductions figées. Façade du temple, pas la plaque de rue. Pas de 1721. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The façade steps forward in a projecting bay of pale stone. Two fluted columns frame the upper floor; above, a high cavetto cornice. Beneath the cornice, winged sun disks, carved, wings spread. Windows with geometric leaded panes. The vocabulary is neo-Egyptian, clearer at the upper storey than at street level.

Hector Puchot builds the house in 1890, for the lodge La Parfaite Union, also called La Concorde. The façades and roofs were listed as a monument on 19 April 1982.`,
  nl: `De gevel springt vooruit in een risaliet van lichte steen. Twee gecanneleerde zuilen omlijsten de verdieping; daarboven een hoge holle kroonlijst. Onder de kroonlijst, gevleugelde zonneschijven, gebeeldhouwd, vleugels gespreid. Vensters met geometrisch loodglas. Het vocabularium is neo-Egyptisch, duidelijker boven dan op de begane grond.

Hector Puchot bouwt het pand in 1890, voor de loge La Parfaite Union, ook La Concorde genoemd. De gevels en daken zijn als monument beschermd op 19 april 1982.`,
  de: `Die Fassade tritt in einem Risalit aus hellem Stein vor. Zwei kannelierte Säulen fassen das Obergeschoss; darüber ein hohes Hohlkehlgesims. Unter dem Gesims geflügelte Sonnenscheiben, gemeißelt, die Flügel geöffnet. Fenster mit geometrischem Bleiglas. Das Vokabular ist neoägyptisch, oben klarer als im Erdgeschoss.

Hector Puchot errichtet das Gebäude 1890 für die Loge La Parfaite Union, auch La Concorde genannt. Fassaden und Dächer stehen seit dem 19. April 1982 unter Denkmalschutz.`,
  it: `La facciata avanza un avancorpo di pietra chiara. Due colonne scanalate inquadrano il piano; sopra, un alto cornicione a gola. Sotto il cornicione, dischi solari alati, scolpiti, le ali aperte. Baie a piccolo legno in rete geometrica. Il vocabolario è neoegizio, più netto in alto che al piano terra.

Hector Puchot costruisce l'immobile nel 1890, per la loggia La Parfaite Union, detta anche La Concorde. Le facciate e i tetti sono classificati monumento il 19 aprile 1982.`,
  es: `La fachada adelanta un cuerpo de piedra clara. Dos columnas estriadas encuadran el piso; encima, una cornisa alta en gola. Bajo la cornisa, discos solares alados, esculpidos, las alas abiertas. Vanos de pequeño bosque en red geométrica. El vocabulario es neoegipcio, más nítido en altura que en la planta baja.

Hector Puchot construye el inmueble en 1890, para la logia La Parfaite Union, llamada también La Concorde. Las fachadas y las cubiertas están catalogadas como monumento el 19 de abril de 1982.`,
  pl: `Fasada wysuwa ryzalit z jasnego kamienia. Dwie żłobkowane kolumny obramowują piętro; powyżej wysoki gzyms z wyżłobieniem. Pod gzymsem skrzydlate tarcze słoneczne, rzeźbione, skrzydła rozwarte. Okna w geometrycznej siatce ołowiu. Słownik jest neoegipski, wyraźniejszy na górze niż na parterze.

Hector Puchot wznosi budynek w 1890, dla loży La Parfaite Union, zwanej też La Concorde. Elewacje i dachy wpisano jako zabytek 19 kwietnia 1982.`,
  ar: `تتقدّم الواجهة بجسم بارز من حجر فاتح. عمودان محزّزان يؤطّران الطابق؛ فوقهما إفريز عالٍ مقعّر. تحت الإفريز أقراص شمسية مجنّحة، منحوتة، أجنحتها مفتوحة. نوافذ بزجاج هندسي. المعجم نيو-مصري، أوضح في العلو منه في الطابق الأرضي.

يبني هيكتور بوشو المبنى سنة 1890، لصالح المحفل La Parfaite Union، المسمّى أيضاً La Concorde. صُنّفت الواجهات والأسقف أثراً في 19 نيسان/أبريل 1982.`,
  cn: `立面向前凸出一块浅色石质前体。两根带槽圆柱框住楼上；其上是高高的凹曲檐口。檐口下，带翼日盘浮雕，翅膀张开。窗格呈几何铅条网。语汇是新埃及式，楼上比底层更清楚。

Hector Puchot于1890年建造此楼，供La Parfaite Union会所之用，亦称La Concorde。立面与屋顶于1982年4月19日列为保护古迹。`,
  jp: `ファサードは淡い石のアヴァン＝コールを前に出す。溝のある円柱が二本、階を囲む。その上に高いゴーラのコーニス。コーニスの下、翼のある太陽円盤が彫られ、翼を開く。幾何学的な鉛ガラスの開口。語彙はネオ＝エジプト式で、地上階より上の方がはっきりしている。

Hector Puchotが1890年にこの建物を建てる。ロッジ La Parfaite Union、別名 La Concorde のため。ファサードと屋根は1982年4月19日に記念建造物に指定。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'loge_maconnique_rue_chisaire.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'loge_maconnique_rue_chisaire.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `LogeMaconniqueRueChisaire_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (!/\bChizèr\b/.test(text)) {
      throw new Error('TTS FR Chisaire non substitué : ' + text);
    }
    if (/\bChisaire\b/.test(text)) {
      throw new Error('TTS FR Chisaire restant : ' + text);
    }
    if (
      /\bClef\b/.test(text) ||
      /\bTETE\b/.test(text) ||
      /\bTETTE\b/.test(text) ||
      /\bCROIX D OR\b/.test(text) ||
      /\bGillis\b/.test(text) ||
      /\bHarvent\b/.test(text) ||
      /\bBertaimont\b/.test(text) ||
      /\bIHS\b/.test(text) ||
      /Grand['’]Rue/.test(text)
    ) {
      throw new Error('TTS FR mal lu : ' + text);
    }
    console.log('TTS FR:\n' + text);
  }
  console.log('tts', lang, text.slice(0, 180).replace(/\n/g, ' '));
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
