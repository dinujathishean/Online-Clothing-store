/** Standard streetwear colours offered in admin + catalogue filters. */
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

/** Normalize colour labels for comparison (trim + Title Case). */
export function normalizeColor(color) {
  return String(color || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
