/**
 * Pelles a enfourner 1573 : texte long réécrit (sans répéter le court),
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-pelles-1573.mjs
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

const NAME = 'Pelles a enfourner 1573';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = "Rue d'Havré 114, 7000 Mons.";
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

const FR_LONG_BODY = `Enseigne en pierre, enchâssée dans le mur de droite. Le millésime y est gravé. Elle vient fort probablement d’une boulangerie de la rue. On a choisi de la reposer tout près de l’endroit où on l’avait trouvée.

Travaux d’aménagement du Jardin Gustave Jacobs, sculpteur montois : on l’a dégagée là. Elle pavait une remise, depuis démolie, à une dizaine de mètres de la façade arrière, près du mur de clôture de droite. Comment elle est arrivée là : mystère. On a pu imaginer qu’elle avait été récupérée à la démolition d’une maison des environs, endommagée lors d’un des sièges des XVIIe et XVIIIe siècles.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `A stone sign, set into the right-hand wall. The year is carved on it. It most probably comes from a bakery on the street. It was decided to set it back down close to the place where it had been found.

Works to lay out the Jardin Gustave Jacobs, a Mons sculptor: that is where it was uncovered. It had been used to pave a shed, since demolished, about ten metres from the rear façade, near the fence wall on the right. How it got there: a mystery. One may imagine it was salvaged when a nearby house was demolished, a house damaged in one of the sieges of the seventeenth and eighteenth centuries.`,
  nl: `Een stenen uithangbord, ingemetseld in de rechtermuur. Het jaartal is erin gegraveerd. Het komt hoogstwaarschijnlijk van een bakkerij in de straat. Men heeft ervoor gekozen het weer neer te zetten vlak bij de plek waar het was gevonden.

Werken voor de aanleg van de Jardin Gustave Jacobs, een beeldhouwer uit Mons: daar is het blootgelegd. Het diende als bestrating van een schuur, sindsdien afgebroken, op een tiental meter van de achtergevel, bij de rechterafsluitingsmuur. Hoe het daar terechtkwam: een mysterie. Men kan zich voorstellen dat het werd geborgen bij de sloop van een huis in de buurt, beschadigd tijdens een van de belegeringen van de zeventiende en achttiende eeuw.`,
  de: `Ein steinernes Schild, eingelassen in die rechte Wand. Die Jahreszahl ist eingemeißelt. Es stammt höchstwahrscheinlich von einer Bäckerei der Straße. Man beschloss, es ganz in der Nähe des Fundorts wieder einzusetzen.

Arbeiten zur Anlage des Jardin Gustave Jacobs, eines Bildhauers aus Mons: dort wurde es freigelegt. Es diente als Pflaster einer inzwischen abgerissenen Remise, etwa zehn Meter von der Hinterfassade, nahe der rechten Einfriedungsmauer. Wie es dorthin kam: ein Rätsel. Man kann sich vorstellen, dass es beim Abbruch eines Nachbarhauses geborgen wurde, das bei einer der Belagerungen des 17. und 18. Jahrhunderts beschädigt worden war.`,
  it: `Insegna in pietra, incastonata nel muro di destra. Il millesimo vi è inciso. Proviene molto probabilmente da una panetteria della strada. Si è scelto di riposarla vicino al punto in cui era stata trovata.

Lavori di sistemazione del Jardin Gustave Jacobs, scultore di Mons: è lì che è stata portata alla luce. Pavimentava una rimessa, poi demolita, a una decina di metri dalla facciata posteriore, presso il muro di cinta di destra. Come sia arrivata lì: un mistero. Si è potuto immaginare che fosse stata recuperata alla demolizione di una casa dei dintorni, danneggiata in uno degli assedi del XVII e del XVIII secolo.`,
  es: `Enseña de piedra, empotrada en el muro de la derecha. El milésimo está grabado. Proviene muy probablemente de una panadería de la calle. Se decidió reponerla cerca del lugar donde se había encontrado.

Obras de acondicionamiento del Jardin Gustave Jacobs, escultor de Mons: allí se la desenterró. Pavimentaba un cobertizo, hoy demolido, a unos diez metros de la fachada posterior, junto al muro de cierre de la derecha. Cómo llegó allí: un misterio. Se ha podido imaginar que se recuperó al demoler una casa de los alrededores, dañada en uno de los asedios de los siglos XVII y XVIII.`,
  pl: `Kamienny szyld, osadzony w prawej ścianie. Data jest na nim wyryta. Pochodzi najpewniej z piekarni przy tej ulicy. Postanowiono go ponownie umieścić tuż przy miejscu, w którym go znaleziono.

Prace przy urządzaniu Jardin Gustave Jacobs, rzeźbiarza z Mons: tam go odsłonięto. Brukował szopę, później wyburzoną, jakieś dziesięć metrów od tylnej elewacji, przy prawym murze ogrodzenia. Jak się tam znalazł: zagadka. Można sobie wyobrazić, że odzyskano go przy rozbiórce domu z okolicy, uszkodzonego podczas jednego z oblężeń XVII i XVIII wieku.`,
  ar: `لافتة حجرية، مُثبَّتة في الجدار الأيمن. السنة محفورة عليها. تأتي على الأرجح من مخبز في الشارع. تقرر إعادتها قريباً من المكان الذي عُثر عليها فيه.

أعمال تهيئة Jardin Gustave Jacobs، النحات المونتوي: هناك كُشف عنها. كانت تبلّط مستودعاً، هُدم لاحقاً، على بعد نحو عشرة أمتار من الواجهة الخلفية، قرب جدار السياج الأيمن. كيف وصلت إلى هناك: لغز. يمكن تصوّر أنها استُعيدت عند هدم بيت مجاور، تضرر في أحد حصارات القرنين السابع عشر والثامن عشر.`,
  cn: `石质招牌，嵌在右侧墙上。年号刻在上面。它很可能来自这条街上的一家面包店。人们决定把它重新安放在发现处附近。

整治 Jardin Gustave Jacobs（蒙斯雕塑家）时，石板在那里被挖出。它曾铺过一间库房的地面，库房现已拆除，距后立面约十米，靠近右侧围墙。它怎么到了那里：仍是个谜。可以设想，是在拆除附近一所房屋时收回的，那所房屋在十七、十八世纪某次围城中受损。`,
  jp: `石の看板で、右の壁に嵌め込まれている。年号が刻まれている。通りのパン屋から来た可能性が高い。見つかった場所のすぐ近くに、再び据えることにした。

モンスの彫刻家 Gustave Jacobs の庭（Jardin Gustave Jacobs）の整備工事のとき、そこで掘り出された。取り壊された納屋の敷石になっていた。後ろのファサードから十メートルほど、右側の囲いの壁のそば。どうしてそこにあったのかは謎である。十七・十八世紀の包囲の一つで傷んだ近所の家を壊したときに回収された、と想像することはできる。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'pelles_a_enfourner_1573.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'pelles_a_enfourner_1573.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `PellesAEnfourner1573_${lang}.mp3`);
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
