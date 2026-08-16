import fs from 'fs';
import path from 'path';
const DIR = 'images';
const files = [
  'The_Bootle_Arms.jpg',
  'Aux_Trois_Herrents.jpg',
  'Armes_de_Mons_Petit_Marche.jpg',
  'IHS_dans_un_soleil.jpg',
  'A_la_Tette_dOr.jpg',
  'Au_Lion_dOr.jpg',
  'Millesime_MDCCXII.jpg',
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
];
function kind(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'JPEG';
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'PNG';
  const s = buf.toString('latin1');
  if (s.startsWith('%PDF')) return 'PDF';
  if (s.includes('DJVU') || s.includes('DJVM') || s.startsWith('AT&T')) return 'DJVU';
  return 'OTHER ' + [...buf.slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join(' ');
}
for (const f of files) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) { console.log('missing', f); continue; }
  const buf = fs.readFileSync(p).subarray(0, 24);
  console.log(kind(buf).padEnd(12), String(fs.statSync(p).size).padStart(8), f);
}
