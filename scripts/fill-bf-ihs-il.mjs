/**
 * BF IHS IL : texte long réécrit (sans répéter le court),
 * IHS → I H S en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-bf-ihs-il.mjs
 *
 * Sources : Yannart (monsblog, n°52) + photo POI (médaillon d’allège).
 * Connaître la Wallonie : pas de fiche dédiée au n°104.
 * Ne pas voler : 16 IHS 93 (Groseilliers), Au Blanc Lévrier, À la Grande Rose,
 *   Artothèque, Visit Mons, rue de la Chaussée.
 * Écarter : Louis XIV, pierre Tournai/Soignies, numérotation révolutionnaire,
 *   cours IHS / Bernardin / Jésuites, Arma Christi, couple BF/IL « énigme »,
 *   talisman, lumière rasante.
 * Quiz : inchangé (cœur et clous / XVIIIe / Grand'Rue).
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

const NAME = 'BF IHS IL';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Grand'Rue 104, 7000 Mons.";
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

const FR_LONG_BODY = `Dans l’allège, un cartouche de pierre, rond, scellé sur chant de briques. Un médaillon. Au centre, IHS en capitales ; la barre du H porte une croix. Sous les lettres, un cœur transpercé de trois clous, symbole de la crucifixion. Autour du cercle, les initiales des propriétaires, aux quatre points : B et F en haut, I et L en bas.

Maison d’angle, style classique montois, première moitié du XVIIIe siècle. La pierre tient sous l’appui de fenêtre.`;

/** Traductions figées. Pas de clé de voûte, date fendue, fleurs (Groseilliers). */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `In the allège, a round stone cartouche, set on a field of bricks. A medallion. At the centre, IHS in capitals; the bar of the H bears a cross. Under the letters, a heart pierced by three nails, the symbol of the Crucifixion. Around the circle, the owners' initials, at the four points: B and F above, I and L below.

A corner house in Mons classical style, first half of the eighteenth century. The stone sits under the window sill.`,
  nl: `In de allège, een rond stenen cartouche, gevat op een veld van baksteen. Een medaillon. In het midden, IHS in kapitalen; de dwarsbalk van de H draagt een kruis. Onder de letters, een hart doorboord door drie spijkers, het teken van de kruisiging. Rond de cirkel, de initialen van de eigenaars, op de vier punten: B en F boven, I en L onder.

Hoekhuis in klassieke Montoise stijl, eerste helft van de achttiende eeuw. De steen zit onder de vensterbank.`,
  de: `In der Allège ein rundes steinernes Kartusche, gesetzt auf ein Ziegelfeld. Ein Medaillon. In der Mitte IHS in Majuskeln; der Balken des H trägt ein Kreuz. Unter den Buchstaben ein Herz, von drei Nägeln durchbohrt, Symbol der Kreuzigung. Um den Kreis die Initialen der Eigentümer, an den vier Punkten: B und F oben, I und L unten.

Eckhaus im klassischen Mons-Stil, erste Hälfte des 18. Jahrhunderts. Der Stein sitzt unter dem Fenstersims.`,
  it: `Nell'allège, un cartiglio di pietra, tondo, fissato su un campo di mattoni. Un medaglione. Al centro, IHS in capitali; la barra della H porta una croce. Sotto le lettere, un cuore trafitto da tre chiodi, simbolo della crocifissione. Intorno al cerchio, le iniziali dei proprietari, ai quattro punti: B e F in alto, I e L in basso.

Casa d'angolo, stile classico montois, prima metà del XVIII secolo. La pietra sta sotto il davanzale.`,
  es: `En el allège, un cartucho de piedra, redondo, sujeto sobre un campo de ladrillos. Un medallón. En el centro, IHS en capitales; la barra de la H lleva una cruz. Bajo las letras, un corazón atravesado por tres clavos, símbolo de la crucifixión. Alrededor del círculo, las iniciales de los propietarios, en los cuatro puntos: B y F arriba, I y L abajo.

Casa de esquina, estilo clásico montois, primera mitad del siglo XVIII. La piedra está bajo el alféizar.`,
  pl: `W allège okrągły kamienny kartusz, osadzony na polu cegieł. Medalion. W środku IHS kapitalikami; poprzeczka H niesie krzyż. Pod literami serce przebite trzema gwoździami, znak ukrzyżowania. Wokół koła inicjały właścicieli, na czterech punktach: B i F u góry, I i L u dołu.

Dom narożny, klasyczny styl montois, pierwsza połowa XVIII wieku. Kamień tkwi pod parapetem.`,
  ar: `في الأليج، خرطوشة حجرية مستديرة، مثبتة على حقل من الآجر. ميدالية. في الوسط، IHS بأحرف كبيرة؛ عارضة حرف H تحمل صليباً. تحت الحروف، قلب مثقوب بثلاثة مسامير، رمز الصلب. حول الدائرة، أحرف أصحاب البيت الأولى، عند النقاط الأربع: B و F في الأعلى، I و L في الأسفل.

بيت زاوية، أسلوب كلاسيكي مونتوي، النصف الأول من القرن الثامن عشر. الحجر يقع تحت عتبة النافذة.`,
  cn: `窗裙（allège）里，一块圆形石质涡卷饰，嵌在砖场上。一块圆徽。正中是大写的 IHS；H 的横杠托着十字架。字母下方，一颗被三枚钉子穿透的心，十字架受难的象征。圆环四周，业主的首字母，分列四点：上为 B 和 F，下为 I 和 L。

转角房屋，蒙斯古典风格，十八世纪上半叶。石头在窗台之下。`,
  jp: `窓台下の石板（allège）に、丸い石のカルトゥーシュ、煉瓦の地に填められている。メダリオン。中央に大文字の IHS。H の横棒に十字架。文字の下、三本の釘に貫かれた心、磔のしるし。円のまわり、所有者の頭文字が四点に：上に B と F、下に I と L。

角の家、モンスの古典様式、十八世紀前半。石は窓台の下にある。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'bf_ihs_il.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'bf_ihs_il.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `BFIHSIL_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bIHS\b/.test(text)) {
    throw new Error('IHS non épelé (' + lang + ') : ' + text);
  }
  if (!/I H S/.test(text)) {
    throw new Error('I H S manquant (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (
      /\bClef\b/.test(text) ||
      /\bTETE\b/.test(text) ||
      /\bTETTE\b/.test(text) ||
      /Bertaimont/.test(text) ||
      /\bGillis\b/.test(text) ||
      /\bHarvent\b/.test(text) ||
      /CROIX D OR/.test(text)
    ) {
      throw new Error('TTS FR mal lu (Clef/TETE/Gillis/Harvent/CROIX) : ' + text);
    }
    console.log('TTS FR (IHS → I H S):\n' + text);
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
fs.mkdirSync(path.join(ROOT, 'dist', 'scripts'), { recursive: true });
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('done');
