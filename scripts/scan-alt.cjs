// Find <img> tags missing alt text in dist HTML
const fs = require('fs');
const path = require('path');
function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const counts = {};
for (const f of walk('dist')) {
  const html = fs.readFileSync(f, 'utf8');
  const imgs = html.match(/<img[^>]*>/g) || [];
  for (const img of imgs) {
    const hasAlt = /\balt="[^"]+"/.test(img);
    if (!hasAlt) {
      const src = (img.match(/src="([^"]+)"/) || [])[1] || '?';
      const key = src.replace(/\?.*$/, '');
      counts[key] = (counts[key] || 0) + 1;
    }
  }
}
for (const [src, n] of Object.entries(counts)) console.log(n, src);
console.log('total missing-alt <img> occurrences:', Object.values(counts).reduce((a, b) => a + b, 0));
