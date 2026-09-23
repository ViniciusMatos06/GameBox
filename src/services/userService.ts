import { findByUsername, updateUser as updateUserAuth } from './authService';
import { getListsForUser } from './listService';
import { getUserRatingsAcrossLists } from './ratingService';
import type { PublicUser } from '../types/gamebox';
import { toPublicUser } from './authService';

export function getPublicProfile(username: string): PublicUser | undefined {
  const user = findByUsername(username);
  return user ? toPublicUser(user) : undefined;
}

export function getProfileStats(username: string) {
  const lists = getListsForUser(username);
  const ratings = getUserRatingsAcrossLists(username);
  const gamesAdded = lists.reduce(
    (sum, l) => sum + l.games.filter((g) => g.addedBy === username).length,
    0
  );
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10
      : 0;
  return {
    listsCreated: lists.filter((l) => l.ownerUsername === username).length,
    gamesRated: ratings.length,
    gamesAdded,
    avgRating,
  };
}

export function updateProfile(
  username: string,
  patch: { name?: string; bio?: string; avatarUrl?: string; email?: string }
) {
  return updateUserAuth(username, patch);
}
