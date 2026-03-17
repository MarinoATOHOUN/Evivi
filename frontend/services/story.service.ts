import api from './api';

export interface StoryCreateData {
    media?: File;
    media_type: 'image' | 'video' | 'text';
    caption?: string;
    font_style?: string;
    font_color?: string;
    background_color?: string;
    text_position?: { x: number; y: number };
    mentioned_usernames?: string[];
}

export const storyService = {
    createStory: async (data: StoryCreateData) => {
        const formData = new FormData();

        if (data.media) {
            formData.append('media', data.media);
        }

        formData.append('media_type', data.media_type);

        if (data.caption) formData.append('caption', data.caption);
        if (data.font_style) formData.append('font_style', data.font_style);
        if (data.font_color) formData.append('font_color', data.font_color);
        if (data.background_color) formData.append('background_color', data.background_color);
        if (data.text_position) formData.append('text_position', JSON.stringify(data.text_position));

        if (data.mentioned_usernames && data.mentioned_usernames.length > 0) {
            data.mentioned_usernames.forEach(username => {
                formData.append('mentioned_usernames', username);
            });
        }

        const response = await api.post('/stories/', formData, {
            // Content-Type is handled automatically (boundary) by the API client interceptor.
        });
        return response.data;
    },

    getFeed: async () => {
        const response = await api.get('/stories/feed/');
        return response.data;
    },

    markAsViewed: async (storyId: string) => {
        const response = await api.post(`/stories/${storyId}/view/`);
        return response.data;
    },

    toggleReaction: async (storyId: string, reactionType: string) => {
        const response = await api.post(`/stories/${storyId}/react/`, { reaction_type: reactionType });
        return response.data;
    }
};
