const fs = require('fs'), path = require('path');
function walk(d, o = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, o);
    else if (f.name.endsWith('.html')) o.push(p);
  }
  return o;
}
const noAlt = {}, emptyAlt = {}, pagesNoAlt = {}, pagesEmpty = {};
for (const f of walk('dist')) {
  const html = fs.readFileSync(f, 'utf8');
  for (const img of html.match(/<img[^>]*>/g) || []) {
    const src = (img.match(/src="([^"]+)"/) || [])[1] || '?';
    if (!/\balt=/.test(img)) { noAlt[src] = (noAlt[src] || 0) + 1; (pagesNoAlt[src] ||= []).push(path.relative('dist', f)); }
    else if (/alt=""/.test(img)) { emptyAlt[src] = (emptyAlt[src] || 0) + 1; (pagesEmpty[src] ||= []).push(path.relative('dist', f)); }
  }
}
console.log('NO alt attr:', JSON.stringify(noAlt));
console.log('empty alt:', JSON.stringify(emptyAlt));
for (const [s, p] of Object.entries(pagesEmpty)) console.log('empty-alt pages for', s, ':', p.length, 'pages:', p.slice(0, 3).join(', '));
const js = fs.readFileSync('public/finder.js', 'utf8') + fs.readFileSync('public/map.js', 'utf8');
const jsImgs = js.match(/<img[^>]*>/g) || [];
console.log('img tags in client JS:', jsImgs.length ? jsImgs.map(t => t.slice(0, 120)).join('\n') : 'none');
