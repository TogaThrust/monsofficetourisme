/**
 * Bump version + SW + notes after fill-16-ihs-93.mjs.
 * Lit les numéros RÉELS, +1. Usage: node scripts/bump-16-ihs-93.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function writeViaTmp(file, contents) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, contents);
  try { fs.unlinkSync(file); } catch {}
  fs.renameSync(tmp, file);
}

function copyViaTmp(src, dest) {
  writeViaTmp(dest, fs.readFileSync(src));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

const verSrc = read('version.js');
const verM = verSrc.match(/APP_VERSION = '(\d+)\.(\d+)\.(\d+)'/);
if (!verM) throw new Error('version.js: APP_VERSION introuvable');
const nextPatch = String(parseInt(verM[3], 10) + 1).padStart(verM[3].length, '0');
const nextVer = `${verM[1]}.${verM[2]}.${nextPatch}`;
const curVer = `${verM[1]}.${verM[2]}.${verM[3]}`;

const swSrc = read('service-worker.js');
const swM = swSrc.match(/precache-v(\d+)-ot/);
const rtM = swSrc.match(/runtime-v(\d+)-ot/);
if (!swM || !rtM) throw new Error('SW versions introuvables');
const nextSw = String(parseInt(swM[1], 10) + 1);
const nextRt = String(parseInt(rtM[1], 10) + 1);

const htmlSrc = read('index.html');
const epM = htmlSrc.match(/ot-sw-v(\d+)/);
if (!epM) throw new Error('ot-sw-v introuvable');
const nextEp = String(parseInt(epM[1], 10) + 1);

console.log('from', { ver: curVer, sw: swM[1], rt: rtM[1], epoch: epM[1] });
console.log('to  ', { ver: nextVer, sw: nextSw, rt: nextRt, epoch: nextEp });

writeViaTmp(
  path.join(ROOT, 'version.js'),
  verSrc.replace(`APP_VERSION = '${curVer}'`, `APP_VERSION = '${nextVer}'`),
);
writeViaTmp(
  path.join(ROOT, 'service-worker.js'),
  swSrc
    .replace(`precache-v${swM[1]}-ot`, `precache-v${nextSw}-ot`)
    .replace(`runtime-v${rtM[1]}-ot`, `runtime-v${nextRt}-ot`),
);
for (const f of ['index.html', 'main.html', 'parcours.html']) {
  const s = read(f);
  if (!s.includes(`ot-sw-v${epM[1]}`)) throw new Error('epoch manquant dans ' + f);
  writeViaTmp(path.join(ROOT, f), s.split(`ot-sw-v${epM[1]}`).join(`ot-sw-v${nextEp}`));
}

const notes = read('Release notes.txt');
const block =
  'CityLoop Quest Mons - Release notes\r\n' +
  `Version ${nextVer}\r\n` +
  '----------------------------------------\r\n' +
  '16 IHS 93 : texte long réécrit (sans répéter le court), IHS lu I H S, 10 langues + audio long.\r\n\r\n';
writeViaTmp(path.join(ROOT, 'Release notes.txt'), block + notes);

copyViaTmp(path.join(ROOT, 'version.js'), path.join(ROOT, 'dist/version.js'));
copyViaTmp(path.join(ROOT, 'service-worker.js'), path.join(ROOT, 'dist/service-worker.js'));
copyViaTmp(path.join(ROOT, 'index.html'), path.join(ROOT, 'dist/index.html'));
copyViaTmp(path.join(ROOT, 'main.html'), path.join(ROOT, 'dist/main.html'));
copyViaTmp(path.join(ROOT, 'parcours.html'), path.join(ROOT, 'dist/parcours.html'));
copyViaTmp(path.join(ROOT, 'Release notes.txt'), path.join(ROOT, 'dist/Release notes.txt'));
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('bumped', nextVer);
