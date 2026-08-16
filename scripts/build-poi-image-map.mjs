import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');

function poiImageBaseFromName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}
function normalizeFileName(name) {
  return poiImageBaseFromName(name).toLowerCase();
}

const files = fs.readdirSync(IMAGES).filter((f) => fs.statSync(path.join(IMAGES, f)).isFile());
const byLower = new Map(files.map((f) => [f.toLowerCase(), f]));
const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'];

function resolveFile(name, audio, explicit) {
  const tries = [];
  if (explicit && !/^https?:/i.test(explicit)) {
    tries.push(explicit.replace(/^images\//, ''));
  }
  const bases = [
    poiImageBaseFromName(name),
    normalizeFileName(name),
    name,
    audio ? path.basename(audio, '.mp3') : '',
  ].filter(Boolean);
  for (const base of bases) {
    for (const ext of EXTS) tries.push(base + ext);
  }
  for (const t of tries) {
    const hit = byLower.get(String(t).toLowerCase());
    if (hit) return 'images/' + hit;
  }
  return null;
}

const code = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(`${code}\nthis.locations = locations;`, ctx);

const map = {};
const missing = [];
for (const loc of ctx.locations) {
  if (!loc?.name || map[loc.name]) continue;
  const resolved = resolveFile(loc.name, loc.audio, loc.image);
  if (resolved) map[loc.name] = resolved;
  else missing.push(loc.name);
}

const out = path.join(ROOT, 'js', 'poi-image-map.js');
const body =
  '/* Auto-generated: chemins images locales uniquement. */\n' +
  'window.POI_IMAGE_MAP = ' +
  JSON.stringify(map, null, 2) +
  ';\n';
fs.writeFileSync(out, body);
console.log('mapped', Object.keys(map).length, 'missing', missing.length);
if (missing.length) console.log(missing.join('\n'));
