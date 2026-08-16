import fs from 'fs';

const addresses = [
  'Rue de la Chaussée, 7000 Mons, Belgium',
  'Rue de la Petite Guirlande, 7000 Mons, Belgium',
  'Rue Rogier, 7000 Mons, Belgium',
  'Rue Léopold II, 7000 Mons, Belgium',
  'Rue de la Clef, 7000 Mons, Belgium',
  'Rue de Houdain, 7000 Mons, Belgium',
  'Rue du Hautbois, 7000 Mons, Belgium',
  'Rue du Miroir, 7000 Mons, Belgium',
  'Rue des Capucins, 7000 Mons, Belgium',
  "Grand'Rue 8, 7000 Mons, Belgium",
];

const cache = JSON.parse(fs.readFileSync('scripts/geocode-cache.json', 'utf8'));

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function geocode(address) {
  if (cache[address]) return cache[address];
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address);
  const res = await fetch(url, { headers: { 'User-Agent': 'CLQ-Mons-OT-parcours/1.0' } });
  const json = await res.json();
  await sleep(1100);
  if (!json[0]) {
    cache[address] = null;
    fs.writeFileSync('scripts/geocode-cache.json', JSON.stringify(cache, null, 2));
    console.warn('no hit', address);
    return null;
  }
  const hit = { lat: Number(json[0].lat), lng: Number(json[0].lon), display: json[0].display_name };
  cache[address] = hit;
  fs.writeFileSync('scripts/geocode-cache.json', JSON.stringify(cache, null, 2));
  console.log(address, '→', hit.lat.toFixed(5), hit.lng.toFixed(5));
  return hit;
}

for (const a of addresses) await geocode(a);
