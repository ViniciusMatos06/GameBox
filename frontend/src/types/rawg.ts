// Types describing the shape of data returned by the RAWG Video Games Database API.
// Docs: https://rawg.io/apidocs

export interface RawgPlatform {
  platform: { id: number; name: string; slug: string };
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  genres: RawgGenre[];
  platforms: RawgPlatform[] | null;
}

export interface RawgGameDetails extends RawgGame {
  description_raw: string;
  website: string | null;
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  esrb_rating: { id: number; name: string } | null;
}

export interface RawgScreenshot {
  id: number;
  image: string;
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type GameOrdering =
  | '-added'
  | '-rating'
  | '-released'
  | 'released'
  | '-metacritic';

export interface GameSearchParams {
  search?: string;
  page?: number;
  page_size?: number;
  genres?: string;
  platforms?: string;
  ordering?: GameOrdering;
  dates?: string;
  metacritic?: string;
}
