// Builds data/world.svg from Natural Earth (public domain) via world-atlas.
import fs from 'fs';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoArea } from 'd3-geo';
import { presimplify, simplify, quantile } from 'topojson-simplify';
const res = process.argv[2] || '50m';
let topo = JSON.parse(fs.readFileSync(`node_modules/world-atlas/countries-${res}.json`, 'utf8'));
const q = parseFloat(process.argv[3] || '0');
if (q > 0) { topo = presimplify(topo); topo = simplify(topo, quantile(topo, q)); }
const fc = feature(topo, topo.objects.countries);
fc.features = fc.features.filter(f => f.properties.name !== 'Antarctica');
const W = 1000, H = 500;
const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], fc);
const path = geoPath(proj).digits(1);
let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">\n`;
const meta = {};
for (const f of fc.features) {
  const d = path(f); if (!d) continue;
  const name = f.properties.name;
  // zoom box = largest piece of the country (its mainland), so far-off islands don't widen it
  let main = f;
  if (f.geometry.type === 'MultiPolygon') {
    const parts = f.geometry.coordinates.map(c => ({ c, a: geoArea({ type: 'Polygon', coordinates: c }) }));
    const maxA = Math.max(...parts.map(p => p.a));
    main = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: parts.filter(p => p.a >= maxA * 0.2).map(p => p.c) } };
  }
  const [[x0, y0], [x1, y1]] = path.bounds(main);
  const [cx, cy] = path.centroid(main);
  meta[name] = { b: [x0, y0, x1, y1].map(v => Math.round(v * 10) / 10), c: [Math.round(cx * 10) / 10, Math.round(cy * 10) / 10] };
  // Far-off overseas pieces (e.g. French Guiana) get their own path so they don't light up with the mainland
  const nm = name.replace(/"/g, '&quot;');
  if (f.geometry.type === 'MultiPolygon') {
    const pad = Math.max(x1 - x0, y1 - y0) * 0.75 + 4;
    const near = [], far = [];
    for (const c of f.geometry.coordinates) {
      const [px, py] = path.centroid({ type: 'Polygon', coordinates: c });
      ((px > x0 - pad && px < x1 + pad && py > y0 - pad && py < y1 + pad) ? near : far).push(c);
    }
    out += `<path data-name="${nm}" d="${path({ type: 'MultiPolygon', coordinates: near })}"/>\n`;
    if (far.length) out += `<path data-name="${nm}" data-far="1" d="${path({ type: 'MultiPolygon', coordinates: far })}"/>\n`;
  } else {
    out += `<path data-name="${nm}" d="${d}"/>\n`;
  }
}
out += '</svg>\n';
fs.mkdirSync('/home/user/site/data', { recursive: true });
fs.writeFileSync('/home/user/site/data/world.svg', out);
fs.writeFileSync('/home/user/site/data/world-meta.json', JSON.stringify(meta));
console.log(res, 'countries', Object.keys(meta).length, 'svg KB', Math.round(out.length / 1024));
for (const n of ['United Kingdom', 'Spain', 'France', 'Portugal', 'Denmark', 'Italy', 'Croatia', 'New Zealand']) console.log(n, JSON.stringify(meta[n]));
