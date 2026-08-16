/**
 * A la Ville d'Avesnes : texte long réécrit (sans répéter le court),
 * AVESNE/AVESNES lus Avesnes (FR : A-vè-nes), traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-ville-avesnes.mjs
 *
 * Sources : Yannart (monsblog, n°55) + photo POI images/A_la_Ville_dAvesnes.jpg
 *   + gevelstenen (Grand'Rue 70, motif « stadsgezicht », OPSCHRIFT A LA VILLE D'AVESNE 1724).
 * Connaître la Wallonie : pas de fiche dédiée au n°70.
 * Ne pas voler : Le Gant 95 ; À la Couronne 102 ; BF IHS IL 104 ; autres Grand-Rue.
 * Écarter : pierre Tournai/Soignies, baroque/Régence ; Maison d’Avesnes XIIIe-XIVe ;
 *   Pyrénées 1659, Vauban, Pays-Bas autrichiens, frontière Louis XIV ;
 *   Napoléon, analphabétisme, « face à la Ville d’Avesnes » ;
 *   auberge/relais/draps « fortement suggéré » ; rival français, sièges,
 *   survivant des vitrines, CTA Yannart.
 * Quiz : inchangé (représentation d'Avesnes / 1724 / Grand'Rue).
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

const NAME = "A la Ville d'Avesnes";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Grand'Rue 70, 7000 Mons.";
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

const FR_LONG_BODY = `Sous l’appui de la fenêtre centrale du niveau supérieur, l’allège de pierre calcaire porte un panneau aux contours chantournés. Au centre, une ville fortifiée : remparts en bas, une porte voûtée à droite, des tours et des clochers, dont un plus haut, à lanterne. À gauche, gravé : A LA VILLE. À droite : D AVESNE.

Le millésime se partage sous les mots, 17 d’un côté, 24 de l’autre. Graphie ancienne, sans S final : AVESNE. La pierre est scellée au-dessus d’un arc de façade.`;

/** Traductions figées. Inscription pierre : D AVESNE (sans S). Pas Gant / Couronne / IHS. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Under the sill of the central window on the upper floor, the limestone allège bears a panel with cut-out, chantourné contours. In the centre, a fortified town: ramparts below, a vaulted gate to the right, towers and steeples, one of them taller, with a lantern. On the left, carved: A LA VILLE. On the right: D AVESNE.

The date is split under the words, 17 on one side, 24 on the other. Old spelling, no final S: AVESNE. The stone is set above a façade arch.`,
  nl: `Onder de dorpel van het middelste venster op het bovenste niveau draagt de allège van kalksteen een paneel met geschulpte, chantourné contouren. In het midden een vestingstad: onderaan wallen, rechts een gewelfde poort, torens en kerktorens, waarvan één hoger, met een lantaarn. Links gegraveerd: A LA VILLE. Rechts: D AVESNE.

Het jaartal splitst zich onder de woorden, 17 aan de ene kant, 24 aan de andere. Oude spelling, zonder slot-S: AVESNE. De steen is gezet boven een gevelboog.`,
  de: `Unter der Sohlbank des mittleren Fensters im oberen Geschoss trägt die Allège aus Kalkstein eine Tafel mit ausgeschnittenen, chantourné Konturen. In der Mitte eine befestigte Stadt: unten Wälle, rechts ein gewölbtes Tor, Türme und Kirchtürme, einer davon höher, mit einer Laterne. Links gemeißelt: A LA VILLE. Rechts: D AVESNE.

Die Jahreszahl teilt sich unter den Wörtern, 17 auf der einen Seite, 24 auf der anderen. Alte Schreibweise, ohne Schluss-S: AVESNE. Der Stein sitzt über einem Fassadenbogen.`,
  it: `Sotto il davanzale della finestra centrale al livello superiore, l'allège in pietra calcarea porta un pannello dai contorni ritagliati, chantournés. Al centro, una città fortificata: in basso le mura, a destra una porta voltata, torri e campanili, uno più alto, a lanterna. A sinistra, inciso: A LA VILLE. A destra: D AVESNE.

Il millesimo si divide sotto le parole, 17 da una parte, 24 dall'altra. Grafia antica, senza S finale: AVESNE. La pietra è fissata sopra un arco di facciata.`,
  es: `Bajo el alféizar de la ventana central del nivel superior, el allège de piedra caliza lleva un panel de contornos recortados, chantournés. En el centro, una villa fortificada: abajo las murallas, a la derecha una puerta abovedada, torres y campanarios, uno más alto, con linterna. A la izquierda, grabado: A LA VILLE. A la derecha: D AVESNE.

El milésimo se reparte bajo las palabras, 17 a un lado, 24 al otro. Grafía antigua, sin S final: AVESNE. La piedra está sellada encima de un arco de fachada.`,
  pl: `Pod parapetem środkowego okna na wyższej kondygnacji allège z wapienia niesie panel o wyciętych, chantournés konturach. Pośrodku miasto warowne: u dołu mury, po prawej sklepiona brama, wieże i dzwonnice, jedna wyższa, z latarnią. Po lewej wyryte: A LA VILLE. Po prawej: D AVESNE.

Data dzieli się pod słowami, 17 z jednej strony, 24 z drugiej. Dawna pisownia, bez końcowego S: AVESNE. Kamień osadzony jest nad łukiem elewacji.`,
  ar: `تحت عتبة النافذة الوسطى في المستوى الأعلى، تحمل أليج الحجر الجيري لوحة بخطوط مقصوصة، chantournés. في الوسط، مدينة محصّنة: أسفلها أسوار، وإلى اليمين باب معقود، وأبراج وأجراس، أحدها أعلى، بفانوس. على اليسار محفور: A LA VILLE. على اليمين: D AVESNE.

السنة تتوزّع تحت الكلمات، 17 من جهة و24 من أخرى. كتابة قديمة، بلا سين أخيرة: AVESNE. الحجر مثبت فوق قوس الواجهة.`,
  cn: `上层正中窗台之下，石灰岩窗裙（allège）托着一块轮廓镂空、chantourné 的石板。正中是一座设防的城：下方城墙，右侧一座拱门，塔楼与钟楼，其中一座更高，带灯笼顶。左侧刻着：A LA VILLE。右侧：D AVESNE。

年号分刻在字下，一边 17，一边 24。旧写法，没有词尾 S：AVESNE。石头嵌在立面拱券之上。`,
  jp: `上層中央の窓の下、石灰岩の窓台下石（allège）が、切り抜かれた chantourné の輪郭のパネルを支える。中央は城塞都市：下に城壁、右にアーチ門、塔と鐘楼、その一つは高く、ランタン付き。左に刻まれている：A LA VILLE。右に：D AVESNE。

年号は語の下で分かれる。一方に 17、他方に 24。古い綴り、末尾の S なし：AVESNE。石はファサードのアーチの上に据えられている。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_ville_davesnes.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_ville_davesnes.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaVilleDAvesnes_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bAVESNES\b/.test(text) || /\bAVESNE\b/.test(text) || /\bA LA VILLE D\b/.test(text)) {
    throw new Error('inscription non lue (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (
      /\bClef\b/.test(text) ||
      /\bTETE\b/.test(text) ||
      /\bTETTE\b/.test(text) ||
      /Bertaimont/.test(text) ||
      /\bGillis\b/.test(text) ||
      /\bHarvent\b/.test(text) ||
      /CROIX D OR/.test(text) ||
      /\bIHS\b/.test(text)
    ) {
      throw new Error('TTS FR mal lu (Clef/TETE/Gillis/Harvent/CROIX/IHS) : ' + text);
    }
    if (!/A-vè-nes/.test(text) || !/À la Ville/.test(text)) {
      throw new Error('TTS FR Avesnes/Ville manquant : ' + text);
    }
    if (/\bavèn\b/i.test(text)) {
      throw new Error('TTS FR avèn faux : ' + text);
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
fs.mkdirSync(path.join(ROOT, 'dist', 'scripts'), { recursive: true });
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('done');
