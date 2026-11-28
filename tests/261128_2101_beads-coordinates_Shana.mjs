import assert from 'node:assert/strict';
import { positionFromCode, BASE_VIEW } from '../trigrams/beads/261128_2101_coordinates_Shana.mjs';
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

const mul = (a,b) => a.map(row => [0,1,2].map(j => row.reduce((s,v,k) => s+v*b[k][j],0)));
const cx=Math.cos(.25),sx=Math.sin(.25),cy=Math.cos(-.4),sy=Math.sin(-.4);
const start=mul([[1,0,0],[0,cx,-sx],[0,sx,cx]],mul([[cy,0,sy],[0,1,0],[-sy,0,cy]],BASE_VIEW));
const depths=points.map(p=>start[2].reduce((s,v,k)=>s+v*p[k],0));
assert.ok(Math.min(...depths.slice(0,4)) > Math.max(...depths.slice(4)));
console.log('ok - first-bit-zero face is entirely in front at the initial view');
