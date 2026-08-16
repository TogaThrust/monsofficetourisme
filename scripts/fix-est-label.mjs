import fs from 'fs';
const p = 'translations/translations.json';
const tr = JSON.parse(fs.readFileSync(p, 'utf8'));
for (const lang of Object.keys(tr)) {
  const v = tr[lang].circuit_curiosites_est;
  if (typeof v === 'string') {
    tr[lang].circuit_curiosites_est = v.replace('3,0 km — 1h50', '3,4 km — 2h').replace('3.0 km', '3,4 km');
  }
}
fs.writeFileSync(p, JSON.stringify(tr, null, 2));
console.log('updated curiosites_est labels');
