/**
 * Au Mousqueton d'Or : texte long réécrit (sans répéter le court),
 * AVX MOVSQVETON lu Aux Mousqueton en TTS, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-mousqueton-dor.mjs
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

const NAME = "Au Mousqueton d'Or";
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 122, 7000 Mons.";
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

const FR_LONG_BODY = `Le rectangle de calcaire est coincé sous la fenêtre du milieu, au premier étage. L’arme, dorée, pointe vers la droite, le canon qui traverse presque toute la pierre. Dessous, gravé : AVX MOVSQVETON D’OR. Le V vaut U. Ce n’est pas AU : c’est AUX, collé à un seul mousqueton. Puis le millésime, chiffre par chiffre.

Maison modeste, premier tiers du XVIIIe. En 1775, les demoiselles Roisin, rentières, l’hypothéquèrent après un emprunt auprès de François Louis Marin, seigneur de Thieusies. Une boutique a repris l’enseigne.`;

/** Traductions figées : inscription AVX MOVSQVETON D’OR inchangée. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The limestone rectangle is wedged under the middle window, on the first floor. The weapon, gilded, points to the right, the barrel almost spanning the whole stone. Below, carved: AVX MOVSQVETON D’OR. V stands for U. It is not AU: it is AUX, attached to a single mousqueton. Then the millésime, digit by digit.

A modest house, first third of the eighteenth century. In 1775 the demoiselles Roisin, rentières, mortgaged it after a loan from François Louis Marin, Seigneur de Thieusies. A shop has taken up the sign.`,
  nl: `De kalkstenen rechthoek zit geklemd onder het middelste raam, op de eerste verdieping. Het wapen, verguld, wijst naar rechts, de loop die bijna de hele steen doorkruist. Eronder, gegraveerd: AVX MOVSQVETON D’OR. De V staat voor U. Het is geen AU: het is AUX, vastgeplakt aan één mousqueton. Daarna het millésime, cijfer per cijfer.

Bescheiden huis, eerste derde van de achttiende eeuw. In 1775 hypothekeerden de demoiselles Roisin, rentières, het na een lening bij François Louis Marin, heer van Thieusies. Een winkel heeft het uithangbord overgenomen.`,
  de: `Das Kalksteinrechteck sitzt unter dem mittleren Fenster im ersten Stock. Die Waffe, vergoldet, zeigt nach rechts, der Lauf durchquert fast den ganzen Stein. Darunter eingemeißelt: AVX MOVSQVETON D’OR. Das V steht für U. Es ist nicht AU: es ist AUX, gekoppelt an ein einziges Mousqueton. Dann das millésime, Ziffer für Ziffer.

Bescheidenes Haus, erstes Drittel des 18. Jahrhunderts. 1775 beliehen die demoiselles Roisin, rentières, es nach einem Darlehen bei François Louis Marin, Seigneur de Thieusies. Ein Geschäft hat das Schild übernommen.`,
  it: `Il rettangolo di calcare è incastrato sotto la finestra di mezzo, al primo piano. L’arma, dorata, punta a destra, la canna che attraversa quasi tutta la pietra. Sotto, inciso: AVX MOVSQVETON D’OR. La V vale U. Non è AU: è AUX, attaccato a un solo mousqueton. Poi il millésime, cifra per cifra.

Casa modesta, primo terzo del XVIII secolo. Nel 1775 le demoiselles Roisin, rentières, la ipotecarono dopo un prestito presso François Louis Marin, signore di Thieusies. Un negozio ha ripreso l’insegna.`,
  es: `El rectángulo de caliza está encajado bajo la ventana del medio, en el primer piso. El arma, dorada, apunta a la derecha, el cañón que recorre casi toda la piedra. Debajo, grabado: AVX MOVSQVETON D’OR. La V vale U. No es AU: es AUX, unido a un solo mousqueton. Luego el millésime, cifra por cifra.

Casa modesta, primer tercio del siglo XVIII. En 1775, las demoiselles Roisin, rentières, la hipotecaron tras un préstamo de François Louis Marin, señor de Thieusies. Una tienda ha retomado la enseña.`,
  pl: `Wapienny prostokąt tkwi pod środkowym oknem, na pierwszym piętrze. Broń, pozłacana, wskazuje w prawo, lufa przecina niemal cały kamień. Poniżej, wyryte: AVX MOVSQVETON D’OR. V znaczy U. To nie AU: to AUX, sklejone z jednym mousqueton. Potem millésime, cyfra po cyfrze.

Skromny dom, pierwsza tercja XVIII wieku. W 1775 demoiselles Roisin, rentières, obciążyły go hipoteką po pożyczce u François Louis Marin, seigneur de Thieusies. Sklep przejął szyld.`,
  ar: `المستطيل الكلسي محشور تحت النافذة الوسطى في الطابق الأول. السلاح، المذهب، يشير إلى اليمين، والسبطانة تعبر تقريباً الحجر كله. تحته محفور: AVX MOVSQVETON D’OR. حرف V يعادل U. ليس AU: إنه AUX، ملتصق بـ mousqueton واحد. ثم millésime، رقماً برقم.

منزل متواضع، الثلث الأول من القرن الثامن عشر. في 1775 رهنت demoiselles Roisin، rentières، المنزل بعد قرض لدى François Louis Marin، سيد Thieusies. متجر استعاد اللافتة.`,
  cn: `这块石灰岩长方形嵌在一楼中间窗户下方。镀金的武器指向右边，枪管几乎横贯整块石头。下面刻着：AVX MOVSQVETON D’OR。V 即 U。不是 AU：是 AUX，贴在单数的 mousqueton 上。然后是年号，一字一数。

朴素的房屋，十八世纪前三分之一。1775年，食利者 Roisin 小姐们因向 François Louis Marin（Thieusies 领主）借款而将房屋抵押。一家店铺沿用了这块招牌。`,
  jp: `石灰岩の長方形は、1階中央の窓の下に挟まっている。金箔の武器は右を向き、銃身が石のほぼ全体を横切る。下に刻まれている：AVX MOVSQVETON D’OR。V は U。AU ではなく AUX。単数の mousqueton に付いている。それから年号、数字ごと。

控えめで小さな家、十八世紀の最初の三分の一。1775年、地代生活者の demoiselles Roisin は、Thieusies 領主 François Louis Marin からの借入れのあと、この家を抵当に入れた。店が看板を引き継いだ。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'au_mousqueton_dor.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'au_mousqueton_dor.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `AuMousquetonDOr_${lang}.mp3`);
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
