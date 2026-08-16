/**
 * A la Croix d'Or Croix-Place : texte long réécrit (sans répéter le court),
 * A LA CROIX D'OR lu À la Croix d'Or en TTS, traductions 10 langues, MP3 longs.
 *
 * Distinct de « La Croix d'Or Havre » (117 rue d'Havré, 1766). Ne pas mélanger.
 * Usage: node scripts/fill-croix-or-croix-place.mjs
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

const NAME = "A la Croix d'Or Croix-Place";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Croix-Place 3, 7000 Mons.';
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

const FR_LONG_BODY = `Enseigne de pierre, sur la façade de l’immeuble d’angle, du côté de la rue des Chartriers. Gravé, capitales : A LA CROIX D'OR. Le millésime, sur la même pierre, accompagne le nom.

L’angle a été profondément transformé : l’enseigne est neuve, taillée pour la façade refaite. Sur la place se tenait le marché au filet et au lin. Le nom Crois en l’Esplace est attesté dès 1399.`;

/** Traductions figées. Graphie A LA CROIX D'OR inchangée. Pas 117 rue d'Havré / 1766. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `A stone sign, on the facade of the corner building, on the rue des Chartriers side. Carved, capitals: A LA CROIX D'OR. The date, on the same stone, accompanies the name.

The corner was thoroughly remodelled: the sign is new, cut for the rebuilt facade. On the square stood the market for netting and linen. The name Crois en l'Esplace is attested as early as 1399.`,
  nl: `Stenen uithangbord, op de gevel van het hoekhuis, aan de kant van de rue des Chartriers. Gegraveerd, kapitalen: A LA CROIX D'OR. Het jaartal, op dezelfde steen, begeleidt de naam.

De hoek is grondig verbouwd: het uithangbord is nieuw, gehakt voor de herstelde gevel. Op het plein stond de markt voor netten en linnen. De naam Crois en l'Esplace is al in 1399 geattesteerd.`,
  de: `Steinschild, an der Fassade des Eckhauses, zur rue des Chartriers hin. Gemeißelt, Versalien: A LA CROIX D'OR. Die Jahreszahl, auf demselben Stein, begleitet den Namen.

Die Ecke wurde gründlich umgebaut: das Schild ist neu, für die erneuerte Fassade gehauen. Auf dem Platz stand der Markt für Netze und Leinen. Der Name Crois en l'Esplace ist schon 1399 bezeugt.`,
  it: `Insegna di pietra, sulla facciata dell'edificio d'angolo, lato rue des Chartriers. Inciso, maiuscole: A LA CROIX D'OR. Il millesimo, sulla stessa pietra, accompagna il nome.

L'angolo è stato profondamente trasformato: l'insegna è nuova, tagliata per la facciata rifatta. Sulla piazza si teneva il mercato del filet e del lino. Il nome Crois en l'Esplace è attestato dal 1399.`,
  es: `Letrero de piedra, en la fachada del inmueble de esquina, del lado de la rue des Chartriers. Grabado, mayúsculas: A LA CROIX D'OR. El milésimo, en la misma piedra, acompaña el nombre.

La esquina fue profundamente transformada: el letrero es nuevo, tallado para la fachada rehecha. En la plaza se celebraba el mercado de red y de lino. El nombre Crois en l'Esplace está atestiguado desde 1399.`,
  pl: `Kamienny szyld, na elewacji narożnej kamienicy, od strony rue des Chartriers. Wyryte, kapitaliki: A LA CROIX D'OR. Data, na tym samym kamieniu, towarzyszy nazwie.

Narożnik gruntownie przebudowano: szyld jest nowy, wyciosany do odnowionej elewacji. Na placu odbywał się targ sieci i lnu. Nazwa Crois en l'Esplace jest poświadczona od 1399.`,
  ar: `لافتة حجرية، على واجهة المبنى عند الزاوية، من جهة rue des Chartriers. محفور بأحرف كبيرة: A LA CROIX D'OR. السنة المنحوتة، على الحجر نفسه، ترافق الاسم.

أُعيد تشكيل الزاوية بعمق: اللافتة جديدة، منحوتة للواجهة المجدَّدة. في الساحة كان يُقام سوق الشباك والكتان. اسم Crois en l'Esplace ثابت منذ سنة 1399.`,
  cn: `石质招牌，嵌在转角楼立面，靠 rue des Chartriers 一侧。阴刻大写：A LA CROIX D'OR。年号刻在同一块石头上，跟着店名。

转角被彻底改建：招牌是新的，为重做的立面而凿。广场上曾有网与亚麻集市。Crois en l'Esplace 这一名称自1399年即有记载。`,
  jp: `石の看板、角の建物のファサード、rue des Chartriers 側。大文字で刻まれている：A LA CROIX D'OR。年号は同じ石に、名に添えてある。

角は大きく改修された：看板は新しい、作り直したファサードのために彫られた。広場では網と亜麻の市が立っていた。Crois en l'Esplace という名は1399年から確認される。`,
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

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_croix_dor_croix-place.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_croix_dor_croix-place.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaCroixDOrCroixPlace_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (/\bA LA CROIX D['’]?OR\b/.test(text) || /\bA LA CROIX D OR\b/.test(text)) {
      throw new Error('TTS FR mal lu (A LA CROIX D OR) : ' + text);
    }
    if (/\bClef\b/.test(text) || /\bTETTE\b/.test(text) || /\bTETE\b/.test(text) || /\bTaette\b/.test(text)) {
      throw new Error('TTS FR casse une règle : ' + text);
    }
  }
  console.log('tts', lang, text.slice(0, 90).replace(/\n/g, ' '));
  try { fs.unlinkSync(out); } catch {}
  await synthesizeSpeechMp3(text, out, { lang: POLLY_LANG[lang] || lang });
  copyViaTmp(out, path.join(ROOT, 'dist', 'audio', path.basename(out)));
  console.log('audio long', lang, fs.statSync(out).size);
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
