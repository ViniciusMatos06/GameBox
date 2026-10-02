import type { RatingsSummary } from '../types/gamebox';
import { api } from './apiClient';

export async function getRatingsSummary(listId: string, gameId: number): Promise<RatingsSummary> {
  return api.get<RatingsSummary>(`/lists/${listId}/games/${gameId}/ratings`);
}

export async function rateGame(input: {
  listId: string;
  gameId: number;
  gameName: string;
  stars: number;
}): Promise<RatingsSummary> {
  return api.post<RatingsSummary>(`/lists/${input.listId}/games/${input.gameId}/ratings`, {
    gameName: input.gameName,
    stars: input.stars,
  });
}
