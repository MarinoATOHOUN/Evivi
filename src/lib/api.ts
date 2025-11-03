import { getAuthToken, removeAuthToken } from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Auto-logout si le token est invalide ou expiré
    removeAuthToken();
    window.location.href = '/auth/login';
    // On pourrait aussi tenter un refresh token ici dans une implémentation plus complexe
    return Promise.reject(new Error('Unauthorized'));
  }

  if (!response.ok) {
    // Essayer de parser le corps de l'erreur pour plus de détails
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `An API error occurred: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Si le status est 204 No Content, il n'y a pas de corps à parser
  if (response.status === 204) {
    return Promise.resolve(null as T);
  }
  
  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
