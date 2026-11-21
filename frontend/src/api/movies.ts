import { apiClient } from './client.js';
import {
  Movie,
  CreateMovieInput,
  PatchMovieInput,
  RewatchOrderResponse,
} from './types.js';

export async function getMovies(): Promise<Movie[]> {
  return apiClient<Movie[]>('/api/movies');
}

export async function getMovieById(id: number): Promise<Movie> {
  return apiClient<Movie>(`/api/movies/${id}`);
}

export async function createMovie(input: CreateMovieInput): Promise<Movie> {
  return apiClient<Movie>('/api/movies', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function patchMovie(id: number, input: PatchMovieInput): Promise<Movie> {
  return apiClient<Movie>(`/api/movies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function getRewatchOrder(id: number): Promise<RewatchOrderResponse> {
  return apiClient<RewatchOrderResponse>(`/api/movies/${id}/rewatch-order`);
}
