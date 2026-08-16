/**
 * Croix plume et pinceau : texte long réécrit (sans répéter le court),
 * Puissant / gayole à pinchons lus en TTS FR, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-croix-plume-pinceau.mjs
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

const NAME = 'Croix plume et pinceau';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue Terre du Prince 3, 7000 Mons.';
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

const GAYOLE = '« gayole à pinchons »';

const FR_LONG_BODY = `Au-dessus de la porte, la baie d’imposte : fer forgé, élégamment contourné. Au centre, un médaillon, un fond cerclé. Un pinceau et une plume d’oie s’y croisent, accrochés à une croix.

Le chanoine Puissant y a vécu. Humaniste, protecteur du patrimoine architectural et artistique. Il appelait cette maison sa ${GAYOLE}.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Above the door, the transom: wrought iron, elegantly scrolled. At the centre, a medallion, a circled field. A paintbrush and a goose quill cross there, fastened to a cross.

Canon Puissant lived in this house. A humanist, a protector of architectural and artistic heritage. He called the house his ${GAYOLE}.`,
  nl: `Boven de deur, het bovenlicht: smeedijzer, elegant gewelfd. In het midden een medaillon, een omcirkeld veld. Een penseel en een ganzenveer kruisen er, vastgemaakt aan een kruis.

Kanunnik Puissant woonde in dit huis. Humanist, beschermer van het architecturale en artistieke erfgoed. Hij noemde het huis zijn ${GAYOLE}.`,
  de: `Über der Tür das Oberlicht: Schmiedeeisen, elegant geschwungen. In der Mitte ein Medaillon, ein gerundetes Feld. Ein Pinsel und eine Gänsefeder kreuzen sich dort, an einem Kreuz befestigt.

Kanoniker Puissant hat in diesem Haus gelebt. Humanist, Beschützer des architektonischen und künstlerischen Erbes. Er nannte das Haus seine ${GAYOLE}.`,
  it: `Sopra la porta, la soprapporta: ferro battuto, elegantemente contorto. Al centro, un medaglione, un fondo cerchiato. Un pennello e una penna d'oca vi si incrociano, agganciati a una croce.

Il canonico Puissant visse in questa casa. Umanista, protettore del patrimonio architettonico e artistico. Chiamava questa casa la sua ${GAYOLE}.`,
  es: `Encima de la puerta, el montante: hierro forjado, elegantemente contorneado. En el centro, un medallón, un fondo cercado. Un pincel y una pluma de oca se cruzan allí, sujetos a una cruz.

El canónigo Puissant vivió en esta casa. Humanista, protector del patrimonio arquitectónico y artístico. Llamaba a esta casa su ${GAYOLE}.`,
  pl: `Nad drzwiami, naświetle: kute żelazo, elegancko wygięte. W środku medalion, pole w kole. Pędzel i gęsie pióro krzyżują się tam, zaczepione o krzyż.

Kanonik Puissant mieszkał w tym domu. Humanista, obrońca dziedzictwa architektonicznego i artystycznego. Nazywał ten dom swoją ${GAYOLE}.`,
  ar: `فوق الباب، في الواجهة العلوية: حديد مطروق، منحنى بأناقة. في الوسط، ميدالية، حقل محاط بدائرة. فرشاة وريشة إوز تتقاطعان هناك، معلقتان على صليب.

عاش القمص Puissant في هذا البيت. إنساني، حامٍ للتراث المعماري والفني. كان يسمي هذا البيت ${GAYOLE}.`,
  cn: `门上方，亮窗里：锻铁，优雅地弯曲。正中一块圆徽，圈起的底。一支画笔和一根鹅毛笔在那里交叉，挂在十字架上。

普伊桑神父住过这所房子。人文主义者，建筑与艺术遗产的保护者。他称这所房子为他的${GAYOLE}。`,
  jp: `扉の上、欄間に：鍛鉄、優雅に湾曲している。中央にメダリオン、円で囲まれた地。絵筆と鵞ペンがそこで交わり、十字架に掛けられている。

プイサン神父がこの家に住んだ。人文主義者、建築と芸術の遺産の保護者。この家を自分の${GAYOLE}と呼んでいた。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'croix_plume_et_pinceau.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'croix_plume_et_pinceau.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `CroixPlumeEtPinceau_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /Bertaimont/.test(text)) {
      throw new Error('TTS FR mal lu (Clef/TETE/Bertaimont) : ' + text);
    }
    if (/\bPuissant\b/.test(text) || /puissamment/i.test(text)) {
      throw new Error('TTS FR Puissant mal lu : ' + text);
    }
    if (!/Pui-ssant/.test(text) || !/ga-yole à pin-chons/.test(text)) {
      throw new Error('TTS FR substitutions manquantes : ' + text);
    }
    if (/gayole à pinchons/.test(text)) {
      throw new Error('TTS FR gayole non substitué : ' + text);
    }
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
