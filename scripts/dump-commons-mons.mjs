import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'commons-mons-files.json');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.status === 429 || text.startsWith('You are making')) {
      await sleep(1500 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(res.status + ' ' + text.slice(0, 200));
    return JSON.parse(text);
  }
  throw new Error('rate limited');
}

async function listCategory(title) {
  const files = [];
  let cont = {};
  do {
    const j = await wiki({
      action: 'query',
      list: 'categorymembers',
      cmtitle: title,
      cmlimit: '500',
      cmtype: 'file|subcat',
      ...cont,
    });
    files.push(...(j.query?.categorymembers || []).map((x) => ({ title: x.title, ns: x.ns })));
    cont = j.continue || {};
    await sleep(350);
  } while (cont.cmcontinue);
  return files;
}

async function searchAll(srsearch) {
  const files = [];
  let sroffset = 0;
  while (true) {
    const j = await wiki({
      action: 'query',
      list: 'search',
      srsearch,
      srnamespace: '6',
      srlimit: '50',
      sroffset: String(sroffset),
    });
    const hits = j.query?.search || [];
    files.push(...hits.map((s) => s.title));
    if (!j.continue?.sroffset || hits.length === 0) break;
    sroffset = j.continue.sroffset;
    await sleep(350);
    if (files.length > 800) break;
  }
  return files;
}

const streetArt = (await listCategory('Category:Street art in Mons (Hainaut)')).filter((x) => x.ns === 6).map((x) => x.title);
const streetsCat = await listCategory('Category:Streets in Mons (Hainaut)');
const streetFiles = [];
for (const m of streetsCat) {
  if (m.ns === 14) {
    const inner = await listCategory(m.title);
    streetFiles.push(...inner.filter((x) => x.ns === 6).map((x) => x.title));
  } else if (m.ns === 6) streetFiles.push(m.title);
}
const zeroMons = await searchAll('intitle:"0 Mons"');
const all = [...new Set([...streetArt, ...streetFiles, ...zeroMons])];
fs.writeFileSync(OUT, JSON.stringify({ streetArt, streetFiles, zeroMons, all }, null, 2));
console.log({ streetArt: streetArt.length, streetFiles: streetFiles.length, zeroMons: zeroMons.length, all: all.length });
console.log('wrote', OUT);
