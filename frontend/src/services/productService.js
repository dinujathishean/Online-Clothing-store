import { api } from './api.js';

/** @param {Record<string,string|number|undefined>} params */
export async function fetchProducts(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
  });
  const qs = q.toString();
  return api(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProduct(idOrSlug) {
  const id = encodeURIComponent(idOrSlug);
  return api(`/api/products/${id}`);
}

export async function fetchCategories() {
  return api('/api/categories');
}
