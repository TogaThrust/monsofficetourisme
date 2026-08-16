import fs from 'fs';
const html = fs.readFileSync(`${process.env.TEMP}/sac-mons.html`, 'utf8');

const media = [...html.matchAll(/https?:\\\/\\\/streetart\.(?:media|cities\.com)[^"\\]+/g)].slice(0, 5);
console.log('escaped media', media.map((m) => m[0]));

const media2 = [...html.matchAll(/streetart\.media\/[^"\\]+/g)].slice(0, 10);
console.log('media2', [...new Set(media2.map((m) => m[0]))]);

const titles = [...html.matchAll(/"title":"([^"]{3,80})"/g)].map((m) => m[1]).slice(0, 30);
console.log('titles', titles);

const hrefs = [...html.matchAll(/cities\\\/mons\\\/markers\\\/([a-f0-9-]+)/g)].map((m) => m[1]);
console.log('marker ids count', new Set(hrefs).size, [...new Set(hrefs)].slice(0, 5));

// try fetching markers
const urls = [
  'https://streetartcities.com/data/zones/1090/markers.json',
  'https://streetartcities.com/cities/mons/markers.json',
  'https://streetartcities.com/open-api/cities/1090/markers',
  'https://streetartcities.com/api/cities/1090/markers',
  'https://streetartcities.com/data/open-data/Country:BE/Month:2026-07.json',
];
for (const url of urls.slice(0, 4)) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0' } });
    const text = await res.text();
    console.log(url, res.status, text.slice(0, 180).replace(/\s+/g, ' '));
  } catch (e) {
    console.log(url, 'ERR', e.message);
  }
}
