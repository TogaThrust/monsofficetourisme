/**
 * Assigne un fichier audio à chaque POI insolite et génère
 * les MP3 court + long dans les 10 langues (Polly / Factory).
 * Usage: node scripts/generate-insolite-audio.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { pronounceForTts } from './tts-pronounce.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FACTORY = 'C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory';

config({ path: path.join(FACTORY, '.env') });

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);

const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const CONCURRENCY = 3;

function audioBaseFromName(name) {
  return String(name || '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'Oe')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/(?:^|[\s-]+)(\w)/g, (_, c) => c.toUpperCase())
    .replace(/[\s-]+/g, '');
}

function ttsText(raw) {
  return pronounceForTts(
    String(raw || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
  );
}

const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'insolite-pois.json'), 'utf8'));
const names = [...new Set([
  ...meta.pois.map((p) => p.name),
  ...meta.reuse.filter((n) => n !== 'Grand-place'),
])];

function patchCircuitData() {
  const p = path.join(ROOT, 'circuit-data.js');
  let src = fs.readFileSync(p, 'utf8');
  let changed = 0;
  for (const name of names) {
    const base = audioBaseFromName(name);
    const audioPath = `audio/${base}.mp3`;
    const re = new RegExp(
      `(\\{ name: ${JSON.stringify(name)}, lat: [^,]+, lng: [^,]+, audio: )""`,
    );
    if (re.test(src)) {
      src = src.replace(re, `$1${JSON.stringify(audioPath)}`);
      changed++;
    }
  }
  fs.writeFileSync(p, src);
  console.log('circuit-data audio fields:', changed, '/', names.length);
}

async function runPool(jobs, limit, worker) {
  let i = 0;
  let failed = 0;
  let ok = 0;
  let skipped = 0;
  async function next() {
    while (i < jobs.length) {
      const job = jobs[i++];
      try {
        const did = await worker(job);
        if (did === 'skip') skipped++;
        else ok++;
        if ((ok + skipped) % 25 === 0) {
          console.log(`… ${ok + skipped}/${jobs.length} (${failed} erreurs, ${skipped} déjà là)`);
        }
      } catch (err) {
        failed++;
        console.error('FAIL', job.label, err.message || err);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => next()));
  return { ok, failed, skipped };
}

patchCircuitData();

const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

const jobs = [];
for (const name of names) {
  const base = audioBaseFromName(name);
  for (const lang of LANGS) {
    const shortText = ttsText(shorts[lang]?.[name] || shorts.fr?.[name] || '');
    const longText = ttsText(longs[lang]?.[name] || longs.fr?.[name] || '');
    if (shortText) {
      jobs.push({
        label: `${name} short [${lang}]`,
        lang,
        pollyLang: POLLY_LANG[lang] || lang,
        text: shortText,
        outAbs: path.join(ROOT, 'audio', `${base}_short_${lang}.mp3`),
      });
    }
    if (longText) {
      jobs.push({
        label: `${name} long [${lang}]`,
        lang,
        pollyLang: POLLY_LANG[lang] || lang,
        text: longText,
        outAbs: path.join(ROOT, 'audio', `${base}_${lang}.mp3`),
      });
    }
  }
}

console.log(`POI: ${names.length}, jobs: ${jobs.length}, provider=${process.env.TTS_PROVIDER || 'openai'}`);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });

const t0 = Date.now();
const { ok, failed, skipped } = await runPool(jobs, CONCURRENCY, async (job) => {
  if (fs.existsSync(job.outAbs) && fs.statSync(job.outAbs).size > 1000) return 'skip';
  await synthesizeSpeechMp3(job.text, job.outAbs, { lang: job.pollyLang });
  return 'ok';
});

console.log(
  `Terminé: ${ok} générés, ${skipped} déjà présents, ${failed} erreurs, ${Math.round((Date.now() - t0) / 1000)}s`,
);
if (failed) process.exit(1);
