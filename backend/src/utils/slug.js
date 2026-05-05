/**
 * URL-safe slug from a string (basic ASCII; extend for i18n if needed).
 */
export function toSlug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
