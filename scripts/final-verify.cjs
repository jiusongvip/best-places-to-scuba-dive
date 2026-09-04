const fs = require('fs');
const path = require('path');
const DIST = 'dist';

// 1. sitemap check
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log('sitemap URLs:', urls.length);
console.log('dive-type pages in sitemap:', urls.filter(u => u.includes('/browse/dive-type/')).length);
console.log('homepage URL:', urls.find(u => u.endsWith('.com') || u.endsWith('.com/')));

// 2. canonical spot checks
function read(p) { return fs.readFileSync(path.join(DIST, p), 'utf8'); }
const checks = [
  ['index.html', '/'],
  ['destinations/bali/index.html', '/destinations/bali/'],
  ['browse/dive-type/wall/index.html', '/browse/dive-type/wall/'],
  ['browse/price/mid-range/index.html', '/browse/price/mid-range/'],
];
for (const [f, expect] of checks) {
  const html = read(f);
  const can = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  console.log('canonical', f, '->', can, can === 'https://www.best-places-to-scuba-dive.com' + expect ? 'OK' : 'MISMATCH(expect ' + expect + ')');
}

// 3. homepage ItemList JSON-LD URL trailing slash
const home = read('index.html');
const badItemList = home.includes('best-places-to-scuba-dive.com/destinations/"') === false && /"url":"https:\/\/www\.best-places-to-scuba-dive\.com\/destinations\/[a-z-]+\/"/.test(home);
console.log('ItemList URLs trailing slash:', badItemList ? 'OK' : 'CHECK');

// 4. bali page LCP signals
const bali = read('destinations/bali/index.html');
console.log('bali preload fetchpriority:', /rel="preload" as="image"[^>]*fetchpriority="high"/.test(bali) ? 'OK' : 'MISSING');
console.log('bali hero fetchpriority:', /<img[^>]*fetchpriority="high"[^>]*>/.test(bali) ? 'OK' : 'MISSING');

// 5. breadcrumb schema URL normalization (a page with /destinations breadcrumb)
const slugOk = /"item":"https:\/\/www\.best-places-to-scuba-dive\.com\/destinations\/"/.test(bali);
console.log('breadcrumb Destinations URL slash:', slugOk ? 'OK' : 'MISSING');

// 6. desc length distribution (all pages)
function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.html')) out.push(p);
  }
  return out;
}
let over160 = 0, under70 = 0, total = 0;
for (const f of walk(DIST)) {
  const html = fs.readFileSync(f, 'utf8');
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!d) continue;
  total++;
  if (d.length > 160) { over160++; console.log('DESC>160:', path.relative(DIST, f), d.length); }
  if (d.length < 70) under70++;
}
console.log('desc: total', total, '| >160:', over160, '| <70:', under70);

// 7. mid-range link from /destinations/
const destIdx = read('destinations/index.html');
console.log('mid-range link fixed:', destIdx.includes('/browse/price/mid-range/') ? 'OK' : 'MISSING');
