/**
 * Télécharge en local les 8 photos de POI encore absentes (Commons, 1600px).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app)' } };

function poiImageBaseFromName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

const TARGETS = [
  { name: "Rue d'Enghien", queries: ["Rue d'Enghien Mons", "Rue d Enghien Mons Belgique"] },
  { name: "Rue du Chapitre", queries: ["Rue du Chapitre Mons", "Chapitre Mons rue"] },
  { name: "Rue des Fripiers", queries: ["Rue des Fripiers Mons"] },
  { name: "Thanks Galerie", queries: ["Thanks Galerie Mons", "Thanks street art Mons"] },
  { name: "Lask'Art", queries: ["Lask'Art Mons", "Lask Art Mons fresque"] },
  { name: "Rue de la Coupe", queries: ["Rue de la Coupe Mons"] },
  { name: "Rue d'Havre", queries: ["Rue d'Havré Mons", "Rue d'Havre Mons"] },
  { name: "1582 4+W", queries: ["1582 Mons street art", "4+W Mons fresque"] },
];

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error('commons ' + res.status);
  return res.json();
}

async function findFile(queries) {
  for (const q of queries) {
    const j = await wiki({
      action: 'query',
      list: 'search',
      srsearch: q,
      srnamespace: '6',
      srlimit: '8',
    });
    const hits = j.query?.search || [];
    const file = hits.find((h) => /mons/i.test(h.title)) || hits[0];
    if (file?.title) return file.title;
  }
  return null;
}

for (const t of TARGETS) {
  const dest = path.join(IMAGES, poiImageBaseFromName(t.name) + '.jpg');
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
    console.log('skip', t.name);
    continue;
  }
  try {
    const file = await findFile(t.queries);
    if (!file) {
      console.log('NONE', t.name);
      continue;
    }
    const info = await wiki({
      action: 'query',
      titles: file,
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '1600',
    });
    const page = Object.values(info.query?.pages || {})[0];
    const ii = page?.imageinfo?.[0];
    const url = ii?.thumburl || ii?.url;
    if (!url) {
      console.log('NOURL', t.name, file);
      continue;
    }
    const res = await fetch(url, UA);
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4000) throw new Error('too small');
    fs.writeFileSync(dest, buf);
    console.log('OK', t.name, '←', file, buf.length);
  } catch (err) {
    console.log('FAIL', t.name, err.message);
  }
}
