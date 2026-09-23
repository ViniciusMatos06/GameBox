import type { GameRating } from '../types/gamebox';
import { readAll, writeAll, genId } from './storage';
import { logActivity } from './activityService';

const KEY = 'ratings';

export function getAllRatings(): GameRating[] {
  return readAll<GameRating>(KEY);
}

export function getRatingsForGameInList(listId: string, gameId: number): GameRating[] {
  return getAllRatings().filter((r) => r.listId === listId && r.gameId === gameId);
}

export function getUserRating(listId: string, gameId: number, username: string): GameRating | undefined {
  return getAllRatings().find(
    (r) => r.listId === listId && r.gameId === gameId && r.username === username
  );
}

export function getUserRatingsAcrossLists(username: string): GameRating[] {
  return getAllRatings().filter((r) => r.username === username);
}

export function averageForGameInList(listId: string, gameId: number): number | null {
  const ratings = getRatingsForGameInList(listId, gameId);
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function rateGame(input: {
  listId: string;
  gameId: number;
  gameName: string;
  username: string;
  stars: number;
}): GameRating {
  const all = getAllRatings();
  const existingIdx = all.findIndex(
    (r) => r.listId === input.listId && r.gameId === input.gameId && r.username === input.username
  );
  const now = new Date().toISOString();
  let rating: GameRating;
  if (existingIdx >= 0) {
    rating = { ...all[existingIdx], stars: input.stars, updatedAt: now };
    all[existingIdx] = rating;
  } else {
    rating = {
      id: genId('rating'),
      listId: input.listId,
      gameId: input.gameId,
      username: input.username,
      stars: input.stars,
      createdAt: now,
      updatedAt: now,
    };
    all.push(rating);
  }
  writeAll(KEY, all);
  logActivity({
    username: input.username,
    type: 'rated_game',
    listId: input.listId,
    gameId: input.gameId,
    gameName: input.gameName,
    stars: input.stars,
  });
  return rating;
}
