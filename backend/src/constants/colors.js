/** Standard streetwear colours (admin presets). Custom colours are also allowed. */
export const PRESET_COLORS = [
  'Black',
  'White',
  'Navy',
  'Grey',
  'Charcoal',
  'Red',
  'Beige',
  'Olive',
  'Cream',
  'Burgundy',
  'Khaki',
  'Forest',
];

/** Normalize colour labels (trim, collapse spaces, Title Case). */
export function normalizeColor(color) {
  return String(color || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Unique colours present on variants, sorted with presets first. */
export function availableColorsFromVariants(variants = []) {
  const seen = new Set();
  for (const v of variants) {
    const c = normalizeColor(v.color);
    if (c) seen.add(c);
  }
  const list = [...seen];
  list.sort((a, b) => {
    const ia = PRESET_COLORS.indexOf(a);
    const ib = PRESET_COLORS.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return list;
}
