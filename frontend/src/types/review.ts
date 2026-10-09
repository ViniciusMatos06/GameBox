import type { UserSummary } from './gamebox';

export interface CommentItem {
  id: string;
  author: UserSummary;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  gameId: number;
  author: UserSummary;
  stars: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  comments: CommentItem[];
}
