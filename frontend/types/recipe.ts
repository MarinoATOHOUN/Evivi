
import { User } from './user';

export interface RecipeImage {
  id: number;
  image: string;
  order: number;
  is_active: boolean;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: string;
  unit: string;
  order: number;
  is_active: boolean;
}

export interface PreparationStep {
  id: number;
  text: string;
  order: number;
  is_active: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  images: RecipeImage[];
  ingredients: Ingredient[];
  steps: PreparationStep[];
  likes_count: number;
  saves_count?: number;
  comments_count: number;
  is_liked: boolean;
  is_saved?: boolean;
  author: User;
  created_at: string;
  cooking_time?: string;
  servings?: string;
  difficulty?: string;
}
