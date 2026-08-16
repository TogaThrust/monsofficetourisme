/**
 * Buste de la reine Astrid : texte long réécrit (sans répéter le court),
 * Küssnacht / Waux-Hall en TTS FR, traductions 10 langues, MP3 longs.
 * Usage: node scripts/fill-buste-astrid.mjs
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

const NAME = 'Buste de la reine Astrid';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Parc du Waux-Hall, 7000 Mons.';
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

const FR_LONG_BODY = `Le buste, patine verte, tient un socle de pierre claire, au milieu d’un banc en arc, au Waux-Hall. Cheveux tirés en arrière, épaules drapées, le visage de trois-quarts. Sur le piédestal, gravé : ASTRID, REINE DES BELGES, 1905-1935. Dans un pli du drapé, signé Victor Rousseau. Astrid de Suède, quatrième reine des Belges. Règne court : 1934-1935. Le 29 août 1935, à Küssnacht, en Suisse, la voiture du roi Léopold III quitte la route. Elle a vingt-neuf ans.

Le bronze date de 1936. Ce qu’on voit est de la résine, moulée sur le jumeau de Maurage, prêté à la ville. Même modèle : Rousseau, qui avait dirigé l’Académie royale des Beaux-Arts de Bruxelles. Le métal n’est plus là. Le portrait, lui, est resté.`;

/** Traductions figées. Inscriptions du socle inchangées. */
const LONG_BODY = {
  fr: FR_LONG_BODY,
  en: `The bust, green patina, stands on a pale stone pedestal, in the middle of a curved bench, at the Waux-Hall. Hair drawn back, shoulders draped, the face in three-quarter view. On the pedestal, carved: ASTRID, REINE DES BELGES, 1905-1935. In a fold of the drapery, signed Victor Rousseau. Astrid of Sweden, fourth Queen of the Belgians. A short reign: 1934-1935. On 29 August 1935, at Küssnacht, in Switzerland, King Leopold III’s car left the road. She was twenty-nine.

The bronze dates from 1936. What one sees is resin, cast from the twin at Maurage, lent to the city. The same model: Rousseau, who had directed the Royal Academy of Fine Arts in Brussels. The metal is gone. The portrait remains.`,
  nl: `De buste, groene patina, staat op een lichte stenen sokkel, midden in een gebogen bank, in het Waux-Hall. Haar naar achteren gestreken, gedrapeerde schouders, het gezicht in driekwart. Op de sokkel gegraveerd: ASTRID, REINE DES BELGES, 1905-1935. In een plooi van de draperie, gesigneerd Victor Rousseau. Astrid van Zweden, vierde koningin der Belgen. Kort bewind: 1934-1935. Op 29 augustus 1935, in Küssnacht, in Zwitserland, verlaat de auto van koning Leopold III de weg. Ze is negenentwintig.

Het brons dateert van 1936. Wat men ziet is hars, afgegoten van de tweeling in Maurage, uitgeleend aan de stad. Hetzelfde model: Rousseau, die de Koninklijke Academie voor Schone Kunsten van Brussel had geleid. Het metaal is weg. Het portret is gebleven.`,
  de: `Die Büste, grüne Patina, steht auf einem hellen Steinsockel, in der Mitte einer gebogenen Bank, im Waux-Hall. Haar zurückgestrichen, drapierte Schultern, das Gesicht im Dreiviertelprofil. Auf dem Sockel gemeißelt: ASTRID, REINE DES BELGES, 1905-1935. In einer Falte des Gewands, signiert Victor Rousseau. Astrid von Schweden, vierte Königin der Belgier. Kurze Herrschaft: 1934-1935. Am 29. August 1935, in Küssnacht, in der Schweiz, kommt der Wagen König Leopolds III. von der Straße ab. Sie ist neunundzwanzig.

Die Bronze stammt von 1936. Was man sieht, ist Harz, abgeformt vom Zwilling in Maurage, der Stadt geliehen. Dasselbe Modell: Rousseau, der die Königliche Akademie der Schönen Künste in Brüssel geleitet hatte. Das Metall ist fort. Das Porträt ist geblieben.`,
  it: `Il busto, patina verde, sta su un basamento di pietra chiara, al centro di una panca ad arco, al Waux-Hall. Capelli tirati indietro, spalle drappeggiate, il viso di tre quarti. Sul piedistallo, inciso: ASTRID, REINE DES BELGES, 1905-1935. In una piega del drappeggio, firmato Victor Rousseau. Astrid di Svezia, quarta regina dei Belgi. Regno breve: 1934-1935. Il 29 agosto 1935, a Küssnacht, in Svizzera, l’auto del re Leopoldo III esce di strada. Ha ventinove anni.

Il bronzo è del 1936. Quello che si vede è resina, colata sul gemello di Maurage, prestato alla città. Stesso modello: Rousseau, che aveva diretto l’Accademia reale di Belle Arti di Bruxelles. Il metallo non c’è più. Il ritratto è rimasto.`,
  es: `El busto, pátina verde, se alza sobre un pedestal de piedra clara, en medio de un banco en arco, en el Waux-Hall. Cabello hacia atrás, hombros drapeados, el rostro de tres cuartos. En el pedestal, grabado: ASTRID, REINE DES BELGES, 1905-1935. En un pliegue del drapeado, firmado Victor Rousseau. Astrid de Suecia, cuarta reina de los belgas. Reinado corto: 1934-1935. El 29 de agosto de 1935, en Küssnacht, en Suiza, el coche del rey Leopoldo III se sale de la carretera. Tiene veintinueve años.

El bronce data de 1936. Lo que se ve es resina, moldeada sobre el gemelo de Maurage, prestado a la ciudad. El mismo modelo: Rousseau, que había dirigido la Academia Real de Bellas Artes de Bruselas. El metal ya no está. El retrato, sí.`,
  pl: `Popiersie, zielona patyna, stoi na jasnym kamiennym cokole, pośrodku łukowej ławy, w Waux-Hall. Włosy zaczesane do tyłu, ramiona w draperii, twarz w trzech czwartych. Na piedestale wyryte: ASTRID, REINE DES BELGES, 1905-1935. W fałdzie draperii podpis: Victor Rousseau. Astrid ze Szwecji, czwarta królowa Belgów. Krótkie panowanie: 1934-1935. 29 sierpnia 1935, w Küssnacht, w Szwajcarii, samochód króla Leopolda III zjeżdża z drogi. Ma dwadzieścia dziewięć lat.

Brąz pochodzi z 1936. To, co widać, to żywica, odlana z bliźniaka z Maurage, wypożyczonego miastu. Ten sam model: Rousseau, który kierował Królewską Akademią Sztuk Pięknych w Brukseli. Metalu już nie ma. Portret został.`,
  ar: `التمثال النصفي، زنجار أخضر، يقوم على قاعدة من حجر فاتح، في وسط مقعد مقوّس، في الواوكس-هال. الشعر مسحوب إلى الخلف، الكتفان مكسوّان بطيات، الوجه بثلاثة أرباع. على القاعدة محفور: ASTRID, REINE DES BELGES, 1905-1935. في طية من الثوب توقيع Victor Rousseau. أستريد السويدية، رابعة ملكات البلجيك. حكم قصير: 1934-1935. في 29 آب 1935، في كوسناخت، بسويسرا، تخرج سيارة الملك ليوبولد الثالث عن الطريق. عمرها تسعة وعشرون عاماً.

البرونز من سنة 1936. ما يُرى هو راتنج، صُبّ عن التوأم في موراج، المُعار للمدينة. النموذج نفسه: روسو، الذي كان قد أدار الأكاديمية الملكية للفنون الجميلة في بروكسل. المعدن لم يعد هناك. أما الصورة فبقيت.`,
  cn: `半身像，绿色包浆，立在浅色石座上，座落在一道弧形石凳中央，在瓦克斯大厅。头发向后梳，肩上有衣褶，脸呈四分之三侧面。座上刻着：ASTRID, REINE DES BELGES, 1905-1935。衣褶里签着 Victor Rousseau。瑞典的阿斯特丽德，比利时第四位王后。在位很短：1934–1935。1935年8月29日，在瑞士屈斯纳赫特，国王利奥波德三世的车驶离路面。她二十九岁。

青铜作于1936年。眼前所见是树脂，按莫拉日那尊孪生像翻模，由该市借出。同一模型：鲁索，曾主持布鲁塞尔皇家美术学院。金属已不在。肖像还在。`,
  jp: `胸像は緑のパティナ、白い石の台座の上、弧を描く石のベンチの中央、ワウクスホール。髪は後ろに梳かれ、肩はドレープ、顔は四分の三正面。台座に刻まれている：ASTRID, REINE DES BELGES, 1905-1935。ドレープのひだに署名 Victor Rousseau。スウェーデンのアストリッド、ベルギー人の四人目の王妃。短い治世：1934-1935。1935年8月29日、スイスのキュスナハトで、国王レオポルド三世の車が道路を外れる。二十九歳だった。

青銅は1936年。目に見えるのは樹脂で、モラージュの双子像から型を取り、市に貸されたもの。同じ原型：ルソー。ブリュッセル王立美術アカデミーを率いていた。金属はない。肖像は残った。`,
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
  let t = String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (!lang || lang === 'fr') {
    t = t
      .replace(/Küssnacht/g, 'Kussnacht')
      .replace(/Waux-Hall/g, 'Vô-Hall');
  }
  return pronounceForTts(t, lang);
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
fs.writeFileSync(path.join(ROOT, 'data', 'buste_de_la_reine_astrid.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'buste_de_la_reine_astrid.txt'), txt);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, 'audio', `BusteDeLaReineAstrid_${lang}.mp3`);
  const text = ttsText(longs[lang][NAME], lang);
  if (!text) throw new Error('TTS vide ' + lang);
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
