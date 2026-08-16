import fs from 'fs';

const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.status === 429 || text.startsWith('You are making')) { await sleep(1200 * (i + 1)); continue; }
    return JSON.parse(text);
  }
}

function isPhotoTitle(title) {
  return /\.(jpe?g|png|JPG|JPEG|PNG|webp)$/i.test(title) && !/\.(pdf|djvu)/i.test(title);
}

const queries = [
  'Mons "Théâtre Royal"',
  'Mons "Theatre Royal"',
  'Mons theatre Grand-Place',
  'intitle:"Mons" theatre',
  'Mons "Belle Plébéienne"',
  'Mons Harvent',
  'Mons "Reine Astrid" Waux',
  'Mons Astrid Rousseau',
  'Mons "Au Paradis"',
  'Mons Herrents OR harengs enseigne',
  'Mons "Tette d\'Or" OR "Tête d\'Or" Havré enseigne',
  'Mons "Grande Rose" Poterie',
  'Mons Laboureur Clef',
  'Mons "Ecaille d\'Or"',
  'Mons "Rue Léopold II"',
  'Mons "Rue Leopold II"',
  'Mons Petit Marché blason',
  'Mons "0 Mons - Rue de Nimy, 14"',
  'Mons "0 Mons - Rue de Nimy, 25"',
  'Mons "0 Mons - Rue de Nimy, 83"',
  'Mons "0 Mons - Rue de Nimy, 89"',
  'Mons "0 Mons - Rue d\'Havré, 15"',
  'Mons "0 Mons - Rue d\'Havré, 42"',
  'Mons "0 Mons - Rue d\'Havré, 44"',
  'Mons "0 Mons - Rue d\'Havré, 106"',
  'Mons "0 Mons - Rue d\'Havré, 114"',
  'Mons "0 Mons - Rue d\'Havré, 116"',
  'Mons "0 Mons - Rue de la Poterie"',
  'Mons "0 Mons - Rue du Hautbois, 22"',
  'Mons "0 Mons - Rue de Bertaimont"',
  'Mons "0 Mons - Rue de Houdain, 10"',
  'Mons "0 Mons - Rue de Houdain, 13"',
  'Mons "0 Mons - Rue des Fripiers, 22"',
  'Mons "0 Mons - Rue du Parc, 19"',
  'Mons "0 Mons - Rue de la Clef, 4"',
  'Mons "0 Mons - Rue de la Clef, 30"',
  'Mons "0 Mons - Rue Masquelier, 31"',
  'Mons "0 Mons - Rue de la Grande Triperie, 13"',
  'Mons "0 Mons - Rue des Groseilliers, 38"',
  'Mons "0 Mons - Grand\'Rue, 104"',
  'prefix:Mons 070204',
];

const all = {};
for (const q of queries) {
  const json = await wiki({
    action: 'query',
    list: 'search',
    srsearch: q.startsWith('prefix:') ? q.slice(7) : q,
    srnamespace: '6',
    srlimit: '15',
  });
  const hits = (json.query?.search || [])
    .filter((h) => isPhotoTitle(h.title))
    .map((h) => ({ title: h.title, snippet: String(h.snippet || '').replace(/<[^>]+>/g, '').slice(0, 160) }));
  all[q] = hits;
  console.log('\n==', q, hits.length);
  hits.slice(0, 6).forEach((h) => console.log(' ', h.title, '|', h.snippet));
  await sleep(160);
}

const parse = await wiki({ action: 'parse', page: 'Mons_(Hainaut)', prop: 'wikitext' });
const wt = parse.parse.wikitext['*'];
const theatre = [...wt.matchAll(/([^|\n]+)\|[^|\n]*[Tt]h[eé]atre[^\n]*/g)].map((m) => m[0].trim());
console.log('\nGALLERY THEATRE LINES');
theatre.forEach((l) => console.log(' ', l));

fs.writeFileSync('scripts/commons-strict-search.json', JSON.stringify({ all, theatre }, null, 2));
