import fs from 'fs';
const html = fs.readFileSync(`${process.env.TEMP}/sac-mons.html`, 'utf8');
const zones = [...html.matchAll(/zones\/(\d+)/g)].map((m) => m[1]);
console.log('zones', [...new Set(zones)].slice(0, 30));
const jsonUrls = [...html.matchAll(/https?:\/\/[^"'\\\s]+markers\.json/g)].map((m) => m[0]);
console.log('jsonUrls', [...new Set(jsonUrls)].slice(0, 20));
const idx = html.indexOf('markers.json');
console.log('idx', idx);
if (idx >= 0) console.log(html.slice(Math.max(0, idx - 250), idx + 250));
const cityMatch = html.match(/"slug":"mons"[\s\S]{0,400}/);
console.log('cityMatch', cityMatch && cityMatch[0].slice(0, 400));
const idMatch = html.match(/city[_]?[Ii]d[^,]{0,40}/g);
console.log('cityId', idMatch && idMatch.slice(0, 10));
const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (nextData) {
  const data = JSON.parse(nextData[1]);
  fs.writeFileSync(`${process.env.TEMP}/sac-mons-next.json`, JSON.stringify(data, null, 2));
  console.log('NEXT_DATA keys', Object.keys(data));
  console.log('pageProps keys', data.props && data.props.pageProps && Object.keys(data.props.pageProps));
} else {
  console.log('no NEXT_DATA');
  const nuxt = html.match(/__NUXT__|window\.__/ );
  console.log('nuxt?', nuxt && nuxt[0]);
}
