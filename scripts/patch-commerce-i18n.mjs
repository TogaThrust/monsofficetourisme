import fs from 'fs';

const keysFr = {
  circuit_commerces: 'Rues commerçantes<br>à la carte',
  commerce_picker_title: 'Choisir les rues commerçantes',
  commerce_picker_hint: 'Distance depuis la Grand-Place, et depuis vous si la géolocalisation est active. Cochez les rues à parcourir.',
  commerce_select_all: 'Tout',
  commerce_select_near: 'Les plus proches',
  commerce_select_none: 'Aucune',
  commerce_picker_go: 'Lancer le parcours',
  commerce_picker_cancel: 'Annuler',
  commerce_summary_empty: 'Aucune rue sélectionnée.',
  commerce_summary: '{count} rue(s) · {km} · {time}',
  commerce_entire: 'entière',
  commerce_from_you_short: 'de vous',
  commerce_from_gp_short: 'de la Grand-Place',
};

const keysEn = {
  circuit_commerces: 'Shopping streets<br>à la carte',
  commerce_picker_title: 'Choose shopping streets',
  commerce_picker_hint: 'Distance from Grand-Place, and from you if location is on. Tick the streets you want to walk.',
  commerce_select_all: 'All',
  commerce_select_near: 'Nearest',
  commerce_select_none: 'None',
  commerce_picker_go: 'Start the tour',
  commerce_picker_cancel: 'Cancel',
  commerce_summary_empty: 'No street selected.',
  commerce_summary: '{count} street(s) · {km} · {time}',
  commerce_entire: 'full street',
  commerce_from_you_short: 'from you',
  commerce_from_gp_short: 'from Grand-Place',
};

const tr = JSON.parse(fs.readFileSync('translations/translations.json', 'utf8'));
for (const lang of Object.keys(tr)) {
  Object.assign(tr[lang], lang === 'fr' ? keysFr : keysEn);
}
fs.writeFileSync('translations/translations.json', JSON.stringify(tr, null, 2));

const desc = JSON.parse(fs.readFileSync('translations/descriptions.json', 'utf8'));
const shorts = JSON.parse(fs.readFileSync('translations/descriptions_short.json', 'utf8'));
const frLong = {
  'Rue de Nimy': "La rue de Nimy est l'une des plus anciennes rues commerçantes de Mons. En partant de la Grand-Place, on remonte toute la rue : enseignes de pierre, boutiques et façades du XVIIIe siècle forment une véritable rue-musée.",
  'Rue de Nimy extremite': "Vous voilà vers l'extrémité de la rue de Nimy, du côté du Mundaneum et de la ville haute. Revenez sur vos pas ou continuez selon les rues que vous avez choisies.",
  'Rue du Miroir': "Petite rue commerçante juste à côté de la Grand-Place, la rue du Miroir mène vers le théâtre et le quartier de Nimy. Levez les yeux : enseignes et détails de façades y sont nombreux.",
  "Rue d'Havre debut": "La rue d'Havré commence ici, au plus près de la Grand-Place. C'est probablement la rue la plus riche en enseignes de pierre de Mons : lion, clé, lunette, balance, pelles de boulanger...",
  "Rue d'Havre extremite": "Extrémité de la rue d'Havré, vers le quartier du Waux-Hall. Vous avez parcouru toute cette ancienne voie commerçante, autrefois route vers Havré.",
  'Rue du Hautbois': "La rue du Hautbois relie le centre aux abords de la rue d'Havré. On y trouve notamment de belles enseignes de pierre, dont le Pistolet d'Or et l'Écaille d'Or.",
  'Rue de la Clef': "La rue de la Clef, toute proche de la Grand-Place, conserve le souvenir de l'ancienne Grande Boucherie et plusieurs enseignes sculptées.",
  'Rue de Houdain': "La rue de Houdain descend vers le sud du centre. Rue commerçante et de passage, elle mène vers Croix-Place et le quartier de la Halle.",
  'Rue de la Chaussee': "La rue de la Chaussée est une artère commerçante du centre, entre la Grand-Place et le bas de la ville. Vitrines, passages et flux de piétons s'y croisent toute la journée.",
  'Rue des Capucins': "La rue des Capucins relie le centre au quartier ouest. Boutiques et façades s'y succèdent, avec plusieurs fresques de L'Art habite la ville.",
  'Rue de la Petite Guirlande': "La rue de la Petite Guirlande, plus calme, se situe vers le quartier de la gare. Elle complète le réseau des rues commerçantes de l'ouest du centre.",
  'Rue Rogier': "La rue Rogier, du côté de la gare Calatrava, fait le lien entre le centre historique et le quartier de la station.",
  'Rue Leopold II': "La rue Léopold II borde le quartier de la gare. Plus éloignée de la Grand-Place, elle reste une rue de passage et de commerces vers Calatrava.",
};
const frShort = {
  'Rue de Nimy': "Remontez toute la rue de Nimy depuis la Grand-Place : une rue-musée d'enseignes de pierre et de boutiques.",
  'Rue de Nimy extremite': "Extrémité de la rue de Nimy, vers le Mundaneum et la ville haute.",
  'Rue du Miroir': "Petite rue commerçante collée à la Grand-Place, vers le théâtre.",
  "Rue d'Havre debut": "Début de la rue d'Havré, la plus riche en enseignes de pierre de Mons.",
  "Rue d'Havre extremite": "Bout de la rue d'Havré, vers le Waux-Hall.",
  'Rue du Hautbois': "Rue du Hautbois, entre le centre et la rue d'Havré, connue pour ses enseignes de pierre.",
  'Rue de la Clef': "Rue de la Clef, tout près de la Grand-Place, souvenir de l'ancienne Grande Boucherie.",
  'Rue de Houdain': "Rue de Houdain, vers Croix-Place et le quartier de la Halle.",
  'Rue de la Chaussee': "Rue de la Chaussée, artère commerçante entre la Grand-Place et le bas de la ville.",
  'Rue des Capucins': "Rue des Capucins, commerces et fresques vers l'ouest du centre.",
  'Rue de la Petite Guirlande': "Rue de la Petite Guirlande, vers le quartier de la gare.",
  'Rue Rogier': "Rue Rogier, lien entre le centre historique et la gare.",
  'Rue Leopold II': "Rue Léopold II, près de la gare Calatrava.",
};
if (!desc.fr) desc.fr = {};
if (!shorts.fr) shorts.fr = {};
Object.assign(desc.fr, frLong);
Object.assign(shorts.fr, frShort);
fs.writeFileSync('translations/descriptions.json', JSON.stringify(desc, null, 2));
fs.writeFileSync('translations/descriptions_short.json', JSON.stringify(shorts, null, 2));
console.log('translations + descriptions updated');
