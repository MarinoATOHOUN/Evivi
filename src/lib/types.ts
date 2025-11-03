export type RecipeCategory = 'Afrique de l’Ouest' | 'Afrique du Nord' | 'Afrique Centrale' | 'Afrique du Sud' | 'Afrique de l\'Est';

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

export type Comment = {
  id: number;
  author: {
      id: number;
      username: string;
      avatarUrl?: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
};

export type Recipe = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category: RecipeCategory;
  country: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  likes: number;
  comments: Comment[];
  author: {
    name: string;
    avatarUrl: string;
  }
};

export type BlogArticle = {
  slug: string;
  title:string;
  excerpt: string;
  imageUrl: string;
  imageHint: string;
  content: string;
  author: string;
  date: string;
  views: number;
};
