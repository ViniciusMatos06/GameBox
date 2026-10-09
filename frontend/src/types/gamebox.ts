// Types for GameBox's own data. Mirrors the JSON shapes returned by the
// backend (see gamebox-backend's dto/ package) - no localStorage involved
// anymore except for the cached auth token/user (see services/authService.ts).

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export interface ProfileStats {
  listsCreated: number;
  gamesRated: number;
  gamesAdded: number;
  avgRating: number;
}

export interface PublicProfile {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  stats: ProfileStats;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface UserSummary {
  username: string;
  name: string;
  avatarUrl: string;
}

export type ListType = 'personal' | 'group';

export interface GameListItem {
  gameId: number; // real RAWG id
  addedByUsername: string;
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

export interface InvitePreview {
  listId: string;
  name: string;
  description: string;
  ownerUsername: string;
  gameCount: number;
  memberCount: number;
}

export interface RatingItem {
  username: string;
  stars: number;
  updatedAt: string;
}

export interface RatingsSummary {
  average: number | null;
  count: number;
  ratings: RatingItem[];
}

export type ActivityType =
  | 'added_game'
  | 'rated_game'
  | 'joined_list'
  | 'created_list';

export interface Activity {
  id: string;
  type: ActivityType;
  listId?: string;
  listName?: string;
  gameId?: number;
  gameName?: string;
  stars?: number;
  createdAt: string;
}

export interface FeedActivity extends Activity {
  author: UserSummary;
}
