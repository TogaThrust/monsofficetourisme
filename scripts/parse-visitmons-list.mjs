import fs from 'fs';
const html = fs.readFileSync(`${process.env.TEMP}/visitmons-oeuvres.html`, 'utf8');

const hrefs = [...html.matchAll(/href="([^"]*l-art-habite-la-ville\/oeuvres\/[^"]+)"/gi)].map((m) => m[1]);
const unique = [...new Set(hrefs)].filter((h) => !h.endsWith('/oeuvres') && !h.endsWith('/oeuvres/'));
console.log('artwork links', unique.length);
unique.slice(0, 30).forEach((h) => console.log(h));
console.log('...');
unique.slice(-10).forEach((h) => console.log(h));

const imgs = [...html.matchAll(/<(?:img|source)[^>]+(?:src|srcset|data-src)="([^"]+)"/gi)].map((m) => m[1]);
console.log('\nimg count', imgs.length);
[...new Set(imgs)].slice(0, 20).forEach((u) => console.log(u.slice(0, 180)));

const og = html.match(/og:image[^>]+content="([^"]+)"/);
console.log('\nog', og && og[1]);

// look for json / media
const media = [...html.matchAll(/https?:\/\/[^"'\s]+(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0]);
console.log('\nmedia urls', [...new Set(media)].length);
[...new Set(media)].slice(0, 25).forEach((u) => console.log(u.slice(0, 200)));
