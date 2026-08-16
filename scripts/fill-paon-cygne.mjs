/**
 * Au Paon et au Cygne : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-paon-cygne.mjs
 *
 * Sources : Yannart (monsblog, fig. 24) + photo POI (cygne) + Rue_des_Fripiers.jpg
 *   (cygne à gauche / paon à droite, haut au-dessus des fenêtres).
 * Connaître la Wallonie : pas de fiche dédiée.
 * Ne pas voler : THANKSgalerie, pavés peints, autres enseignes Fripiers, Cité du Doudou.
 * Quiz : inchangé (animaux / 22 / Rue des Fripiers).
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

const NAME = 'Au Paon et au Cygne';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue des Fripiers 22, 7000 Mons.';
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

const FR_LONG_BODY = `Haut, au-dessus des fenêtres : deux frontons de calcaire. Chacun porte un motif au centre, anépigraphe. À gauche, le cygne au centre d’une couronne de verdure. À droite, le paon faisant la roue, inscrit dans un écusson.

Maison étroite, baroque, premier tiers du XVIIe. Brique et pierre. On peut douter que ce soit une enseigne commerciale. Au pignon, une petite ouverture cintrée, encadrement de pierre, clé monogrammée IHS. Peut-être une ancienne maison d’accueil, ou un refuge.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `High up, above the windows: two limestone pediments. Each holds a motif at the centre, anepigraphic. On the left, the swan at the centre of a crown of greenery. On the right, the peacock displaying, set in an escutcheon.

A narrow house, baroque, first third of the seventeenth century. Brick and stone. One may doubt that this is a commercial sign. On the gable, a small arched opening, a stone frame, a key monogrammed IHS. Perhaps a former house of welcome, or a refuge.`,
  nl: `Hoog, boven de vensters: twee frontons van kalksteen. Elk draagt een motief in het midden, anepigrafisch. Links de zwaan in het midden van een groene kroon. Rechts de pauw die een wiel maakt, gevat in een wapenschild.

Smal huis, barok, eerste derde van de zeventiende eeuw. Baksteen en steen. Men kan betwijfelen of het een handelsuithangbord is. Op de geveltop een kleine boogopening, stenen omlijsting, sleutel met monogram IHS. Misschien een voormalig opvanghuis, of een toevluchtsoord.`,
  de: `Hoch, über den Fenstern: zwei Kalksteingiebel. Jeder trägt in der Mitte ein Motiv, anepigraphisch. Links der Schwan in einer Laubkrone. Rechts der Pfau, der ein Rad schlägt, in einem Wappenschild.

Schmales Haus, barock, erstes Drittel des 17. Jahrhunderts. Ziegel und Stein. Man darf bezweifeln, dass es ein Ladenschild ist. Am Giebel eine kleine Bogenöffnung, steinerne Rahmung, Schlussstein mit Monogramm IHS. Vielleicht ein ehemaliges Aufnahmehaus, oder eine Zuflucht.`,
  it: `In alto, sopra le finestre: due frontoni di calcare. Ciascuno porta un motivo al centro, anepigrafo. A sinistra, il cigno al centro di una corona di verdura. A destra, il pavone che fa la ruota, inscritto in uno scudo.

Casa stretta, barocca, primo terzo del XVII secolo. Mattone e pietra. Si può dubitare che sia un'insegna commerciale. Sul timpano, una piccola apertura ad arco, cornice di pietra, chiave monogrammata IHS. Forse un'antica casa di accoglienza, o un rifugio.`,
  es: `En lo alto, encima de las ventanas: dos frontones de caliza. Cada uno lleva un motivo en el centro, anepígrafo. A la izquierda, el cisne en el centro de una corona de verdura. A la derecha, el pavo real haciendo la rueda, inscrito en un escudo.

Casa estrecha, barroca, primer tercio del siglo XVII. Ladrillo y piedra. Cabe dudar de que sea un letrero comercial. En el piñón, una pequeña abertura en arco, marco de piedra, clave monogramada IHS. Quizá una antigua casa de acogida, o un refugio.`,
  pl: `Wysoko, nad oknami: dwa frontony z wapienia. Każdy niesie motyw pośrodku, anepigraficzny. Po lewej łabędź w środku korony zieleni. Po prawej paw rozkładający ogon, wpisany w tarczę herbową.

Wąski dom, barokowy, pierwsza tercja XVII wieku. Cegła i kamień. Można wątpić, czy to szyld handlowy. Na szczycie mały otwór łukowy, kamienna oprawa, zwornik z monogramem IHS. Być może dawny dom gościnny, albo schronienie.`,
  ar: `في الأعلى، فوق النوافذ: جبهتان من الحجر الجيري. كل واحدة تحمل زخرفة في الوسط، بلا كتابة. على اليسار، البجعة في وسط إكليل من الخضرة. على اليمين، الطاووس فاتحاً ذيله، داخل درع.

منزل ضيق، باروكي، الثلث الأول من القرن السابع عشر. آجر وحجر. يمكن الشك في أن تكون لافتة تجارية. على المثلث العلوي فتحة مقوسة صغيرة، إطار حجري، مفتاح عليه حرف IHS. ربما بيت استقبال قديم، أو ملجأ.`,
  cn: `高处，窗户上方：两座石灰岩山花。各有一个纹样居中，无铭文。左边，天鹅在绿叶冠中央。右边，孔雀开屏，嵌在盾形饰里。

窄屋，巴洛克，十七世纪前三分之一。砖和石。可以怀疑这不是商业招牌。山墙上有一小拱口，石框，拱心石刻着 IHS。也许曾是接待所，或庇护所。`,
  jp: `高い位置、窓の上：石灰岩のペディメントが二つ。それぞれ中央に図像、銘文なし。左は緑の冠の中央に白鳥。右は車輪を広げた孔雀、盾形の中。

狭い家、バロック、十七世紀前三分の一。煉瓦と石。商いの看板かどうか、疑ってよい。破風に小さなアーチ開口、石の枠、要石に IHS。かつての受け入れの家、あるいは避難所かもしれない。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'au_paon_et_au_cygne.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'au_paon_et_au_cygne.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `AuPaonEtAuCygne_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bCROIX D OR\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
  }
  console.log('tts', lang, text.slice(0, 120).replace(/\n/g, ' '));
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
