import { AppError } from '../errors/AppError.js';

export interface CreateCinemaDto {
  name: string;
  bundleSizes: number[];
}

export function validateCinemaIdParam(idParam: string): number {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0 || !Number.isInteger(Number(idParam))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cinema ID must be a positive integer');
  }
  return id;
}

export function validateCreateCinema(body: unknown): CreateCinemaDto {
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object');
  }

  const { name, bundleSizes } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Name is required and must be a non-empty string');
  }

  if (!Array.isArray(bundleSizes) || bundleSizes.length < 1 || bundleSizes.length > 10) {
    throw new AppError(400, 'VALIDATION_ERROR', 'bundleSizes must be an array of 1 to 10 integers');
  }

  for (const size of bundleSizes) {
    if (typeof size !== 'number' || !Number.isInteger(size) || size < 1 || size > 500) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Each bundle size must be an integer between 1 and 500');
    }
  }

  const uniqueSizes = new Set(bundleSizes);
  if (uniqueSizes.size !== bundleSizes.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'bundleSizes cannot contain duplicate values');
  }

  // Sort ascending for consistent storage
  const sorted = [...bundleSizes].sort((a, b) => a - b);

  return {
    name: name.trim(),
    bundleSizes: sorted,
  };
}

export function validateBookingQuery(query: unknown): { groupSize: number } {
  if (!query || typeof query !== 'object') {
    throw new AppError(400, 'VALIDATION_ERROR', 'groupSize query parameter is required');
  }

  const { groupSize } = query as Record<string, unknown>;

  if (groupSize === undefined || groupSize === null || groupSize === '') {
    throw new AppError(400, 'VALIDATION_ERROR', 'groupSize query parameter is required');
  }

  const parsed = Number(groupSize);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 10000) {
    throw new AppError(400, 'VALIDATION_ERROR', 'groupSize must be an integer between 1 and 10000');
  }

  return { groupSize: parsed };
}
