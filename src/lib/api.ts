// API calls are currently disabled.
// This file is a placeholder.

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.warn(`API call to ${endpoint} was prevented.`);
    // Simulate a network error or an empty response to avoid breaking calling code.
    return Promise.reject(new Error("API integration is currently disabled."));
}


export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
