import type { GameList, ListType } from '../types/gamebox';
import { readAll, writeAll, genId } from './storage';
import { logActivity } from './activityService';

const KEY = 'lists';

export function getAllLists(): GameList[] {
  return readAll<GameList>(KEY);
}

export function getListById(id: string): GameList | undefined {
  return getAllLists().find((l) => l.id === id);
}

export function getListsForUser(username: string): GameList[] {
  return getAllLists().filter((l) => l.memberUsernames.includes(username));
}

export function getListByInviteCode(code: string): GameList | undefined {
  return getAllLists().find((l) => l.inviteCode === code);
}

export function createList(input: {
  name: string;
  description: string;
  type: ListType;
  ownerUsername: string;
}): GameList {
  const now = new Date().toISOString();
  const list: GameList = {
    id: genId('list'),
    name: input.name,
    description: input.description,
    type: input.type,
    ownerUsername: input.ownerUsername,
    memberUsernames: [input.ownerUsername],
    games: [],
    inviteCode: genId('inv').slice(-8),
    createdAt: now,
    updatedAt: now,
  };
  const all = getAllLists();
  writeAll(KEY, [...all, list]);
  logActivity({
    username: input.ownerUsername,
    type: 'created_list',
    listId: list.id,
    listName: list.name,
  });
  return list;
}

function saveList(list: GameList): GameList {
  const all = getAllLists();
  const idx = all.findIndex((l) => l.id === list.id);
  if (idx === -1) throw new Error('Lista não encontrada.');
  list.updatedAt = new Date().toISOString();
  all[idx] = list;
  writeAll(KEY, all);
  return list;
}

export function joinListByInviteCode(code: string, username: string): GameList {
  const list = getListByInviteCode(code);
  if (!list) throw new Error('Convite inválido ou expirado.');
  if (list.type !== 'group') throw new Error('Este link de convite não é válido.');
  if (!list.memberUsernames.includes(username)) {
    list.memberUsernames.push(username);
    saveList(list);
    logActivity({ username, type: 'joined_list', listId: list.id, listName: list.name });
  }
  return list;
}

export function addGameToList(input: {
  listId: string;
  gameId: number;
  gameName: string;
  username: string;
}): GameList {
  const list = getListById(input.listId);
  if (!list) throw new Error('Lista não encontrada.');
  if (list.games.some((g) => g.gameId === input.gameId)) {
    throw new Error('Este jogo já está nesta lista.');
  }
  list.games.push({
    gameId: input.gameId,
    addedBy: input.username,
    addedAt: new Date().toISOString(),
  });
  saveList(list);
  logActivity({
    username: input.username,
    type: 'added_game',
    listId: list.id,
    listName: list.name,
    gameId: input.gameId,
    gameName: input.gameName,
  });
  return list;
}

export function removeGameFromList(listId: string, gameId: number): GameList {
  const list = getListById(listId);
  if (!list) throw new Error('Lista não encontrada.');
  list.games = list.games.filter((g) => g.gameId !== gameId);
  return saveList(list);
}

export function canEditList(list: GameList, username: string | undefined): boolean {
  if (!username) return false;
  if (list.type === 'personal') return list.ownerUsername === username;
  return list.memberUsernames.includes(username);
}

export function participantStats(list: GameList): { username: string; gamesAdded: number }[] {
  return list.memberUsernames.map((username) => ({
    username,
    gamesAdded: list.games.filter((g) => g.addedBy === username).length,
  }));
}
