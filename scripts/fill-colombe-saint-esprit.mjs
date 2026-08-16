/**
 * Colombe du Saint-Esprit : texte long réécrit (sans répéter le court),
 * patois Gillis lu en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-colombe-saint-esprit.mjs
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

const NAME = 'Colombe du Saint-Esprit';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Houdain 13, 7000 Mons.';
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

const GILLIS = `« Et il a co, à l’Rue d’Houdain, Pindant à ein balcon, toute dorée, qui s’invole L’Colombe du Saint-esprit des p’tits infants trouvés... »`;

const FR_LONG_BODY = `Au centre du garde-corps, l’oiseau a les ailes ouvertes, éployées entre les volutes et les barreaux : une belle œuvre de ferronnerie. Sous le fer, un appui de pierre à caissons. Fin XVIIe. Une des deux seules représentations anciennes encore posées sur un balcon.

Elle fut l’enseigne de l’Hospice du Saint-Esprit, ou des Enfants abandonnés. Créé en 1682 par l’abbé François Michel, dans l’ancien Hôtel des seigneurs d’Hyon, pour recueillir, héberger, placer chez des nourriciers. Marcel Gillis, dans Les Cayaux : ${GILLIS}`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `At the centre of the railing, the bird has its wings open, spread between the scrolls and the bars: a fine work of ironwork. Below the iron, a stone sill with coffers. Late seventeenth century. One of only two old representations still set on a balcony.

It was the sign of the Hospice du Saint-Esprit, or of the Abandoned Children. Founded in 1682 by the Mons abbot François Michel, in the former Hôtel of the lords of Hyon, to take them in, shelter them, or place them with wet nurses. Marcel Gillis, in Les Cayaux: ${GILLIS}`,
  nl: `In het midden van de borstwering heeft de vogel de vleugels open, uitgespreid tussen de voluten en de spijlen: een mooi stuk smeedwerk. Onder het ijzer een stenen dorpel met caissons. Eind zeventiende eeuw. Een van de twee enige oude voorstellingen die nog op een balkon staan.

Het was het uithangbord van het Hospice du Saint-Esprit, of van de Verlaten Kinderen. Gesticht in 1682 door de Montoise abt François Michel, in het oude Hôtel des seigneurs d’Hyon, om hen op te vangen, te huisvesten, bij zoogsters te plaatsen. Marcel Gillis, in Les Cayaux: ${GILLIS}`,
  de: `In der Mitte des Geländers hat der Vogel die Flügel offen, ausgebreitet zwischen Voluten und Stäben: ein schönes Werk der Schmiedekunst. Unter dem Eisen ein steinerner Sims mit Kassetten. Ende des 17. Jahrhunderts. Eine der nur zwei alten Darstellungen, die noch so auf einem Balkon sitzen.

Sie war das Schild des Hospice du Saint-Esprit, oder der verlassenen Kinder. 1682 vom Montoiser Abbé François Michel gegründet, im ehemaligen Hôtel der Herren von Hyon, um sie aufzunehmen, zu beherbergen, bei Ammen unterzubringen. Marcel Gillis, in Les Cayaux: ${GILLIS}`,
  it: `Al centro del parapetto, l’uccello ha le ali aperte, spiegate tra volute e sbarre: una bella opera di ferronnerie. Sotto il ferro, un davanzale di pietra a cassettoni. Fine del XVII secolo. Una delle due sole rappresentazioni antiche ancora posate su un balcone.

Fu l’insegna dell’Hospice du Saint-Esprit, o dei Bambini abbandonati. Fondato nel 1682 dall’abate montois François Michel, nell’antico Hôtel des seigneurs d’Hyon, per raccoglierli, ospitarli, collocarli presso nutrici. Marcel Gillis, in Les Cayaux: ${GILLIS}`,
  es: `En el centro del pretil, el pájaro tiene las alas abiertas, desplegadas entre volutas y barrotes: una bella obra de herrería. Bajo el hierro, un antepecho de piedra con casetones. Finales del XVII. Una de las dos únicas representaciones antiguas que siguen puestas en un balcón.

Fue el letrero del Hospice du Saint-Esprit, o de los Niños abandonados. Fundado en 1682 por el abad montois François Michel, en el antiguo Hôtel des seigneurs d’Hyon, para recogerlos, alojarlos, colocarlos en casas de nodrizas. Marcel Gillis, en Les Cayaux: ${GILLIS}`,
  pl: `Na środku balustrady ptak ma skrzydła otwarte, rozpostarte między wolutami i prętami: piękne dzieło kowalstwa. Pod żelazem kamienny parapet z kasetonami. Koniec XVII wieku. Jedna z zaledwie dwóch dawnych przedstawień wciąż osadzonych na balkonie.

Była szyldem Hospice du Saint-Esprit, czyli Dzieci porzuconych. Założony w 1682 przez abbého montois François Michel, w dawnym Hôtel des seigneurs d’Hyon, by je zbierać, dawać schronienie, umieszczać u mamek. Marcel Gillis, w Les Cayaux: ${GILLIS}`,
  ar: `في وسط الحاجز، للطائر جناحان مفتوحان، مبسوطان بين اللفائف والقضبان: عمل حدادة جميل. تحت الحديد، عتبة حجرية ذات تجاويف. أواخر القرن السابع عشر. واحدة من التمثيلين القديمين الوحيدين اللذين ما زالا على شرفة.

كانت لافتة Hospice du Saint-Esprit، أو الأطفال المتخلّى عنهم. أسّسه سنة 1682 الأب المونتوي François Michel، في Hôtel des seigneurs d’Hyon القديم، لجمعهم وإيوائهم ووضعهم عند مرضعات. Marcel Gillis، في Les Cayaux : ${GILLIS}`,
  cn: `栏杆正中，鸟张开翅膀，展于涡卷与直杆之间：一件漂亮的铁艺。铁下是带方格的石台沿。十七世纪末。仅存的两件仍安在阳台上的古代表现之一。

它曾是Hospice du Saint-Esprit（弃儿收容所）的招牌。1682年，蒙斯神父François Michel在昔日Hôtel des seigneurs d’Hyon创办，为收留、安置、送到奶妈家。Marcel Gillis，在Les Cayaux中：${GILLIS}`,
  jp: `手すりの中央で、鳥は翼を開き、渦巻きと縦桟のあいだに広げている：美しい鉄細工。鉄の下は格間のある石の出窓。十七世紀末。今もバルコニーに残る古い表現は、二つしかない。

Hospice du Saint-Esprit、すなわち捨て子の施療院の看板だった。1682年、モンスの司祭François Michelが、かつてのHôtel des seigneurs d’Hyonで創設し、引き取り、宿し、乳母のもとへ預けた。Marcel Gillis、『Les Cayaux』：${GILLIS}`,
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

function patchLongs() {
  const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
  for (const lang of LANGS) {
    const body = LONG_BODY[lang];
    if (!body) throw new Error('missing long ' + lang);
    setDesc(longs, lang, `${body}\n\n${ADDRESS_LABEL[lang]} ${ADDRESS}`);
  }
  writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
  return longs;
}

let longs = patchLongs();
for (const lang of LANGS) {
  console.log('ok', lang, LONG_BODY[lang].length);
}

const txt = longs.fr[NAME].replace(/\n/g, '\r\n');
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'colombe_du_saint-esprit.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'colombe_du_saint-esprit.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ColombeDuSaintEsprit_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bGillis\b/.test(text) || /à ein balcon/.test(text) || /s['’]invole/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  fs.copyFileSync(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
}

longs = patchLongs();

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
