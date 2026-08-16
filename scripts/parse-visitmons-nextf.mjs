import fs from 'fs';

const listing = fs.readFileSync(`${process.env.TEMP}/visitmons-oeuvres.html`, 'utf8');
const folks = fs.readFileSync(`${process.env.TEMP}/visitmons-folks.html`, 'utf8');

function mediaFiles(html) {
  return [...new Set([...html.matchAll(/\/api\/media\/file\/([^"'\\\s]+)/g)].map((m) => decodeURIComponent(m[1].replace(/\\u002F/g, '/'))))];
}

console.log('listing media', mediaFiles(listing).length);
mediaFiles(listing).forEach((f) => console.log(' L', f));
console.log('\nfolks media', mediaFiles(folks).length);
mediaFiles(folks).forEach((f) => console.log(' F', f));

const alts = [...listing.matchAll(/alt="([^"]+)"/g)].map((m) => m[1]);
console.log('\nalts', [...new Set(alts)]);

const titles = [...listing.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
console.log('\nh3', titles);

// extract next_f blobs
const blobs = [...listing.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)].map((m) => m[1]);
console.log('\nnext_f blobs', blobs.length, 'chars', blobs.reduce((n, b) => n + b.length, 0));
const joined = blobs.join('').replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\u002F/g, '/');
fs.writeFileSync(`${process.env.TEMP}/visitmons-nextf.txt`, joined);
console.log('wrote nextf', joined.length);

const slugHits = [...joined.matchAll(/oeuvres\/[a-z0-9\-]+-\d+/gi)];
console.log('slugs in nextf', [...new Set(slugHits.map((m) => m[0]))].slice(0, 20), 'count', new Set(slugHits.map((m) => m[0])).size);
