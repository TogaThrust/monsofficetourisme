/**
 * Applique thematic-circuits-output.json sur circuit-data.js,
 * descriptions et traductions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/thematic-circuits-output.json'), 'utf8'));

const EXISTING_NAMES = [
  'Grand-place', 'Fontaine du Rouge Puits', 'Immeuble Blanc Lévrier', 'Immeuble Grand Place 31 34',
  'Office du Tourisme', 'Hotel de la Couronne', 'Chapelle Saint Georges', 'Immeuble Grand Place 28 30',
  'Immeuble Grand Place 14', 'Theatre Royal', 'Singe du Grand Garde', 'Statue du Dragon',
  'Hotel de Ville', 'Ropieur', 'Gillis', 'Mayeur', 'Musee du Doudou', 'Conservatoire Royal',
  'Eglise Sainte Elisabeth', 'Palais de Justice', 'Maison Losseau', 'Maison Rue de Nimy 53',
  'Mundaneum', 'Place du Parc', 'Chapelle des Visitandines', 'Ancienne Caserne de Gendarmerie',
  'Prison de Mons', 'Tour Valenciennoise', 'Pavillons Caserne Cavalerie', 'Tank Sherman',
  'Machine a Eau', 'Parc du Waux Hall', 'Eglise Saint Nicolas', 'Chapelle du Belian',
  'Marche aux Herbes', 'Maison Rue de la Couronne 20 22', 'Couvent des Soeurs Noires',
  'Carre des Arts', 'Anciens Abattoirs', 'Eglise Notre Dame de Messines',
  'Maison Rue de Bertaimont 17', 'Maison Rue de Bertaimont 33', 'Casemates',
  'Bonne Maison de Bouzanton', 'Chapelle du Beguinage', 'Tour du Val des Ecoliers',
  'Gare de Mons', 'Statue Saint Georges', 'Lucie et les Papillons', 'Collegiale Sainte Waudru',
  'Tresors de Sainte Waudru', 'Le Car d Or', 'Porte Rue Courte', 'Maison Espagnole',
  'Chapelle Saint Calixte', 'Ancien Chateau Comtal', 'Tour Cesar', 'Beffroi', 'Square', 'Pilori', 'BAM',
];

function jsString(s) {
  return JSON.stringify(s);
}

const nameToIndex = {};
EXISTING_NAMES.forEach((n, i) => { nameToIndex[n] = i + 1; });
out.newPois.forEach((p, i) => { nameToIndex[p.name] = EXISTING_NAMES.length + i + 1; });

function namesToIndices(names) {
  return names.map((n) => {
    const i = nameToIndex[n];
    if (!i) throw new Error('Unknown POI ' + n);
    return i;
  });
}

const circuitDataPath = path.join(ROOT, 'circuit-data.js');
let circuitSrc = fs.readFileSync(circuitDataPath, 'utf8');

const insertLines = out.newPois.map((p) => {
  const extra = p.skipUnless ? `, skipUnless: ${jsString(p.skipUnless)}` : '';
  return `    { name: ${jsString(p.name)}, lat: ${p.lat}, lng: ${p.lng}, audio: ""${extra} },`;
}).join('\n');

if (!circuitSrc.includes('Rue d\'Enghien')) {
  circuitSrc = circuitSrc.replace(
    /    \{ name: "BAM",[\s\S]*?\}\n\];/,
    (m) => m.replace('\n];', `\n${insertLines}\n];`)
  );
}

const oldCircuits = {
  grand: [1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,27,28,29,32,30,31,33,34,35,36,38,37,39,40,41,42,43,44,45,46,47,48,49,60,59,50,51,52,53,54,55,57,58,1],
  moyen: [1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,28,29,33,34,35,36,59,60,47,48,49,50,51,52,53,54,55,57,58,1],
  petit: [1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,28,29,33,34,35,59,60,49,50,51,52,54,53,55,57,58,1],
  grand_gare: [47,48,49,60,59,50,51,52,53,54,55,57,58,1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,27,28,29,32,30,31,33,34,35,36,38,37,39,40,41,42,43,44,45,46,47],
  moyen_gare: [47,48,49,50,51,52,53,54,55,57,58,1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,28,29,33,34,35,36,59,60,47],
  petit_gare: [47,50,51,52,54,53,55,57,58,1,2,8,13,11,12,14,15,16,17,61,18,19,20,21,22,23,24,25,26,28,29,33,34,35,59,60,49,47],
};

const thematic = {};
for (const [key, tour] of Object.entries(out.tours)) {
  thematic[key] = namesToIndices(tour.names);
}

const circuits = {
  famille: thematic.famille,
  art_est: thematic.art_est,
  art_sud: thematic.art_sud,
  art_ouest: thematic.art_ouest,
  patrimoine: thematic.patrimoine,
  curiosites_nord: thematic.curiosites_nord,
  curiosites_est: thematic.curiosites_est,
  curiosites_sud: thematic.curiosites_sud,
  curiosites_ouest: thematic.curiosites_ouest,
  commerces: thematic.commerces,
  complet: thematic.complet,
  petit: oldCircuits.petit,
  moyen: oldCircuits.moyen,
  grand: oldCircuits.grand,
  petit_gare: oldCircuits.petit_gare,
  moyen_gare: oldCircuits.moyen_gare,
  grand_gare: oldCircuits.grand_gare,
  complet_gare: oldCircuits.petit_gare,
};

const meta = {
  famille: { color: '#2e7d32', group: 'main', km: out.tours.famille.kmLabel, time: out.tours.famille.timeLabel },
  art_est: { color: '#6a1b9a', group: 'art', km: out.tours.art_est.kmLabel, time: out.tours.art_est.timeLabel },
  art_sud: { color: '#8e24aa', group: 'art', km: out.tours.art_sud.kmLabel, time: out.tours.art_sud.timeLabel },
  art_ouest: { color: '#ab47bc', group: 'art', km: out.tours.art_ouest.kmLabel, time: out.tours.art_ouest.timeLabel },
  patrimoine: { color: '#1565c0', group: 'main', km: out.tours.patrimoine.kmLabel, time: out.tours.patrimoine.timeLabel },
  curiosites_nord: { color: '#ef6c00', group: 'curiosites', km: out.tours.curiosites_nord.kmLabel, time: out.tours.curiosites_nord.timeLabel },
  curiosites_est: { color: '#f57c00', group: 'curiosites', km: out.tours.curiosites_est.kmLabel, time: out.tours.curiosites_est.timeLabel },
  curiosites_sud: { color: '#fb8c00', group: 'curiosites', km: out.tours.curiosites_sud.kmLabel, time: out.tours.curiosites_sud.timeLabel },
  curiosites_ouest: { color: '#ff9800', group: 'curiosites', km: out.tours.curiosites_ouest.kmLabel, time: out.tours.curiosites_ouest.timeLabel },
  commerces: { color: '#00838f', group: 'main', km: out.tours.commerces.kmLabel, time: out.tours.commerces.timeLabel },
  complet: { color: '#c62828', group: 'main', km: out.tours.complet.kmLabel, time: out.tours.complet.timeLabel },
};

const circuitsBlock = `const circuits = ${JSON.stringify(circuits, null, 2).replace(/"/g, "'")};

const circuitMeta = ${JSON.stringify(meta, null, 2)};

const CIRCUIT_BUTTONS = [
  'famille',
  'art_est', 'art_sud', 'art_ouest',
  'patrimoine',
  'curiosites_nord', 'curiosites_est', 'curiosites_sud', 'curiosites_ouest',
  'commerces',
  'complet'
];
`;

circuitSrc = circuitSrc.replace(/const circuits = \{[\s\S]*?\};\s*$/, circuitsBlock.trim() + '\n');
fs.writeFileSync(circuitDataPath, circuitSrc);
console.log('circuit-data.js updated, locations', EXISTING_NAMES.length + out.newPois.length);

function shortDesc(text) {
  const parts = String(text || '').split(/(?<=[.!?])\s+/);
  return parts.slice(0, 2).join(' ').trim();
}

const descPath = path.join(ROOT, 'translations/descriptions.json');
const shortPath = path.join(ROOT, 'translations/descriptions_short.json');
const descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
const shorts = JSON.parse(fs.readFileSync(shortPath, 'utf8'));
if (!descriptions.fr) descriptions.fr = {};
if (!shorts.fr) shorts.fr = {};
for (const p of out.newPois) {
  if (!descriptions.fr[p.name]) {
    const extra = p.address ? `\n\nAdresse : ${p.address.replace(', Belgium', '')}.` : '';
    descriptions.fr[p.name] = (p.desc || p.name) + extra;
  }
  if (!shorts.fr[p.name]) {
    shorts.fr[p.name] = shortDesc(p.desc) || p.name;
  }
}
fs.writeFileSync(descPath, JSON.stringify(descriptions, null, 2));
fs.writeFileSync(shortPath, JSON.stringify(shorts, null, 2));
console.log('descriptions FR added');

const I18N = {
  fr: {
    circuit_famille: `Famille / essentiels<br>${out.tours.famille.kmLabel} — ${out.tours.famille.timeLabel}`,
    circuit_art_est: `L'Art habite la ville — Est<br>${out.tours.art_est.kmLabel} — ${out.tours.art_est.timeLabel}`,
    circuit_art_sud: `L'Art habite la ville — Sud<br>${out.tours.art_sud.kmLabel} — ${out.tours.art_sud.timeLabel}`,
    circuit_art_ouest: `L'Art habite la ville — Ouest<br>${out.tours.art_ouest.kmLabel} — ${out.tours.art_ouest.timeLabel}`,
    circuit_patrimoine: `Histoire / Patrimoine<br>${out.tours.patrimoine.kmLabel} — ${out.tours.patrimoine.timeLabel}`,
    circuit_curiosites_nord: `Bas-reliefs — Nord<br>${out.tours.curiosites_nord.kmLabel} — ${out.tours.curiosites_nord.timeLabel}`,
    circuit_curiosites_est: `Bas-reliefs — Est<br>${out.tours.curiosites_est.kmLabel} — ${out.tours.curiosites_est.timeLabel}`,
    circuit_curiosites_sud: `Bas-reliefs — Sud<br>${out.tours.curiosites_sud.kmLabel} — ${out.tours.curiosites_sud.timeLabel}`,
    circuit_curiosites_ouest: `Bas-reliefs — Ouest<br>${out.tours.curiosites_ouest.kmLabel} — ${out.tours.curiosites_ouest.timeLabel}`,
    circuit_commerces: `Rues commerçantes<br>${out.tours.commerces.kmLabel} — ${out.tours.commerces.timeLabel}`,
    circuit_complet: `Visite complète<br>${out.tours.complet.kmLabel} — ${out.tours.complet.timeLabel}`,
    circuit_group_art: "L'Art habite la ville",
    circuit_group_curiosites: 'Bas-reliefs / curiosités',
    confirm_circuit_name_famille: 'parcours Famille / essentiels',
    confirm_circuit_name_art_est: "parcours L'Art habite la ville — Est",
    confirm_circuit_name_art_sud: "parcours L'Art habite la ville — Sud",
    confirm_circuit_name_art_ouest: "parcours L'Art habite la ville — Ouest",
    confirm_circuit_name_patrimoine: 'parcours Histoire / Patrimoine',
    confirm_circuit_name_curiosites_nord: 'parcours Bas-reliefs — Nord',
    confirm_circuit_name_curiosites_est: 'parcours Bas-reliefs — Est',
    confirm_circuit_name_curiosites_sud: 'parcours Bas-reliefs — Sud',
    confirm_circuit_name_curiosites_ouest: 'parcours Bas-reliefs — Ouest',
    confirm_circuit_name_commerces: 'parcours Rues commerçantes',
    confirm_circuit_name_complet: 'parcours Visite complète',
    circuit_selfie_famille: 'Parcours Famille / essentiels de CityLoop Quest Mons',
    circuit_selfie_art: "Parcours L'Art habite la ville de CityLoop Quest Mons",
    circuit_selfie_patrimoine: 'Parcours Histoire / Patrimoine de CityLoop Quest Mons',
    circuit_selfie_curiosites: 'Parcours Bas-reliefs de CityLoop Quest Mons',
    circuit_selfie_commerces: 'Parcours Rues commerçantes de CityLoop Quest Mons',
    circuit_selfie_complet: 'Parcours Visite complète de CityLoop Quest Mons',
  },
  en: {
    circuit_famille: `Family / essentials<br>${out.tours.famille.kmLabel} — ${out.tours.famille.timeLabel}`,
    circuit_art_est: `Art lives in the city — East<br>${out.tours.art_est.kmLabel} — ${out.tours.art_est.timeLabel}`,
    circuit_art_sud: `Art lives in the city — South<br>${out.tours.art_sud.kmLabel} — ${out.tours.art_sud.timeLabel}`,
    circuit_art_ouest: `Art lives in the city — West<br>${out.tours.art_ouest.kmLabel} — ${out.tours.art_ouest.timeLabel}`,
    circuit_patrimoine: `History / Heritage<br>${out.tours.patrimoine.kmLabel} — ${out.tours.patrimoine.timeLabel}`,
    circuit_curiosites_nord: `Reliefs — North<br>${out.tours.curiosites_nord.kmLabel} — ${out.tours.curiosites_nord.timeLabel}`,
    circuit_curiosites_est: `Reliefs — East<br>${out.tours.curiosites_est.kmLabel} — ${out.tours.curiosites_est.timeLabel}`,
    circuit_curiosites_sud: `Reliefs — South<br>${out.tours.curiosites_sud.kmLabel} — ${out.tours.curiosites_sud.timeLabel}`,
    circuit_curiosites_ouest: `Reliefs — West<br>${out.tours.curiosites_ouest.kmLabel} — ${out.tours.curiosites_ouest.timeLabel}`,
    circuit_commerces: `Shopping streets<br>${out.tours.commerces.kmLabel} — ${out.tours.commerces.timeLabel}`,
    circuit_complet: `Complete visit<br>${out.tours.complet.kmLabel} — ${out.tours.complet.timeLabel}`,
    circuit_group_art: 'Art lives in the city',
    circuit_group_curiosites: 'Reliefs / curiosities',
    confirm_circuit_name_famille: 'Family / essentials tour',
    confirm_circuit_name_art_est: 'Art lives in the city — East tour',
    confirm_circuit_name_art_sud: 'Art lives in the city — South tour',
    confirm_circuit_name_art_ouest: 'Art lives in the city — West tour',
    confirm_circuit_name_patrimoine: 'History / Heritage tour',
    confirm_circuit_name_curiosites_nord: 'Reliefs — North tour',
    confirm_circuit_name_curiosites_est: 'Reliefs — East tour',
    confirm_circuit_name_curiosites_sud: 'Reliefs — South tour',
    confirm_circuit_name_curiosites_ouest: 'Reliefs — West tour',
    confirm_circuit_name_commerces: 'Shopping streets tour',
    confirm_circuit_name_complet: 'Complete visit tour',
    circuit_selfie_famille: 'Family / essentials tour of CityLoop Quest Mons',
    circuit_selfie_art: 'Art lives in the city tour of CityLoop Quest Mons',
    circuit_selfie_patrimoine: 'History / Heritage tour of CityLoop Quest Mons',
    circuit_selfie_curiosites: 'Reliefs tour of CityLoop Quest Mons',
    circuit_selfie_commerces: 'Shopping streets tour of CityLoop Quest Mons',
    circuit_selfie_complet: 'Complete visit tour of CityLoop Quest Mons',
  },
};

const LANG_FALLBACK = {
  nl: 'en', de: 'en', it: 'en', es: 'en', pl: 'en', ar: 'en', cn: 'en', jp: 'en', ja: 'en', zh: 'en',
};

const trPath = path.join(ROOT, 'translations/translations.json');
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
for (const [lang, bag] of Object.entries(tr)) {
  const src = I18N[lang] || I18N[LANG_FALLBACK[lang]] || I18N.en;
  Object.assign(bag, src);
}
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));
console.log('translations updated');
console.log('tours', Object.fromEntries(Object.entries(out.tours).map(([k, v]) => [k, `${v.kmLabel} / ${v.timeLabel}`])));
