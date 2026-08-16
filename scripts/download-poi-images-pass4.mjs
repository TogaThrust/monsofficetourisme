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
  "Rue du Miroir": "File:0 Mons - Rue du Miroir, 9.JPG",
  "Rue de Nimy extremite": "File:0 Mons - Rue de Nimy, 127-129.JPG",
  "Rue d'Havre extremite": "File:0 Mons - Rue d'Havré, 131.JPG",
};
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  return (await fetch(url, UA)).json();
}
for (const [name, title] of Object.entries(MAP)) {
  const dest = path.join(IMAGES, base(name) + '.jpg');
  if (fs.existsSync(dest)) continue;
  const info = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1600' });
  const ii = Object.values(info.query.pages)[0].imageinfo?.[0];
  const buf = Buffer.from(await (await fetch(ii.thumburl || ii.url, UA)).arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log('OK', name);
}
