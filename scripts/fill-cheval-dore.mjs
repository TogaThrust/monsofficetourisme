/**
 * Cheval Dore : texte long réécrit (sans répéter le court),
 * Buef lu Bœuf en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-cheval-dore.mjs
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

const NAME = 'Cheval Dore';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue du Parc 19, 7000 Mons.';
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

const FR_LONG_BODY = `En profil, vers la gauche : quatre pieds au sol, crinière, queue tombante. Calcaire usé. Aucune inscription. La dorure ne se lit plus sur la pierre. Un arc de brique la cale, au-dessus de la porte.

Maison du XVIIe, brique et pierre. En 1543, les archives disent « Au Buef ». La pierre, aujourd’hui, porte un cheval. Restauration en 1934.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `In profile, facing left: all four feet on the ground, mane, hanging tail. Worn limestone. No inscription. The gilding no longer reads on the stone. A brick arch holds it, above the door.

A seventeenth-century house, brick and stone. In 1543, the archives call it « Au Buef ». The stone, today, bears a horse. Restored in 1934.`,
  nl: `In profiel, naar links: vier hoeven op de grond, manen, hangende staart. Versleten kalksteen. Geen opschrift. Het verguldsel is op de steen niet meer te lezen. Een bakstenen boog houdt hem vast, boven de deur.

Huis uit de zeventiende eeuw, baksteen en steen. In 1543 noemen de archieven het « Au Buef ». De steen toont vandaag een paard. Restauratie in 1934.`,
  de: `Im Profil, nach links: vier Hufe am Boden, Mähne, hängender Schweif. Abgenutzter Kalkstein. Keine Inschrift. Die Vergoldung liest sich auf dem Stein nicht mehr. Ein Ziegelbogen hält ihn, über der Tür.

Haus des 17. Jahrhunderts, Ziegel und Stein. 1543 nennen die Archive es « Au Buef ». Der Stein trägt heute ein Pferd. Restaurierung 1934.`,
  it: `Di profilo, verso sinistra: quattro zampe a terra, criniera, coda cadente. Calcare consunto. Nessuna iscrizione. La doratura non si legge più sulla pietra. Un arco di mattoni la tiene, sopra la porta.

Casa del XVII secolo, mattone e pietra. Nel 1543 gli archivi la dicono « Au Buef ». La pietra, oggi, porta un cavallo. Restauro nel 1934.`,
  es: `De perfil, hacia la izquierda: cuatro patas en el suelo, crin, cola caída. Caliza desgastada. Ninguna inscripción. El dorado ya no se lee en la piedra. Un arco de ladrillo la sujeta, encima de la puerta.

Casa del siglo XVII, ladrillo y piedra. En 1543, los archivos la llaman « Au Buef ». La piedra, hoy, lleva un caballo. Restauración en 1934.`,
  pl: `Z profilu, w lewo: cztery kopyta na ziemi, grzywa, opadający ogon. Zużyty wapień. Żadnego napisu. Złocenie nie czyta się już na kamieniu. Ceglany łuk go trzyma, nad drzwiami.

Dom z XVII wieku, cegła i kamień. W 1543 archiwa nazywają go « Au Buef ». Kamień dziś nosi konia. Renowacja w 1934.`,
  ar: `جانبياً، نحو اليسار: أربع قوائم على الأرض، عرف، ذيل متدلٍ. حجر جيري متآكل. لا نقش. الذهب لم يعد يُقرأ على الحجر. قوس من الآجر يثبّته، فوق الباب.

منزل من القرن السابع عشر، آجر وحجر. في 1543 تسمّيه الأرشيفات « Au Buef ». الحجر اليوم يحمل حصاناً. ترميم سنة 1934.`,
  cn: `侧面，朝左：四蹄着地，鬃毛，垂尾。磨损的石灰岩。没有铭文。石头上看不出镀金。砖拱把它卡住，在门上方。

十七世纪的房子，砖和石。1543年，档案称之为« Au Buef »。石头上，如今是一匹马。1934年修复。`,
  jp: `横顔、左向き：四本の脚は地面、たてがみ、垂れた尾。摩耗した石灰岩。銘文はない。金彩は石に読めない。煉瓦のアーチが、扉の上でそれを留めている。

十七世紀の家、煉瓦と石。1543年、文書は« Au Buef »と呼ぶ。石は、いま馬を載せる。1934年に修復。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'cheval_dore.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'cheval_dore.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ChevalDore_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bBuef\b/.test(text))) {
    throw new Error('TTS FR mal lu : ' + text);
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
