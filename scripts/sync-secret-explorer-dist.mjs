import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function copySafe(srcRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(DIST, srcRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + '.tmp';
  fs.copyFileSync(src, tmp);
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
  console.log('copied', srcRel);
}

copySafe('js/poi-experiment.js');
copySafe('poi-experiment.html');
copySafe('data/pois_explorer.json');
copySafe('version.js');
copySafe('Release notes.txt');
copySafe('service-worker.js');

const imgDir = 'images/explorer-secret';
const abs = path.join(ROOT, imgDir);
fs.mkdirSync(path.join(DIST, imgDir), { recursive: true });
for (const f of fs.readdirSync(abs)) {
  copySafe(path.join(imgDir, f));
}
console.log('dist sync done');
