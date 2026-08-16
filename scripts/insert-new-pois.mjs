import fs from 'fs';

const out = JSON.parse(fs.readFileSync('scripts/thematic-circuits-output.json', 'utf8'));
const p = 'circuit-data.js';
let s = fs.readFileSync(p, 'utf8');
if (s.includes("Rue d'Enghien")) {
  console.log('already inserted');
  process.exit(0);
}
const lines = out.newPois.map((poi) => {
  const extra = poi.skipUnless ? `, skipUnless: ${JSON.stringify(poi.skipUnless)}` : '';
  return `    { name: ${JSON.stringify(poi.name)}, lat: ${poi.lat}, lng: ${poi.lng}, audio: ""${extra} },`;
}).join('\n');

const needle = '    { name: "BAM", lat: 50.45561164910952, lng: 3.9525083177023212, audio: "", image: "images/beauxarts.jpg", skipUnless: "doudouMuseumOpen" },';
if (!s.includes(needle)) {
  console.error('BAM line not found');
  process.exit(1);
}
s = s.replace(needle, needle + '\n' + lines);
fs.writeFileSync(p, s);
console.log('inserted', out.newPois.length, 'POIs');
