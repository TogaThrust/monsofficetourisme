import fs from 'fs';
import path from 'path';

const IMAGES = 'images';
const BAD = [
  'The_Bootle_Arms.jpg',
  'Aux_Trois_Herrents.jpg',
  'Armes_de_Mons_Petit_Marche.jpg',
  'IHS_dans_un_soleil.jpg',
  'A_la_Tette_dOr.jpg',
  'Au_Lion_dOr.jpg',
  'A_la_Clef_dOr.jpg',
  'Au_Corbeau.jpg',
  'A_la_Licorne.jpg',
  'A_lEcaille_dOr.jpg',
  'Fontaine_Rue_de_Bertaimont.jpg',
  'Colombe_du_Saint-Esprit.jpg',
  'Cheval_Dore.jpg',
  'St_Franciscus_Kring.jpg',
  'Cartouche_et_blason_Grande_Triperie.jpg',
  '16_IHS_93.jpg',
  'Portes_du_Theatre_Royal.jpg',
  'Rue_Leopold_II.jpg',
  'Armes_de_Mons_Rue_de_la_Clef.jpg',
];

for (const f of BAD) {
  const p = path.join(IMAGES, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('deleted', f);
  }
}

const millesime = path.join(IMAGES, 'Millesime_MDCCXII.jpg');
const clef = path.join(IMAGES, 'A_la_Clef_dOr.jpg');
if (fs.existsSync(millesime)) {
  fs.copyFileSync(millesime, clef);
  fs.unlinkSync(millesime);
  console.log('moved millesime photo -> A_la_Clef_dOr.jpg (enseigne A LA CLEF D OR)');
}
