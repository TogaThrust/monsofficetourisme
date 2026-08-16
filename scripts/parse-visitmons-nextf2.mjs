import fs from 'fs';
const joined = fs.readFileSync(`${process.env.TEMP}/visitmons-nextf.txt`, 'utf8');

const keys = ['slug', 'permalink', 'href', 'path', 'page=', 'offset', 'cms', 'strapi', 'payload', 'artwork'];
for (const k of keys) {
  const n = (joined.match(new RegExp(k, 'gi')) || []).length;
  if (n) console.log(k, n);
}

const hrefs = [...joined.matchAll(/\/fr\/l-art-habite-la-ville\/oeuvres\/[a-z0-9\-]+/gi)];
console.log('paths', [...new Set(hrefs.map((m) => m[0]))].slice(0, 30), 'count', new Set(hrefs.map((m) => m[0])).size);

const ids = [...joined.matchAll(/--[a-z]*-?(\d{5,6})/g)];
console.log('id-like', [...new Set(ids.map((m) => m[0]))].slice(0, 20));

// look for JSON-like title fields
const titles = [...joined.matchAll(/"title"\s*:\s*"([^"]{5,80})"/g)].map((m) => m[1]);
console.log('titles', [...new Set(titles)].slice(0, 40));

const snippet = joined.indexOf('Harmonizing');
console.log('\naround Harmonizing', joined.slice(snippet - 400, snippet + 600));
