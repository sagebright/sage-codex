/**
 * Prepends the API base URL for production deployments.
 * In dev, VITE_API_URL is unset → returns the path as-is (Vite proxy handles it).
 * In prod, VITE_API_URL points to the Render backend (e.g. https://sage-codex-api.onrender.com).
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
