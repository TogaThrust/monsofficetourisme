const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  return (await fetch(url, UA)).json();
}
const titles = [
  'File:0 Mons - Rue de Nimy (85).JPG',
  'File:0 Mons - Rue du Parc (1).JPG',
  'File:0 Mons - Rue du Parc (2).JPG',
  'File:0 Mons - Rue du Parc (3).JPG',
  'File:0 Mons - Rue du Parc (4).JPG',
  'File:0 Mons - Rue du Parc (5).JPG',
  'File:0 Mons - Rue des Fripiers (2a).JPG',
  'File:0 Mons - Rue des Fripiers (2b).jpg',
];
const json = await wiki({ action: 'query', titles: titles.join('|'), prop: 'imageinfo', iiprop: 'extmetadata' });
for (const page of Object.values(json.query.pages)) {
  const desc = page.imageinfo?.[0]?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  console.log(page.title);
  console.log(' ', desc.slice(0, 260), '\n');
}
