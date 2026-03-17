
import { User } from './user';

export interface Comment {
  id: string;
  content: string;
  author: User;
  created_at: string;
}
