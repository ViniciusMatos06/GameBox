import type { Review, CommentItem } from '../types/review';
import { api } from './apiClient';

export async function getReviewsForGame(gameId: number, filter: 'all' | 'following' = 'all'): Promise<Review[]> {
  return api.get<Review[]>(`/games/${gameId}/reviews?filter=${filter}`);
}

export async function upsertReview(gameId: number, input: { gameName: string; stars: number; text: string }): Promise<Review> {
  return api.post<Review>(`/games/${gameId}/reviews`, input);
}

export async function addComment(reviewId: string, text: string): Promise<CommentItem> {
  return api.post<CommentItem>(`/reviews/${reviewId}/comments`, { text });
}
