import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function appVersion() {
  const v = fs.readFileSync(path.join(ROOT, 'version.js'), 'utf8');
  const m = v.match(/APP_VERSION = '([^']+)'/);
  return m ? m[1] : '?';
}

function verNum(v) {
  const p = String(v).split('.').map((n) => parseInt(n, 10) || 0);
  return (p[0] || 0) * 10000 + (p[1] || 0) * 100 + (p[2] || 0);
}

function isRealLong(longText, shortText) {
  const body = String(longText || '')
    .replace(/\n\nAdresse[^\n]*\s*$/u, '')
    .replace(/\n\nAddress:[^\n]*\s*$/u, '')
    .replace(/\n\nAdres:[^\n]*\s*$/u, '')
    .replace(/\n\nIndirizzo:[^\n]*\s*$/u, '')
    .replace(/\n\nDirección:[^\n]*\s*$/u, '')
    .trim();
  const short = String(shortText || '').trim();
  if (!body || body === short) return false;
  if (body.length < 180) return false;
  return true;
}

function snapshot() {
  const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
  const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
  const names = [
    "A la Paile d'Or",
    'Au Corbeau',
    'Pelles a enfourner 1573',
    "Au Mousqueton d'Or",
    "A la Faux d'Or",
    "La Croix d'Or Havre",
    'A la Licorne',
    'La Belle Plebeienne',
  ];
  const rows = names.map((name) => {
    const L = longs.fr?.[name] || '';
    const S = shorts.fr?.[name] || '';
    return { name, real: isRealLong(L, S), len: L.length };
  });
  const ver = appVersion();
  const ready = verNum(ver) >= verNum('26.08.153') && rows.every((r) => r.real);
  return { ver, ready, rows };
}

const maxMs = 28 * 60 * 1000;
const start = Date.now();
while (true) {
  const snap = snapshot();
  console.log(new Date().toISOString(), JSON.stringify(snap));
  if (snap.ready) {
    console.log('READY');
    process.exit(0);
  }
  if (Date.now() - start >= maxMs) {
    console.log('TIMEOUT');
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 25000));
}
