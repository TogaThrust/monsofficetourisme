/**
 * Génère les MP3 des descriptions courtes (10 langues) via le TTS de la Factory (Polly).
 * Usage: node scripts/generate-short-audio.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FACTORY = "C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory";

config({ path: path.join(FACTORY, ".env") });

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, "lib", "tts-providers.js")).href
);
const { pronounceForTts } = await import("./tts-pronounce.mjs");

const LANGS = ["fr", "en", "nl", "de", "it", "es", "pl", "ar", "cn", "jp"];
const POLLY_LANG = { jp: "ja", cn: "cn" };
const CONCURRENCY = 3;

function uniquePoiAudios() {
  const circuit = fs.readFileSync(path.join(ROOT, "circuit-data.js"), "utf8");
  const map = new Map();
  const re = /name:\s*"([^"]+)"[\s\S]*?audio:\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(circuit))) {
    const name = m[1];
    const audio = m[2];
    if (!audio || !audio.startsWith("audio/")) continue;
    if (!map.has(name)) map.set(name, audio);
  }
  return map;
}

function basenameFromAudio(audioPath) {
  return path.basename(audioPath, ".mp3");
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
        console.error("FAIL", job.label, err.message || err);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => next()));
  return { ok, failed };
}

const shorts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "translations", "descriptions_short.json"), "utf8")
);
const poiAudios = uniquePoiAudios();
const jobs = [];
for (const [name, audioPath] of poiAudios) {
  const base = basenameFromAudio(audioPath);
  for (const lang of LANGS) {
    const text = pronounceForTts((shorts[lang]?.[name] || shorts.fr?.[name] || "").trim());
    if (!text) continue;
    const outRel = `audio/${base}_short_${lang}.mp3`;
    jobs.push({
      label: `${name} [${lang}]`,
      lang,
      pollyLang: POLLY_LANG[lang] || lang,
      text,
      outAbs: path.join(ROOT, outRel),
    });
  }
}

console.log(`POI audio: ${poiAudios.size}, jobs: ${jobs.length}, provider=${process.env.TTS_PROVIDER}`);
const t0 = Date.now();
const { ok, failed } = await runPool(jobs, CONCURRENCY, async (job) => {
  if (fs.existsSync(job.outAbs) && fs.statSync(job.outAbs).size > 1000) return;
  await synthesizeSpeechMp3(job.text, job.outAbs, { lang: job.pollyLang });
});
console.log(`Terminé: ${ok} ok, ${failed} erreurs, ${Math.round((Date.now() - t0) / 1000)}s`);
