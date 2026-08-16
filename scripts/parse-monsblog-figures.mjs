import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('scripts/monsblog-enseignes.html', 'utf8');
const figures = [];
const re = /<figure[\s\S]*?<img[\s\S]*?src="([^"]+)"[\s\S]*?(?:srcset="([^"]*)")?[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/gi;
let m;
while ((m = re.exec(html))) {
  const caption = m[3]
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/\s+/g, ' ')
    .trim();
  const srcset = m[2] || '';
  const originals = [...srcset.matchAll(/https?:\/\/[^ ]+\.(?:png|jpe?g)/gi)].map((x) => x[0].replace(/-\d+x\d+\.(png|jpe?g)/i, '.$1'));
  let url = originals.find((u) => /monsblog\.be\/wp-content/.test(u) && !/\?/.test(u))
    || m[1].replace(/https:\/\/i\d\.wp\.com\//, 'https://').replace(/\?.*$/, '').replace(/&amp;ssl=1/, '');
  url = url.replace(/^https:\/\/i0\.wp\.com\//, 'https://').split('?')[0];
  figures.push({ url, caption: caption.slice(0, 220) });
}
console.log('figures', figures.length);
figures.forEach((f, i) => console.log(String(i).padStart(3), f.caption.slice(0, 110)));
fs.writeFileSync('scripts/monsblog-figures.json', JSON.stringify(figures, null, 2));
