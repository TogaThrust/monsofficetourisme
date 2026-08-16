/**
 * Construit les 3 parcours « Mons insolite » :
 * géocodage, ordre 2-opt, OSRM, images Commons, circuit-data, descriptions, i18n UI.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; insolite circuits)' } };

const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'insolite-pois.json'), 'utf8'));
const frEn = JSON.parse(fs.readFileSync(path.join(__dirname, 'insolite-texts-fr-en.json'), 'utf8'));

function loadI18nTexts() {
  const out = { ...frEn };
  for (const file of [
    'insolite-texts-nl-de-it.json',
    'insolite-texts-es-pl.json',
    'insolite-texts-ar-cn-jp.json',
  ]) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) continue;
    const bag = JSON.parse(fs.readFileSync(p, 'utf8'));
    Object.assign(out, bag);
  }
  return out;
}

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function loadCache() {
  const p = path.join(__dirname, 'geocode-cache.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}
function saveCache(cache) {
  fs.writeFileSync(path.join(__dirname, 'geocode-cache.json'), JSON.stringify(cache, null, 2));
}

const COORD_OVERRIDES = {
  "Ruelle du Cerf Blanc": { lat: 50.457981, lng: 3.9513633 },
  "Rue de l'Âtre": { lat: 50.4552278, lng: 3.957255 },
};

async function geocode(address, cache) {
  if (cache[address]) return cache[address];
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address);
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(`Nominatim ${res.status} for ${address}`);
  const json = await res.json();
  await sleep(1100);
  if (!json[0]) {
    console.warn('  ⚠ no geocode:', address);
    cache[address] = null;
    saveCache(cache);
    return null;
  }
  const hit = { lat: Number(json[0].lat), lng: Number(json[0].lon), display: json[0].display_name };
  cache[address] = hit;
  saveCache(cache);
  console.log('  ✓', address, '→', hit.lat.toFixed(5), hit.lng.toFixed(5));
  return hit;
}

function nearestNeighbor(points) {
  const start = points[0];
  const rest = points.slice(1);
  const ordered = [start];
  const pool = [...rest];
  while (pool.length) {
    const cur = ordered[ordered.length - 1];
    let bestI = 0;
    let bestD = Infinity;
    pool.forEach((p, i) => {
      const d = haversine(cur, p);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    });
    ordered.push(pool.splice(bestI, 1)[0]);
  }
  return ordered;
}

function twoOpt(points) {
  let route = points.slice();
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let k = i + 1; k < route.length - 1; k++) {
        const a = route[i - 1];
        const b = route[i];
        const c = route[k];
        const d = route[k + 1];
        const before = haversine(a, b) + haversine(c, d);
        const after = haversine(a, c) + haversine(b, d);
        if (after + 1 < before) {
          route = [...route.slice(0, i), ...route.slice(i, k + 1).reverse(), ...route.slice(k + 1)];
          improved = true;
        }
      }
    }
  }
  return route;
}

async function osrmPair(a, b) {
  const url = `https://router.project-osrm.org/route/v1/foot/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const json = await res.json();
  const route = json.routes && json.routes[0];
  if (!route) throw new Error('OSRM no route');
  return { meters: route.distance, seconds: route.duration };
}

async function osrmRoute(points) {
  let meters = 0;
  let seconds = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const bird = haversine(points[i], points[i + 1]);
    try {
      const r = await osrmPair(points[i], points[i + 1]);
      const speed = r.seconds > 0 ? r.meters / r.seconds : 99;
      if (speed > 2.2) {
        meters += r.seconds * 1.25;
        seconds += r.seconds;
      } else if (r.meters > bird * 6 && bird < 400) {
        meters += bird * 1.35;
        seconds += (bird * 1.35) / 1.25;
      } else {
        meters += r.meters;
        seconds += r.seconds;
      }
    } catch {
      meters += bird * 1.35;
      seconds += (bird * 1.35) / 1.25;
    }
    await sleep(80);
  }
  return { meters, seconds };
}

function formatDuration(minutes) {
  const m = Math.max(15, Math.round(minutes / 5) * 5);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm} min`;
  if (mm === 0) return `${h}h`;
  return `${h}h${String(mm).padStart(2, '0')}`;
}

function formatKm(meters) {
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km * 10) / 10} km`.replace('.', ',');
}

function loadLocations() {
  const code = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(`${code}\nthis.locations = locations; this.circuits = circuits; this.circuitMeta = circuitMeta; this.CIRCUIT_BUTTONS = CIRCUIT_BUTTONS;`, ctx);
  return ctx;
}

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  return (await fetch(url, UA)).json();
}

async function downloadCommonsFile(title, dest) {
  const info = await wiki({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1600' });
  const page = Object.values(info.query?.pages || {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error('no imageinfo for ' + title);
  const buf = Buffer.from(await (await fetch(ii.thumburl || ii.url, UA)).arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function searchCommons(query) {
  const json = await wiki({ action: 'query', list: 'search', srsearch: query, srnamespace: '6', srlimit: '5' });
  const hits = json.query?.search || [];
  return hits[0]?.title || null;
}

const UI = {
  fr: {
    circuit_group_insolite: 'Mons insolite',
    circuit_insolite_mystere: (km, t) => `Mons mystérieux<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Cours et passages secrets<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Noms impossibles<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'parcours Mons mystérieux',
    confirm_circuit_name_insolite_secret: 'parcours Cours et passages secrets',
    confirm_circuit_name_insolite_noms: 'parcours Noms impossibles',
    circuit_selfie_insolite: 'Parcours Mons insolite de CityLoop Quest Mons',
  },
  en: {
    circuit_group_insolite: 'Unusual Mons',
    circuit_insolite_mystere: (km, t) => `Mysterious Mons<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Hidden courtyards and passages<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Impossible street names<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'Mysterious Mons tour',
    confirm_circuit_name_insolite_secret: 'Hidden courtyards and passages tour',
    confirm_circuit_name_insolite_noms: 'Impossible street names tour',
    circuit_selfie_insolite: 'Unusual Mons tour of CityLoop Quest Mons',
  },
  nl: {
    circuit_group_insolite: 'Ongewoon Bergen',
    circuit_insolite_mystere: (km, t) => `Mysterieus Bergen<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Verborgen hoven en steegjes<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Onmogelijke straatnamen<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'wandeling Mysterieus Bergen',
    confirm_circuit_name_insolite_secret: 'wandeling Verborgen hoven en steegjes',
    confirm_circuit_name_insolite_noms: 'wandeling Onmogelijke straatnamen',
    circuit_selfie_insolite: 'Ongewoon Bergen-wandeling van CityLoop Quest Mons',
  },
  de: {
    circuit_group_insolite: 'Ungewöhnliches Mons',
    circuit_insolite_mystere: (km, t) => `Geheimnisvolles Mons<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Versteckte Höfe und Gassen<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Unmögliche Straßennamen<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'Rundgang Geheimnisvolles Mons',
    confirm_circuit_name_insolite_secret: 'Rundgang Versteckte Höfe und Gassen',
    confirm_circuit_name_insolite_noms: 'Rundgang Unmögliche Straßennamen',
    circuit_selfie_insolite: 'Ungewöhnliches-Mons-Rundgang von CityLoop Quest Mons',
  },
  it: {
    circuit_group_insolite: 'Mons insolita',
    circuit_insolite_mystere: (km, t) => `Mons misteriosa<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Cortili e passaggi segreti<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Nomi impossibili<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'percorso Mons misteriosa',
    confirm_circuit_name_insolite_secret: 'percorso Cortili e passaggi segreti',
    confirm_circuit_name_insolite_noms: 'percorso Nomi impossibili',
    circuit_selfie_insolite: 'Percorso Mons insolita di CityLoop Quest Mons',
  },
  es: {
    circuit_group_insolite: 'Mons insólita',
    circuit_insolite_mystere: (km, t) => `Mons misteriosa<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Patios y pasajes secretos<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Nombres imposibles<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'recorrido Mons misteriosa',
    confirm_circuit_name_insolite_secret: 'recorrido Patios y pasajes secretos',
    confirm_circuit_name_insolite_noms: 'recorrido Nombres imposibles',
    circuit_selfie_insolite: 'Recorrido Mons insólita de CityLoop Quest Mons',
  },
  pl: {
    circuit_group_insolite: 'Nietypowy Mons',
    circuit_insolite_mystere: (km, t) => `Tajemniczy Mons<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `Ukryte dziedzińce i przejścia<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `Niemożliwe nazwy ulic<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'trasę Tajemniczy Mons',
    confirm_circuit_name_insolite_secret: 'trasę Ukryte dziedzińce i przejścia',
    confirm_circuit_name_insolite_noms: 'trasę Niemożliwe nazwy ulic',
    circuit_selfie_insolite: 'Trasa Nietypowy Mons CityLoop Quest Mons',
  },
  ar: {
    circuit_group_insolite: 'مونس غير المألوفة',
    circuit_insolite_mystere: (km, t) => `مونس الغامضة<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `ساحات وممرات سرية<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `أسماء شوارع مستحيلة<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: 'مسار مونس الغامضة',
    confirm_circuit_name_insolite_secret: 'مسار الساحات والممرات السرية',
    confirm_circuit_name_insolite_noms: 'مسار أسماء الشوارع المستحيلة',
    circuit_selfie_insolite: 'مسار مونس غير المألوفة من CityLoop Quest Mons',
  },
  cn: {
    circuit_group_insolite: '奇特的蒙斯',
    circuit_insolite_mystere: (km, t) => `神秘蒙斯<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `隐秘庭院与通道<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `不可思议的街名<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: '神秘蒙斯路线',
    confirm_circuit_name_insolite_secret: '隐秘庭院与通道路线',
    confirm_circuit_name_insolite_noms: '不可思议的街名路线',
    circuit_selfie_insolite: 'CityLoop Quest Mons 奇特蒙斯路线',
  },
  jp: {
    circuit_group_insolite: 'ふしぎなモンス',
    circuit_insolite_mystere: (km, t) => `神秘のモンス<br>${km} — ${t}`,
    circuit_insolite_secret: (km, t) => `隠れた中庭と通路<br>${km} — ${t}`,
    circuit_insolite_noms: (km, t) => `ありえない通り名<br>${km} — ${t}`,
    confirm_circuit_name_insolite_mystere: '神秘のモンスコース',
    confirm_circuit_name_insolite_secret: '隠れた中庭と通路コース',
    confirm_circuit_name_insolite_noms: 'ありえない通り名コース',
    circuit_selfie_insolite: 'CityLoop Quest Mons ふしぎなモンスコース',
  },
};
UI.zh = UI.cn;
UI.ja = UI.jp;

async function main() {
  const cache = loadCache();
  const ctx = loadLocations();
  const existingByName = Object.fromEntries(ctx.locations.map((p) => [p.name, p]));
  const gp = existingByName['Grand-place'];
  if (!gp) throw new Error('Grand-place missing');

  console.log('Géocodage…');
  const newPois = [];
  for (const poi of meta.pois) {
    if (existingByName[poi.name]) {
      console.log('  = already', poi.name);
      continue;
    }
    let hit = COORD_OVERRIDES[poi.name] || null;
    if (!hit) hit = await geocode(poi.address, cache);
    if (!hit) {
      const alt = poi.address
        .replace(/^Ruelle /, 'Rue ')
        .replace(/^Rue /, 'Ruelle ')
        .replace(', Belgium', '');
      if (alt !== poi.address) hit = await geocode(alt, cache);
    }
    if (!hit) throw new Error('geocode failed: ' + poi.name);
    const loc = { name: poi.name, lat: hit.lat, lng: hit.lng, audio: '' };
    newPois.push(loc);
    existingByName[poi.name] = loc;
  }

  const tourResults = {};
  for (const [key, tour] of Object.entries(meta.tours)) {
    let pts = tour.names.map((name) => {
      const p = existingByName[name];
      if (!p) throw new Error(`${key}: missing ${name}`);
      return { name: p.name, lat: p.lat, lng: p.lng };
    });
    if (pts[0].name !== 'Grand-place') pts = [gp, ...pts.filter((p) => p.name !== 'Grand-place')];
    const inner = twoOpt(nearestNeighbor(pts));
    pts = inner[inner.length - 1].name === 'Grand-place' ? inner : [...inner, gp];
    if (pts[0].name !== 'Grand-place') pts = [gp, ...pts.filter((p) => p.name !== 'Grand-place')];
    if (pts[pts.length - 1].name !== 'Grand-place') pts = [...pts, gp];

    console.log(`OSRM ${key} (${pts.length} pts)…`);
    const r = await osrmRoute(pts);
    const uniqueStops = pts.filter((p, i) => i === 0 || p.name !== pts[i - 1].name).length;
    const totalMin = r.seconds / 60 + uniqueStops * 3.5;
    tourResults[key] = {
      names: pts.map((p) => p.name),
      meters: Math.round(r.meters),
      kmLabel: formatKm(r.meters),
      timeLabel: formatDuration(totalMin),
      poiCount: uniqueStops,
      totalMinutes: Math.round(totalMin),
    };
    console.log(`  ${key}: ${tourResults[key].kmLabel} — ${tourResults[key].timeLabel}`);
    if (totalMin > 155) console.warn('  ⚠ exceeds ~2h30');
    await sleep(200);
  }

  // Patch circuit-data.js
  let src = fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8');
  const already = src.includes("'insolite_mystere'");
  if (newPois.length && !src.includes(`name: ${JSON.stringify(newPois[0].name)}`)) {
    const insert = newPois
      .map((p) => `    { name: ${JSON.stringify(p.name)}, lat: ${p.lat}, lng: ${p.lng}, audio: "" },`)
      .join('\n');
    const needle = '    { name: "Rue Leopold II", lat: 50.45282, lng: 3.94361, audio: "" },';
    if (!src.includes(needle)) throw new Error('Leopold II needle not found');
    src = src.replace(needle, needle + '\n' + insert);
  }

  const nameToIndex = {};
  // Re-parse names from patched source via a light regex of top-level name fields is fragile;
  // rebuild index from existing locations + newPois in original order.
  ctx.locations.forEach((p, i) => {
    nameToIndex[p.name] = i + 1;
  });
  newPois.forEach((p, i) => {
    if (!nameToIndex[p.name]) nameToIndex[p.name] = ctx.locations.length + i + 1;
  });

  function namesToIndices(names) {
    return names.map((n) => {
      const i = nameToIndex[n];
      if (!i) throw new Error('Unknown POI ' + n);
      return i;
    });
  }

  const insoliteCircuits = {};
  const insoliteMeta = {};
  for (const [key, tour] of Object.entries(meta.tours)) {
    insoliteCircuits[key] = namesToIndices(tourResults[key].names);
    insoliteMeta[key] = {
      color: tour.color,
      group: 'insolite',
      km: tourResults[key].kmLabel,
      time: tourResults[key].timeLabel,
    };
  }

  const circuitBlock = `  'insolite_mystere': ${JSON.stringify(insoliteCircuits.insolite_mystere)},
  'insolite_secret': ${JSON.stringify(insoliteCircuits.insolite_secret)},
  'insolite_noms': ${JSON.stringify(insoliteCircuits.insolite_noms)},`;

  if (already) {
    src = src.replace(
      /  'insolite_mystere': \[[^\]]+\],\s*'insolite_secret': \[[^\]]+\],\s*'insolite_noms': \[[^\]]+\],/,
      circuitBlock
    );
  } else {
    const circuitRe = /  'commerces': \[[^\]]+\],\s*'complet': \[/;
    if (!circuitRe.test(src)) throw new Error('circuit needle not found');
    src = src.replace(circuitRe, (m) => m.replace(/'complet': \[/, `${circuitBlock}\n  'complet': [`));
  }

  const metaInsert = `  "insolite_mystere": ${JSON.stringify(insoliteMeta.insolite_mystere)},
  "insolite_secret": ${JSON.stringify(insoliteMeta.insolite_secret)},
  "insolite_noms": ${JSON.stringify(insoliteMeta.insolite_noms)},
  "complet": {`;
  if (src.includes('"insolite_mystere"')) {
    src = src.replace(
      /  "insolite_mystere": \{[^}]+\},\s*"insolite_secret": \{[^}]+\},\s*"insolite_noms": \{[^}]+\},\s*"complet": \{/,
      metaInsert
    );
  } else {
    const metaRe = /  "complet": \{\s*"color": "#c62828",/;
    if (!metaRe.test(src)) throw new Error('meta needle not found');
    src = src.replace(metaRe, metaInsert + '\n    "color": "#c62828",');
  }

  if (!src.includes("'insolite_mystere', 'insolite_secret', 'insolite_noms'")) {
    src = src.replace(
      /'commerces',\s*'complet'\s*\];/,
      `'commerces',\n  'insolite_mystere', 'insolite_secret', 'insolite_noms',\n  'complet'\n];`
    );
  }

  fs.writeFileSync(path.join(ROOT, 'circuit-data.js'), src);
  console.log('circuit-data.js updated, new POIs', newPois.length);

  // Descriptions
  const texts = loadI18nTexts();
  const descPath = path.join(ROOT, 'translations/descriptions.json');
  const shortPath = path.join(ROOT, 'translations/descriptions_short.json');
  const descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
  const shorts = JSON.parse(fs.readFileSync(shortPath, 'utf8'));
  const langMap = { zh: 'cn', ja: 'jp' };
  for (const [lang, bag] of Object.entries(texts)) {
    const destLang = langMap[lang] || lang;
    if (!descriptions[destLang]) descriptions[destLang] = {};
    if (!shorts[destLang]) shorts[destLang] = {};
    for (const [name, pair] of Object.entries(bag)) {
      if (pair.long) descriptions[destLang][name] = pair.long;
      if (pair.short) shorts[destLang][name] = pair.short;
    }
  }
  if (descriptions.cn && !descriptions.zh) descriptions.zh = descriptions.cn;
  if (descriptions.jp && !descriptions.ja) descriptions.ja = descriptions.jp;
  if (shorts.cn && !shorts.zh) shorts.zh = shorts.cn;
  if (shorts.jp && !shorts.ja) shorts.ja = shorts.jp;
  fs.writeFileSync(descPath, JSON.stringify(descriptions, null, 2));
  fs.writeFileSync(shortPath, JSON.stringify(shorts, null, 2));
  console.log('descriptions merged, langs', Object.keys(texts).join(','));

  // UI translations
  const trPath = path.join(ROOT, 'translations/translations.json');
  const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
  for (const [lang, bag] of Object.entries(tr)) {
    const ui = UI[lang] || UI.en;
    const km = (k) => tourResults[k].kmLabel;
    const tm = (k) => tourResults[k].timeLabel;
    bag.circuit_group_insolite = ui.circuit_group_insolite;
    bag.circuit_insolite_mystere = ui.circuit_insolite_mystere(km('insolite_mystere'), tm('insolite_mystere'));
    bag.circuit_insolite_secret = ui.circuit_insolite_secret(km('insolite_secret'), tm('insolite_secret'));
    bag.circuit_insolite_noms = ui.circuit_insolite_noms(km('insolite_noms'), tm('insolite_noms'));
    bag.confirm_circuit_name_insolite_mystere = ui.confirm_circuit_name_insolite_mystere;
    bag.confirm_circuit_name_insolite_secret = ui.confirm_circuit_name_insolite_secret;
    bag.confirm_circuit_name_insolite_noms = ui.confirm_circuit_name_insolite_noms;
    bag.circuit_selfie_insolite = ui.circuit_selfie_insolite;
  }
  fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));
  console.log('translations.json UI keys added');

  // Images
  const IMAGES = path.join(ROOT, 'images');
  const toFetch = [
    ...meta.pois.map((p) => ({ name: p.name, commons: p.commons, search: p.search })),
    ...Object.entries(meta.commonsReuse).map(([name, commons]) => ({ name, commons, search: null })),
  ];
  for (const item of toFetch) {
    const dest = path.join(IMAGES, poiImageBaseFromName(item.name) + '.jpg');
    if (fs.existsSync(dest)) {
      console.log('  img exists', item.name);
      continue;
    }
    let title = item.commons;
    if (!title && item.search) {
      title = await searchCommons(item.search);
      await sleep(400);
    }
    if (!title) {
      console.warn('  ⚠ no commons for', item.name);
      continue;
    }
    try {
      await downloadCommonsFile(title, dest);
      console.log('  img OK', item.name, '←', title);
    } catch (err) {
      console.warn('  ⚠ img fail', item.name, err.message);
    }
    await sleep(400);
  }

  fs.writeFileSync(
    path.join(__dirname, 'insolite-output.json'),
    JSON.stringify({ newPois, tours: tourResults, indices: insoliteCircuits }, null, 2)
  );
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
