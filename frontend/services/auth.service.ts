import api from './api';
import { User } from '../types/user';

interface AuthResponse {
  user: User;
  token: string;
  refresh?: string;
}

export const authService = {
  login: async (credentials: any) => {
    // The customized backend returns { user, token, refresh }
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post<AuthResponse>('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
