import fs from 'fs';
const html = fs.readFileSync(`${process.env.TEMP}/visitmons-oeuvres.html`, 'utf8');

const slugs = [...html.matchAll(/oeuvres\/([a-z0-9\-_%]+)/gi)].map((m) => m[1]);
console.log('slug samples', [...new Set(slugs)].slice(0, 40));
console.log('slug count', new Set(slugs).size);

const apis = [...html.matchAll(/\/api\/[^"'\\\s]+/g)].map((m) => m[0]);
console.log('\napi', [...new Set(apis)].slice(0, 40));

const jsonBits = html.match(/"items"\s*:|"artworks"|l-art-habite|media\/file/g);
console.log('\nmarkers', jsonBits && jsonBits.slice(0, 20));

const idx = html.indexOf('api/media/file');
console.log('\naround first media', html.slice(Math.max(0, idx - 200), idx + 250));

const nuxt = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
const next = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
console.log('nuxt', !!nuxt, 'next', !!next);

const payloads = [...html.matchAll(/<script[^>]*>(\{[\s\S]{200,5000}\})<\/script>/g)];
console.log('inline json scripts', payloads.length);
