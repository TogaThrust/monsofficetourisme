import fs from 'fs';
import vm from 'vm';

const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync('circuit-data.js', 'utf8') +
    '\nthis.locations=locations; this.circuits=circuits; this.CIRCUIT_BUTTONS=CIRCUIT_BUTTONS; this.circuitMeta=circuitMeta;',
  ctx
);

const { locations, circuits, CIRCUIT_BUTTONS, circuitMeta } = ctx;
const names = Object.fromEntries(locations.map((l, i) => [i + 1, l.name]));
console.log('count', locations.length);
console.log('62', names[62], '| 63', names[63], '| last', names[locations.length]);
let badCount = 0;
for (const [key, arr] of Object.entries(circuits)) {
  const bad = arr.filter((i) => !locations[i - 1]);
  if (bad.length) {
    console.error('BAD', key, bad);
    badCount++;
  }
}
console.log('bad circuits', badCount);
console.log('famille:\n', circuits.famille.map((i) => names[i]).join('\n '));
console.log('buttons', CIRCUIT_BUTTONS);
console.log('meta', Object.keys(circuitMeta));
