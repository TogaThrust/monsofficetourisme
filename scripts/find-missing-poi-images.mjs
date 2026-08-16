import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES = path.join(ROOT, 'images');

const code = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(`${code}\nthis.locations = locations; this.circuits = circuits;`, ctx);
const { locations, circuits } = ctx;

const STANDARD = new Set(['famille', 'complet', 'petit', 'moyen', 'grand', 'petit_gare', 'moyen_gare', 'grand_gare', 'complet_gare']);
const THEMATIC = Object.keys(circuits).filter((k) => !STANDARD.has(k));

const imageFiles = new Set(fs.readdirSync(IMAGES).filter((f) => fs.statSync(path.join(IMAGES, f)).isFile()));
const imageLower = new Map();
for (const f of imageFiles) imageLower.set(f.toLowerCase(), f);

function normalizeFileName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').toLowerCase();
}
function poiImageBaseFromName(name) {
  if (!name) return '';
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}
const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.JPG', '.JPEG', '.PNG'];

function hasImage(location) {
  const candidates = [];
  if (location.image) candidates.push(location.image.replace(/^images\//, ''));
  if (location.audio) {
    const fromAudio = location.audio.replace(/^audio\//i, '').replace(/\.mp3$/i, '');
    for (const ext of EXTS) candidates.push(fromAudio + ext);
  }
  const rawName = (location.name || '').trim();
  const bases = [rawName, poiImageBaseFromName(rawName), normalizeFileName(rawName)].filter(Boolean);
  for (const base of bases) {
    for (const ext of EXTS) candidates.push(base + ext);
  }
  for (const c of candidates) {
    if (imageFiles.has(c) || imageLower.has(c.toLowerCase())) return true;
  }
  return false;
}

const thematicIdx = new Set();
const byCircuit = {};
for (const key of THEMATIC) {
  byCircuit[key] = [];
  for (const i of circuits[key]) {
    thematicIdx.add(i);
  }
}

const missing = [];
for (const i of [...thematicIdx].sort((a, b) => a - b)) {
  const loc = locations[i - 1];
  if (!loc) continue;
  if (hasImage(loc)) continue;
  const inCircuits = THEMATIC.filter((k) => circuits[k].includes(i));
  missing.push({ index: i, name: loc.name, circuits: inCircuits, lat: loc.lat, lng: loc.lng });
}

console.log(JSON.stringify({
  thematicCircuits: THEMATIC,
  thematicPoiCount: thematicIdx.size,
  missingCount: missing.length,
  missing
}, null, 2));
