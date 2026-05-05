import { api } from './api.js';

/** Register a new customer account. */
export async function register(name, email, password) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/** Login (same endpoint for users and admins; role comes from the database). */
export async function login(email, password) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** Current user from JWT. */
export async function fetchMe() {
  return api('/api/auth/me');
}
