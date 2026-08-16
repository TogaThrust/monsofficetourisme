const UA = { headers: { 'User-Agent': 'CLQ-Mons-OT/1.0 (https://monsofficetourisme.netlify.app; poi image research)' } };
async function wiki(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', origin: '*', ...params });
  return (await fetch(url, UA)).json();
}
const prefixes = [
  '0 Mons - Rue de Houdain',
  '0 Mons - Rue Léopold',
  '0 Mons - Rue Leopold',
  '0 Mons - Rue du Parc',
  '0 Mons - Rue Masquelier',
  '0 Mons - Rue de la Clef',
  '0 Mons - Rue de Nimy',
  '0 Mons - Rue de Bertaimont, 31',
  '0 La légende des Anges',
];
for (const p of prefixes) {
  const json = await wiki({ action: 'query', list: 'allpages', apnamespace: '6', apprefix: p, aplimit: '20' });
  const pages = json.query?.allpages || [];
  console.log('\nPREFIX', p, pages.length);
  pages.forEach((x) => console.log(' ', x.title));
}

const extra = [
  'File:0 La légende des Anges de Mons - Rue de Houdain - Mons.JPG',
  'File:0 Grand\'Place et hôtel de ville - Rue de Houdain - Mons (1).JPG',
];
const info = await wiki({ action: 'query', titles: extra.join('|'), prop: 'imageinfo', iiprop: 'extmetadata' });
for (const page of Object.values(info.query.pages)) {
  const desc = page.imageinfo?.[0]?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  console.log('\nDESC', page.title, desc.slice(0, 300));
}
