/**
 * Armes de Mons Rue de la Clef : texte long réécrit (sans répéter le court),
 * Clef lu Clé en TTS (déjà dans tts-pronounce.mjs), traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-armes-clef.mjs
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

const NAME = 'Armes de Mons Rue de la Clef';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de la Clef 4, 7000 Mons.';
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

const FR_LONG_BODY = `La pierre pend sous l’arc, au-dessus de la porte : une clé, au sens du maçon. Dessus, les armes de la ville, usées. Un château, la porte ouverte. XVIe siècle. La maison est de type tournaisien. La porte, elle, est du XVIIIe.

C’était l’issue du premier théâtre de Mons, à l’étage de la Grande Boucherie, bâtie en 1589 sur la Grand-Place. On a démoli le bâtiment en 1841 ou 1842. La pierre est restée ici.`;

const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The stone hangs under the arch, above the door: a keystone, in the mason's sense. On it, the city's arms, worn. A castle, the gate open. 16th century. The house is of Tournai type. The door itself is 18th century.

This was the exit of Mons's first theatre, on the upper floor of the Grande Boucherie, built in 1589 on the Grand-Place. The building was demolished in 1841 or 1842. The stone stayed here.`,
  nl: `De steen hangt onder de boog, boven de deur: een sluitsteen, in de zin van de metselaar. Erop de wapens van de stad, versleten. Een kasteel, de poort open. 16e eeuw. Het huis is van Doorniks type. De deur zelf is 18e-eeuws.

Dit was de uitgang van het eerste theater van Mons, op de verdieping van de Grande Boucherie, gebouwd in 1589 op de Grand-Place. Het gebouw werd in 1841 of 1842 afgebroken. De steen is hier gebleven.`,
  de: `Der Stein hängt unter dem Bogen, über der Tür: ein Schlussstein, im Sinn des Maurers. Darauf die Wappen der Stadt, abgenutzt. Ein Schloss, das Tor offen. 16. Jahrhundert. Das Haus ist vom Tournai-Typ. Die Tür selbst ist aus dem 18. Jahrhundert.

Das war der Ausgang des ersten Theaters von Mons, im Obergeschoss der Grande Boucherie, 1589 an der Grand-Place errichtet. Das Gebäude wurde 1841 oder 1842 abgerissen. Der Stein ist hier geblieben.`,
  it: `La pietra pende sotto l'arco, sopra la porta: una chiave di volta, nel senso del muratore. Sopra, le armi della città, consunte. Un castello, la porta aperta. XVI secolo. La casa è di tipo tornacense. La porta, lei, è del XVIII.

Era l'uscita del primo teatro di Mons, al piano della Grande Boucherie, costruita nel 1589 sulla Grand-Place. L'edificio fu demolito nel 1841 o 1842. La pietra è restata qui.`,
  es: `La piedra cuelga bajo el arco, encima de la puerta: una clave, en el sentido del albañil. Encima, las armas de la ciudad, desgastadas. Un castillo, la puerta abierta. Siglo XVI. La casa es de tipo tornesino. La puerta, ella, es del XVIII.

Era la salida del primer teatro de Mons, en el piso de la Grande Boucherie, construida en 1589 en la Grand-Place. El edificio se demolió en 1841 o 1842. La piedra se quedó aquí.`,
  pl: `Kamień zwisa pod łukiem, nad drzwiami: zwornik, w znaczeniu murarskim. Na nim herby miasta, starte. Zamek, brama otwarta. XVI wiek. Dom typu tournai. Same drzwi są z XVIII wieku.

To było wyjście pierwszego teatru w Mons, na piętrze Grande Boucherie, wzniesionej w 1589 na Grand-Place. Budynek zburzono w 1841 lub 1842. Kamień został tutaj.`,
  ar: `الحجر يتدلى تحت القوس، فوق الباب: حجر المفتاح، بمعنى البنّاء. عليه أسلحة المدينة، بالية. قلعة، الباب مفتوح. القرن السادس عشر. المنزل من النمط التورنيزي. أما الباب فهو من القرن الثامن عشر.

كان هذا مخرج أول مسرح في مون، في طابق الـ Grande Boucherie، المبنية سنة 1589 على Grand-Place. هُدم المبنى سنة 1841 أو 1842. الحجر بقي هنا.`,
  cn: `石头悬在拱门下、门的上方：砌筑意义上的拱心石。上面是磨损的城市纹章。一座城堡，城门开着。十六世纪。房屋属图尔奈式。门本身是十八世纪的。

这曾是蒙斯第一座剧院的出口，在 Grande Boucherie 的楼上，该楼1589年建于大广场。建筑于1841或1842年拆除。石头留在了这里。`,
  jp: `石はアーチの下、扉の上に下がっている：石工の意味での要石。その上に、すり減った市の紋章。城、門は開いている。十六世紀。家はトゥルネー型。扉そのものは十八世紀。

モンス最初の劇場の出口だった。Grande Boucherie の階上、1589年にGrand-Placeに建てられた。建物は1841年か1842年に壊された。石はここに残った。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'armes_de_mons_rue_de_la_clef.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'armes_de_mons_rue_de_la_clef.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `ArmesDeMonsRueDeLaClef_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (lang === 'fr' && /\bClef\b/.test(text)) {
    throw new Error('TTS FR lit encore Clef : ' + text);
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
