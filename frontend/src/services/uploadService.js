import { getApiBaseUrl } from './api.js';

/**
 * Upload image files from the PC (admin JWT required).
 * @param {FileList|File[]} files
 * @returns {Promise<string[]>} absolute image URLs
 */
export async function uploadImages(files) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) throw new Error('Choose at least one image file');

  const form = new FormData();
  list.forEach((file) => form.append('images', file));

  const token = localStorage.getItem('token') || '';
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}/api/admin/uploads`, {
    method: 'POST',
    headers,
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }
  return data.urls || [];
}
