// Games now come through our own backend, which proxies the RAWG Video
// Games Database API server-side (the RAWG key lives only there now — see
// gamebox-backend's RawgProxyService). No component should call RAWG
// directly; everything goes through the functions below.
import { api } from './apiClient';
import type {
  RawgGame,
  RawgGameDetails,
  RawgScreenshot,
  RawgListResponse,
  GameSearchParams,
} from '../types/rawg';

export async function searchGames(params: GameSearchParams): Promise<RawgListResponse<RawgGame>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  query.set('page', String(params.page ?? 1));
  query.set('page_size', String(params.page_size ?? 20));
  if (params.genres) query.set('genres', params.genres);
  if (params.platforms) query.set('platforms', params.platforms);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.dates) query.set('dates', params.dates);
  if (params.metacritic) query.set('metacritic', params.metacritic);

  return api.get<RawgListResponse<RawgGame>>(`/rawg/games?${query.toString()}`);
}

export async function getGameDetails(id: number | string): Promise<RawgGameDetails> {
  return api.get<RawgGameDetails>(`/rawg/games/${id}`);
}

export async function getGameScreenshots(id: number | string): Promise<RawgScreenshot[]> {
  const data = await api.get<RawgListResponse<RawgScreenshot>>(`/rawg/games/${id}/screenshots`);
  return data.results;
}

export async function getPopularGames(page = 1): Promise<RawgListResponse<RawgGame>> {
  return searchGames({ page, page_size: 20, ordering: '-added' });
}

export async function getUpcomingGames(page = 1): Promise<RawgListResponse<RawgGame>> {
  const today = new Date();
  const inSixMonths = new Date();
  inSixMonths.setMonth(today.getMonth() + 6);
  const dates = `${today.toISOString().slice(0, 10)},${inSixMonths.toISOString().slice(0, 10)}`;
  return searchGames({ page, page_size: 20, dates, ordering: '-added' });
}

export async function getGenres(): Promise<{ id: number; name: string; slug: string }[]> {
  const data = await api.get<RawgListResponse<{ id: number; name: string; slug: string }>>('/rawg/genres');
  return data.results;
}

export async function getPlatforms(): Promise<{ id: number; name: string; slug: string }[]> {
  const data = await api.get<RawgListResponse<{ id: number; name: string; slug: string }>>('/rawg/platforms');
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
