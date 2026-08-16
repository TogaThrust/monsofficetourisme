/**
 * Cantoria Roland de Lassus : texte long réécrit (sans répéter le court),
 * LASSVS / mvnich en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-cantoria-lassus.mjs
 *
 * Sources : photo images/Cantoria_Roland_de_Lassus.jpg
 *   + BE-monumen (fiche Cantoria Mons : bronze, C.LEROY, 12 sept. 1970,
 *     Fonderia Brotal Mendrisio, 1853 Frison fondue 1918)
 *   + vanderkrogt (A ROLAND DE LASSVS mons 1532 mvnich 1594 ;
 *     c leroy cera persa | brotal | mendrisio)
 *   + Connaître la Wallonie (Fêtes de Wallonie, socle, pied collégiale)
 *   + SAAMB (Square Roosevelt)
 * Ne pas voler : Collégiale Sainte-Waudru (emplacement OK), Saint-Nicolas-en-Havré,
 *   Place du Parc, statue Frison comme sujet.
 * Écarter : cours cantoria italienne ; querelle Delattre ; enlèvements / Gonzague /
 *   soprano Saint-Nicolas ; illusion sonore vent / collégiale / banc.
 * Quiz : inchangé (bronze / 1970 / rue du Chapitre).
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

const NAME = 'Cantoria Roland de Lassus';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Square Roosevelt, rue du Chapitre, 7000 Mons.';
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

const FR_LONG_BODY = `Trois figures de bronze, allongées, serrées. Drapés longs, plis verticaux, jusqu’aux pieds. Patine sombre, un peu verte. Ils tiennent ensemble un livre ouvert, une partition. Le groupe pose sur un socle bas, pierre claire, un rectangle mince. Sur la face, gravé en capitales : A ROLAND DE LASSVS. Le V pour le U. Puis mons 1532, mvnich 1594. Au bronze, signé C. LEROY. Cire perdue. Fonderia Brotal, Mendrisio.

Il remplace une statue de 1853, Barthélemy Frison, fondue par l’occupant allemand en 1918. Inauguré le 12 septembre 1970, aux Fêtes de Wallonie. Square Roosevelt, au pied de Sainte-Waudru.`;

/** Traductions figées. Inscriptions du socle inchangées. Pas de notice de collégiale. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Three bronze figures, elongated, pressed together. Long draperies, vertical folds, down to the feet. A dark patina, a little green. Together they hold an open book, a score. The group stands on a low plinth, pale stone, a thin rectangle. On the face, carved in capitals: A ROLAND DE LASSVS. V for U. Then mons 1532, mvnich 1594. On the bronze, signed C. LEROY. Lost wax. Fonderia Brotal, Mendrisio.

It replaces an 1853 statue, Barthélemy Frison, melted down by the German occupier in 1918. Inaugurated on 12 September 1970, during the Fêtes de Wallonie. Square Roosevelt, at the foot of Sainte-Waudru.`,
  nl: `Drie bronzen figuren, langgerekt, tegen elkaar aangedrukt. Lange draperieën, verticale plooien, tot aan de voeten. Donkere patina, een beetje groen. Samen houden ze een open boek vast, een partituur. De groep staat op een lage sokkel, lichte steen, een dunne rechthoek. Op de voorkant, in kapitalen gegraveerd: A ROLAND DE LASSVS. De V voor de U. Daarna mons 1532, mvnich 1594. Op het brons, gesigneerd C. LEROY. Verloren was. Fonderia Brotal, Mendrisio.

Het vervangt een standbeeld uit 1853, Barthélemy Frison, omgesmolten door de Duitse bezetter in 1918. Ingehuldigd op 12 september 1970, tijdens de Fêtes de Wallonie. Square Roosevelt, aan de voet van Sainte-Waudru.`,
  de: `Drei Bronzefiguren, gestreckt, eng zusammengedrängt. Lange Gewänder, senkrechte Falten, bis zu den Füßen. Dunkle Patina, etwas grün. Zusammen halten sie ein aufgeschlagenes Buch, eine Partitur. Die Gruppe steht auf einem niedrigen Sockel, heller Stein, ein dünnes Rechteck. Auf der Vorderseite, in Kapitalen gemeißelt: A ROLAND DE LASSVS. Das V für das U. Dann mons 1532, mvnich 1594. Auf der Bronze, signiert C. LEROY. Wachsausschmelzung. Fonderia Brotal, Mendrisio.

Es ersetzt eine Statue von 1853, Barthélemy Frison, 1918 vom deutschen Besatzer eingeschmolzen. Eingeweiht am 12. September 1970, zu den Fêtes de Wallonie. Square Roosevelt, am Fuß von Sainte-Waudru.`,
  it: `Tre figure di bronzo, allungate, strette l'una all'altra. Drappeggio lungo, pieghe verticali, fino ai piedi. Patina scura, un po' verde. Tengono insieme un libro aperto, una partitura. Il gruppo poggia su un basamento basso, pietra chiara, un rettangolo sottile. Sulla faccia, inciso in capitali: A ROLAND DE LASSVS. La V al posto della U. Poi mons 1532, mvnich 1594. Sul bronzo, firmato C. LEROY. Cera persa. Fonderia Brotal, Mendrisio.

Sostituisce una statua del 1853, Barthélemy Frison, fusa dall'occupante tedesco nel 1918. Inaugurato il 12 settembre 1970, alle Fêtes de Wallonie. Square Roosevelt, ai piedi di Sainte-Waudru.`,
  es: `Tres figuras de bronce, alargadas, apretadas. Drapeados largos, pliegues verticales, hasta los pies. Pátina oscura, un poco verde. Sostienen juntos un libro abierto, una partitura. El grupo reposa sobre un zócalo bajo, piedra clara, un rectángulo delgado. En la cara, grabado en capitales: A ROLAND DE LASSVS. La V por la U. Luego mons 1532, mvnich 1594. En el bronce, firmado C. LEROY. Cera perdida. Fonderia Brotal, Mendrisio.

Sustituye una estatua de 1853, Barthélemy Frison, fundida por el ocupante alemán en 1918. Inaugurado el 12 de septiembre de 1970, en las Fêtes de Wallonie. Square Roosevelt, al pie de Sainte-Waudru.`,
  pl: `Trzy brązowe postaci, wydłużone, ściśnięte. Długie draperie, pionowe fałdy, aż do stóp. Ciemna patyna, trochę zielona. Razem trzymają otwartą księgę, partyturę. Grupa stoi na niskim cokole, jasny kamień, cienki prostokąt. Na froncie, wyryte kapitalikami: A ROLAND DE LASSVS. V zamiast U. Potem mons 1532, mvnich 1594. Na brązie podpis C. LEROY. Wosk tracony. Fonderia Brotal, Mendrisio.

Zastępuje posąg z 1853, Barthélemy Frison, przetopiony przez niemieckiego okupanta w 1918. Odsłonięty 12 września 1970, podczas Fêtes de Wallonie. Square Roosevelt, u stóp Sainte-Waudru.`,
  ar: `ثلاث شخصيات من البرونز، ممدودة، متلاصقة. طيات طويلة، ثنيات عمودية، حتى القدمين. زنجار قاتم، يميل قليلاً إلى الأخضر. يمسكون معاً كتاباً مفتوحاً، مدوّنة موسيقية. المجموعة تقوم على قاعدة منخفضة، حجر فاتح، مستطيل رقيق. على الوجه، محفور بأحرف كبيرة: A ROLAND DE LASSVS. حرف V بدل U. ثم mons 1532، mvnich 1594. على البرونز توقيع C. LEROY. شمع ضائع. Fonderia Brotal، Mendrisio.

يحل محل تمثال من سنة 1853، Barthélemy Frison، أذابه المحتل الألماني سنة 1918. دُشّن في 12 أيلول 1970، في Fêtes de Wallonie. Square Roosevelt، عند سفح Sainte-Waudru.`,
  cn: `三尊青铜人像，细长，挤在一起。长衣褶，竖向褶皱，垂到脚。深色包浆，略带绿。他们一起捧着一本打开的书，一份乐谱。群像立在低矮基座上，浅色石头，薄长方。正面大写刻着：A ROLAND DE LASSVS。V 代替 U。然后是 mons 1532，mvnich 1594。青铜上署名 C. LEROY。失蜡法。Fonderia Brotal，Mendrisio。

它取代一尊1853年的雕像，Barthélemy Frison，1918年被德国占领军熔化。1970年9月12日揭幕，在 Fêtes de Wallonie 期间。Square Roosevelt，在 Sainte-Waudru 脚下。`,
  jp: `三体の青銅像、細長く、寄り添う。長いドレープ、縦のひだ、足まで。暗いパティナ、少し緑。開いた本、楽譜を一緒に持つ。群像は低い台座の上、白い石、薄い長方形。正面に大文字で刻まれている：A ROLAND DE LASSVS。V は U の代わり。それから mons 1532、mvnich 1594。青銅に署名 C. LEROY。ロストワックス。Fonderia Brotal、Mendrisio。

1853年の像に代わる。Barthélemy Frison。1918年、ドイツ占領軍が溶かした。1970年9月12日、Fêtes de Wallonie で除幕。Square Roosevelt、Sainte-Waudru の麓。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'cantoria_roland_de_lassus.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'cantoria_roland_de_lassus.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `CantoriaRolandDeLassus_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (/\bLASSVS\b/.test(text) || /\bmvnich\b/.test(text) || /\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bIHS\b/.test(text) || /\bGillis\b/.test(text) || /\bHarvent\b/.test(text) || /\bBertaimont\b/.test(text)) {
      throw new Error('TTS FR mal lu : ' + text);
    }
    if (/\bWaudru\b/.test(text)) throw new Error('Waudru TTS cassé : ' + text);
    if (!/Wô-dru/.test(text)) throw new Error('Wô-dru manquant : ' + text);
  }
  console.log('tts', lang, text.slice(0, 200).replace(/\n/g, ' '));
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  const dest = path.join(ROOT, 'dist', 'audio', path.basename(out));
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(out));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
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
