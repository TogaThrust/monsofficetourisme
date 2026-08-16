/**
 * St Franciscus Kring : texte long réécrit (sans répéter le court),
 * ST. FRANCISCUS KRING. / Kring / Masquelier lus en TTS,
 * traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-st-franciscus-kring.mjs
 *
 * Sources : Yannart (monsblog, n°41) + photo POI images/St_Franciscus_Kring.jpg
 *   (même plaque que monsblog image-116).
 * Connaître la Wallonie : pas de fiche dédiée au n°31
 *   (Rue A. Masquelier 38 = Tour du Val des Écoliers — ne pas voler).
 * Ne pas voler : Chapelle des Capucins n°15 (salle culturelle / réception).
 *   Attenant : une mention (Yannart : bâtiment attenant à l’ancien couvent).
 * Écarter : 500 familles 1960 ; messe 9h30 ; café bénévole ; bibliothèque ;
 *   théâtre ; chambres de rhétorique ; choc des cultures ; Révolution ;
 *   bombardements 1918 ; reconstruction WWI ; reconversion logements/commerces
 *   / chapelle désacralisée ; autres enseignes ; CTA Mons Blog.
 * Court inchangé : nom, Maison des Flamands, n°31, rue — ne pas les ouvrir.
 * Quiz : inchangé (Maison des Flamands / une maison / Rue Masquelier).
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

const NAME = 'St Franciscus Kring';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue André Masquelier 31, 7000 Mons.';
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

const FR_LONG_BODY = `Dans le mur de brique, une niche cintrée. Une plaque de pierre, bas-relief, claire, usée. En haut, suivant l’arc, puis le bord droit, en capitales : ST. FRANCISCUS KRING. Au centre, un buste capuchonné, de profil, tourné vers la droite : saint François, tonsure, auréole rayonnante gravée derrière la tête, un animal serré contre la poitrine.

Kring, en néerlandais, c’est le cercle. Le nom du local, attenant à l’ancien couvent des Capucins.`;

/** Traductions figées. Inscription pierre : ST. FRANCISCUS KRING. Pas chapelle n°15. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `In the brick wall, an arched niche. A stone plaque, bas-relief, light, worn. At the top, following the arch, then the right edge, in capitals: ST. FRANCISCUS KRING. In the centre, a hooded bust, in profile, turned to the right: Saint Francis, tonsure, a radiating halo carved behind the head, an animal held against the chest.

Kring, in Dutch, means the circle. The name of the premises, adjoining the former Capuchin convent.`,
  nl: `In de bakstenen muur, een gewelfde nis. Een stenen plaat, bas-reliëf, licht, versleten. Bovenaan, de boog volgend, dan de rechterrand, in kapitalen: ST. FRANCISCUS KRING. In het midden, een buste met kap, en profil, naar rechts: de heilige Franciscus, tonsuur, een stralend aureool achter het hoofd, een dier tegen de borst.

Kring: de kring, het gezelschap. De naam van het lokaal, palend aan het voormalige kapucijnenklooster.`,
  de: `In der Ziegelmauer eine rundbogige Nische. Eine Steintafel, Relief, hell, abgenutzt. Oben, dem Bogen folgend, dann dem rechten Rand, in Kapitalen: ST. FRANCISCUS KRING. In der Mitte eine kapuzentragende Büste im Profil, nach rechts gewandt: der heilige Franziskus, Tonsur, ein strahlenförmiger Heiligenschein hinter dem Kopf, ein Tier an der Brust.

Kring, auf Niederländisch, bedeutet der Kreis. Der Name des Lokals, an das ehemalige Kapuzinerkloster angrenzend.`,
  it: `Nel muro di mattoni, una nicchia ad arco. Una lastra di pietra, bassorilievo, chiara, consumata. In alto, seguendo l'arco, poi il bordo destro, in capitali: ST. FRANCISCUS KRING. Al centro, un busto incappucciato, di profilo, volto a destra: san Francesco, tonsura, un'aureola raggiante scolpita dietro la testa, un animale stretto al petto.

Kring, in olandese, significa il circolo. Il nome del locale, attiguo all'antico convento dei Cappuccini.`,
  es: `En el muro de ladrillo, un nicho arqueado. Una placa de piedra, bajorrelieve, clara, desgastada. Arriba, siguiendo el arco, luego el borde derecho, en capitales: ST. FRANCISCUS KRING. En el centro, un busto encapuchado, de perfil, vuelto a la derecha: san Francisco, tonsura, un halo radiante grabado detrás de la cabeza, un animal apretado contra el pecho.

Kring, en neerlandés, significa el círculo. El nombre del local, anejo al antiguo convento de los Capuchinos.`,
  pl: `W ceglanej ścianie wnęka łukowa. Kamienna płyta, płaskorzeźba, jasna, wytarta. U góry, wzdłuż łuku, potem prawego brzegu, kapitalikami: ST. FRANCISCUS KRING. Na środku popiersie w kapturze, z profilu, zwrócone w prawo: święty Franciszek, tonsura, promienista aureola wyryta za głową, zwierzę przyciśnięte do piersi.

Kring po niderlandzku znaczy krąg. Nazwa lokalu, przylegającego do dawnego klasztoru kapucynów.`,
  ar: `في جدار الآجر، كوة مقوّسة. لوحة حجر، نحت بارز، فاتحة، بالية. في الأعلى، تتبع القوس ثم الحافة اليمنى، بأحرف كبيرة: ST. FRANCISCUS KRING. في الوسط، تمثال نصفي بقلنسوة، من الجانب، متجه إلى اليمين: القديس فرنسيس، حلاقة الرهبان، هالة مشعّة محفورة خلف الرأس، حيوان مضغوط إلى الصدر.

Kring بالهولندية تعني الحلقة. اسم المقر، الملاصق لدير الكبوشيين القديم.`,
  cn: `砖墙里，一座拱形壁龛。一块浅浮雕石板，色浅，磨损。上方顺着拱弧，再到右缘，大写：ST. FRANCISCUS KRING. 正中，一尊戴帽的半身像，侧面朝右：圣方济各，剃度，头后刻着放射状光环，怀里紧抱一只动物。

Kring，荷兰语，即圈子。这是会所的名字，紧挨着原嘉布遣会修道院。`,
  jp: `煉瓦の壁に、アーチ形の龕。石のプレート、浅浮彫、明るい色、摩耗している。上はアーチに沿い、右縁へ、大文字：ST. FRANCISCUS KRING. 中央は頭巾の胸像、横顔、右向き：聖フランシスコ、剃髪、頭の後ろに放射状の光輪、胸に動物を抱えている。

Kringはオランダ語で輪、集まり。会所の名。旧カプチン会修道院に隣接する。`,
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
fs.writeFileSync(path.join(ROOT, 'data', 'st_franciscus_kring.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'st_franciscus_kring.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `StFranciscusKring_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
  if (/\bST\./.test(text)) {
    throw new Error('ST. non lu (' + lang + ') : ' + text);
  }
  if (lang === 'fr') {
    if (
      /\bClef\b/.test(text) ||
      /\bTETE\b/.test(text) ||
      /\bTETTE\b/.test(text) ||
      /Bertaimont/.test(text) ||
      /\bGillis\b/.test(text) ||
      /\bHarvent\b/.test(text) ||
      /\bIHS\b/.test(text) ||
      /Grand['’]Rue/.test(text) ||
      /\bChisaire\b/.test(text)
    ) {
      throw new Error('TTS FR mal lu (Clef/TETE/Gillis/Harvent/IHS/Chisaire) : ' + text);
    }
    if (/\bFranciscus\b/.test(text) || /\bKring\b/.test(text) || /\bMasquelier\b/.test(text)) {
      throw new Error('TTS FR Franciscus/Kring/Masquelier non substitués : ' + text);
    }
    if (!/Franciskuss/.test(text) || !/Kringue/.test(text) || !/Mas-ke-lié/.test(text)) {
      throw new Error('TTS FR substitutions manquantes : ' + text);
    }
    console.log('TTS FR:\n' + text);
  }
  if (lang === 'nl' && /\bSaint Franciscus Kring\b/.test(text)) {
    throw new Error('TTS NL Saint au lieu de Sint : ' + text);
  }
  console.log('tts', lang, text.slice(0, 180).replace(/\n/g, ' '));
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
