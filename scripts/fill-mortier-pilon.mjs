/**
 * Mortier et Pilon : texte long réécrit (sans répéter le court),
 * Kieffer-Desert lu Kieffeur-Désert en TTS FR, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-mortier-pilon.mjs
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

const NAME = 'Mortier et Pilon';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Houdain 10, 7000 Mons.';
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

const FR_LONG_BODY = `Au-dessus de la porte, une cuve en ronde-bosse, pierre claire, posée sur un corbeau en demi-lune. Deux oreilles rectangulaires, un bec verseur au milieu. Le pilon y repose, oblique, le manche vers la droite. Pas d’épigraphie : le bandeau au-dessus reste vide. Mortier et pilon, les outils du droguiste.

M. Kieffer-Desert a fait poser ce relief. Droguiste de son état. La façade mêle brique et pierre ; un câble passe derrière les anses. Levez les yeux : la cuve tient encore.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `Above the door, a bowl in the round, pale stone, set on a crescent corbel. Two rectangular lugs, a pouring spout in the middle. The pestle rests inside, at an angle, the handle to the right. No lettering: the band above stays empty. Mortar and pestle, the druggist's tools.

M. Kieffer-Desert had this relief put up. A druggist by trade. The façade mixes brick and stone; a cable passes behind the handles. Look up: the bowl still holds.`,
  nl: `Boven de deur, een kuip in ronde-bosse, lichte steen, geplaatst op een halvemaanvormige kraagsteen. Twee rechthoekige oren, een schenktuit in het midden. De stamper rust erin, schuin, het handvat naar rechts. Geen opschrift: de band erboven blijft leeg. Vijzel en stamper, het gereedschap van de drogist.

M. Kieffer-Desert heeft dit reliëf laten plaatsen. Drogist van beroep. De gevel mengt baksteen en natuursteen; een kabel loopt achter de oren door. Kijk omhoog: de kuip houdt nog.`,
  de: `Über der Tür eine Schale in Rundplastik, heller Stein, auf einem halbmondförmigen Kragstein. Zwei rechteckige Henkel, in der Mitte eine Ausgusstülle. Der Stößel liegt schräg darin, der Griff nach rechts. Keine Inschrift: das Band darüber bleibt leer. Mörser und Stößel, die Werkzeuge des Drogisten.

M. Kieffer-Desert hat dieses Relief anbringen lassen. Drogist von Beruf. Die Fassade mischt Ziegel und Stein; ein Kabel läuft hinter den Henkeln durch. Blicken Sie hinauf: die Schale hält noch.`,
  it: `Sopra la porta, una coppa a tutto tondo, pietra chiara, posata su un mensolone a mezzaluna. Due orecchie rettangolari, un beccuccio al centro. Il pestello vi riposa, obliquo, il manico verso destra. Nessuna epigrafia: il nastro sopra resta vuoto. Mortaio e pestello, gli attrezzi del droghiere.

M. Kieffer-Desert ha fatto posare questo rilievo. Droghiere di mestiere. La facciata mescola mattone e pietra; un cavo passa dietro le anse. Alzate gli occhi: la coppa tiene ancora.`,
  es: `Encima de la puerta, una copa de bulto redondo, piedra clara, posada sobre una ménsula en media luna. Dos orejas rectangulares, un pico vertedor en el medio. El pilón reposa dentro, oblicuo, el mango hacia la derecha. Sin epigrafía: la franja de encima permanece vacía. Mortero y pilón, las herramientas del droguero.

M. Kieffer-Desert hizo colocar este relieve. Droguero de oficio. La fachada mezcla ladrillo y piedra; un cable pasa detrás de las asas. Levantad la vista: la copa sigue en su sitio.`,
  pl: `Nad drzwiami czara w pełnym reliefie, jasny kamień, osadzona na wsporniku w kształcie półksiężyca. Dwa prostokątne ucha, dziobek w środku. Tłuczek spoczywa w środku, ukośnie, trzonek w prawo. Bez napisu: pas powyżej pozostaje pusty. Moździerz i tłuczek, narzędzia drogerzysty.

M. Kieffer-Desert kazał osadzić ten relief. Drogerzysta z zawodu. Fasada łączy cegłę i kamień; kabel przechodzi za uchwytami. Spójrzcie w górę: czara wciąż trzyma.`,
  ar: `فوق الباب، وعاء منحوت مجسّم، حجر فاتح، موضوع على كابول هلالي. أذنان مستطيلتان، وفوهة صب في الوسط. المدقّ يستريح فيه، مائلًا، المقبض نحو اليمين. لا نقش: الشريط أعلاه يبقى فارغًا. الهاون والمدقّ، أدوات بائع العقاقير.

وضع السيد Kieffer-Desert هذا النحت الناتئ. بائع عقاقير مهنةً. الواجهة تمزج الآجر والحجر؛ ويمرّ سلك خلف المقابض. ارفعوا أعينكم: الوعاء ما زال ثابتًا.`,
  cn: `门上方，一只圆雕石钵，浅色石头，搁在半月形托石上。两只矩形耳，中间一个倒嘴。杵斜搁在钵里，柄朝右。没有铭文：上方的石带空着。研钵和杵，杂货商的工具。

Kieffer-Desert 先生令人安上了这块浮雕。杂货商为业。立面是砖和石头；一根线缆从耳后穿过。抬头看：石钵还在。`,
  jp: `扉の上、円刻の鉢、明るい石、半月形の持送りの上。矩形の耳が二つ、中央に注ぎ口。杵が斜めに収まり、柄は右へ。銘文はない。上の帯は空のまま。乳鉢と乳棒、薬種商の道具。

Kieffer-Desert氏がこの浮き彫りを据えさせた。薬種商を業とする。ファサードは煉瓦と石。ケーブルが耳の後ろを通る。目を上げよ。鉢はまだそこにいる。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'mortier_et_pilon.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'mortier_et_pilon.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `MortierEtPilon_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr') {
    if (/\bClef\b/.test(text) || /\bTETE\b/.test(text) || /\bTETTE\b/.test(text) || /\bTaette\b/.test(text)) {
      throw new Error('TTS FR mal lu (Clef/TETE) : ' + text);
    }
    if (/\bKieffer-Desert\b/.test(text) || (/\bDesert\b/.test(text) && !/Désert/.test(text))) {
      throw new Error('TTS FR Desert non substitué : ' + text);
    }
  }
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
