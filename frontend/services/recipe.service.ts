
import api from './api';
import { Recipe } from '../types/recipe';
import { Comment } from '../types/comment';

export const recipeService = {
  getFeed: async (type: 'global' | 'following' = 'global') => {
    const response = await api.get<any>('/recipes/feed/', {
      params: { scope: type }
    });
    // Handle paginated response if present
    const data = response.data?.results || response.data;
    return Array.isArray(data) ? data : [];
  },

  getRecipeById: async (id: string) => {
    const response = await api.get<Recipe>(`/recipes/${id}/`);
    return response.data;
  },

  createRecipe: async (recipeData: any, images?: File[]) => {
    let payload: any;

    if (images && images.length > 0) {
      const formData = new FormData();

      // Separate images from other data
      Object.keys(recipeData).forEach(key => {
        // Skip images if it's already in recipeData to avoid conflicts
        if (key === 'images') return;

        if (Array.isArray(recipeData[key]) || typeof recipeData[key] === 'object') {
          // Backend expects JSON strings for nested objects in multipart
          formData.append(key, JSON.stringify(recipeData[key]));
        } else {
          formData.append(key, recipeData[key]);
        }
      });

      // Add actual image files
      images.forEach(image => {
        formData.append('images', image);
      });
      payload = formData;
    } else {
      payload = recipeData;
    }

    const response = await api.post<Recipe>('/recipes/', payload);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const response = await api.post(`/recipes/${id}/like/`);
    return response.data;
  },

  toggleSave: async (id: string) => {
    const response = await api.post(`/recipes/${id}/save/`);
    return response.data;
  },

  getSavedRecipes: async () => {
    const response = await api.get<any>('/recipes/saved/');
    const data = response.data?.results || response.data;
    return Array.isArray(data) ? data : [];
  },

  addComment: async (recipeId: string, content: string) => {
    const response = await api.post<Comment>(`/recipes/${recipeId}/comments/`, { content });
    return response.data;
  },

  getComments: async (recipeId: string) => {
    const response = await api.get<Comment[]>(`/recipes/${recipeId}/comments/`);
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    return api.delete(`/recipes/comments/${commentId}/`);
  }
};
