// All communication with the RAWG Video Games Database API goes through this
// module. No component should call fetch() against api.rawg.io directly.
// Docs: https://rawg.io/apidocs
import type {
  RawgGame,
  RawgGameDetails,
  RawgScreenshot,
  RawgListResponse,
  GameSearchParams,
} from '../types/rawg';

const BASE_URL = 'https://api.rawg.io/api';
const API_KEY = import.meta.env.VITE_RAWG_API_KEY as string | undefined;

export class RawgApiKeyMissingError extends Error {
  constructor() {
    super(
      'VITE_RAWG_API_KEY não está configurada. Copie .env.example para .env e adicione sua chave da RAWG (https://rawg.io/apidocs).'
    );
    this.name = 'RawgApiKeyMissingError';
  }
}

export function hasApiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

// --- simple in-memory cache to avoid refetching the same query repeatedly ---
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as T;
  if (hit) cache.delete(key);
  return undefined;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

async function rawgFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!hasApiKey()) throw new RawgApiKeyMissingError();

  const url = new URL(BASE_URL + path);
  url.searchParams.set('key', API_KEY as string);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  });

  const cacheKey = url.toString();
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`RAWG API respondeu com erro ${res.status} para ${path}`);
  }
  const data = (await res.json()) as T;
  setCached(cacheKey, data);
  return data;
}

export async function searchGames(params: GameSearchParams): Promise<RawgListResponse<RawgGame>> {
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    search: params.search,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    genres: params.genres,
    platforms: params.platforms,
    ordering: params.ordering,
    dates: params.dates,
    metacritic: params.metacritic,
    search_precise: params.search ? 'true' : undefined,
  });
}

export async function getGameDetails(id: number | string): Promise<RawgGameDetails> {
  return rawgFetch<RawgGameDetails>(`/games/${id}`);
}

export async function getGameScreenshots(id: number | string): Promise<RawgScreenshot[]> {
  const data = await rawgFetch<RawgListResponse<RawgScreenshot>>(`/games/${id}/screenshots`);
  return data.results;
}

export async function getPopularGames(page = 1): Promise<RawgListResponse<RawgGame>> {
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    page,
    page_size: 20,
    ordering: '-added',
  });
}

export async function getUpcomingGames(page = 1): Promise<RawgListResponse<RawgGame>> {
  const today = new Date();
  const inSixMonths = new Date();
  inSixMonths.setMonth(today.getMonth() + 6);
  const dates = `${today.toISOString().slice(0, 10)},${inSixMonths.toISOString().slice(0, 10)}`;
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    page,
    page_size: 20,
    dates,
    ordering: '-added',
  });
}

export async function getGenres(): Promise<{ id: number; name: string; slug: string }[]> {
  const data = await rawgFetch<RawgListResponse<{ id: number; name: string; slug: string }>>('/genres');
  return data.results;
}

export async function getPlatforms(): Promise<{ id: number; name: string; slug: string }[]> {
  const data = await rawgFetch<RawgListResponse<{ id: number; name: string; slug: string }>>('/platforms');
  return data.results;
}

// Fetch a batch of games by RAWG id (used to render GameBox lists, which only
// store the id). Runs requests in parallel and silently drops failures so one
// bad id doesn't break the whole list.
export async function getGamesByIds(ids: number[]): Promise<Record<number, RawgGameDetails>> {
  const uniqueIds = Array.from(new Set(ids));
  const results = await Promise.allSettled(uniqueIds.map((id) => getGameDetails(id)));
  const map: Record<number, RawgGameDetails> = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') map[uniqueIds[i]] = r.value;
  });
  return map;
}
