// Crawl dist/**/*.html: check dead links, trailing slashes, title/desc lengths
const fs = require('fs');
const path = require('path');

const DIST = 'dist';
function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const htmlFiles = walk(DIST);
const pages = new Map(); // urlPath -> {title, desc, links[]}
for (const f of htmlFiles) {
  const rel = path.relative(DIST, f).replace(/\\/g, '/');
  let urlPath = '/' + rel.replace(/index\.html$/, '');
  if (urlPath === '/index.html') urlPath = '/';
  if (urlPath !== '/' && !urlPath.endsWith('/')) urlPath += '/';
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const links = [];
  const re = /href="(\/[^"#]*?)"/g;
  let m;
  while ((m = re.exec(html))) links.push(m[1]);
  pages.set(urlPath, { title, desc, links, file: f });
}

const knownPaths = new Set(pages.keys());
// files that exist in dist but aren't pages (redirects/assets handled separately)
const deadLinks = new Map();
const noSlash = new Map();
const titleIssues = [];
const descIssues = [];

for (const [url, p] of pages) {
  for (const href of p.links) {
    if (href.startsWith('//')) continue;
    let target = href.split('?')[0];
    // static assets & special files
    if (/\.(svg|png|jpg|jpeg|webp|avif|woff2?|xml|txt|json|ico|css|js|webmanifest)$/i.test(target) || target === '/favicon.svg' || target.startsWith('/_')) continue;
    if (target === '' ) continue;
    if (!target.endsWith('/')) {
      target += '/';
    }
    if (!knownPaths.has(target)) {
      if (!deadLinks.has(url)) deadLinks.set(url, []);
      deadLinks.get(url).push(href);
    }
  }
  // trailing slash check (internal page links)
  for (const href of p.links) {
    if (/\.(svg|png|jpg|jpeg|webp|avif|woff2?|xml|txt|json|ico|css|js|webmanifest)$/i.test(href) || href === '/' || href.startsWith('/_')) continue;
    if (!href.endsWith('/') && !href.includes('#') && !/\.[a-z0-9]+$/i.test(href)) {
      if (!noSlash.has(url)) noSlash.set(url, []);
      noSlash.get(url).push(href);
    }
  }
  const t = p.title;
  if (t.length < 30 || t.length > 65) titleIssues.push({ url, len: t.length, title: t.slice(0, 80) });
  if (p.desc.length > 160 || p.desc.length < 70) descIssues.push({ url, len: p.desc.length, desc: p.desc.slice(0, 100) });
}

console.log('=== PAGES CRAWLED:', pages.size, '===');
console.log('\n=== DEAD LINKS:', [...deadLinks.values()].flat().length, '===');
for (const [u, ls] of deadLinks) console.log(u, '->', [...new Set(ls)].join(', '));
console.log('\n=== NO TRAILING SLASH:', [...noSlash.values()].flat().length, '===');
for (const [u, ls] of noSlash) console.log(u, '->', [...new Set(ls)].slice(0, 5).join(', '));
console.log('\n=== TITLE ISSUES:', titleIssues.length, '===');
titleIssues.forEach(t => console.log(t.len, t.url, t.title));
console.log('\n=== DESC ISSUES:', descIssues.length, '===');
descIssues.forEach(t => console.log(t.len, t.url, t.desc));
