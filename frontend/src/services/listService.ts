import type { GameList, InvitePreview, ListType } from '../types/gamebox';
import { api } from './apiClient';

export async function getMyLists(): Promise<GameList[]> {
  return api.get<GameList[]>('/lists');
}

/** Public: lists a given user owns or belongs to — used on their profile page. */
export async function getListsByUsername(username: string): Promise<GameList[]> {
  return api.get<GameList[]>(`/lists/by-user/${username}`);
}

export async function getListById(id: string): Promise<GameList> {
  return api.get<GameList>(`/lists/${id}`);
}

export async function createList(input: {
  name: string;
  description: string;
  type: ListType;
}): Promise<GameList> {
  return api.post<GameList>('/lists', input);
}

export async function addGameToList(listId: string, gameId: number, gameName: string): Promise<GameList> {
  return api.post<GameList>(`/lists/${listId}/games`, { gameId, gameName });
}

export async function removeGameFromList(listId: string, gameId: number): Promise<void> {
  return api.delete<void>(`/lists/${listId}/games/${gameId}`);
}

export async function getInvitePreview(inviteCode: string): Promise<InvitePreview> {
  return api.get<InvitePreview>(`/lists/invite/${inviteCode}`);
}

export async function joinListByInviteCode(inviteCode: string): Promise<GameList> {
  return api.post<GameList>(`/lists/invite/${inviteCode}/join`);
}

export function canEditList(list: GameList, username: string | undefined): boolean {
  if (!username) return false;
  if (list.type === 'personal') return list.ownerUsername === username;
  return list.memberUsernames.includes(username);
}

export function participantStats(list: GameList): { username: string; gamesAdded: number }[] {
  return list.memberUsernames.map((username) => ({
    username,
    gamesAdded: list.games.filter((g) => g.addedByUsername === username).length,
  }));
}
