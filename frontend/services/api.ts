
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This would be the actual backend URL
});

api.interceptors.request.use((config) => {
  // Axios may provide `headers` lazily depending on request; normalize to an object.
  if (!config.headers) {
    config.headers = {} as any;
  }

  // Let the browser set correct boundaries for FormData.
  // This also prevents a default JSON Content-Type from breaking uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headersAny = config.headers as any;
    // Axios v1 may use AxiosHeaders which has `delete()`/`set()` methods.
    if (typeof headersAny.delete === 'function') {
      headersAny.delete('Content-Type');
      headersAny.delete('content-type');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete headersAny['Content-Type'];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete headersAny['content-type'];
    }
  } else {
    // Ensure JSON requests have a content type when not explicitly set.
    const headersAny = config.headers as any;
    const hasContentType =
      (typeof headersAny.has === 'function' && (headersAny.has('Content-Type') || headersAny.has('content-type'))) ||
      headersAny['Content-Type'] ||
      headersAny['content-type'];

    if (!hasContentType) {
      if (typeof headersAny.set === 'function') {
        headersAny.set('Content-Type', 'application/json');
      } else {
        headersAny['Content-Type'] = 'application/json';
      }
    }
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Avoid infinite loops if the user is already on the login page.
      if (typeof window !== 'undefined' && !window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
