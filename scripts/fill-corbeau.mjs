/**
 * Au Corbeau : texte long réécrit (sans répéter le court),
 * Charleroy lu Charleroi en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-corbeau.mjs
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

const NAME = 'Au Corbeau';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 106, 7000 Mons.";
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

const FR_LONG_BODY = `Sur un claveau, à gauche de la clé de voûte : profil vers la droite, plumes en stries, bec entrouvert. Pierre, vers 1770. Grosse maison à double corps, aujourd’hui divisée.

L’auberge est déjà citée en juillet 1454. Le nom est l’un des plus anciens connus dans la rue. Dès 1767, Pierre Ferez part d’ici tous les quinze jours : Mons, Solre-le-Château, Charleroy. Au début du XXe siècle, Florent Dinsart y loue encore voitures et chevaux, sous la même enseigne.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `On a voussoir, to the left of the keystone: profile facing right, feathers in grooves, beak slightly open. Stone, around 1770. A large double-pile house, now divided.

The inn is already mentioned in July 1454. The name is one of the oldest known in the street. From 1767, Pierre Ferez left from here every fortnight: Mons, Solre-le-Château, Charleroy. In the early twentieth century, Florent Dinsart still hired out carriages and horses here, under the same sign.`,
  nl: `Op een welfsteen, links van de sluitsteen: profiel naar rechts, veren in groeven, snavel licht geopend. Steen, omstreeks 1770. Groot huis met dubbel corps, nu verdeeld.

De herberg wordt al in juli 1454 genoemd. De naam is een van de oudste die in de straat bekend zijn. Vanaf 1767 vertrok Pierre Ferez van hier om de veertien dagen: Mons, Solre-le-Château, Charleroy. Aan het begin van de 20e eeuw verhuurde Florent Dinsart er nog rijtuigen en paarden, onder hetzelfde uithangbord.`,
  de: `Auf einem Wölbstein, links vom Schlussstein: Profil nach rechts, Federn in Rillen, Schnabel leicht geöffnet. Stein, um 1770. Großes Haus mit doppeltem Corps, heute geteilt.

Die Herberge ist schon im Juli 1454 genannt. Der Name gehört zu den ältesten in der Straße. Ab 1767 fuhr Pierre Ferez von hier alle vierzehn Tage: Mons, Solre-le-Château, Charleroy. Zu Beginn des 20. Jahrhunderts vermietete Florent Dinsart hier noch Wagen und Pferde, unter demselben Schild.`,
  it: `Su un cuneo d’arco, a sinistra della chiave di volta: profilo verso destra, piume a striature, becco socchiuso. Pietra, verso il 1770. Grossa casa a doppio corps, oggi divisa.

L’osteria è già citata nel luglio 1454. Il nome è uno dei più antichi noti nella via. Dal 1767 Pierre Ferez partiva da qui ogni quindici giorni: Mons, Solre-le-Château, Charleroy. All’inizio del XX secolo Florent Dinsart vi noleggiava ancora carrozze e cavalli, sotto la stessa insegna.`,
  es: `Sobre una dovela, a la izquierda de la clave: perfil hacia la derecha, plumas en estrías, pico entreabierto. Piedra, hacia 1770. Gran casa de doble corps, hoy dividida.

La posada ya se cita en julio de 1454. El nombre es uno de los más antiguos conocidos en la calle. Desde 1767, Pierre Ferez salía de aquí cada quince días: Mons, Solre-le-Château, Charleroy. A principios del siglo XX, Florent Dinsart aún alquilaba allí coches y caballos, bajo el mismo letrero.`,
  pl: `Na klińcu, na lewo od zwornika: profil w prawo, pióra w bruzdach, dziób lekko otwarty. Kamień, około 1770. Duży dom o podwójnym corps, dziś podzielony.

Gospoda jest już wzmiankowana w lipcu 1454. Nazwa należy do najstarszych znanych na ulicy. Od 1767 Pierre Ferez wyjeżdżał stąd co dwa tygodnie: Mons, Solre-le-Château, Charleroy. Na początku XX wieku Florent Dinsart wynajmował tu jeszcze powozy i konie, pod tym samym szyldem.`,
  ar: `على حجر عقد، إلى يسار مفتاح القوس: جانب نحو اليمين، ريش بخطوط محفورة، منقار نصف مفتوح. حجر، نحو 1770. بيت كبير بجسمين، مقسوم اليوم.

يُذكر النزل منذ تموز/يوليو 1454. الاسم من أقدم الأسماء المعروفة في الشارع. منذ 1767 كان Pierre Ferez ينطلق من هنا كل خمسة عشر يوماً: Mons، Solre-le-Château، Charleroy. في مطلع القرن العشرين كان Florent Dinsart ما يزال يؤجر عربات وخيولاً، تحت اللافتة نفسها.`,
  cn: `在一块拱楔石上，位于拱心石左侧：侧面朝右，羽毛刻成细槽，喙微张。石头，约1770年。一座双进深的大宅，如今已分隔。

客栈在1454年7月已有记载。这个名字是街上已知最古老的之一。从1767年起，Pierre Ferez每隔十五天从这里出发：Mons、Solre-le-Château、Charleroy。二十世纪初，Florent Dinsart仍在此出租马车和马匹，沿用同一招牌。`,
  jp: `迫石の上、要石の左：右向きの横顔、羽は筋彫り、くちばしは少し開く。石、1770年頃。二つの奥行きを持つ大きな家で、いまは分割されている。

宿はすでに1454年7月に記されている。名はこの通りで知られる最古のひとつ。1767年からPierre Ferezはここを起点に十五日ごとに発った：Mons、Solre-le-Château、Charleroy。二十世紀初め、Florent Dinsartは同じ看板の下で、まだ馬車と馬を貸していた。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'au_corbeau.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'au_corbeau.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `AuCorbeau_${lang}.mp3`);
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
