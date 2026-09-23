// Types for GameBox's own data, persisted in localStorage today and intended
// to be served by a real backend API later (see src/services/*).

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash' | 'email'>;

export type ListType = 'personal' | 'group';

export interface GameListItem {
  gameId: number; // real RAWG id
  addedBy: string; // username
  addedAt: string;
}

export interface GameList {
  id: string;
  name: string;
  description: string;
  type: ListType;
  ownerUsername: string;
  memberUsernames: string[]; // includes owner
  games: GameListItem[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameRating {
  id: string;
  listId: string;
  gameId: number;
  username: string;
  stars: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'added_game'
  | 'rated_game'
  | 'joined_list'
  | 'created_list';

export interface Activity {
  id: string;
  username: string;
  type: ActivityType;
  listId?: string;
  listName?: string;
  gameId?: number;
  gameName?: string;
  stars?: number;
  createdAt: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  activityVisible: boolean;
}
