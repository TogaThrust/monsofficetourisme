/**
 * Cherche des images Commons / visitMons pour les POI thématiques encore sans photo.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' };
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

const buildSrc = fs.readFileSync(path.join(ROOT, 'scripts/build-thematic-circuits.mjs'), 'utf8');
const addrByName = new Map();
for (const m of buildSrc.matchAll(/\{\s*name:\s*(['"])((?:\\\1|.)*?)\1[\s\S]*?address:\s*(['"])((?:\\\3|.)*?)\3/g)) {
  addrByName.set(m[2].replace(/\\'/g, "'").replace(/\\"/g, '"'), m[4].replace(/\\'/g, "'").replace(/\\"/g, '"'));
}

const missing = [];
const thematicIdx = new Set();
for (const key of THEMATIC) for (const i of circuits[key]) thematicIdx.add(i);
for (const i of [...thematicIdx].sort((a, b) => a - b)) {
  const loc = locations[i - 1];
  if (!loc || hasImage(loc)) continue;
  missing.push({
    index: i,
    name: loc.name,
    circuits: THEMATIC.filter((k) => circuits[k].includes(i)),
    address: addrByName.get(loc.name) || '',
  });
}

function parseAddress(address) {
  const a = String(address || '').replace(/,?\s*7000 Mons.*$/i, '').trim();
  const m = a.match(/^(.+?)\s+(\d+[A-Za-z]?)$/);
  if (m) return { street: m[1].trim(), number: m[2] };
  return { street: a, number: '' };
}

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, { headers: UA });
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

async function searchCommons(query, limit = 8) {
  const json = await wiki({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: String(limit),
  });
  return (json.query?.search || []).map((h) => ({ title: h.title, snippet: h.snippet?.replace(/<[^>]+>/g, '') }));
}

async function fileExists(title) {
  const json = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size' });
  const page = Object.values(json.query?.pages || {})[0];
  if (!page || page.missing != null || !page.imageinfo?.[0]) return null;
  return { title: page.title, url: page.imageinfo[0].url, size: page.imageinfo[0].size };
}

const results = [];
for (const poi of missing) {
  const { street, number } = parseAddress(poi.address);
  const guesses = [];
  if (street && number) {
    guesses.push(`File:0 Mons - ${street}, ${number}.JPG`);
    guesses.push(`File:0 Mons - ${street}, ${number} (1).JPG`);
    guesses.push(`File:0 Mons - ${street}, ${number} - (1).JPG`);
    guesses.push(`File:0 Mons - ${street}, ${number} - (2).JPG`);
    guesses.push(`File:${street}, ${number}.JPG`);
  }
  if (street && !number) {
    guesses.push(`File:0 Mons - ${street} (1).JPG`);
    guesses.push(`File:0 Mons - ${street}.JPG`);
  }

  const foundFiles = [];
  for (const g of guesses) {
    const hit = await fileExists(g);
    if (hit) foundFiles.push({ ...hit, via: 'guess' });
    await sleep(80);
  }

  const queries = [];
  if (street && number) queries.push(`Mons "${street}" ${number}`);
  if (street) queries.push(`Mons "${street}"`);
  queries.push(`Mons ${poi.name}`);
  const distinctive = poi.name.replace(/^(A |Au |Aux |Le |La |Les )/i, '').trim();
  if (distinctive.length > 4) queries.push(`Mons ${distinctive} enseigne`);

  const searches = [];
  for (const q of queries.slice(0, 3)) {
    try {
      searches.push({ q, hits: await searchCommons(q, 6) });
    } catch (e) {
      searches.push({ q, error: e.message });
    }
    await sleep(150);
  }

  const row = { name: poi.name, address: poi.address, street, number, foundFiles, searches };
  results.push(row);
  const nFiles = foundFiles.length;
  const nHits = searches.reduce((n, s) => n + (s.hits?.length || 0), 0);
  console.log(`${nFiles ? 'FILE' : nHits ? 'HIT' : '---'}  ${poi.name}  [${street} ${number}] files=${nFiles} hits=${nHits}`);
}

fs.writeFileSync(path.join(ROOT, 'scripts/missing-poi-search.json'), JSON.stringify({ missingCount: missing.length, results }, null, 2));
console.log('\nWrote scripts/missing-poi-search.json');
