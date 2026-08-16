/**
 * A la Paile d'Or : texte long réécrit (sans répéter le court),
 * PAILE DOR lu Pelle d'Or en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-paile-dor.mjs
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

const NAME = "A la Paile d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 72, 7000 Mons.";
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

const FR_LONG_BODY = `Le panneau tient le trumeau du milieu, au premier étage : un rectangle de calcaire, polychrome, qui saillit sur le cordon. Un ovale. Dedans, la pelle, manche long, lame plate. Autour, des rinceaux, des feuilles. Sous le cartouche, gravé : PAILE DOR. Un i pour un e : c’est la pelle. Au XVIIe, on écrivait déjà Pelle.

Maison de 1793, d’après les archives. Le nom est plus vieux : en 1600, on dit déjà « A la Pelle d’or ». Un boulanger, Jehan Willame, occupait le lieu en 1547. L’enseigne a été reprise en 1934.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The panel holds the central trumeau on the first floor: a rectangle of polychrome limestone, projecting on the string course. An oval. Inside, the peel, long handle, flat blade. Around it, scrolls, leaves. Below the cartouche, carved: PAILE DOR. An i for an e: it is the peel. In the 17th century they already wrote Pelle.

A house of 1793, according to the archives. The name is older: in 1600 it was already called “A la Pelle d’or”. A baker, Jehan Willame, occupied the place in 1547. The sign was restored in 1934.`,
  nl: `Het paneel vormt het middelste trumeau op de eerste verdieping: een rechthoek van polychroom kalksteen, die uitsteekt op de cordon. Een ovaal. Daarin de schep, lange steel, platte blad. Errond, ranken, bladeren. Onder de cartouche, gegraveerd: PAILE DOR. Een i voor een e: het is de schep. In de 17e eeuw schreef men al Pelle.

Huis van 1793, volgens de archieven. De naam is ouder: in 1600 zei men al “A la Pelle d’or”. Een bakker, Jehan Willame, bewoonde de plek in 1547. Het uithangbord werd in 1934 hernomen.`,
  de: `Die Tafel bildet das mittlere Trumeau im ersten Stock: ein Rechteck aus polychromem Kalkstein, das auf dem Gurtgesims vorspringt. Ein Oval. Darin die Schaufel, langer Stiel, flaches Blatt. Darum Ranken, Blätter. Unter der Kartusche eingemeißelt: PAILE DOR. Ein i für ein e: es ist die Schaufel. Im 17. Jahrhundert schrieb man schon Pelle.

Haus von 1793, laut den Archiven. Der Name ist älter: 1600 sagte man bereits „A la Pelle d’or“. Ein Bäcker, Jehan Willame, bewohnte den Ort 1547. Das Schild wurde 1934 wiederhergestellt.`,
  it: `Il pannello occupa il trumeau centrale al primo piano: un rettangolo di calcare policromo, sporgente sul cordone. Un ovale. Dentro, la pala, manico lungo, lama piatta. Intorno, girali, foglie. Sotto il cartiglio, inciso: PAILE DOR. Una i per una e: è la pala. Nel XVII secolo si scriveva già Pelle.

Casa del 1793, secondo gli archivi. Il nome è più antico: nel 1600 si diceva già « A la Pelle d’or ». Un fornaio, Jehan Willame, occupava il luogo nel 1547. L’insegna è stata ripresa nel 1934.`,
  es: `El panel ocupa el trumeau del centro, en el primer piso: un rectángulo de caliza policromada, que sobresale sobre el cordón. Un óvalo. Dentro, la pala, mango largo, hoja plana. Alrededor, roleos, hojas. Bajo el cartucho, grabado: PAILE DOR. Una i por una e: es la pala. En el siglo XVII ya se escribía Pelle.

Casa de 1793, según los archivos. El nombre es más antiguo: en 1600 ya se decía « A la Pelle d’or ». Un panadero, Jehan Willame, ocupaba el lugar en 1547. El letrero se retomó en 1934.`,
  pl: `Panel zajmuje środkowy trumeau na pierwszym piętrze: prostokąt z polichromowanego wapienia, wystający na gzymsie. Owal. Wewnątrz łopata, długi trzonek, płaskie ostrze. Wokół, wici, liście. Pod kartuszem, wyryte: PAILE DOR. I zamiast e: to łopata. W XVII wieku pisano już Pelle.

Dom z 1793, według archiwów. Nazwa jest starsza: w 1600 mówiono już „A la Pelle d’or”. Piekarz Jehan Willame zajmował to miejsce w 1547. Szyld odnowiono w 1934.`,
  ar: `تشغل اللوحة الترومو الأوسط في الطابق الأول: مستطيل من الحجر الجيري متعدد الألوان، بارز على الإفريز. شكل بيضاوي. في داخله المجرفة، مقبض طويل، نصل مسطح. حولها لفائف وأوراق. تحت الخرطوش محفور: PAILE DOR. حرف i بدل e: إنها المجرفة. في القرن السابع عشر كانوا يكتبون أصلا Pelle.

منزل سنة 1793، حسب الأرشيف. الاسم أقدم: في 1600 كانوا يقولون أصلا « A la Pelle d’or ». خباز، Jehan Willame، شغل المكان سنة 1547. أُعيدت اللافتة سنة 1934.`,
  cn: `石板占据一楼正中窗间墙（trumeau）：一块带彩绘的石灰岩长方形，凸出在腰线上。一个椭圆。里面是烤铲，长柄，扁刃。四周是卷草和叶子。框下刻着：PAILE DOR。用 i 代 e：就是铲子。十七世纪已写作 Pelle。

房屋据档案为1793年。名字更早：1600年已称“A la Pelle d’or”。面包师Jehan Willame在1547年已占用此地。招牌于1934年重修。`,
  jp: `パネルは1階中央の窓間壁（trumeau）を占める：彩色された石灰岩の長方形で、帯状の石から張り出す。楕円。中はパン用のへら、長い柄、平たい刃。まわりは唐草と葉。枠の下に刻まれている：PAILE DOR。e の代わりに i：へらである。十七世紀にはすでに Pelle と書いていた。

家は史料によれば1793年。名はもっと古い：1600年にはすでに「A la Pelle d’or」と呼ばれていた。パン職人 Jehan Willame が1547年にこの場所を使っていた。看板は1934年に作り直された。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'a_la_paile_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'a_la_paile_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ALaPaileDOr_${lang}.mp3`);
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
