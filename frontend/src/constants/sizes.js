/** Standard clothing sizes offered in admin + catalogue filters. */
export const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Normalize size labels for comparison (trim + uppercase). */
export function normalizeSize(size) {
  return String(size || '')
    .trim()
    .toUpperCase();
}
