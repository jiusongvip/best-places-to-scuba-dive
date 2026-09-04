const fs = require('fs');
const path = require('path');

function walk(dir, exts, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, exts, out);
    else if (exts.some(e => f.name.endsWith(e))) out.push(p);
  }
  return out;
}

const files = [
  ...walk('src', ['.astro', '.ts', '.js']),
  ...walk('public', ['.js', '.html']),
];

const patterns = [
  // static href strings without trailing slash
  /href=(["'])(\/[^"'#]*[^\/"'#])\1/g,
  // link:'/xxx' or link: "/xxx" or url: '/xxx'
  /(link|url)\s*:\s*(["'])(\/[^"'\s]*[^\/"'\s])\2/g,
  // breadcrumbs url '/xxx'
  /url:\s*(["'])(\/[^"']+)\1/g,
  // string concat href '/destinations/' + expr  (handled separately below)
];

// Pattern A: concatenation building paths — find `'/seg/' + expr` not already followed by "+ '/'"
const concatPatterns = [
  { re: /(['"])\/(destinations|collections|browse\/[a-z-]+|compare)\/\1\s*\+\s*([A-Za-z0-9_.()]+)/g, desc: "concat" },
];

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    // static href without slash
    const m1 = [...line.matchAll(/href=(["'])(\/[^"'#\s]*[^\/"'#\s])\1/g)];
    if (m1.length) console.log(`${f}:${i + 1} HREF: ${line.trim().slice(0, 160)}`);
    // object props
    const m2 = [...line.matchAll(/(?:link|url)\s*:\s*(['"])(\/[^'"\s]+)\1/g)];
    m2.forEach(m => {
      if (!m[2].endsWith('/')) console.log(`${f}:${i + 1} PROP: ${line.trim().slice(0, 160)}`);
    });
    // concatenations
    const m3 = [...line.matchAll(/(['"])\/(destinations|collections|browse\/[a-z-]+)\/\1\s*\+/g)];
    if (m3.length) console.log(`${f}:${i + 1} CONCAT: ${line.trim().slice(0, 160)}`);
    // template literal
    const m4 = [...line.matchAll(/`\/(destinations|collections|browse\/[a-z-]+)\/\$\{([^}]+)\}`/g)];
    m4.forEach(m => { if (!/\$\{[^}]+\}\/`/.test(line)) console.log(`${f}:${i + 1} TPL: ${line.trim().slice(0, 160)}`); });
  });
}
