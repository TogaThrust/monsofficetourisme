import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES = path.join(ROOT, 'images');
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function poiImageBaseFromName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').trim();
}

const WRONG = [
  "GrandRue.jpg",
  "Arts2_Tunnel_de_la_Paix.jpg",
  "Ufocinque_Passeggiando_nella_Storia.jpg",
  "Cedric_Le_Borgne_La_riviere.jpg",
  "Dourone_Boulevard_Sainctelette.jpg",
  "Rachelle_Celiane_Santerre_Jacques_Du_Broeucq.jpg",
  "Andrea_Ravo_Mattoni_Sainte_Waudru_et_ses_filles.jpg",
  "Filip_Gilissen_Spread_your_wings.jpg",
  "Nevercrew_Dissipation.jpg",
  "A_la_Ville_dAvesnes.jpg",
  "Farm_Prod_Rue_de_la_Halle.jpg",
];
for (const f of WRONG) {
  const p = path.join(IMAGES, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('deleted', f);
  }
}

const cybeleSrc = path.join(IMAGES, 'cybeleetpoliade.jpg');
const cybeleDest = path.join(IMAGES, 'Nean_Cybele_et_Poliade.jpg');
if (fs.existsSync(cybeleSrc) && !fs.existsSync(cybeleDest)) {
  fs.copyFileSync(cybeleSrc, cybeleDest);
  console.log('copied cybeleetpoliade.jpg → Nean_Cybele_et_Poliade.jpg');
}

const MAP = {
  "Grand'Rue": "File:0 Mons - Grand'Rue (1).JPG",
  "A la Poire d'Or": "File:0 Mons - Rue de Nimy, 3 (1).JPG",
  "A le Trois Brouet": "File:0 Mons - Rue de Nimy, 72 - (1).JPG",
  "Saint-Pierre Rue de Nimy": "File:0 Mons - Rue de Nimy, 80 - 'Saint Pierre'.JPG",
  "A la Lunette d'Or": "File:0 Mons - Rue d'Havré, 50 - (1).JPG",
  "Au Gros Visage": 'File:Mons - rue du Miroir - enseigne "Li Grosse Tiète" - 2020-07-03 - 01.jpg',
  "Rue des Capucins": "File:Rue des Capucins, Mons.jpg",
  "Loge maconnique Rue Chisaire": "File:0 Mons - Rue Chisaire (1).JPG",
};

async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, UA);
    const text = await res.text();
    if (res.status === 429 || text.startsWith('You are making')) {
      await sleep(1200 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(res.status + ' ' + text.slice(0, 180));
    return JSON.parse(text);
  }
  throw new Error('rate limited');
}

async function downloadFile(poiName, commonsTitle) {
  const destBase = poiImageBaseFromName(poiName);
  const destJpg = path.join(IMAGES, destBase + '.jpg');
  if (fs.existsSync(destJpg) && fs.statSync(destJpg).size > 4000) {
    console.log('skip exists', destBase);
    return destBase + '.jpg';
  }
  const info = await wiki({
    action: 'query',
    titles: commonsTitle,
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1600',
  });
  const page = Object.values(info.query?.pages || {})[0];
  const ii = page?.imageinfo?.[0];
  const url = ii?.thumburl || ii?.url;
  if (!url) throw new Error('no url for ' + commonsTitle);
  const ext = (url.match(/\.(jpe?g|png|webp)/i) || ['.jpg'])[0].toLowerCase().replace('jpeg', 'jpg');
  const dest = path.join(IMAGES, destBase + (ext === '.jpeg' ? '.jpg' : ext));
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(String(res.status));
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error('too small');
  fs.writeFileSync(dest, buf);
  console.log('OK', poiName, '←', commonsTitle);
  return path.basename(dest);
}

const extraGot = [];
for (const [name, file] of Object.entries(MAP)) {
  try {
    extraGot.push({ name, file: await downloadFile(name, file) });
  } catch (e) {
    console.warn('fail', name, e.message);
  }
  await sleep(300);
}

const SEARCHES = [
  ['Kobra Torre de Saber', 'Kobra Mons Beffroi OR "Torre de Saber"'],
  ["Hell'O Folks", 'Hell\'O Folks Mons mural OR fresque'],
  ['Blancbec Le monstrueux', 'Blancbec Mons monstrueux'],
  ["Oli-B L'escapade", 'Oli-B Mons escapade OR fresque'],
  ['Taquen Bouquet of memory and hope', 'Taquen Mons'],
  ['Arkane Lalie', 'Arkane Lalie Mons'],
  ['Dulk The battle', 'Dulk Mons battle'],
  ['Celeste Gangolphe Mille et une feuille', 'Gangolphe Mons'],
  ['Paul Segard Ma ville s\'endort', 'Segard Mons fresque'],
  ['Nadege Dauvergne Place du Beguinage', 'Dauvergne Mons'],
  ['Robert Montgomery Invisible graffiti of love', 'Montgomery Mons graffiti'],
  ['Andrea Buglisi La Gayole', 'Buglisi Gayole Mons'],
  ['Ilan Walbrecq Georges Cuvelier', 'Walbrecq Mons'],
  ['Lola Goies Rue du Miroir', 'Goies Mons'],
  ['Stelios Pupet Harmonizing Mons', 'Pupet Mons Harmonizing'],
  ['Pierre Liebaert Je crois aux nuits', 'Liebaert Mons'],
  ['Olivier Sonck Ivre d\'histoires', 'Sonck Mons'],
  ['Andrea Ravo Mattoni Charles Quint', 'Ravo Mattoni Mons "Charles Quint"'],
  ['Andrea Ravo Mattoni Rue de Nimy 126', 'Ravo Mattoni "Rue de Nimy"'],
  ['Andrea Ravo Mattoni Sainte Waudru et ses filles', 'Ravo Mattoni "Sainte Waudru" Mons'],
  ['Eva Badalamenti Passage de l\'ilot', 'Badalamenti Mons'],
  ['Eva Badalamenti Louis Buisseret', 'Badalamenti Buisseret Mons'],
  ['Jana et JS Le couple de la rue Verte', 'Jana JS Mons "rue Verte" OR fenêtre'],
  ['Hell\'O Rue de la Halle', 'Hell\'O "Rue de la Halle" Mons'],
  ['Farm Prod Rue de la Halle', 'Farm Prod "Rue de la Halle" Mons'],
  ['Ufocinque Passeggiando nella Storia', 'Ufocinque Mons'],
  ['Nevercrew Dissipation', 'Nevercrew Mons'],
  ['Filip Gilissen Spread your wings', 'Gilissen Mons wings'],
  ['Cedric Le Borgne La riviere', 'Le Borgne Mons rivière OR riviere'],
  ['Dourone Boulevard Sainctelette', 'Dourone Sainctelette Mons'],
  ['Arts2 Tunnel de la Paix', 'Tunnel de la Paix Mons Arts'],
  ['Au Renard', 'enseigne "Au Renard" Mons Havré'],
  ['Au Lion d\'Or', 'enseigne "Lion d\'Or" Mons Havré'],
  ['A la Clef d\'Or', 'enseigne "Clef d\'Or" Mons'],
  ['A la Balance d\'Or', 'enseigne "Balance d\'Or" Mons'],
  ['Pelles a enfourner 1573', 'pelles enfourner Mons 1573'],
  ['Le Lecteur Colas', 'Lecteur Colas Mons Havré'],
  ['Chateau de le Marcote', 'Marcote Mons enseigne'],
  ['Cheval Dore', 'Cheval Doré Mons enseigne'],
  ['A la Bonne Femme', '"Bonne Femme" Mons enseigne Spira'],
  ['La Belle Plebeienne', '"Belle Plébéienne" OR "Belle Plebeienne" Mons Harvent'],
  ['Buste de la reine Astrid', 'Astrid Rousseau Mons Waux-Hall'],
  ['Cantoria Roland de Lassus', 'Cantoria Lassus Mons Leroy'],
  ['Portes du Theatre Royal', 'portes Théâtre Royal Mons fonte'],
  ['Loge maconnique Rue Chisaire', 'maçonnique Chisaire Mons'],
  ['Croix plume et pinceau', 'croix plume pinceau Mons "Terre du Prince"'],
];

function relevant(title, query) {
  const t = title.toLowerCase();
  if (!/mons|havré|havre|waudru|nimy/i.test(t) && !/enseigne|fresque|mural/i.test(t)) return false;
  if (/pdf$/i.test(t)) return false;
  return true;
}

const searchGot = [];
const searchMiss = [];
for (const [name, query] of SEARCHES) {
  const dest = path.join(IMAGES, poiImageBaseFromName(name) + '.jpg');
  if (fs.existsSync(dest)) {
    console.log('already', name);
    continue;
  }
  await sleep(450);
  try {
    const j = await wiki({
      action: 'query',
      list: 'search',
      srsearch: query,
      srnamespace: '6',
      srlimit: '8',
    });
    const hits = (j.query?.search || []).map((s) => s.title).filter((t) => relevant(t, query));
    if (!hits.length) {
      searchMiss.push(name);
      console.log('none', name);
      continue;
    }
    const file = await downloadFile(name, hits[0]);
    searchGot.push({ name, file, source: hits[0] });
  } catch (e) {
    searchMiss.push(name);
    console.warn('search fail', name, e.message);
  }
}

fs.writeFileSync(path.join(__dirname, 'poi-images-pass2.json'), JSON.stringify({ extraGot, searchGot, searchMiss }, null, 2));
console.log('\npass2 extra', extraGot.length, 'search', searchGot.length, 'miss', searchMiss.length);
