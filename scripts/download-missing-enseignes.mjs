/**
 * Télécharge les photos Commons des POI encore sans image
 * (enseignes galerie Mons + recherches par adresse / nom).
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

const GALLERY = {
  "A la Balance d'Or": 'File:Mons 070204 (1).JPG',
  "Au Pistolet d'Or": 'File:Mons 070204 (16).JPG',
  "La Croix d'Or Havre": 'File:Mons 070204 (26).JPG',
  "A la Faux d'Or": 'File:Mons 070204 (29).JPG',
  "A la Tasche d'Argent": 'File:Mons 070204 (3).JPG',
  "A la Paile d'Or": 'File:Mons 070204 (31).JPG',
  'Au Renard': 'File:Mons 070204 (32).JPG',
  'Le Lecteur Colas': 'File:Mons 070204 (38).JPG',
  'A la Couronne Grand Rue': 'File:Mons 070204 (53).JPG',
  'Le Gant': 'File:Mons 070204 (54).JPG',
  "A la Ville d'Avesnes": 'File:Mons 070204 (58).JPG',
  'Aux Trois Verts Chapeaux': 'File:Mons 070204 (84).JPG',
  "Au Mousqueton d'Or": 'File:Mons 070204 (94).JPG',
};

const EXTRA = {
  'Armes de Mons Rue de la Clef': 'File:Mons 070204 (64).JPG',
  'Rue de Houdain': "File:0 Grand'Place et hôtel de ville - Rue de Houdain - Mons (1).JPG",
  'Rue de la Clef': 'File:2016-07-04 15-41-04 ILCE-6300 DSC01286 (28022282112).jpg',
  'Rue du Hautbois': 'File:0 Mons - Rue du Hautbois, 14.JPG',
};

const SEARCH_HINTS = {
  'The Bootle Arms': ['Mons Bootle', 'Mons jumelage Bootle', 'Rue de Nimy 14 Mons'],
  'Au Paradis': ['Mons "Au Paradis" enseigne', 'Mons Rue de Nimy 25 enseigne'],
  'Aux Trois Herrents': ['Mons Herrents', 'Mons harengs enseigne', 'Rue de Nimy 83'],
  'Armes de Mons Petit Marche': ['Mons Petit Marché blason', 'Cour du Petit Marché Mons armes'],
  'IHS dans un soleil': ['Mons IHS soleil', 'Rue de Nimy 89 IHS'],
  "A la Tette d'Or": ["Mons Tette d'Or", "Rue d'Havré 15 enseigne"],
  "Au Lion d'Or": ["Mons Lion d'Or Havré", "Rue d'Havré 42"],
  'Millesime MDCCXII': ["Mons MDCCXII", "Rue d'Havré 44"],
  "A la Clef d'Or": ["Mons Clef d'Or Havré", "Rue d'Havré 44 clé"],
  'Au Corbeau': ["Mons Corbeau Havré", "Rue d'Havré 106"],
  'Pelles a enfourner 1573': ["Mons pelles enfourner", "Rue d'Havré 114"],
  'A la Licorne': ["Mons Licorne Havré", "Rue d'Havré 116 Franeau"],
  'A la Grande Rose': ['Mons Grande Rose Poterie', 'Rue de la Poterie 2 Mons'],
  "A l'Ecaille d'Or": ["Mons Ecaille d'Or", 'Rue du Hautbois 22'],
  'Fontaine Rue de Bertaimont': ['Mons Bertaimont fontaine', 'Rue de Bertaimont 31'],
  'Mortier et Pilon': ['Mons Mortier Pilon Houdain'],
  'Colombe du Saint-Esprit': ['Mons colombe Houdain', 'Rue de Houdain 13'],
  'Au Paon et au Cygne': ['Mons Paon Cygne Fripiers'],
  'Cheval Dore': ['Mons Cheval Doré Parc', 'Rue du Parc 19 Mons'],
  'Au Grand Laboureur': ['Mons Grand Laboureur', 'Rue de la Clef 30'],
  'St Franciscus Kring': ['Mons Franciscus Kring', 'Rue Masquelier 31'],
  'Cartouche et blason Grande Triperie': ['Mons Grande Triperie 13', 'Rue de la Grande Triperie 13'],
  '16 IHS 93': ['Mons Groseilliers IHS', 'Rue des Groseilliers 38'],
  'BF IHS IL': ["Mons Grand'Rue 104 IHS"],
  'Portes du Theatre Royal': ['Théâtre Royal Mons portes', 'Mons theatre medaillons Hoyaux'],
  'La Belle Plebeienne': ['Belle Plébéienne Mons', 'Harvent Waux-Hall'],
  'Buste de la reine Astrid': ['Reine Astrid Mons Waux-Hall', 'Rousseau Astrid Mons'],
  'Rue Leopold II': ['Rue Léopold II Mons', 'Boulevard Léopold II Mons'],
};

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

async function downloadFile(poiName, commonsTitle) {
  const dest = path.join(IMAGES, poiImageBaseFromName(poiName) + '.jpg');
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
    console.log('skip', poiName);
    return dest;
  }
  const info = await wiki({
    action: 'query',
    titles: commonsTitle,
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1600',
  });
  const page = Object.values(info.query.pages)[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error('no imageinfo ' + commonsTitle);
  const url = ii.thumburl || ii.url;
  const buf = Buffer.from(await (await fetch(url, UA)).arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  console.log('OK', poiName, '<=', commonsTitle, buf.length);
  return dest;
}

async function searchCommons(query, limit = 8) {
  const json = await wiki({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: String(limit),
  });
  return (json.query?.search || []).map((h) => ({
    title: h.title,
    snippet: String(h.snippet || '').replace(/<[^>]+>/g, ''),
  }));
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
  missing.push(loc.name);
}

const downloaded = [];
const failed = [];
const unmatched = [];
const searchLog = {};

const MAP = { ...GALLERY, ...EXTRA };

for (const name of missing) {
  if (!MAP[name]) continue;
  try {
    await downloadFile(name, MAP[name]);
    downloaded.push({ name, file: MAP[name], via: 'map' });
    imageFiles.add(poiImageBaseFromName(name) + '.jpg');
  } catch (e) {
    failed.push({ name, error: e.message, file: MAP[name] });
    console.warn('FAIL', name, e.message);
  }
  await sleep(120);
}

const stillMissing = missing.filter((n) => !imageFiles.has(poiImageBaseFromName(n) + '.jpg') && !imageLower.has((poiImageBaseFromName(n) + '.jpg').toLowerCase()));

for (const name of stillMissing) {
  const queries = SEARCH_HINTS[name] || [`Mons ${name}`];
  let picked = null;
  const allHits = [];
  for (const q of queries) {
    const hits = await searchCommons(q, 8);
    allHits.push({ q, hits });
    await sleep(180);
  }
  searchLog[name] = allHits;

  const nameTok = poiImageBaseFromName(name).toLowerCase().split('_').filter((w) => w.length > 3);
  for (const pack of allHits) {
    for (const h of pack.hits) {
      const t = h.title.toLowerCase() + ' ' + h.snippet.toLowerCase();
      if (/tomb|grave|cimet/i.test(t)) continue;
      if (/bruxelles|brussels|liege|namur|charleroi|tournai/i.test(t) && !/mons/.test(t)) continue;
      const score = nameTok.filter((w) => t.includes(w)).length;
      if (score >= Math.min(2, nameTok.length) || /enseigne|relief|medaillon|statue|buste/.test(t)) {
        picked = h.title;
        break;
      }
    }
    if (picked) break;
  }
  if (!picked && allHits[0]?.hits?.[0]) {
    const first = allHits[0].hits[0];
    if (/mons/i.test(first.title + first.snippet)) picked = first.title;
  }

  if (!picked) {
    unmatched.push(name);
    console.log('NOHIT', name);
    continue;
  }
  try {
    await downloadFile(name, picked);
    downloaded.push({ name, file: picked, via: 'search' });
    imageFiles.add(poiImageBaseFromName(name) + '.jpg');
  } catch (e) {
    failed.push({ name, error: e.message, file: picked });
    unmatched.push(name);
    console.warn('FAIL', name, e.message);
  }
  await sleep(150);
}

const report = { downloaded, failed, unmatched, searchLog };
fs.writeFileSync(path.join(ROOT, 'scripts/missing-poi-download-report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE downloaded', downloaded.length, 'failed', failed.length, 'unmatched', unmatched.length);
unmatched.forEach((n) => console.log('  -', n));
