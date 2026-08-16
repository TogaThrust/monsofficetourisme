/**
 * La Belle Plebeienne : texte long réécrit (sans répéter le court),
 * Harvent lu Artvent en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-belle-plebeienne.mjs
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

const NAME = 'La Belle Plebeienne';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Avenue Reine Astrid, entrée du parc du Waux-Hall, 7000 Mons.';
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

const FR_LONG_BODY = `Une femme, nue, debout, les mains aux hanches. Le visage tourné vers sa gauche. Le bronze est sombre. Deux blocs de pierre grise, bruts, pour socle. Derrière, la pelouse monte : parterres rouge et blanc, le pavillon rose, la tour à l’horloge, les grands arbres.

On l’a d’abord appelée Nora. En 1949, sous ce nom, le Prix du Hainaut. Le plâtre a été remanié en 1952-1953, puis détruit. Au socle : RENÉ HARVENT, CIE DES BRONZES. Parmi les dernières fontes de la Compagnie, à Molenbeek, avant la fermeture.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `A woman, nude, standing, hands on her hips. The face turned to her left. The bronze is dark. Two blocks of grey stone, rough, for a pedestal. Behind, the lawn rises: red and white flowerbeds, the pink pavilion, the clock tower, the tall trees.

She was first called Nora. In 1949, under that name, the Hainaut Prize. The plaster was reworked in 1952-1953, then destroyed. On the pedestal: RENÉ HARVENT, CIE DES BRONZES. Among the last casts of the Compagnie, in Molenbeek, before it closed.`,
  nl: `Een vrouw, naakt, rechtop, de handen in de zij. Het gezicht naar haar links gewend. Het brons is donker. Twee blokken grijs steen, ruw, als sokkel. Achteraan stijgt het gazon: rode en witte perkjes, het roze paviljoen, de toren met klok, de hoge bomen.

Ze heette eerst Nora. In 1949, onder die naam, de Prix du Hainaut. Het gips werd in 1952-1953 herwerkt, daarna vernietigd. Op de sokkel: RENÉ HARVENT, CIE DES BRONZES. Bij de laatste gietsels van de Compagnie, in Molenbeek, voor de sluiting.`,
  de: `Eine Frau, nackt, aufrecht, die Hände in die Hüften gestemmt. Das Gesicht nach ihrer Linken gewandt. Die Bronze ist dunkel. Zwei Blöcke grauen Steins, roh, als Sockel. Dahinter steigt der Rasen: rote und weiße Beete, der rosa Pavillon, der Turm mit Uhr, die hohen Bäume.

Zuerst hieß sie Nora. 1949, unter diesem Namen, der Prix du Hainaut. Der Gips wurde 1952-1953 überarbeitet, dann zerstört. Am Sockel: RENÉ HARVENT, CIE DES BRONZES. Unter den letzten Güssen der Compagnie, in Molenbeek, vor der Schließung.`,
  it: `Una donna, nuda, in piedi, le mani sui fianchi. Il viso volto verso la sua sinistra. Il bronzo è scuro. Due blocchi di pietra grigia, grezzi, per basamento. Dietro, il prato sale: aiuole rosse e bianche, il padiglione rosa, la torre con l’orologio, i grandi alberi.

Prima si chiamava Nora. Nel 1949, con quel nome, il Prix du Hainaut. Il gesso fu rielaborato nel 1952-1953, poi distrutto. Sul basamento: RENÉ HARVENT, CIE DES BRONZES. Tra le ultime fusioni della Compagnie, a Molenbeek, prima della chiusura.`,
  es: `Una mujer, desnuda, de pie, las manos en las caderas. El rostro vuelto hacia su izquierda. El bronce es oscuro. Dos bloques de piedra gris, toscos, como peana. Detrás, el césped sube: parterres rojo y blanco, el pabellón rosa, la torre del reloj, los grandes árboles.

Primero se llamó Nora. En 1949, con ese nombre, el Prix du Hainaut. El yeso se reelaboró en 1952-1953, luego se destruyó. En la peana: RENÉ HARVENT, CIE DES BRONZES. Entre las últimas fundiciones de la Compagnie, en Molenbeek, antes del cierre.`,
  pl: `Kobieta, naga, stojąca, ręce na biodrach. Twarz zwrócona w jej lewo. Brąz jest ciemny. Dwa bloki szarego kamienia, surowe, jako cokoł. Z tyłu trawnik się wznosi: rabaty czerwone i białe, różowy pawilon, wieża z zegarem, wysokie drzewa.

Najpierw nazywano ją Nora. W 1949, pod tą nazwą, Prix du Hainaut. Gips przerobiono w latach 1952-1953, potem zniszczono. Na cokole: RENÉ HARVENT, CIE DES BRONZES. Wśród ostatnich odlewów Compagnie, w Molenbeek, przed zamknięciem.`,
  ar: `امرأة عارية، واقفة، اليدان على الوركين. الوجه ملتفت نحو يسارها. البرونز داكن. كتلتان من الحجر الرمادي الخشن تشكلان القاعدة. خلفها يرتفع العشب: أحواض حمراء وبيضاء، الجناح الوردي، البرج ذو الساعة، الأشجار العالية.

سمّيت أولا Nora. سنة 1949، بهذا الاسم، جائزة هينو. أُعيد تشكيل الجص بين 1952 و1953 ثم دُمّر. على القاعدة: RENÉ HARVENT، CIE DES BRONZES. من أواخر مسبوكات الشركة في مولينبيك، قبل الإغلاق.`,
  cn: `一个女人，裸体，站立，双手叉腰。脸转向她的左侧。青铜颜色深暗。两块粗糙的灰色石块作基座。身后草坪升起：红白花坛、粉色楼阁、带时钟的塔楼、高大的树木。

她起初叫Nora。1949年，以此名获得埃诺奖。石膏像在1952-1953年被改过，随后毁掉。基座上：RENÉ HARVENT，CIE DES BRONZES。属于该公司在莫伦贝克关闭前的最后一批浇铸。`,
  jp: `女性、裸、直立、両手を腰に。顔は彼女の左へ向く。青銅は暗い。粗い灰色の石が二つ、台座になる。後ろで芝生が上る：赤と白の花壇、ピンクのパヴィリオン、時計の塔、高い木々。

最初はNoraと呼ばれた。1949年、その名でエノー賞。石膏は1952-1953年に作り直され、その後壊された。台座に：RENÉ HARVENT、CIE DES BRONZES。モレンベークの会社が閉じる前の、最後の鋳造のひとつ。`,
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

const frSpoken = ttsText(`${FR_LONG_BODY}\n\n${ADDRESS_LABEL.fr} ${ADDRESS}`, 'fr');
if (!frSpoken.includes('Artvent')) throw new Error('TTS FR sans Artvent');
if (/\bHarvent\b/.test(frSpoken)) throw new Error('TTS FR contient encore Harvent');
console.log('tts fr ok Artvent');

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
fs.writeFileSync(path.join(ROOT, 'data', 'la_belle_plebeienne.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'la_belle_plebeienne.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `LaBellePlebeienne_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && !text.includes('Artvent')) throw new Error('audio FR sans Artvent');
  if (lang === 'fr' && /\bHarvent\b/.test(text)) throw new Error('audio FR contient encore Harvent');
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
