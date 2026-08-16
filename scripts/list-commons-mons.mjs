const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', ...params });
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(res.status + ' ' + await res.text());
  return res.json();
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
      ...cont,
    });
    files.push(...(j.query?.categorymembers || []).map((x) => x.title));
    cont = j.continue || {};
    await sleep(400);
  } while (cont.cmcontinue);
  return files;
}

const cats = [
  'Category:Street art in Mons (Hainaut)',
  'Category:Mons (Hainaut)',
];
for (const cat of cats) {
  const members = await listCategory(cat);
  console.log('\n==', cat, members.length);
  console.log(members.slice(0, 40).join('\n'));
  if (members.length > 40) console.log('... +' + (members.length - 40));
}

await sleep(500);
const search = await wiki({
  action: 'query',
  list: 'search',
  srsearch: 'intitle:"0 Mons"',
  srnamespace: '6',
  srlimit: '50',
});
console.log('\n== intitle 0 Mons', search.query?.searchinfo?.totalhits);
console.log((search.query?.search || []).map((s) => s.title).join('\n'));
