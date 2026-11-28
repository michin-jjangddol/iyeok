import assert from 'node:assert/strict';
import { positionFromCode } from '../trigrams/beads/261128_2032_coordinates_Shana.mjs';
const points = Array.from({length: 8}, (_, n) => positionFromCode(n.toString(2).padStart(3, '0')));
assert.deepEqual(points, [[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]]);
let edges = 0;
for (let n=0; n<8; n++) {
  assert.equal(Math.hypot(...points[n]), Math.sqrt(3));
  assert.deepEqual(points[n].map(v=>-v), points[n ^ 7]);
  for (let m=n+1; m<8; m++) {
    const distance = Math.hypot(...points[n].map((v,a)=>v-points[m][a]));
    if ([1,2,4].includes(n ^ m)) { assert.equal(distance,2); edges++; }
  }
}
assert.equal(edges,12);
for (const invalid of ['', '01', '0000', 'abc', 111, null]) assert.throws(()=>positionFromCode(invalid), TypeError);
console.log('ok - all eight xyz positions, equal radii, four opposite pairs and twelve edges');
