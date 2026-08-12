/** Standard clothing sizes (admin presets). Custom sizes are also allowed. */
export const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function normalizeSize(size) {
  return String(size || '')
    .trim()
    .toUpperCase();
}

/** Unique sizes present on variants, sorted with presets first. */
export function availableSizesFromVariants(variants = []) {
  const seen = new Set();
  for (const v of variants) {
    const s = normalizeSize(v.size);
    if (s) seen.add(s);
  }
  const list = [...seen];
  list.sort((a, b) => {
    const ia = PRESET_SIZES.indexOf(a);
    const ib = PRESET_SIZES.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return list;
}
