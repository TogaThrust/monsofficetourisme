import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; insolite images)' } };

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  return (await fetch(url, UA)).json();
}

async function download(title, dest) {
  const info = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1600' });
  const page = Object.values(info.query?.pages || {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error('no imageinfo ' + title);
  const url = ii.thumburl || ii.url;
  if (/\.djvu/i.test(url) || /\.pdf/i.test(url)) throw new Error('not a photo: ' + title);
  const buf = Buffer.from(await (await fetch(url, UA)).arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log('OK', path.basename(dest), '←', title, buf.length);
}

async function search(q) {
  const json = await wiki({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: '10' });
  return (json.query?.search || []).map((h) => h.title);
}

const MAP = {
  'Rampe du Château': [
    'File:0 Mons - Rue des Clercs - Maison espagnole - Beffroi.JPG',
    'File:Mons - Maison espagnole.JPG',
  ],
  "Rue de l'Âtre": [
    'File:0 Mons - Église Saint-Nicolas-en-Havré (2).JPG',
    'File:Mons - Eglise Saint-Nicolas-en-Havré.jpg',
  ],
};

for (const [name, fallbacks] of Object.entries(MAP)) {
  const dest = path.join(IMAGES, poiImageBaseFromName(name) + '.jpg');
  const queries = name === 'Rampe du Château'
    ? ['intitle:"Rampe du Château" Mons', 'Maison espagnole Mons rampe', 'Beffroi Mons rampe château']
    : ['intitle:"Âtre" Mons', 'Ruelle de l\'Âtre Mons', 'Église Saint-Nicolas-en-Havré Mons façade'];
  let titles = [];
  for (const q of queries) {
    titles = titles.concat(await search(q));
  }
  titles = [...new Set([...titles, ...fallbacks])].filter((t) => /\.(jpe?g|png|webp)$/i.test(t) && !/djvu/i.test(t));
  console.log('\n', name, 'candidates:');
  titles.slice(0, 8).forEach((t) => console.log('  ', t));
  let ok = false;
  for (const t of titles) {
    try {
      await download(t, dest);
      ok = true;
      break;
    } catch (err) {
      console.warn('  fail', t, err.message);
    }
  }
  if (!ok) console.error('NO IMAGE', name);
}
