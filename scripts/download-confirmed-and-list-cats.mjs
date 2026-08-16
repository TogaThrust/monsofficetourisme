import fs from 'fs';
import path from 'path';

const IMAGES = 'images';
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function base(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.status === 429 || text.startsWith('You are making')) { await sleep(1200 * (i + 1)); continue; }
    return JSON.parse(text);
  }
}

async function download(poiName, title) {
  const dest = path.join(IMAGES, base(poiName) + '.jpg');
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
    console.log('skip', poiName);
    return;
  }
  const info = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|mime|size', iiurlwidth: '1600' });
  const ii = Object.values(info.query.pages)[0]?.imageinfo?.[0];
  if (!ii) throw new Error('no info ' + title);
  const buf = Buffer.from(await (await fetch(ii.thumburl || ii.url, UA)).arrayBuffer());
  if (buf.length < 4000) throw new Error('small');
  fs.writeFileSync(dest, buf);
  console.log('OK', poiName, '<=', title, buf.length);
}

const MAP = {
  'Portes du Theatre Royal': 'File:0 Grille du Théatre royal de Mons.JPG',
  'Pelles a enfourner 1573': "File:0 Mons - Rue d'Havré, 114 et Jardin Gustave Jacobs (1).JPG",
  'Fontaine Rue de Bertaimont': 'File:0 Mons - Rue de Bertaimont, 33 (1).JPG',
};

for (const [name, title] of Object.entries(MAP)) {
  try { await download(name, title); } catch (e) { console.warn('FAIL', name, e.message); }
  await sleep(150);
}

async function allMembers(cat) {
  let cmcontinue;
  const out = [];
  do {
    const json = await wiki({
      action: 'query',
      list: 'categorymembers',
      cmtitle: cat,
      cmlimit: '100',
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    out.push(...(json.query?.categorymembers || []).map((m) => m.title));
    cmcontinue = json.continue?.cmcontinue;
    await sleep(120);
  } while (cmcontinue);
  return out;
}

const cats = [
  "Category:Rue de Nimy, Mons",
  "Category:Rue d'Havré (Mons)",
  "Category:Rue d'Havré, Mons",
  "Category:Rue du Hautbois, Mons",
  "Category:Rue de la Poterie, Mons",
  "Category:Rue des Fripiers, Mons",
  "Category:Rue du Parc, Mons",
  "Category:Rue Masquelier, Mons",
  "Category:Rue des Groseilliers, Mons",
  "Category:Grand'Rue, Mons",
  "Category:Grand Rue (Mons)",
  "Category:Parc du Waux-Hall",
  "Category:Waux Hall (Mons)",
  "Category:Théâtre royal de Mons",
  "Category:Theatre royal de Mons",
];
const catDump = {};
for (const c of cats) {
  const mem = await allMembers(c);
  catDump[c] = mem;
  console.log(mem.length, c);
  mem.slice(0, 12).forEach((t) => console.log('  ', t));
}

const prefixHits = [];
let apcontinue;
do {
  const json = await wiki({
    action: 'query',
    list: 'allpages',
    apnamespace: '6',
    apprefix: 'Mons 070204',
    aplimit: '100',
    ...(apcontinue ? { apcontinue } : {}),
  });
  prefixHits.push(...(json.query?.allpages || []).map((p) => p.title));
  apcontinue = json.continue?.apcontinue;
  await sleep(120);
} while (apcontinue);
console.log('\n070204 files', prefixHits.length);
prefixHits.forEach((t) => console.log(' ', t));

fs.writeFileSync('scripts/commons-cats-remaining.json', JSON.stringify({ catDump, prefixHits }, null, 2));
