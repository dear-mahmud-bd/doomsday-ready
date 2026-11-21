import { apiClient } from './client.js';
import {
  Cinema,
  CreateCinemaInput,
  BookingQuoteResponse,
} from './types.js';

export async function getCinemas(): Promise<Cinema[]> {
  return apiClient<Cinema[]>('/api/cinemas');
}

export async function createCinema(input: CreateCinemaInput): Promise<Cinema> {
  return apiClient<Cinema>('/api/cinemas', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getBookingQuote(
  cinemaId: number,
  groupSize: number
): Promise<BookingQuoteResponse> {
  return apiClient<BookingQuoteResponse>(
    `/api/cinemas/${cinemaId}/booking?groupSize=${encodeURIComponent(groupSize)}`
  );
}
