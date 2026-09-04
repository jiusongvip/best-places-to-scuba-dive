const fs = require('fs');
const pages = ['dist/index.html', 'dist/destinations/bali/index.html', 'dist/browse/dive-type/wall/index.html', 'dist/countries/indonesia/index.html'];
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const imgs = html.match(/<img[^>]*>/g) || [];
  const noAlt = imgs.filter(i => !/\balt=/.test(i));
  const emptyAlt = imgs.filter(i => /alt=""/.test(i));
  const svgs = html.match(/<svg[^>]*>/g) || [];
  const noAria = svgs.filter(s => !/aria-hidden=|role=/.test(s));
  console.log(p, '| imgs:', imgs.length, '| no-alt:', noAlt.length, '| empty-alt:', emptyAlt.length, '| svg:', svgs.length, '| svg-no-aria:', noAria.length);
}
