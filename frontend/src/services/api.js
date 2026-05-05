/**
 * API client — base URL defaults to backend at http://localhost:5000.
 * Override with VITE_API_URL in .env (e.g. production).
 */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token') || '';
}

export function getApiBaseUrl() {
  return API_BASE;
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    const msg = e?.message || 'Network error';
    throw new Error(
      `Cannot reach API at ${API_BASE}. Start the backend on port 5000. (${msg})`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstVal = Array.isArray(data.errors) && data.errors[0];
    const detail =
      (typeof firstVal === 'string' && firstVal) ||
      firstVal?.msg ||
      firstVal?.message ||
      data.message ||
      `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return data;
}
