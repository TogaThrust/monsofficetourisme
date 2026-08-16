/**
 * Télécharge depuis Wikimedia Commons les photos manquantes des POI thématiques.
 * Noms de fichiers = poiImageBaseFromName(name) + extension, pour coller à app.js.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const stop = new Set(['mons','belgique','file','jpg','jpeg','png','rue','de','la','le','du','des','et','au','aux','a','d','l','the','of','by','en','sur','dans','a','un','une','les']);
  return norm(s).split(' ').filter((w) => w.length >= 3 && !stop.has(w));
}
function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

const code = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(`${code}\nthis.locations = locations; this.circuits = circuits;`, ctx);
const { locations, circuits } = ctx;
const STANDARD = new Set(['famille','complet','petit','moyen','grand','petit_gare','moyen_gare','grand_gare','complet_gare']);
const THEMATIC = Object.keys(circuits).filter((k) => !STANDARD.has(k));
const imageFiles = new Set(fs.readdirSync(IMAGES).filter((f) => fs.statSync(path.join(IMAGES, f)).isFile()));
const imageLower = new Map([...imageFiles].map((f) => [f.toLowerCase(), f]));
const EXTS = ['.jpg','.jpeg','.png','.webp','.JPG','.JPEG','.PNG'];

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

const missing = [];
const thematicIdx = new Set();
for (const key of THEMATIC) for (const i of circuits[key]) thematicIdx.add(i);
for (const i of [...thematicIdx].sort((a, b) => a - b)) {
  const loc = locations[i - 1];
  if (!loc || hasImage(loc)) continue;
  missing.push({ index: i, name: loc.name, circuits: THEMATIC.filter((k) => circuits[k].includes(i)) });
}

const buildSrc = fs.readFileSync(path.join(ROOT, 'scripts/build-thematic-circuits.mjs'), 'utf8');
const addrByName = new Map();
for (const m of buildSrc.matchAll(/\{\s*name:\s*'((?:\\'|[^'])+)'[\s\S]*?address:\s*'((?:\\'|[^'])+)'/g)) {
  addrByName.set(m[1].replace(/\\'/g, "'"), m[2].replace(/\\'/g, "'"));
}
for (const m of buildSrc.matchAll(/\{\s*name:\s*"((?:\\"|[^"])+)"[\s\S]*?address:\s*'((?:\\'|[^'])+)'/g)) {
  addrByName.set(m[1].replace(/\\"/g, '"'), m[2].replace(/\\'/g, "'"));
}
for (const m of buildSrc.matchAll(/\{\s*name:\s*'((?:\\'|[^'])+)'[\s\S]*?address:\s*"((?:\\"|[^"])+)"/g)) {
  addrByName.set(m[1].replace(/\\'/g, "'"), m[2].replace(/\\"/g, '"'));
}
for (const m of buildSrc.matchAll(/\{\s*name:\s*"((?:\\"|[^"])+)"[\s\S]*?address:\s*"((?:\\"|[^"])+)"/g)) {
  addrByName.set(m[1].replace(/\\"/g, '"'), m[2].replace(/\\"/g, '"'));
}

function parseAddress(address) {
  if (!address) return null;
  const cleaned = address.replace(/,?\s*7000 Mons.*$/i, '').trim();
  const m = cleaned.match(/^(.*?)(?:\s+(\d+[a-zA-Z]?))?$/);
  if (!m) return { street: cleaned, number: null };
  return { street: m[1].trim(), number: m[2] || null };
}

const commons = JSON.parse(fs.readFileSync(path.join(__dirname, 'commons-mons-files.json'), 'utf8'));
const allFiles = commons.all || [];
const streetArt = commons.streetArt || [];

function parseMonsStreetFile(title) {
  const t = title.replace(/^File:/, '');
  const m = t.match(/0\s+Mons\s*-\s*(.+?)(?:\s*,\s*(\d+(?:\s*-\s*\d+)?)|\s+(\d+))?(?:\s*\([^)]+\))?\.jpe?g$/i);
  if (!m) return null;
  return { street: m[1].trim(), number: (m[2] || m[3] || '').split('-')[0].trim() || null, title };
}

const streetIndex = [];
for (const f of allFiles) {
  const p = parseMonsStreetFile(f);
  if (p) streetIndex.push(p);
}

function streetKey(s) {
  return norm(s)
    .replace(/\bgrand rue\b/g, 'grand rue')
    .replace(/\bgrandplace\b/g, 'grand place')
    .replace(/\brue d havre\b/g, 'rue d havre')
    .replace(/\brue de havre\b/g, 'rue d havre')
    .replace(/\brue a degres\b/g, 'rue a degres')
    .replace(/\brue andre masquelier\b/g, 'rue masquelier');
}

const ART_HINTS = {
  "Laurence Vray Instant suspendu": ["instant suspendu", "laurence vray"],
  "Atelier Pica Pica Panorama": ["pica pica", "panorama"],
  "Hell'O Folks": ["folks", "hell o"],
  "Kobra Torre de Saber": ["kobra", "torre de saber"],
  "Andrea Ravo Mattoni Charles Quint": ["charles quint", "ravo mattoni charles"],
  "Olivier Sonck Ivre d'histoires": ["ivre d histoires", "olivier sonck"],
  "Zesar Bahamonte Le Dragon": ["dragon zesar", "zesar bahamonte - rue rossignol"],
  "Zesar Bahamonte Saint Georges": ["st georges zesar", "saint georges zesar", "grand jour"],
  "Arts2 Tunnel de la Paix": ["tunnel de la paix"],
  "Noir Artist Don't sleep on your dream": ["don t sleep", "dont sleep", "noir artist"],
  "Andrea Ravo Mattoni Rue de Nimy 126": ["nimy 126", "ravo mattoni rue de nimy"],
  "Pierre Liebaert Je crois aux nuits": ["je crois aux nuits", "liebaert"],
  "Godmess Third Rua Storytelling": ["godmess", "thirdrua", "third rua"],
  "Leonidas Giannakopoulos Global City": ["global city", "giannakop"],
  "Ufocinque Passeggiando nella Storia": ["ufocinque", "passeggiando"],
  "Stelios Pupet Harmonizing Mons": ["harmonizing", "pupet", "stelios"],
  "Jana et JS Le couple de la rue Verte": ["jana", "rue verte", "a la fenetre"],
  "Lola Goies Rue du Miroir": ["lola goies", "goies"],
  "Eva Badalamenti Passage de l'ilot": ["badalamenti", "ilot", "bretagne"],
  "Blancbec Le monstrueux": ["monstrueux", "blancbec", "blancbec"],
  "Oli-B L'escapade": ["oli-b", "oli b", "escapade", "mur prend des couleurs"],
  "Levalet L'homme des cavernes": ["homme des cavernes", "leval"],
  "Farm Prod Rue de la Halle": ["farm prod", "duesberg", "adam eve"],
  "Hell'O Rue de la Halle": ["hell o rue de la halle"],
  "Ilan Walbrecq Georges Cuvelier": ["walbrecq", "cuvelier"],
  "Cedric Le Borgne La riviere": ["le borgne", "riviere"],
  "Andrea Buglisi La Gayole": ["buglisi", "gayole"],
  "Thomas Istasse La lune de Malapert": ["istasse", "malapert", "oiseau sous le lune"],
  "Eva Badalamenti Louis Buisseret": ["buisseret", "badalamenti"],
  "Taquen Bouquet of memory and hope": ["taquen", "fleur du souvenir", "bouquet"],
  "Dussart Myncke True story Marche aux herbes": ["marche aux herbes", "true story"],
  "Dussart Myncke True story Croix Place": ["true story", "croix place", "dussart"],
  "Duek Eldorado": ["eldorado", "duek"],
  "Poni Grand Rue": ["poni", "palafox"],
  "Paul Segard Ma ville s'endort": ["segard", "ville s endort", "nouveau printemps"],
  "Dulk The battle": ["dulk", "the battle"],
  "Celeste Gangolphe Mille et une feuille": ["gangolphe", "mille et une"],
  "Nean Cybele et Poliade": ["cybele", "poliade", "nean"],
  "Momo Rue Cantimpret": ["momo", "anneaux", "fresque de momo"],
  "Arkane Lalie": ["arkane", "lalie"],
  "Zmogk The elements": ["zmogk", "the element"],
  "Tris Horizon": ["horizon", "tris"],
  "Dourone Boulevard Sainctelette": ["sainctelette", "acteurs du doudou dourone"],
  "Daniel Eime Resistance": ["resistance", "eime"],
  "Nadege Dauvergne Place du Beguinage": ["dauvergne", "nature-morte", "nature morte"],
  "10eme ARTE L'envol des ballons": ["envol des ballons", "10eme arte", "10eme arte"],
  "Arts2 Roland de Lassus": ["hommage a roland de lassus", "ecole arts"],
  "Robert Montgomery Invisible graffiti of love": ["montgomery", "invisible graffiti"],
  "Projeto Ruido Le temps": ["projeto", "ruido"],
  "Margaux Del Vecchio Anto Carte": ["del vecchio", "anto carte"],
  "Rachelle Celiane Santerre Jacques Du Broeucq": ["senterre", "santerre", "fraise de roland", "colier de roland"],
  "Andrea Ravo Mattoni Sainte Waudru et ses filles": ["sainte waudru et ses filles", "ravo mattoni waudru"],
  "Ana Langeheldt Alegoria de santa Valdetrudis": ["langeheldt", "valdetrudis", "alegoria"],
  "Filip Gilissen Spread your wings": ["gilissen", "spread your wings"],
  "Nevercrew Dissipation": ["nevercrew", "dissipation", "rue a degres"],
};

function scoreArt(poiName, fileTitle) {
  const ft = norm(fileTitle);
  const hints = ART_HINTS[poiName] || [];
  let score = 0;
  for (const h of hints) {
    if (ft.includes(norm(h))) score += 8;
  }
  const poiTok = tokens(poiName);
  const fileTok = new Set(tokens(fileTitle));
  let overlap = 0;
  for (const t of poiTok) if (fileTok.has(t)) overlap++;
  score += overlap * 2;
  if (poiTok.length >= 2 && overlap >= 2) score += 3;
  return score;
}

function pickBest(files, scorer, minScore) {
  let best = null;
  let bestScore = minScore - 1;
  for (const f of files) {
    const s = scorer(f);
    if (s > bestScore) {
      bestScore = s;
      best = f;
    }
  }
  return bestScore >= minScore ? best : null;
}

function preferNumbered(files) {
  const ranked = files.slice().sort((a, b) => {
    const an = /\(1\)|\(1[a-z]?\)/.test(a) ? 0 : 1;
    const bn = /\(1\)|\(1[a-z]?\)/.test(b) ? 0 : 1;
    return an - bn || a.length - b.length;
  });
  return ranked[0];
}

const matches = [];
const unmatched = [];
const usedFiles = new Set();

for (const poi of missing) {
  const isArt = poi.circuits.some((c) => c.startsWith('art_'));
  const isStreet = poi.circuits.includes('commerces') || /^(Rue |Grand)/.test(poi.name);
  const addr = parseAddress(addrByName.get(poi.name));

  let file = null;
  let reason = '';

  if (isArt) {
    file = pickBest(streetArt.filter((f) => !usedFiles.has(f)), (f) => scoreArt(poi.name, f), 8);
    if (file) reason = 'street-art-title';
  }

  if (!file && addr && addr.number) {
    const sk = streetKey(addr.street);
    const hits = streetIndex.filter((p) => streetKey(p.street) === sk && p.number === addr.number && !usedFiles.has(p.title));
    if (hits.length) {
      file = preferNumbered(hits.map((h) => h.title));
      reason = 'street+number';
    }
  }

  if (!file && (isStreet || (addr && !addr.number))) {
    const streetName = addr ? addr.street : poi.name.replace(/\s+(debut|extremite)$/i, '');
    const sk = streetKey(streetName);
    const hits = streetIndex.filter((p) => {
      if (usedFiles.has(p.title)) return false;
      const ps = streetKey(p.street);
      if (ps !== sk) return false;
      if (addr && addr.number) return p.number === addr.number;
      return !p.number;
    });
    if (hits.length) {
      file = preferNumbered(hits.map((h) => h.title));
      reason = 'street-general';
    }
  }

  if (!file && !isArt) {
    file = pickBest(allFiles.filter((f) => !usedFiles.has(f)), (f) => scoreArt(poi.name, f), 10);
    if (file) reason = 'keyword';
  }

  if (file) {
    usedFiles.add(file);
    matches.push({ ...poi, file, reason, address: addrByName.get(poi.name) || '' });
  } else {
    unmatched.push({ ...poi, address: addrByName.get(poi.name) || '' });
  }
}

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.status === 429 || text.startsWith('You are making')) {
      await sleep(1200 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(res.status + ' ' + text.slice(0, 180));
    return JSON.parse(text);
  }
  throw new Error('rate limited');
}

async function extraSearch(poi) {
  const q = `"${poi.name.split(' ').slice(0, 3).join(' ')}" Mons`;
  const j = await wiki({
    action: 'query',
    list: 'search',
    srsearch: q,
    srnamespace: '6',
    srlimit: '8',
  });
  const hits = (j.query?.search || []).map((s) => s.title).filter((t) => /mons/i.test(t));
  return pickBest(hits, (f) => scoreArt(poi.name, f), 8);
}

console.log(`Première passe : ${matches.length} trouvés, ${unmatched.length} manquants. Recherche complémentaire...`);

const stillMissing = [];
for (const poi of unmatched) {
  await sleep(400);
  try {
    const file = await extraSearch(poi);
    if (file && !usedFiles.has(file)) {
      usedFiles.add(file);
      matches.push({ ...poi, file, reason: 'commons-search' });
      console.log(' +', poi.name, '→', file);
    } else {
      stillMissing.push(poi);
    }
  } catch (e) {
    stillMissing.push(poi);
    console.warn('search fail', poi.name, e.message);
  }
}

const downloaded = [];
const failedDl = [];
for (const m of matches) {
  const destBase = poiImageBaseFromName(m.name);
  const info = await wiki({
    action: 'query',
    titles: m.file,
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1600',
  });
  const page = Object.values(info.query?.pages || {})[0];
  const ii = page?.imageinfo?.[0];
  const url = ii?.thumburl || ii?.url;
  if (!url) {
    failedDl.push({ ...m, error: 'no url' });
    continue;
  }
  const ext = (url.match(/\.(jpe?g|png|webp)/i) || ['.jpg'])[0].toLowerCase().replace('jpeg', 'jpg');
  const dest = path.join(IMAGES, destBase + (ext === '.jpeg' ? '.jpg' : ext));
  try {
    const res = await fetch(url, UA);
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4000) throw new Error('too small ' + buf.length);
    fs.writeFileSync(dest, buf);
    downloaded.push({ name: m.name, file: path.basename(dest), source: m.file, reason: m.reason, bytes: buf.length });
    console.log('OK', m.name, '←', m.file);
  } catch (e) {
    failedDl.push({ ...m, error: e.message });
    console.warn('DL fail', m.name, e.message);
  }
  await sleep(250);
}

const report = {
  downloadedCount: downloaded.length,
  notFound: stillMissing.map((p) => ({ name: p.name, circuits: p.circuits, address: p.address })),
  downloadFailed: failedDl.map((p) => ({ name: p.name, file: p.file, error: p.error })),
  downloaded,
};
fs.writeFileSync(path.join(__dirname, 'poi-images-report.json'), JSON.stringify(report, null, 2));
console.log('\nTéléchargés:', downloaded.length);
console.log('Non trouvés:', stillMissing.length);
console.log('Échecs DL:', failedDl.length);
