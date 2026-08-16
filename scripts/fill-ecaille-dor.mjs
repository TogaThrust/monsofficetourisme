/**
 * A l'Ecaille d'Or : texte long réécrit (sans répéter le court),
 * A LÉ CAILLE lu À l'Écaille en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-ecaille-dor.mjs
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

const NAME = "A l'Ecaille d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue du Hautbois 22, 7000 Mons.';
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

const FR_LONG_BODY = `Le panneau tient l’allège de la fenêtre du milieu, au premier étage : un rectangle de calcaire, polychrome. Une coquille, striée, posée sur deux palmettes. À gauche, gravé : A LÉ CAILLE. À droite : D OR, puis le millésime. Lé, l’ancienne graphie.

Maison de style classique montois, milieu du XVIIIe. L’or du nom promettait le luxe, comme tant d’enseignes de la ville. L’écaille, ici, c’est la coquille.`;

/** Traductions figées : écaille = coquille (pas écaille de poisson / tortue). */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the allège of the middle window on the first floor: a rectangle of polychrome limestone. A shell, striated, set on two palmettes. On the left, carved: A LÉ CAILLE. On the right: D OR, then the year. Lé, the old spelling.

A house in Mons classical style, mid-eighteenth century. The gold in the name promised luxury, like so many signs in the city. The écaille, here, is the shell.`,
  nl: `Het paneel vormt de allège van het middelste raam op de eerste verdieping: een rechthoek van polychroom kalksteen. Een schelp, gestreept, geplaatst op twee palmetten. Links gegraveerd: A LÉ CAILLE. Rechts: D OR, daarna het jaartal. Lé, de oude spelling.

Een huis in klassieke Montoise stijl, midden achttiende eeuw. Het goud in de naam beloofde luxe, zoals zoveel uithangborden in de stad. De écaille is hier de schelp.`,
  de: `Die Tafel bildet die Allège des mittleren Fensters im ersten Stock: ein Rechteck aus polychromem Kalkstein. Eine Muschel, gerippt, auf zwei Palmetten gesetzt. Links eingemeißelt: A LÉ CAILLE. Rechts: D OR, dann die Jahreszahl. Lé, die alte Schreibweise.

Ein Haus im klassischen Mons-Stil, Mitte des 18. Jahrhunderts. Das Gold im Namen versprach Luxus, wie so viele Schilder in der Stadt. Die écaille ist hier die Muschel.`,
  it: `Il pannello occupa l'allège della finestra centrale al primo piano: un rettangolo di calcare policromo. Una conchiglia, striata, posata su due palmette. A sinistra, inciso: A LÉ CAILLE. A destra: D OR, poi l'anno. Lé, la grafia antica.

Casa in stile classico montois, metà del XVIII secolo. L'oro nel nome prometteva il lusso, come tante insegne della città. L'écaille, qui, è la conchiglia.`,
  es: `El panel ocupa el allège de la ventana del medio, en el primer piso: un rectángulo de caliza policromada. Una concha, estriada, posada sobre dos palmetas. A la izquierda, grabado: A LÉ CAILLE. A la derecha: D OR, luego el año. Lé, la grafía antigua.

Casa de estilo clásico montois, mediados del siglo XVIII. El oro del nombre prometía lujo, como tantas enseñas de la ciudad. La écaille, aquí, es la concha.`,
  pl: `Panel zajmuje allège środkowego okna na pierwszym piętrze: prostokąt z polichromowanego wapienia. Muszla, prążkowana, spoczywająca na dwóch palmetach. Po lewej, wyryte: A LÉ CAILLE. Po prawej: D OR, potem data. Lé, dawna pisownia.

Dom w klasycznym stylu montois, połowa XVIII wieku. Złoto w nazwie obiecywało luksus, jak wiele szyldów w mieście. Écaille oznacza tutaj muszlę.`,
  ar: `تشغل اللوحة الأليج للنافذة الوسطى في الطابق الأول: مستطيل من الحجر الجيري متعدد الألوان. صدفة مخططة، موضوعة على زخرفتين نباتيتين تُدعيان palmettes. على اليسار محفور: A LÉ CAILLE. على اليمين: D OR، ثم السنة المنحوتة. Lé، الكتابة القديمة.

منزل على الطراز الكلاسيكي المونتوي، منتصف القرن الثامن عشر. الذهب في الاسم وعد بالفخامة، مثل كثير من اللافتات في المدينة. الـ écaille هنا هي الصدفة.`,
  cn: `这块石板占据一楼中间窗户下方的窗裙（allège）：一块带彩绘的石灰岩长方形。一只带条纹的贝壳，搁在两片棕叶饰上。左侧刻着：A LÉ CAILLE。右侧：D OR，然后是年号。Lé，旧时写法。

一座蒙斯古典风格的房屋，十八世纪中叶。名字里的金许诺奢华，和城里许多招牌一样。这里的écaille，就是贝壳。`,
  jp: `パネルは1階中央の窓の下、窓台下の石板（allège）を占める：彩色された石灰岩の長方形。筋の入った貝が、二つのパルメットの上に置かれている。左に刻まれている：A LÉ CAILLE。右に：D OR、そして年号。Léは古い綴り。

モンスの古典様式の家、十八世紀半ば。名の金は贅沢を約束した。街の多くの看板と同じだ。ここでのécailleは、貝のことである。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_lecaille_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_lecaille_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALEcailleDOr_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
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
