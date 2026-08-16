import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
function base(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}
const MAP = {
  "A la Croix d'Or Croix-Place": "File:0 Mons - Croix-Place (2).JPG",
  "A la Bonne Femme": "File:0 Mons - Ruelle Spira (1).JPG",
  "Croix plume et pinceau": "File:0 Mons - Rue de la Terre du Prince - Mur de Baudouin (1).JPG",
  "A la Coupe d'Or": "File:0 Mons - Rue de la Coupe (1).JPG",
};
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  const res = await fetch(url, UA);
  return res.json();
}
for (const [name, title] of Object.entries(MAP)) {
  const dest = path.join(IMAGES, base(name) + '.jpg');
  if (fs.existsSync(dest)) { console.log('skip', name); continue; }
  const info = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1600' });
  const ii = Object.values(info.query.pages)[0].imageinfo?.[0];
  const url = ii?.thumburl || ii?.url;
  const buf = Buffer.from(await (await fetch(url, UA)).arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log('OK', name, buf.length);
}
