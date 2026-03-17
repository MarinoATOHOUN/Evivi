
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string | null;
  country: string | null;
  professional_status: string[];
  followers_count: number;
  following_count: number;
  recipes_count: number;
  is_following: boolean;
}
