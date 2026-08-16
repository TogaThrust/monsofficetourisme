const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  const res = await fetch(url, UA);
  return res.json();
}
const titles = [
  'File:Mons 070204 (7).JPG',
  'File:Mons 070204 (9).JPG',
  'File:Mons 070204 (79).JPG',
  'File:Mons 070204 (37).JPG',
  "File:0 Mons - Rue d'Havré (1).JPG",
  "File:0 Mons - Rue d'Havré, 5 - (1).JPG",
  "File:0 Mons - Rue d'Havré, 6 - (1).JPG",
  "File:0 Mons - Rue d'Havré, 34 - (1).JPG",
  'File:0 Mons - Rue des Fripiers (1).JPG',
  'File:0 Mons - Rue des Fripiers (2a).JPG',
  "File:0 Mons - Grand'Rue (1).JPG",
  "File:0 Mons - Grand'Rue, 11.JPG",
  'File:Mons - Waux Hall.JPG',
  'File:Mons Pa1JPG.jpg',
  'File:Mons WH1b.jpg',
  'File:Parc du Waux-Hall - Mons - Belgique.jpg',
  'File:0 Mons - Rue de Bertaimont, 33 (1).JPG',
  "File:0 Mons - Rue d'Havré, 114 et Jardin Gustave Jacobs (1).JPG",
];
const json = await wiki({
  action: 'query',
  titles: titles.join('|'),
  prop: 'imageinfo',
  iiprop: 'extmetadata',
});
for (const page of Object.values(json.query.pages)) {
  const desc = page.imageinfo?.[0]?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  console.log('\n', page.title);
  console.log(' ', desc.slice(0, 280));
}
