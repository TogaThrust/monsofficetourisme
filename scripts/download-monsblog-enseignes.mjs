import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const IMAGES = 'images';
const figures = JSON.parse(fs.readFileSync('scripts/monsblog-figures.json', 'utf8'));
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; CLQ-Mons-OT/1.0; collaboration VisitMons)' };

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

const MAP = [
  ['The Bootle Arms', 'THE BOOTLE ARMS'],
  ['Au Paradis', 'AU PARADIS'],
  ['Aux Trois Herrents', 'AU TROIS HERRENTS'],
  ['Armes de Mons Petit Marche', 'cour du Petit Marché'],
  ['IHS dans un soleil', 'rue de Nimy n°89'],
  ["A la Tette d'Or", "A LA TETTE D"],
  ["Au Lion d'Or", "AU LION D"],
  ['Millesime MDCCXII', 'MDCCXII'],
  ['Au Corbeau', 'AU CORBEAU'],
  ['A la Licorne', 'A LA LICORNE'],
  ['A la Grande Rose', 'A LA GRANDE ROSE'],
  ["A l'Ecaille d'Or", 'CAILLE D'],
  ['Fontaine Rue de Bertaimont', 'FONTAINE, rue de Bertaimont'],
  ['Mortier et Pilon', 'MORTIER ET PILON'],
  ['Colombe du Saint-Esprit', 'COLOMBE DU SAINT'],
  ['Au Paon et au Cygne', 'AU PAON ET AU CYGNE'],
  ['Cheval Dore', 'CHEVAL DORE'],
  ['Armes de Mons Rue de la Clef', 'rue de la Clef n°4'],
  ['Au Grand Laboureur', 'AU GRAND LABOUREUR'],
  ['St Franciscus Kring', 'ST FRANCISCUS KRING'],
  ['Cartouche et blason Grande Triperie', 'CARTOUCHE ET BLASON'],
  ['16 IHS 93', '16 IHS 93'],
  ['BF IHS IL', 'BF IHS IL'],
];

function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function findFigure(needle) {
  const n = norm(needle);
  return figures.find((f) => norm(f.caption).includes(n) && /^\d+\./.test(f.caption.trim()));
}

async function download(url) {
  const candidates = [
    url,
    url.replace('https://monsblog.be/', 'https://i0.wp.com/monsblog.be/') + '?ssl=1',
  ];
  for (const u of candidates) {
    const res = await fetch(u, { headers: UA });
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4000) continue;
    return buf;
  }
  throw new Error('download fail ' + url);
}

function toJpeg(srcPath, destPath) {
  const ps = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcPath.replace(/'/g, "''")}')
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters(1)
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
$img.Save('${destPath.replace(/'/g, "''")}', $codec, $enc)
$img.Dispose()
`;
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || 'convert fail');
}

const report = { downloaded: [], failed: [], unmatched: [] };
for (const [poi, needle] of MAP) {
  const fig = findFigure(needle);
  if (!fig) {
    report.unmatched.push(poi);
    console.log('NOHIT', poi);
    continue;
  }
  const dest = path.join(IMAGES, poiImageBaseFromName(poi) + '.jpg');
  const tmp = dest + '.src';
  try {
    const buf = await download(fig.url);
    fs.writeFileSync(tmp, buf);
    toJpeg(path.resolve(tmp), path.resolve(dest));
    fs.unlinkSync(tmp);
    const size = fs.statSync(dest).size;
    report.downloaded.push({ poi, caption: fig.caption.slice(0, 80), url: fig.url, size });
    console.log('OK', poi, size, fig.caption.slice(0, 70));
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    report.failed.push({ poi, error: e.message, url: fig.url });
    console.warn('FAIL', poi, e.message);
  }
}

fs.writeFileSync('scripts/monsblog-download-report.json', JSON.stringify(report, null, 2));
console.log('\nDONE', report.downloaded.length, 'fail', report.failed.length, 'unmatched', report.unmatched.length);
