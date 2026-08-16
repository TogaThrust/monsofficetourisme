/**
 * Ajoute la catégorie Explorer « Mons secret, insolite & mystérieux ».
 * Usage: node scripts/build-secret-explorer.mjs
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FACTORY = 'C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory';
config({ path: path.join(FACTORY, '.env') });

const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'ja'];
const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (secret explorer)' } };
const CAT = {
  fr: 'Mons secret, insolite & mystérieux',
  en: 'Secret, unusual & mysterious Mons',
  nl: 'Geheim, ongewoon & mysterieus Mons',
  de: 'Geheimes, ungewöhnliches & mysteriöses Mons',
  it: 'Mons segreto, insolito e misterioso',
  es: 'Mons secreto, insólito y misterioso',
  pl: 'Tajemnicze i niezwykłe Mons',
  ar: 'مونس السرية والغريبة والغامضة',
  cn: '隐秘、奇特而神秘的蒙斯',
  ja: '秘密・奇抜・神秘のモンス',
};

const insolite = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/insolite-texts-fr-en.json'), 'utf8'));
const imageMap = {};
{
  const raw = fs.readFileSync(path.join(ROOT, 'js/poi-image-map.js'), 'utf8');
  const m = raw.match(/window\.POI_IMAGE_MAP = (\{[\s\S]*\});/);
  if (m) Object.assign(imageMap, JSON.parse(m[1]));
}

function loadLocations() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'circuit-data.js'), 'utf8') + '\nthis.locations=locations;', ctx);
  const map = new Map();
  for (const loc of ctx.locations) map.set(loc.name, loc);
  return map;
}

const POIS = [
  { id: 'secret-croix-cronque', nameFr: 'La croix mystérieuse de la rue Cronque', lat: 50.45452, lng: 3.95074, tags: ['mystere', 'detail'], observe: 'Observe attentivement les pavés. Une croix se cache dans la chaussée.', secret: 'VisitMons signale, dans cette rue zigzagante, une croix dessinée dans le pavage. On peut la manquer en marchant trop vite. Nul ne s’accorde tout à fait sur son origine : marque de bornage, signe dévotionnel, vestige d’un ancien tracé ? Le mystère fait partie du lieu. Baissez les yeux : la croix est là, quelque part sous vos pas.', anecdote: 'Personne n’a tranché : bornage, piété, ou simple jeu de poseurs de pavés ?' },
  { id: 'secret-rue-cronque', nameFr: 'Rue Cronque', circuitName: 'Rue Cronque', tags: ['vieux_mons', 'nom_insolite'], observe: 'Suivez le tracé : la rue ne va nulle part en ligne droite. Comptez les coudes.', anecdote: 'En parler montois, « cronque » veut dire sinueux, de travers, tordu.' },
  { id: 'secret-rue-a-degres', nameFr: 'Rue à Degrés', circuitName: 'Rue à Degrés', tags: ['vieux_mons', 'passage_cache'], observe: 'Ce n’est pas une rue : c’est un escalier. Montez-le et cherchez le point de vue d’où la pente devient un décor.' },
  { id: 'secret-cerf-blanc', nameFr: 'Maisons du XVIIe siècle de la ruelle du Cerf Blanc', circuitName: 'Ruelle du Cerf Blanc', tags: ['vieux_mons', 'passage_cache'], observe: 'Entrez dans la ruelle et lisez les façades : brique, pierre, toits à forte pente — du XVIIe siècle classé.' },
  { id: 'secret-noir-levrier', nameFr: 'Cour du Noir Lévrier', circuitName: 'Cour du Noir Lévrier', tags: ['passage_cache', 'nom_insolite'], observe: 'Depuis l’artère, rien n’indique la cour. Poussez jusqu’au fond de la poche pavée.' },
  { id: 'secret-marcote', nameFr: 'Le Château de le Marcote', circuitName: 'Chateau de le Marcote', tags: ['detail', 'nom_insolite', 'vieux_mons'], observe: 'Au 33 rue des Marcottes, mesurez la façade du regard (~2,90 m) puis levez les yeux : trois belettes courent sur l’enseigne de 1689.' },
  { id: 'secret-fillettes', nameFr: 'Rue des Fillettes', circuitName: 'Rue des Fillettes', tags: ['nom_insolite', 'vieux_mons'], observe: 'Lisez la plaque sans sourire trop vite. Le nom innocent cache une autre histoire.' },
  { id: 'secret-voussure', nameFr: 'Rue de la Voussure', circuitName: 'Rue de la Voussure', tags: ['mystere', 'passage_cache', 'vieux_mons'], observe: 'La rue n’a qu’une cinquantaine de mètres. Cherchez le point le plus étroit, le ressaut de terrain : ici passait une voûte sous Saint-Germain.' },
  { id: 'secret-ane-barre', nameFr: 'Cour de l’Âne Barré', circuitName: "Cour de l'Âne Barré", tags: ['nom_insolite', 'passage_cache'], observe: 'À deux pas de la Grand-Place, changez de siècle en trois enjambées. Un âne « barré » porte une raie sombre sur le dos.' },
  { id: 'secret-chasse-bon-dieu', nameFr: 'Chasse du Bon Dieu de Pitié', circuitName: 'Chasse du Bon Dieu', tags: ['passage_cache', 'vieux_mons', 'mystere'], observe: 'Une « chasse », à Mons, n’est pas une partie de chasse : c’est une venelle. Celle-ci se traverse en quelques pas.' },
  { id: 'secret-cour-bailly', nameFr: 'Cour du Bailly', circuitName: 'Cour du Bailly', tags: ['vieux_mons', 'passage_cache'], observe: 'Derrière l’ancien château, marchez jusqu’au fond de la cour. Ce n’était pas, à l’origine, une impasse.' },
  { id: 'secret-cinq-visages', nameFr: 'Les Cinq Visages', circuitName: 'Rue des Cinq Visages', tags: ['mystere', 'nom_insolite', 'detail'], observe: 'Comptez les fenêtres, mascarons et clés de voûte. Cinq visages : mais qui regardait qui ?' },
  { id: 'secret-dausias', nameFr: 'Plaque de Charles Dausias – rue des Cinq Visages', lat: 50.45208, lng: 3.94628, tags: ['detail', 'legende'], observe: 'Sur la rue des Cinq Visages, cherchez la plaque littéraire : Charles Dausias, poète montois, s’efface facilement au passage.', secret: 'Charles Dausias (1860-1943), écrivain et poète wallon, a vécu ici. Sa plaque, sur la rue des Cinq Visages, rappelle qu’il fonda la gazette patoisante montoise « El Ropieur ». C’est typiquement le détail que l’on rate en allant vers Sainte-Waudru. Lisez le texte gravé — ICI A VECU. Un détour de vingt mètres suffit.', anecdote: 'Les plaques d’écrivains se lisent mieux à contre-jour, le matin.' },
  { id: 'secret-gades', nameFr: 'Rue des Gades', circuitName: 'Rue des Gades', tags: ['nom_insolite', 'vieux_mons'], observe: '« Gades » signifie chèvres en parler d’ici. Levez les yeux : le beffroi surgit entre deux pignons.' },
  { id: 'secret-grosse-pomme', nameFr: 'Rue de la Grosse Pomme', circuitName: 'Rue de la Grosse Pomme', tags: ['nom_insolite', 'doudou', 'vieux_mons'], observe: 'Goûtez le nom, puis le dénivelé. La rue longeait le parcours du Car d’Or et une ancienne enceinte.' },
  { id: 'secret-rampe-chateau', nameFr: 'Rampe du Château', circuitName: 'Rampe du Château', tags: ['vieux_mons', 'passage_cache'], observe: 'Gravissez la pente pavée à pied. À mi-course, le beffroi bascule au-dessus des toits.' },
  { id: 'secret-peine-perdue', nameFr: 'Rue de la Peine Perdue', circuitName: 'Rue de la Peine Perdue', tags: ['nom_insolite', 'vieux_mons'], observe: 'Oui, la plaque dit bien cela. Lisez-la à voix haute, près de Sainte-Élisabeth.' },
  { id: 'secret-trois-boudins', nameFr: 'Rue des Trois Boudins', circuitName: 'Rue des Trois Boudins', tags: ['nom_insolite', 'detail'], observe: 'La rue existe vraiment. Tournez-vous vers l’arrière du Mundaneum : la brique expressionniste vaut le détour autant que le nom.' },
  { id: 'secret-borgnagache', nameFr: 'Rampe Borgnagache', circuitName: 'Rampe Borgnagache', tags: ['nom_insolite', 'mystere'], observe: 'Épelez le mot : Borg-na-gache. Pie montoise (agache) ou bienfaiteurs Borgnagache ? Les deux pistes circulent.' },
  { id: 'secret-quinettes', nameFr: 'Ruelle aux Quinettes', circuitName: 'Ruelle aux Quinettes', tags: ['passage_cache', 'nom_insolite'], observe: 'Une venelle du quartier Rachot, trop courte pour les guides pressés. Le nom viendrait d’une déformation de Hocquinette.' },
  { id: 'secret-petite-guirlande', nameFr: 'Rue de la Petite Guirlande', circuitName: 'Rue de la Petite Guirlande', tags: ['nom_insolite', 'doudou', 'vieux_mons'], observe: 'Un nom de fête sur une rue de liaison. Elle reste sur le parcours traditionnel du Car d’Or.' },
  { id: 'secret-terre-prince', nameFr: 'Rue de la Terre du Prince', circuitName: 'Rue de la Terre du Prince', tags: ['vieux_mons', 'detail'], observe: 'Cherchez les vestiges d’enceinte — parfois dits mur de Baudouin. La terre du prince, c’était le domaine comtal au bord du mur.' },
  { id: 'secret-fils-aymon', nameFr: 'Rue des Quatre Fils Aymon', circuitName: 'Rue des Quatre Fils Aymon', tags: ['legende', 'nom_insolite', 'detail'], observe: 'Au n°14, un portail d’hôtel de maître ; au n°6, vitraux et belle porte. Sur la plaque, Renaud et ses frères fuient Charlemagne.' },
  { id: 'secret-soeurs-noires', nameFr: 'Rue des Sœurs Noires', geocode: 'Rue des Sœurs Noires, 7000 Mons, Belgium', photoFrom: 'Couvent des Soeurs Noires', tags: ['vieux_mons', 'nom_insolite'], observe: 'Le nom d’un habit de couvent collé à la voirie. Mettez-la en parallèle avec la rue des Sœurs Grises.', secret: 'Mons était une ville de clôtures. Les sœurs noires, souvent hospitalières, se distinguaient par la bure sombre. Quand les régimes ont vidé les couvents, les rues ont gardé les surnoms. La rue des Sœurs Noires n’est pas un musée : c’est une plaque, un alignement, la mémoire d’un enclos. Le couvent voisin donne encore un volume de pierre à cette histoire. Lisez les deux plaques — Noires et Grises — le même jour : vous aurez le Mons des femmes en religion, celui que l’on résume trop vite à Sainte-Waudru.' },
  { id: 'secret-soeurs-grises', nameFr: 'Rue des Sœurs Grises', circuitName: 'Rue des Sœurs Grises', tags: ['vieux_mons', 'nom_insolite'], observe: 'Le pendant des Sœurs Noires. Gris cendré : tertiaires franciscaines, plus humbles que la bure noire.' },
  { id: 'secret-biche', nameFr: 'Rue de la Biche', geocode: 'Rue de la Biche, 7000 Mons, Belgium', tags: ['nom_insolite', 'vieux_mons'], observe: 'Encore un odonyme animalier. Cherchez une enseigne, un fer forgé, un souvenir de bête sur les façades.', secret: 'La biche appartient à la même famille que le cerf blanc, le lévrier et les gades : Mons nommait ses rues comme on nomme une auberge. Une enseigne parlante, un jardin, un surnom : le mot a migré de la façade vers la plaque. La rue n’a rien d’un zoo. Elle a le charme des toponymes que l’on ne traduit plus. Lisez-la à voix haute. Dans une ville de saints et de beffroi, une biche au coin de la rue rappelle que le Mons quotidien parlait aussi aux analphabètes par images.' },
  { id: 'secret-ropieurs', nameFr: 'Rue des Ropieurs', geocode: 'Rue des Ropieurs, 7000 Mons, Belgium', tags: ['nom_insolite', 'doudou'], observe: 'Le Ropieur de la Grand-Place a une rue à son nom. Reliez le folklore du jet d’eau au vocabulaire montois.', secret: 'Le Ropieur, c’est ce garnement de bronze qui pisse dans la fontaine, cousin montois du Manneken-Pis. Lui donner une rue, c’est inscrire le folklore dans le plan. On ne vient pas ici pour une statue : on vient pour un mot. Ropier, en parler d’ici, c’est faire le malin, le petit chenapan. La voirie, plus loin du cœur touristique, prouve que le surnom n’appartient pas qu’aux cartes postales. Prononcez-le comme un Montois. Le Doudou a le dragon ; la ville a aussi ses garnements.' },
  { id: 'secret-blancs-mouchons', nameFr: 'Rue des Blancs Moucherons', geocode: 'Rue des Blancs Mouchons, 7000 Mons, Belgium', tags: ['nom_insolite'], observe: 'Le registre officiel dit souvent « Mouchons ». Moucherons ou mouchons : le nom étrange fonctionne parfaitement.', secret: 'Les Blancs Mouchons (parfois écrits Moucherons) appartiennent à ces odonymes dont l’étymologie savante s’arrête au bord du folklore. Insectes, surnom, enseigne, déformation graphique : les hypothèses circulent, et c’est tant mieux. Une plaque illisible pour le visiteur pressé devient, pour Explorer, un appât. La rue existe au registre de Mons. Elle n’a pas besoin d’un monument : le mot suffit à justifier le détour. Photographiez la plaque. C’est déjà une chasse.' },
  { id: 'secret-inquietude', nameFr: 'Impasse / chemin de l’Inquiétude', geocode: 'Chemin de l\'Inquiétude, 7000 Mons, Belgium', tags: ['nom_insolite', 'passage_cache'], observe: 'Le nom le plus amusant à présenter dans l’application. Une impasse, et une humeur.', secret: 'L’Inquiétude comme nom de voirie a l’air d’une invention. C’est une vraie voie montoise : impasse et chemin portent le même mot. On a proposé un lieu sombre, une boutade de quartier, un passage qu’on n’aimait pas emprunter la nuit. Nul besoin de trancher. Le mot est long, la voie est courte. Un détour de cinquante mètres pour une phrase que l’on raconte ensuite à table.' },
  { id: 'secret-pourcelet', nameFr: 'Rue du Pourcelet', geocode: 'Rue du Pourcelet, 7000 Mons, Belgium', tags: ['nom_insolite', 'vieux_mons'], observe: 'Un pourcelet est un petit porc. Enseigne de triperie, surnom, ou simple gourmandise toponymique ?', secret: 'Le pourcelet — le petit porc — entre dans la série gourmande des Trois Boudins et de la Grosse Pomme. Les métiers de bouche affichaient leurs bêtes ; les rues ont parfois gardé le menu. Mons n’a pas expurgé ses plaques. Celle-ci se prête au jeu de découverte : on y va pour le mot, on y reste si le pavé et les façades le méritent. Lisez, souriez, cherchez une enseigne oubliée. Le vieux Mons se mange aussi avec les yeux.' },
  { id: 'secret-clercs', nameFr: 'Rue des Clercs', circuitName: 'Rue des Clercs', tags: ['vieux_mons', 'detail'], observe: 'Pavés, percées sur le beffroi, Maison espagnole. Ce n’est pas un raccourci : marchez lentement, numéro par numéro.' },
  { id: 'secret-atre', nameFr: 'Rue de l’Âtre', circuitName: "Rue de l'Âtre", tags: ['vieux_mons', 'detail'], observe: 'Un âtre, c’est le foyer. Près de Saint-Nicolas-en-Havré, cherchez aussi le Christ douloureux collé à la façade latérale.' },
  { id: 'secret-rampe-waudru', nameFr: 'Rampe Sainte-Waudru', circuitName: 'Rampe Sainte Waudru', tags: ['doudou', 'legende', 'vieux_mons'], observe: 'Grimpez la pente pavée d’une traite, comme le Car d’Or le dimanche de la Trinité. Si le char s’arrête, dit-on, malheur à la ville.' },
  { id: 'secret-marche-poulets', nameFr: 'Marché aux Poulets', geocode: 'Marché aux Poulets, 7000 Mons, Belgium', tags: ['nom_insolite', 'vieux_mons'], observe: 'Un nom de marché collé à une voirie. Cherchez ce qu’il reste d’un lieu de vente dans le tracé et les rez-de-chaussée.', secret: 'Le Marché aux Poulets appartient à la toponymie des halles : on vendait ici des volailles, comme on vendait aux Herbes, aux Poulets, aux Tripes ailleurs dans les villes d’Ancien Régime. Le marché a disparu ; le nom n’a pas cédé. Pour Explorer, c’est un mini-POI parfait : pas un monument, un usage. Le visiteur comprend, en dix mètres, que Mons nommait ses rues d’après ce qu’on y criait. Écoutez le mot. Il a encore le bruit d’un étal.' },
  { id: 'secret-ruelle-repos', nameFr: 'Ruelle du Repos', geocode: 'Ruelle du Repos, 7000 Mons, Belgium', tags: ['passage_cache', 'nom_insolite'], observe: 'Une ruelle dont le nom promet le calme. Vérifiez si le pavé tient la promesse.', secret: 'La Ruelle du Repos n’a pas besoin d’une légende compliquée. Dans le vieux tissu, les venelles portaient des noms d’humeur, d’usage ou d’enseigne. Le repos, ici, peut dire un cimetière proche, un enclos, ou simplement un passage où l’on s’arrêtait. C’est une de ces minuscules voies qu’un touriste classique ignore. Le GPS doit coller à l’entrée, pas au milieu d’un pâté de maisons. Entrez. Le silence, s’il est au rendez-vous, est le secret.' },
  { id: 'secret-hommes-blancs', nameFr: 'Rue des Hommes Blancs', geocode: 'Rue des Hommes Blancs, 7000 Mons, Belgium', tags: ['nom_insolite', 'mystere'], observe: 'Le nom intrigue autant que les Cinq Visages. Qui étaient ces hommes blancs ?', secret: 'Les Hommes Blancs ont fait gloser : pénitents en aube, confrérie, surnom de quartier, enseigne ? Comme souvent à Mons, l’hypothèse savante n’épuise pas le folklore. La rue figure au registre. Elle offre un détour de vocabulaire, pas une collégiale de plus. Reliez-la mentalement aux Sœurs Noires et Grises : la ville classait les gens par la couleur d’un habit. Ici, ce sont des hommes, et ils sont blancs. Le reste est à chercher sur place — une pierre, une plaque, une absence.' },
  { id: 'secret-loge-chisaire', nameFr: 'Loge maçonnique, rue Chisaire', circuitName: 'Loge maconnique Rue Chisaire', tags: ['mystere', 'detail'], observe: 'Rue Chisaire, cherchez les signes discrets d’une loge : un bâtiment qui ne dit pas tout sur la rue.', secret: 'La loge de la rue Chisaire appartient au Mons discret, celui des sociétés initiatiques plutôt que des processions. On n’y entre pas comme au musée. Depuis le trottoir, le jeu est de repérer un édifice qui, sans crier son nom, ne ressemble pas tout à fait à la maison voisine. C’est un POI de détail : GPS au bâtiment, photo de cette façade, pas d’une rue générique. Le secret n’est pas un complot : c’est une autre sociabilité montoise, parallèle au Doudou et aux couvents.' },
  { id: 'secret-capucins', nameFr: 'Rue des Capucins', circuitName: 'Rue des Capucins', tags: ['vieux_mons', 'nom_insolite'], observe: 'Un ordre mendiant dans le nom de la rue. Cherchez ce qui reste d’un enclos, d’un alignement, d’une mémoire de couvent.', secret: 'Les capucins, franciscains à capuche, ont marqué Mons comme les sœurs noires et grises. Quand le couvent s’efface, la rue garde l’habit. La rue des Capucins n’est pas Sainte-Waudru : c’est un fil de toponymie religieuse dans un quartier plus quotidien. Le visiteur d’Explorer y vient pour le mot et pour le tissu urbain, pas pour une nef. Lisez la plaque, puis le bâti. Un ordre entier tient parfois dans six lettres.' },
  { id: 'secret-gros-visage', nameFr: 'Au Gros Visage', circuitName: 'Au Gros Visage', tags: ['detail', 'nom_insolite'], observe: 'Une enseigne parlante facile à manquer. Cherchez le visage — mascaron, clé de voûte, ou simple souvenir du nom.', secret: 'Au Gros Visage : encore une enseigne devenue repère. Mons en est pleine, et c’est tant mieux pour une chasse aux curiosités. Ici le GPS doit coller au détail, pas au milieu de la rue. Le « gros visage » peut être un mascaron, une tête de pierre, une blague de façade. Levez les yeux. Les enseignes étaient le GPS des analphabètes ; elles le redeviennent pour qui accepte de chercher.' },
  { id: 'secret-sentier-poetes', nameFr: 'Sentier des Poètes', geocode: 'Sentier des Poètes, 7000 Mons, Belgium', tags: ['nom_insolite', 'passage_cache'], observe: 'Un sentier, pas une avenue. Le nom seul invite à ralentir et à lire le lieu comme un texte.', secret: 'Le Sentier des Poètes est l’anti-boulevard. Un sentier, des poètes : Mons y glisse une invitation littéraire dans la voirie. On n’y cherche pas un beffroi. On y cherche un passage, une plaque, une humeur. C’est le complément de Charles Dausias : la ville écrit aussi dans ses chemins. Empruntez-le. S’il est court, tant mieux — Explorer n’est pas une encyclopédie, c’est une chasse.' },
  { id: 'secret-chasse-roeulx', nameFr: 'Chasse du Rœulx', geocode: 'Chasse du Roeulx, 7000 Mons, Belgium', tags: ['passage_cache', 'vieux_mons'], observe: 'Encore une « chasse » montoise : une venelle, pas une partie de chasse. Comparez-la à celle du Bon Dieu.', secret: 'La chasse du Rœulx rappelle qu’à Mons le mot chasse veut dire venelle. Rœulx est une ville voisine ; le toponyme peut dire un chemin vers Rœulx, une propriété, une enseigne. Pour Explorer, l’intérêt est double : le vocabulaire (chasse) et le lien d’échelle (Mons et sa région). Le GPS doit viser l’entrée de la venelle. Deux chasses dans la même catégorie, c’est déjà une leçon de parler montois.' },
];

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function locOf(locations, poi) {
  if (Number.isFinite(poi.lat) && Number.isFinite(poi.lng)) return { lat: poi.lat, lng: poi.lng };
  if (poi.circuitName && locations.has(poi.circuitName)) {
    const loc = locations.get(poi.circuitName);
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

async function geocode(address, cache) {
  if (cache[address]) return cache[address];
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address);
  const res = await fetch(url, UA);
  if (!res.ok) throw new Error(`Nominatim ${res.status} ${address}`);
  const json = await res.json();
  await new Promise((r) => setTimeout(r, 1100));
  if (!json[0]) {
    cache[address] = null;
    return null;
  }
  const hit = { lat: Number(json[0].lat), lng: Number(json[0].lon) };
  cache[address] = hit;
  console.log('geocode', address, hit.lat.toFixed(5), hit.lng.toFixed(5));
  return hit;
}

async function commonsFileUrl(file) {
  const title = file.replace(/^File:/, '');
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent('File:' + title) + '&prop=imageinfo&iiprop=url&iiurlwidth=1600&format=json';
  const res = await fetch(api, UA);
  const json = await res.json();
  const pages = json?.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
}

const NO_SHARE_PHOTO = new Set(['secret-croix-cronque', 'secret-dausias']);

function isImageFileTitle(title) {
  return /\.(jpe?g|png|webp)$/i.test(String(title || '')) && !/\.(pdf|djvu)$/i.test(String(title || ''));
}

async function commonsSearchFile(query) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch='
    + encodeURIComponent(query + ' filetype:bitmap')
    + '&srnamespace=6&srlimit=8&format=json';
  const res = await fetch(api, UA);
  if (!res.ok) return null;
  const json = await res.json();
  await new Promise((r) => setTimeout(r, 400));
  const hits = json?.query?.search || [];
  const hit = hits.find((h) => isImageFileTitle(h.title) && /mons/i.test(h.title || ''));
  return hit?.title || null;
}

async function downloadCommonsTo(fileTitle, abs) {
  const url = await commonsFileUrl(fileTitle);
  if (!url) return false;
  const img = await fetch(url, UA);
  if (!img.ok) return false;
  const buf = Buffer.from(await img.arrayBuffer());
  const hex = buf.subarray(0, 4).toString('hex');
  const ok = hex.startsWith('ffd8ff') || hex === '89504e47' || hex === '52494646';
  if (!ok) return false;
  fs.writeFileSync(abs, buf);
  return fs.statSync(abs).size > 8000;
}

async function ensurePhoto(poi) {
  const dest = poi.photo || `images/explorer-secret/${poi.id}.jpg`;
  const abs = path.join(ROOT, dest);
  const rel = dest.replace(/\\/g, '/');
  if (fs.existsSync(abs) && fs.statSync(abs).size > 8000) return rel;
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  if (poi.commons && await downloadCommonsTo(poi.commons, abs)) {
    console.log('photo commons', poi.id, fs.statSync(abs).size);
    return rel;
  }

  if (!NO_SHARE_PHOTO.has(poi.id)) {
    let src = null;
    if (poi.photoFrom && imageMap[poi.photoFrom]) src = path.join(ROOT, imageMap[poi.photoFrom]);
    else if (poi.circuitName && imageMap[poi.circuitName]) src = path.join(ROOT, imageMap[poi.circuitName]);
    if (src && fs.existsSync(src) && fs.statSync(src).size > 8000) {
      fs.copyFileSync(src, abs);
      console.log('photo copy', poi.id);
      return rel;
    }
  }

  const queries = [];
  if (poi.id === 'secret-dausias') queries.push('Charles Dausias Mons plaque', 'Charles Dausias Mons');
  else {
    if (poi.circuitName) queries.push(`Mons ${poi.circuitName}`);
    queries.push(`Mons ${poi.nameFr}`);
  }
  for (const q of queries) {
    const title = await commonsSearchFile(q);
    if (title && await downloadCommonsTo(title, abs)) {
      console.log('photo search', poi.id, title, fs.statSync(abs).size);
      return rel;
    }
  }

  console.warn('photo missing', poi.id);
  return null;
}

function loadInsoliteAll() {
  const bag = {};
  for (const file of [
    'insolite-texts-fr-en.json',
    'insolite-texts-nl-de-it.json',
    'insolite-texts-es-pl.json',
    'insolite-texts-ar-cn-jp.json',
  ]) {
    Object.assign(bag, JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', file), 'utf8')));
  }
  if (bag.jp && !bag.ja) bag.ja = bag.jp;
  return bag;
}

const insoliteAll = loadInsoliteAll();

function bag(frText) {
  const o = {};
  for (const lang of LANGS) o[lang] = frText;
  return o;
}

function insoliteLong(poi, lang) {
  if (!poi.circuitName) return '';
  const pack = lang === 'ja' ? (insoliteAll.ja || insoliteAll.jp) : insoliteAll[lang];
  return pack?.[poi.circuitName]?.long || '';
}

function secretTextFr(poi) {
  if (poi.secret) return poi.secret;
  return insoliteLong(poi, 'fr') || poi.observe;
}

function isLangComplete(trLang, needSecret, needAnecdote) {
  if (!trLang?.name || !trLang?.observe) return false;
  if (needSecret && !trLang.secret) return false;
  if (needAnecdote && !trLang.anecdote) return false;
  return true;
}

async function translateOne(poi, cache) {
  const needSecret = Boolean(poi.secret) || !insoliteLong(poi, 'en');
  const needAnecdote = Boolean(poi.anecdote);
  const existing = cache[poi.id] || {};
  const missing = LANGS.filter((l) => l !== 'fr' && !isLangComplete(existing[l], needSecret, needAnecdote));
  if (!missing.length) return existing;

  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) {
    console.warn('Pas de clé OpenAI :', poi.id);
    return existing;
  }

  const payload = {
    id: poi.id,
    name: poi.nameFr,
    observe: poi.observe,
    anecdote: poi.anecdote || '',
  };
  if (needSecret) payload.secret = secretTextFr(poi);

  const prompt = `Translate this Mons visitor card into: ${missing.join(', ')} (cn = Simplified Chinese, ja = Japanese).
Keep proper names: Mons, VisitMons, Doudou, Car d’Or, Waudru, Mundaneum, Cronque, Marcote, Dausias, Ropieur.
Return JSON only:
{ "en": {"name","observe"${needSecret ? ',"secret"' : ''}${needAnecdote ? ',"anecdote"' : ''}}, ... }
Text:
${JSON.stringify(payload, null, 2)}`;

  const body = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 3500,
    messages: [
      { role: 'system', content: 'You translate CityLoop Quest Mons visitor texts. Return JSON only. No markdown.' },
      { role: 'user', content: prompt },
    ],
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('OpenAI', poi.id, res.status, await res.text());
    return existing;
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  let parsed = {};
  try { parsed = JSON.parse(content); } catch { console.warn('JSON parse fail', poi.id); return existing; }
  const bagT = parsed[poi.id] || parsed.translations?.[poi.id] || parsed;
  const merged = { ...existing };
  for (const lang of missing) {
    if (bagT[lang] && typeof bagT[lang] === 'object') {
      merged[lang] = { ...(merged[lang] || {}), ...bagT[lang] };
    }
  }
  cache[poi.id] = merged;
  console.log('translated', poi.id);
  return merged;
}

async function geocodeGoogle(address, cache) {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return null;
  const cacheKey = 'g:' + address;
  if (cache[cacheKey] !== undefined) return cache[cacheKey];
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + encodeURIComponent(key);
  const res = await fetch(url);
  if (!res.ok) {
    cache[cacheKey] = null;
    return null;
  }
  const json = await res.json();
  const loc = json.results?.[0]?.geometry?.location;
  if (!loc) {
    cache[cacheKey] = null;
    return null;
  }
  const hit = { lat: Number(loc.lat), lng: Number(loc.lng) };
  cache[cacheKey] = hit;
  console.log('geocode google', address, hit.lat.toFixed(5), hit.lng.toFixed(5));
  return hit;
}

function locName(poi, tr) {
  const name = bag(poi.nameFr);
  for (const lang of LANGS) {
    if (lang !== 'fr' && tr?.[lang]?.name) name[lang] = tr[lang].name;
  }
  return name;
}

const locations = loadLocations();
const geoCachePath = path.join(ROOT, 'scripts/geocode-cache.json');
const geoCache = fs.existsSync(geoCachePath) ? JSON.parse(fs.readFileSync(geoCachePath, 'utf8')) : {};
const center = { lat: 50.454581, lng: 3.952281 };
const MAX_KM = 8;

for (const poi of POIS) {
  let xy = locOf(locations, poi);
  if (!xy && poi.geocode) xy = await geocode(poi.geocode, geoCache);
  if (!xy && poi.geocode) xy = await geocodeGoogle(poi.geocode, geoCache);
  if (xy && haversineKm(center, xy) > MAX_KM) {
    console.warn('TOO FAR', poi.id, haversineKm(center, xy).toFixed(2), 'km');
    xy = null;
  }
  if (!xy) console.warn('NO COORDS', poi.id);
  poi._xy = xy;
}
fs.writeFileSync(geoCachePath, JSON.stringify(geoCache, null, 2));

for (const poi of POIS) {
  if (!poi._xy) continue;
  poi._photo = await ensurePhoto(poi);
}

const seenPhotoHash = new Map();
for (const poi of POIS) {
  if (!poi._photo) continue;
  const abs = path.join(ROOT, poi._photo);
  if (!fs.existsSync(abs)) { poi._photo = null; continue; }
  const h = crypto.createHash('md5').update(fs.readFileSync(abs)).digest('hex');
  if (seenPhotoHash.has(h)) {
    console.warn('duplicate photo dropped', poi.id, 'same as', seenPhotoHash.get(h));
    fs.unlinkSync(abs);
    poi._photo = null;
  } else {
    seenPhotoHash.set(h, poi.id);
  }
}

const trCachePath = path.join(ROOT, 'scripts/secret-translations-cache.json');
const trCache = fs.existsSync(trCachePath) ? JSON.parse(fs.readFileSync(trCachePath, 'utf8')) : {};
for (const poi of POIS) {
  if (!poi._xy) continue;
  await translateOne(poi, trCache);
  fs.writeFileSync(trCachePath, JSON.stringify(trCache, null, 2));
}

const built = [];
for (const poi of POIS) {
  if (!poi._xy) continue;
  const tr = trCache[poi.id] || {};
  const observe = bag(poi.observe);
  const description = bag(secretTextFr(poi));
  const anecdote = poi.anecdote ? bag(poi.anecdote) : null;
  for (const lang of LANGS) {
    if (lang === 'fr') continue;
    const fromInsolite = poi.secret ? '' : insoliteLong(poi, lang);
    if (fromInsolite) description[lang] = fromInsolite;
    if (tr[lang]?.observe) observe[lang] = tr[lang].observe;
    if (tr[lang]?.secret && !fromInsolite) description[lang] = tr[lang].secret;
    if (anecdote && tr[lang]?.anecdote) anecdote[lang] = tr[lang].anecdote;
  }
  built.push({
    id: poi.id,
    name: locName(poi, tr),
    city: 'Mons',
    categoryKeys: ['mons_secret'],
    category: CAT,
    tags: poi.tags,
    explorerFormat: 'hunt',
    lat: poi._xy.lat,
    lng: poi._xy.lng,
    coordinateSystem: 'WGS84 decimal degrees',
    coordinateStatus: poi.geocode && !poi.circuitName ? 'high_confidence' : 'validated',
    distanceKmFromGrandPlaceMons: Math.round(haversineKm(center, poi._xy) * 1000) / 1000,
    radiusPriorityKm: 5,
    visitDurationMin: 8,
    hasOpeningHours: false,
    isBeach: false,
    observe,
    description,
    anecdote,
    photos: poi._photo ? [poi._photo] : [],
    sourceUrls: ['https://www.visitmons.be/'],
    lastVerified: '2026-08-15',
  });
}

const explorerPath = path.join(ROOT, 'data/pois_explorer.json');
const explorer = JSON.parse(fs.readFileSync(explorerPath, 'utf8'));
explorer.pois = explorer.pois.filter((p) => !(Array.isArray(p.categoryKeys) && p.categoryKeys.includes('mons_secret')) && !String(p.id || '').startsWith('secret-'));
explorer.pois.push(...built);
explorer.poiCount = explorer.pois.length;
fs.writeFileSync(explorerPath, JSON.stringify(explorer, null, 2) + '\n');
console.log('secret POIs', built.length, 'total explorer', explorer.poiCount);
console.log('missing photos', built.filter((p) => !p.photos.length).map((p) => p.id).join(', ') || 'none');
console.log('dropped', POIS.filter((p) => !p._xy).map((p) => p.id).join(', ') || 'none');
