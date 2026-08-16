import fs from 'fs';
import vm from 'vm';
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync('circuit-data.js', 'utf8') +
    '\nthis.locations=locations; this.commerceStreets=commerceStreets; this.buildCommercesIndices=buildCommercesIndices;',
  ctx
);
for (const s of ctx.commerceStreets) {
  const names = s.indices.map((i) => {
    const loc = ctx.locations[i - 1];
    if (!loc) return `MISSING ${i}`;
    return `${i}:${loc.name}`;
  });
  console.log(s.id, s.label, '→', names.join(', '));
}
console.log('all ids', ctx.buildCommercesIndices(ctx.commerceStreets.map((s) => s.id)).join(','));
