import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { 'User-Agent': 'CLQ-Mons-OT/1.0 (collaboration VisitMons)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}
function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function tokens(s) {
  const stop = new Set(['mons','de','la','le','du','des','et','au','aux','a','d','l','the','of','par','une','un','les','rue']);
  return norm(s).split(' ').filter((w) => w.length >= 3 && !stop.has(w));
}

async function fetchAllOeuvres() {
  const docs = [];
  let page = 1;
  while (true) {
    const url = `https://www.visitmons.be/api/articles-oeuvres?limit=100&page=${page}&depth=1&locale=fr`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error('API ' + res.status);
    const json = await res.json();
    docs.push(...(json.docs || []));
    console.log('page', page, 'got', json.docs?.length, 'total', json.totalDocs);
    if (!json.hasNextPage) break;
    page += 1;
    await sleep(200);
  }
  return docs;
}

const code = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(`${code}\nthis.locations = locations; this.circuits = circuits;`, ctx);
const { locations, circuits } = ctx;
const ART = ['art_est', 'art_sud', 'art_ouest'];
const artIdx = new Set();
for (const k of ART) for (const i of circuits[k]) artIdx.add(i);

const imageFiles = new Set(fs.readdirSync(IMAGES).filter((f) => fs.statSync(path.join(IMAGES, f)).isFile()));
const imageLower = new Map([...imageFiles].map((f) => [f.toLowerCase(), f]));
const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'];
function hasImage(location) {
  const candidates = [];
  if (location.image) candidates.push(location.image.replace(/^images\//, ''));
  if (location.audio) {
    const fromAudio = location.audio.replace(/^audio\//i, '').replace(/\.mp3$/i, '');
    for (const ext of EXTS) candidates.push(fromAudio + ext);
  }
  const rawName = (location.name || '').trim();
  for (const base of [rawName, poiImageBaseFromName(rawName), poiImageBaseFromName(rawName).toLowerCase()]) {
    for (const ext of EXTS) candidates.push(base + ext);
  }
  return candidates.some((c) => imageFiles.has(c) || imageLower.has(c.toLowerCase()));
}

const missingArt = [];
for (const i of [...artIdx].sort((a, b) => a - b)) {
  const loc = locations[i - 1];
  if (!loc || loc.name === 'Grand-place') continue;
  if (hasImage(loc)) continue;
  missingArt.push({ index: i, name: loc.name });
}

const ALIASES = {
  "Hell'O Folks": ['folks', "hell'o", 'hello'],
  'Kobra Torre de Saber': ['torre de saber', 'kobra'],
  'Andrea Ravo Mattoni Charles Quint': ['carle v', 'charles quint', 'ravo'],
  "Olivier Sonck Ivre d'histoires": ['ivre d histoires', 'sonck'],
  'Arts2 Tunnel de la Paix': ['tunnel de la paix', 'arts2'],
  'Andrea Ravo Mattoni Rue de Nimy 126': ['les bougies', 'nimy 126'],
  'Pierre Liebaert Je crois aux nuits': ['je crois aux nuits', 'liebaert'],
  'Ufocinque Passeggiando nella Storia': ['passeggiando', 'ufocinque'],
  'Stelios Pupet Harmonizing Mons': ['harmonizing', 'pupet'],
  'Jana et JS Le couple de la rue Verte': ['couple de la rue verte', 'jana'],
  'Lola Goies Rue du Miroir': ['lola goies', 'goies'],
  "Eva Badalamenti Passage de l'ilot": ['badalamenti', 'ilot', 'bretagne'],
  'Blancbec Le monstrueux': ['monstrueux', 'blancbec'],
  "Oli-B L'escapade": ['escapade', 'oli-b', 'oli b'],
  'Farm Prod Rue de la Halle': ['farm prod'],
  "Hell'O Rue de la Halle": ["hell'o", 'hello', 'rue de la halle'],
  'Ilan Walbrecq Georges Cuvelier': ['walbrecq', 'cuvelier'],
  'Cedric Le Borgne La riviere': ['la riviere', 'le borgne'],
  'Andrea Buglisi La Gayole': ['gayole', 'buglisi'],
  'Eva Badalamenti Louis Buisseret': ['buisseret'],
  'Taquen Bouquet of memory and hope': ['bouquet of memory', 'taquen'],
  "Paul Segard Ma ville s'endort": ['ville s endort', 'segard'],
  'Dulk The battle': ['the battle', 'dulk'],
  'Celeste Gangolphe Mille et une feuille': ['mille et une feuille', 'gangolphe'],
  'Arkane Lalie': ['lalie', 'arkane', 'liberation de mons'],
  'Dourone Boulevard Sainctelette': ['dourone'],
  'Nadege Dauvergne Place du Beguinage': ['dauvergne'],
  'Robert Montgomery Invisible graffiti of love': ['montgomery', 'invisible graffiti'],
  'Projeto Ruido Le temps': ['projeto', 'ruido', 'le temps'],
  'Margaux Del Vecchio Anto Carte': ['del vecchio', 'anto carte'],
  'Rachelle Celiane Santerre Jacques Du Broeucq': ['santerre', 'senterre', 'du broeucq'],
  'Andrea Ravo Mattoni Sainte Waudru et ses filles': ['sainte waudru et ses filles', 'ysendick', 'ravo'],
  'Ana Langeheldt Alegoria de santa Valdetrudis': ['langeheldt', 'valdetrudis', 'alegoria'],
  'Filip Gilissen Spread your wings': ['spread your wings', 'gilissen'],
  'Nevercrew Dissipation': ['nevercrew', 'dissipation'],
  'Laurence Vray Instant suspendu': ['instant suspendu', 'vray'],
  'Atelier Pica Pica Panorama': ['panorama', 'pica pica'],
  "Levalet L'homme des cavernes": ['homme des cavernes', 'levalet'],
  'Duek Eldorado': ['eldorado', 'duek'],
  'Poni Grand Rue': ['poni'],
  'Momo Rue Cantimpret': ['momo'],
  'Zmogk The elements': ['zmogk', 'the element'],
  'Tris Horizon': ['horizon', 'tris'],
  'Daniel Eime Resistance': ['resistance', 'eime'],
  "10eme ARTE L'envol des ballons": ['envol des ballons', '10eme'],
  'Arts2 Roland de Lassus': ['roland de lassus', 'arts2'],
  'Zesar Bahamonte Le Dragon': ['dragon', 'zesar', 'zesar'],
  'Zesar Bahamonte Saint Georges': ['saint georges', 'zesar'],
  'Noir Artist Don\'t sleep on your dream': ['dont sleep', "don't sleep", 'noir artist'],
  'Godmess Third Rua Storytelling': ['godmess', 'third'],
  'Leonidas Giannakopoulos Global City': ['global city'],
  'Thomas Istasse La lune de Malapert': ['malapert', 'istasse', 'lune'],
  'Dussart Myncke True story Marche aux herbes': ['true story'],
  'Dussart Myncke True story Croix Place': ['true story'],
  'Nean Cybele et Poliade': ['cybele', 'poliade', 'nean'],
};

function score(poiName, oeuvre) {
  const title = oeuvre.title || '';
  const slug = oeuvre.slug || '';
  const hay = norm(title + ' ' + slug);
  let s = 0;
  for (const a of ALIASES[poiName] || []) {
    if (hay.includes(norm(a))) s += 10;
  }
  const pt = tokens(poiName);
  const tt = new Set(tokens(title));
  let ov = 0;
  for (const t of pt) if (tt.has(t)) ov++;
  s += ov * 3;
  if (ov >= 2) s += 4;
  return s;
}

const oeuvres = await fetchAllOeuvres();
fs.writeFileSync(path.join(ROOT, 'scripts/visitmons-oeuvres.json'), JSON.stringify(oeuvres.map((o) => ({
  title: o.title, slug: o.slug, uuid: o.uuid, filename: o.image?.filename, url: o.image?.url, copyright: o.image?.copyright,
})), null, 2));
console.log('oeuvres', oeuvres.length, 'missing art', missingArt.length);

const used = new Set();
const matches = [];
const unmatched = [];
for (const poi of missingArt) {
  let best = null;
  let bestScore = 9;
  for (const o of oeuvres) {
    if (used.has(o.id || o.slug)) continue;
    if (!o.image?.filename && !o.image?.url) continue;
    const sc = score(poi.name, o);
    if (sc > bestScore) {
      bestScore = sc;
      best = o;
    }
  }
  if (best) {
    used.add(best.id || best.slug);
    matches.push({ poi, oeuvre: { title: best.title, slug: best.slug, filename: best.image.filename, url: best.image.url }, score: bestScore });
  } else unmatched.push(poi.name);
}

console.log('\nMATCHES', matches.length);
for (const m of matches) console.log(`  ${m.poi.name}  <=  ${m.oeuvre.title}  [${m.oeuvre.filename}] score=${m.score}`);
console.log('\nUNMATCHED', unmatched.length);
unmatched.forEach((n) => console.log('  -', n));

async function download(m) {
  const dest = path.join(IMAGES, poiImageBaseFromName(m.poi.name) + '.jpg');
  const rel = m.oeuvre.url || `/api/media/file/${encodeURIComponent(m.oeuvre.filename)}`;
  const url = rel.startsWith('http') ? rel : `https://www.visitmons.be${rel}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(res.status + ' ' + url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  console.log('OK', path.basename(dest), buf.length);
}

const downloaded = [];
const failed = [];
for (const m of matches) {
  try {
    await download(m);
    downloaded.push(m.poi.name);
  } catch (e) {
    failed.push({ name: m.poi.name, error: e.message });
    console.warn('FAIL', m.poi.name, e.message);
  }
  await sleep(150);
}

fs.writeFileSync(path.join(ROOT, 'scripts/visitmons-download-report.json'), JSON.stringify({ downloaded, unmatched, failed, matches: matches.map((m) => ({ poi: m.poi.name, title: m.oeuvre.title, file: m.oeuvre.filename })) }, null, 2));
console.log('\nDownloaded', downloaded.length, 'unmatched', unmatched.length, 'failed', failed.length);
