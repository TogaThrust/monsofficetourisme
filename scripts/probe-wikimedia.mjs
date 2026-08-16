const queries = [
  'Mons "street art" Kobra',
  'Mons mural Kobra',
  'Category:Street art in Mons',
  'Mons "L\'Art habite la ville"',
  'Mons "Rue de Nimy"',
  'Mons "Grand\'Rue"',
  'File:Mons Rue',
  'Mons "Levalet"',
  'Mons "Nevercrew"',
  'Mons "Andrea Ravo Mattoni"',
];

for (const q of queries) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&srnamespace=6|14&srlimit=5&format=json';
  const j = await (await fetch(url, { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (tourism app image research)' } })).json();
  const hits = (j.query?.search || []).map((s) => s.title);
  console.log('\n==', q);
  console.log(hits.join('\n') || '(none)');
}

const catUrl = 'https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Mons&cmlimit=20&format=json';
const cat = await (await fetch(catUrl, { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0' } })).json();
console.log('\n== Category:Mons sample');
console.log((cat.query?.categorymembers || []).map((x) => x.title).join('\n'));
