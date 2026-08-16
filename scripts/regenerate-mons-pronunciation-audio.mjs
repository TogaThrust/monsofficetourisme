/**
 * Régénère les MP3 dont le texte source contient Mons / VisitMons,
 * avec prononciation TTS Monss / VisitMonss.
 * Les JSON affichés ne sont pas modifiés.
 *
 * Usage:
 *   node scripts/regenerate-mons-pronunciation-audio.mjs --dry-run
 *   node scripts/regenerate-mons-pronunciation-audio.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { pronounceForTts, needsMonsPronunciationFix } from './tts-pronounce.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FACTORY = 'C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory';
const DRY = process.argv.includes('--dry-run');

config({ path: path.join(FACTORY, '.env') });

const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const CONCURRENCY = 3;

function uniquePoiAudios() {
  const circuit = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
  const map = new Map();
  const re = /name:\s*"([^"]+)"[\s\S]*?audio:\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(circuit))) {
    const name = m[1];
    const audio = m[2];
    if (!audio || !audio.startsWith('audio/')) continue;
    if (!map.has(name)) map.set(name, audio);
  }
  return map;
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

async function runPool(jobs, limit, worker) {
  let i = 0;
  let failed = 0;
  let ok = 0;
  async function next() {
    while (i < jobs.length) {
      const job = jobs[i++];
      try {
        await worker(job);
        ok++;
        if (ok % 20 === 0) {
          console.log(`… ${ok}/${jobs.length} (${failed} erreurs)`);
        }
      } catch (err) {
        failed++;
        console.error('FAIL', job.label, err.message || err);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => next()));
  return { ok, failed };
}

const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
const poiAudios = uniquePoiAudios();
const jobs = [];

for (const [name, audioPath] of poiAudios) {
  const base = path.basename(audioPath, '.mp3');
  for (const lang of LANGS) {
    const shortRaw = shorts[lang]?.[name];
    const longRaw = longs[lang]?.[name];
    if (shortRaw && needsMonsPronunciationFix(shortRaw)) {
      jobs.push({
        label: `${name} short [${lang}]`,
        lang,
        pollyLang: POLLY_LANG[lang] || lang,
        text: ttsText(shortRaw),
        outAbs: path.join(ROOT, 'audio', `${base}_short_${lang}.mp3`),
      });
    }
    if (longRaw && needsMonsPronunciationFix(longRaw)) {
      jobs.push({
        label: `${name} long [${lang}]`,
        lang,
        pollyLang: POLLY_LANG[lang] || lang,
        text: ttsText(longRaw),
        outAbs: path.join(ROOT, 'audio', `${base}_${lang}.mp3`),
      });
    }
  }
}

const byLang = Object.fromEntries(LANGS.map((l) => [l, jobs.filter((j) => j.lang === l).length]));
console.log(`POI audio: ${poiAudios.size}, jobs à régénérer: ${jobs.length}`);
console.log('Par langue:', byLang);

if (DRY) {
  const sample = jobs.slice(0, 8).map((j) => j.label);
  console.log('Exemples:', sample.join(' | '));
  process.exit(0);
}

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);

console.log(`provider=${process.env.TTS_PROVIDER || 'openai'}`);
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });

const t0 = Date.now();
const { ok, failed } = await runPool(jobs, CONCURRENCY, async (job) => {
  await synthesizeSpeechMp3(job.text, job.outAbs, { lang: job.pollyLang });
});
console.log(`Terminé: ${ok} régénérés, ${failed} erreurs, ${Math.round((Date.now() - t0) / 1000)}s`);
if (failed) process.exit(1);
