import api from './api';
import { User } from '../types/user';

export const userService = {
    getCurrentUser: async () => {
        const response = await api.get<User>('/auth/me/');
        return response.data;
    },

    updateProfile: async (userData: any) => {
        const formData = new FormData();

        // Add all fields to form data
        Object.keys(userData).forEach(key => {
            if (key === 'professional_status' && Array.isArray(userData[key])) {
                // Handle list for professional_status
                userData[key].forEach((status: string) => {
                    formData.append('professional_status', status);
                });
            } else if (key === 'avatar' && userData[key] instanceof File) {
                formData.append('avatar', userData[key]);
            } else if (userData[key] !== null && userData[key] !== undefined) {
                formData.append(key, userData[key]);
            }
        });

        const response = await api.patch<User>('/auth/me/', formData, {
            // Content-Type is handled automatically (boundary) by the API client interceptor.
        });
        return response.data;
    },

    getUserProfile: async (username: string) => {
        const response = await api.get<User>(`/users/${username}/`);
        return response.data;
    },

    toggleFollow: async (userId: string) => {
        const response = await api.post<{ following: boolean, message: string }>(`/users/${userId}/follow/`);
        return response.data;
    },

    getRecommendations: async () => {
        const response = await api.get<any[]>('/users/recommendations/all/');
        return response.data;
    }
};
