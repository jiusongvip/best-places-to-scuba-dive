// Auto-generated image width map (public/images)
export const IMG_WIDTHS: Record<string, number> = {
  '/images/anilao.webp': 1672,
  '/images/azores.webp': 1672,
  '/images/bali.webp': 1672,
  '/images/belize.webp': 1672,
  '/images/bonaire.webp': 1672,
  '/images/chuuk-lagoon.webp': 1672,
  '/images/cocos-island.webp': 1672,
  '/images/cozumel.webp': 1672,
  '/images/fernando-de-noronha.webp': 1672,
  '/images/fiji.webp': 1672,
  '/images/galapagos.webp': 1672,
  '/images/great-barrier-reef.webp': 1672,
  '/images/hero.webp': 1200,
  '/images/kimbe-bay.webp': 1672,
  '/images/komodo.webp': 1672,
  '/images/lembeh-strait.webp': 1672,
  '/images/malapascua.webp': 1672,
  '/images/maldives.webp': 1672,
  '/images/palau.webp': 1672,
  '/images/poor-knights.webp': 1672,
  '/images/raja-ampat.webp': 1672,
  '/images/rangiroa.webp': 1672,
  '/images/red-sea.webp': 1672,
  '/images/silfra.webp': 1672,
  '/images/similan-islands.webp': 1672,
  '/images/sipadan.webp': 1672,
  '/images/tubbataha.webp': 1672,
  '/images/wakatobi.webp': 1672,
};

// Build responsive srcset for a local image path using /images/variants/*-480w|800w|1280w.webp
export function imgSrcset(src: string): string {
  const width = IMG_WIDTHS[src];
  if (!width) return '';
  const stem = src.slice(8, -5); // strip '/images/' and '.webp'
  const parts: string[] = [];
  for (const w of [480, 800, 1280]) {
    if (w < width) parts.push(`/images/variants/${stem}-${w}w.webp ${w}w`);
  }
  parts.push(`${src} ${width}w`);
  return parts.join(', ');
}

// Default src: 1280w variant when available, otherwise original
export function imgSrc(src: string): string {
  const width = IMG_WIDTHS[src];
  if (!width || width <= 1280) return src;
  const stem = src.slice(8, -5);
  return `/images/variants/${stem}-1280w.webp`;
}
