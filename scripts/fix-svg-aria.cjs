// Add aria-hidden="true" focusable="false" to inline <svg> tags missing it
const fs = require('fs');
const path = require('path');
function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.astro')) out.push(p);
  }
  return out;
}
let total = 0;
for (const f of walk('src')) {
  let src = fs.readFileSync(f, 'utf8');
  const orig = src;
  src = src.replace(/<svg\b([^>]*)>/g, (m, attrs) => {
    if (/aria-hidden=|role=/.test(attrs)) return m;
    total++;
    return `<svg${attrs} aria-hidden="true" focusable="false">`;
  });
  if (src !== orig) fs.writeFileSync(f, src);
}
console.log('svg tags updated:', total);
