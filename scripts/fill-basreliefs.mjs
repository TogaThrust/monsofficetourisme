/**
 * Bas-reliefs Nord / Est / Sud / Ouest :
 * - vérifie court + long en 10 langues
 * - traduit les manques
 * - assigne audio dans circuit-data.js
 * - génère MP3 court + long (10 langues)
 * - génère un quiz (3 Q / POI) puis traduit
 *
 * Usage:
 *   node scripts/fill-basreliefs.mjs
 *   node scripts/fill-basreliefs.mjs --phase texts
 *   node scripts/fill-basreliefs.mjs --phase audio
 *   node scripts/fill-basreliefs.mjs --phase quiz
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

const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const TARGET_CIRCUITS = (() => {
  const i = process.argv.indexOf('--circuits');
  if (i >= 0 && process.argv[i + 1]) {
    return process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['curiosites_nord', 'curiosites_est', 'curiosites_sud', 'curiosites_ouest'];
})();
const SKIP_QUIZ_ALWAYS = new Set(['Grand-place']);
const ADDRESS_LABEL = {
  fr: 'Adresse :',
  en: 'Address:',
  nl: 'Adres:',
  de: 'Adresse:',
  it: 'Indirizzo:',
  es: 'Dirección:',
  pl: 'Adres:',
  ar: 'العنوان :',
  cn: '地址：',
  jp: '住所：',
};
const PHASE = (() => {
  const i = process.argv.indexOf('--phase');
  return i >= 0 ? process.argv[i + 1] : 'all';
})();

function loadCircuit() {
  const src = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
  return new Function(`${src}\nreturn { locations, circuits };`)();
}

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

function normalizeFileName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function ttsText(raw, lang = 'fr') {
  return pronounceForTts(
    String(raw || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim(),
    lang,
  );
}

function splitLongFr(longText, shortText) {
  const long = String(longText || '').trim();
  const short = String(shortText || '').trim();
  if (!long) return { short, address: '' };
  const m = long.match(/\n\nAdresse\s*:\s*(.+)$/s);
  if (m) {
    return { short: short || long.slice(0, m.index).trim(), address: m[1].trim() };
  }
  if (short && long.startsWith(short)) {
    const rest = long.slice(short.length).replace(/^\s+/, '');
    const m2 = rest.match(/^Adresse\s*:\s*(.+)$/s);
    return { short, address: m2 ? m2[1].trim() : '' };
  }
  return { short: short || long, address: '' };
}

function buildLong(short, address, lang) {
  const s = String(short || '').trim();
  const a = String(address || '').trim();
  if (!a) return s;
  return `${s}\n\n${ADDRESS_LABEL[lang] || ADDRESS_LABEL.fr} ${a}`;
}

function hasText(store, lang, name) {
  const t = store?.[lang]?.[name];
  return typeof t === 'string' && t.trim().length >= 20;
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function openaiKey() {
  return process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || '';
}

async function chatJson(system, user, maxTokens = 4000) {
  const apiKey = openaiKey();
  if (!apiKey) throw new Error('Pas de clé OpenAI');
  const body = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 400)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

function collectPois() {
  const { locations, circuits } = loadCircuit();
  const byCircuit = {};
  const all = [];
  const seen = new Set();
  for (const key of TARGET_CIRCUITS) {
    const ids = circuits[key] || [];
    const names = [];
    for (const id of ids) {
      const loc = locations[id - 1];
      if (!loc?.name) continue;
      names.push(loc.name);
      if (!seen.has(loc.name)) {
        seen.add(loc.name);
        all.push({ name: loc.name, audio: loc.audio || '', circuit: key });
      }
    }
    byCircuit[key] = names;
  }
  return { all, byCircuit };
}

function setDesc(store, lang, name, text) {
  if (!store[lang]) store[lang] = {};
  store[lang][name] = text;
  const alias = LANG_ALIASES[lang];
  if (alias) {
    if (!store[alias]) store[alias] = {};
    store[alias][name] = text;
  }
}

async function phaseTexts() {
  const { all } = collectPois();
  const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
  const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

  const needFr = [];
  const needTr = [];
  for (const poi of all) {
    if (poi.name === 'Grand-place') continue;
    const frShort = shorts.fr?.[poi.name] || '';
    const frLong = longs.fr?.[poi.name] || '';
    if (!frShort.trim() || !frLong.trim()) needFr.push(poi.name);
    const missing = LANGS.filter((l) => l !== 'fr' && (!hasText(shorts, l, poi.name) || !hasText(longs, l, poi.name)));
    if (missing.length) needTr.push({ name: poi.name, missing, audio: poi.audio });
  }

  console.log('POI circuits:', all.length);
  console.log('FR manquant:', needFr.length ? needFr.join(' | ') : 'aucun');
  console.log('Traductions à compléter:', needTr.length);

  if (needFr.length) {
    throw new Error('Textes FR manquants: ' + needFr.join(', '));
  }

  for (let i = 0; i < needTr.length; i++) {
    const item = needTr[i];
    const { short, address } = splitLongFr(longs.fr[item.name], shorts.fr[item.name]);
    const payload = { name: item.name, short, address };
    const langs = item.missing.join(', ');
    console.log(`[${i + 1}/${needTr.length}] traduire ${item.name} → ${langs}`);
    let parsed;
    try {
      parsed = await chatJson(
        'You translate CityLoop Quest Mons visitor texts about historic shop signs and bas-reliefs. Return JSON only. Keep proper names: Mons, Nimy, Havré, Bertaimont, Waudru, Roland de Lassus, Grétry, Molière, Racine, IHS, MDCCXII. cn = Simplified Chinese. jp = Japanese.',
        `Translate this visitor card into: ${langs} (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "short": "..." }, "nl": { "short": "..." }, ... }
Only include requested languages. Translate "short" only. Do not invent extra facts.
Text:
${JSON.stringify(payload, null, 2)}`,
        2500,
      );
    } catch (err) {
      console.error('FAIL translate', item.name, err.message);
      continue;
    }
    for (const lang of item.missing) {
      const bag = parsed[lang] || parsed[item.name]?.[lang] || {};
      const trShort = String(bag.short || bag.text || '').trim();
      if (!trShort) {
        console.warn('  empty', lang, item.name);
        continue;
      }
      setDesc(shorts, lang, item.name, trShort);
      setDesc(longs, lang, item.name, buildLong(trShort, address, lang));
    }
    if ((i + 1) % 5 === 0) {
      writeJson(path.join(ROOT, 'translations/descriptions_short.json'), shorts);
      writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
      console.log('  checkpoint JSON');
    }
  }

  writeJson(path.join(ROOT, 'translations/descriptions_short.json'), shorts);
  writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);

  const dataDir = path.join(ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  for (const poi of all) {
    if (poi.name === 'Grand-place') continue;
    const longFr = longs.fr?.[poi.name];
    if (!longFr) continue;
    fs.writeFileSync(path.join(dataDir, `${normalizeFileName(poi.name)}.txt`), longFr.replace(/\n/g, '\r\n'), 'utf8');
  }

  patchCircuitAudio(all);
  console.log('phase texts OK');
}

function patchCircuitAudio(all) {
  const p = path.join(ROOT, 'circuit-data.js');
  let src = fs.readFileSync(p, 'utf8');
  let changed = 0;
  for (const poi of all) {
    if (poi.name === 'Grand-place') continue;
    if (poi.audio) continue;
    const audioPath = `audio/${audioBaseFromName(poi.name)}.mp3`;
    const re = new RegExp(
      `(\\{ name: ${JSON.stringify(poi.name)}, lat: [^,]+, lng: [^,]+, audio: )""`,
    );
    if (re.test(src)) {
      src = src.replace(re, `$1${JSON.stringify(audioPath)}`);
      changed++;
    } else {
      console.warn('circuit-data: pas de champ audio vide pour', poi.name);
    }
  }
  fs.writeFileSync(p, src);
  console.log('circuit-data audio fields patchés:', changed);
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

async function phaseAudio() {
  const { synthesizeSpeechMp3 } = await import(
    pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
  );
  const { all } = collectPois();
  const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
  const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
  const jobs = [];
  for (const poi of all) {
    if (poi.name === 'Grand-place') continue;
    const base = audioBaseFromName(poi.name);
    for (const lang of LANGS) {
      const shortText = ttsText(shorts[lang]?.[poi.name] || shorts.fr?.[poi.name] || '', lang);
      const longText = ttsText(longs[lang]?.[poi.name] || longs.fr?.[poi.name] || '', lang);
      if (shortText) {
        jobs.push({
          label: `${poi.name} short [${lang}]`,
          lang,
          pollyLang: POLLY_LANG[lang] || lang,
          text: shortText,
          outAbs: path.join(ROOT, 'audio', `${base}_short_${lang}.mp3`),
        });
      }
      if (longText) {
        jobs.push({
          label: `${poi.name} long [${lang}]`,
          lang,
          pollyLang: POLLY_LANG[lang] || lang,
          text: longText,
          outAbs: path.join(ROOT, 'audio', `${base}_${lang}.mp3`),
        });
      }
    }
  }
  fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
  console.log(`jobs audio: ${jobs.length}, provider=${process.env.TTS_PROVIDER || 'openai'}`);
  const t0 = Date.now();
  const { ok, failed, skipped } = await runPool(jobs, 3, async (job) => {
    if (fs.existsSync(job.outAbs) && fs.statSync(job.outAbs).size > 1000) {
      const dist = path.join(ROOT, 'dist', 'audio', path.basename(job.outAbs));
      if (!fs.existsSync(dist) || fs.statSync(dist).size < 1000) {
        fs.copyFileSync(job.outAbs, dist);
      }
      return 'skip';
    }
    await synthesizeSpeechMp3(job.text, job.outAbs, { lang: job.pollyLang });
    fs.copyFileSync(job.outAbs, path.join(ROOT, 'dist', 'audio', path.basename(job.outAbs)));
    return 'ok';
  });
  console.log(
    `Audio: ${ok} générés, ${skipped} déjà présents, ${failed} erreurs, ${Math.round((Date.now() - t0) / 1000)}s`,
  );
  if (failed) throw new Error(`${failed} audios en échec`);
}

function loadQuizFr() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/quiz-fr.json'), 'utf8'));
}

function quizOk(arr) {
  return Array.isArray(arr) && arr.length === 3 && arr.every((q) =>
    q && typeof q.question === 'string' &&
    Array.isArray(q.options) && q.options.length === 3 &&
    Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 2
  );
}

async function phaseQuiz() {
  const { all, byCircuit } = collectPois();
  const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
  const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));
  const quizFr = loadQuizFr();
  const toMake = all.filter((p) => !SKIP_QUIZ_ALWAYS.has(p.name) && !quizOk(quizFr[p.name]));
  console.log('Quiz FR à créer:', toMake.length);

  const cacheName = TARGET_CIRCUITS.join('-').replace(/[^\w-]+/g, '_').slice(0, 80);
  const cachePath = path.join(ROOT, `scripts/.quiz-cache-${cacheName}.json`);
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

  for (let i = 0; i < toMake.length; i++) {
    const poi = toMake[i];
    if (quizOk(cache[poi.name])) {
      quizFr[poi.name] = cache[poi.name];
      continue;
    }
    const short = shorts.fr?.[poi.name] || '';
    const long = longs.fr?.[poi.name] || '';
    console.log(`[quiz ${i + 1}/${toMake.length}] ${poi.name}`);
    let parsed;
    try {
      parsed = await chatJson(
        'Tu rédiges des quiz pour CityLoop Quest Mons. JSON uniquement. Ton adulte, précis, pas infantile.',
        `Rédige exactement 3 questions de quiz pour ce point de visite à Mons.
Contraintes:
- 3 questions, chacune avec 3 options
- "answer" = index 0, 1 ou 2 de la bonne option
- Mélange : 1 observation de ce qu'on voit, 1 détail historique/technique ou de toponymie, 1 contexte montois (quartier, collégiale, beffroi, Grand-Place, métier)
- Fondé UNIQUEMENT sur le texte fourni et le nom du point
- Distracteurs plausibles (autres lieux de Mons) mais clairement faux
- Pas de question du type unique « où se trouve-t-on ? » comme seule observation
- Pas de markdown
JSON:
{ "questions": [ { "question": "...", "options": ["A","B","C"], "answer": 0 } ] }

Nom: ${poi.name}
Texte court: ${short}
Texte long: ${long}`,
        1800,
      );
    } catch (err) {
      console.error('FAIL quiz FR', poi.name, err.message);
      continue;
    }
    const questions = parsed.questions || parsed[poi.name] || parsed;
    if (!quizOk(questions)) {
      console.warn('quiz invalide', poi.name, JSON.stringify(parsed).slice(0, 200));
      continue;
    }
    cache[poi.name] = questions;
    quizFr[poi.name] = questions;
    if ((i + 1) % 4 === 0) writeJson(cachePath, cache);
  }
  writeJson(cachePath, cache);
  writeJson(path.join(ROOT, 'scripts/quiz-fr.json'), quizFr);

  const circuitFiles = {
    curiosites_nord: 'quiz-basreliefs-nord-fr.json',
    curiosites_est: 'quiz-basreliefs-est-fr.json',
    curiosites_sud: 'quiz-basreliefs-sud-fr.json',
    curiosites_ouest: 'quiz-basreliefs-ouest-fr.json',
    insolite_mystere: 'quiz-insolite-mystere-fr.json',
    insolite_secret: 'quiz-insolite-secret-fr.json',
    insolite_noms: 'quiz-insolite-noms-fr.json',
  };
  for (const [key, file] of Object.entries(circuitFiles)) {
    if (!TARGET_CIRCUITS.includes(key)) continue;
    const bag = {};
    for (const name of byCircuit[key] || []) {
      if (SKIP_QUIZ_ALWAYS.has(name)) continue;
      if (quizFr[name]) bag[name] = quizFr[name];
    }
    writeJson(path.join(ROOT, 'scripts', file), bag);
    console.log(file, Object.keys(bag).length, 'POI');
  }

  const quizByLang = {};
  for (const lang of LANGS.filter((l) => l !== 'fr')) {
    quizByLang[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, `scripts/quiz-${lang}.json`), 'utf8'));
  }
  const missingNames = Object.keys(quizFr).filter((name) =>
    quizOk(quizFr[name]) && LANGS.some((l) => l !== 'fr' && !quizOk(quizByLang[l][name])),
  );
  console.log('Quiz à traduire (9 langues):', missingNames.length);
  for (let i = 0; i < missingNames.length; i++) {
    const name = missingNames[i];
    const need = LANGS.filter((l) => l !== 'fr' && !quizOk(quizByLang[l][name]));
    if (!need.length) continue;
    console.log(`[trad quiz ${i + 1}/${missingNames.length}] ${name} → ${need.join(',')}`);
    let parsed;
    try {
      parsed = await chatJson(
        'You translate CityLoop Quest Mons quizzes. Keep option ORDER identical. Never change the answer index. Keep proper names. Return JSON only.',
        `Translate this quiz into: ${need.join(', ')} (cn = Simplified Chinese, jp = Japanese).
Keep the same number of questions, the same option order, and the same "answer" integers.
Return JSON:
{ "en": { "questions": [ { "question": "...", "options": ["A","B","C"], "answer": 0 } ] }, "nl": { "questions": [...] }, ... }

Source:
${JSON.stringify({ name, questions: quizFr[name] }, null, 2)}`,
        4500,
      );
    } catch (err) {
      console.error('FAIL quiz trad', name, err.message);
      continue;
    }
    for (const lang of need) {
      const bag = parsed[lang] || parsed[name]?.[lang] || parsed;
      const questions = bag.questions || bag;
      if (!quizOk(questions)) {
        console.warn('quiz trad invalide', lang, name);
        continue;
      }
      for (let qi = 0; qi < 3; qi++) {
        if (questions[qi].answer !== quizFr[name][qi].answer) {
          console.warn('answer realigné', lang, name, qi, questions[qi].answer, '→', quizFr[name][qi].answer);
          questions[qi].answer = quizFr[name][qi].answer;
        }
      }
      quizByLang[lang][name] = questions;
    }
    if ((i + 1) % 5 === 0) {
      for (const lang of need) writeJson(path.join(ROOT, `scripts/quiz-${lang}.json`), quizByLang[lang]);
    }
  }
  for (const lang of LANGS.filter((l) => l !== 'fr')) {
    writeJson(path.join(ROOT, `scripts/quiz-${lang}.json`), quizByLang[lang]);
  }

  rebuildQuizRuntime();
  rebalanceNewQuizzes(cachePath);
  console.log('phase quiz OK');
}

function placeCorrect(options, answer, target) {
  const correct = options[answer];
  const others = options.filter((_, i) => i !== answer);
  const next = [null, null, null];
  next[target] = correct;
  let oi = 0;
  for (let i = 0; i < 3; i++) if (i !== target) next[i] = others[oi++];
  return { options: next, answer: target };
}

function rebalanceNewQuizzes(cachePath) {
  if (!fs.existsSync(cachePath)) return;
  const names = Object.keys(JSON.parse(fs.readFileSync(cachePath, 'utf8')));
  if (!names.length) return;
  const quizzes = {};
  for (const lang of LANGS) {
    quizzes[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, `scripts/quiz-${lang}.json`), 'utf8'));
  }
  names.forEach((name, pi) => {
    if (!quizOk(quizzes.fr[name])) return;
    for (let qi = 0; qi < 3; qi++) {
      const target = (pi + qi) % 3;
      for (const lang of LANGS) {
        const q = quizzes[lang][name]?.[qi];
        if (!q) continue;
        const p = placeCorrect(q.options, q.answer, target);
        q.options = p.options;
        q.answer = p.answer;
      }
    }
  });
  for (const lang of LANGS) writeJson(path.join(ROOT, `scripts/quiz-${lang}.json`), quizzes[lang]);
  rebuildQuizRuntime();
  console.log('quiz answers rebalanced', names.length);
}

function rebuildQuizRuntime() {
  const quizFr = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/quiz-fr.json'), 'utf8'));
  fs.writeFileSync(
    path.join(ROOT, 'quizData.js'),
    'window.quizData = ' + JSON.stringify(quizFr, null, 2) + ';\n',
    'utf8',
  );
  const translations = {};
  for (const lang of LANGS) {
    translations[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, `scripts/quiz-${lang}.json`), 'utf8'));
  }
  writeJson(path.join(ROOT, 'translations/quiz_translations.json'), translations);
  console.log('quizData.js + quiz_translations.json reconstruits');
}

const run = async () => {
  if (PHASE === 'all' || PHASE === 'texts') await phaseTexts();
  if (PHASE === 'all' || PHASE === 'audio') await phaseAudio();
  if (PHASE === 'all' || PHASE === 'quiz') await phaseQuiz();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
