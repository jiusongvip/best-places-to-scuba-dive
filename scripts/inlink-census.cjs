const fs = require('fs'), path = require('path');
function walk(d, o = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, o);
    else if (f.name.endsWith('.html')) o.push(p);
  }
  return o;
}
const targets = ['/browse/month/1/','/browse/month/11/','/browse/month/12/','/browse/month/3/','/browse/month/6/','/browse/month/8/','/browse/month/9/','/browse/ocean/atlantic/','/browse/price/premium/','/compare/galapagos-vs-cocos-island/','/compare/komodo-vs-sipadan/','/compare/palau-vs-raja-ampat/','/compare/raja-ampat-vs-maldives/','/compare/red-sea-vs-similan-islands/','/compare/tubbataha-vs-raja-ampat/','/countries/belize/','/countries/brazil/','/countries/fiji/','/countries/maldives/','/countries/mexico/','/countries/micronesia/','/countries/new-zealand/','/countries/palau/','/countries/papua-new-guinea/','/destinations/fiji/','/destinations/rangiroa/','/destinations/silfra/','/destinations/similan-islands/','/finder/'];
const inlink = {};
targets.forEach(t => inlink[t] = 0);
const pagesWithLinks = {};
for (const f of walk('dist')) {
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
  const rel = path.relative('dist', f).replace(/\\/g, '/');
  for (const t of targets) {
    if (html.includes('href="' + t + '"')) { inlink[t]++; (pagesWithLinks[t] ||= []).push(rel); }
  }
}
for (const t of targets) {
  console.log(String(inlink[t]).padStart(3), t, '|', (pagesWithLinks[t] || []).slice(0, 4).join(', '));
}
