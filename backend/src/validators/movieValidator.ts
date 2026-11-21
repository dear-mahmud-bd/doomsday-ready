import { AppError } from '../errors/AppError.js';

export interface CreateMovieDto {
  title: string;
  releaseYear: number;
  runtime: number;
  watched?: boolean;
  prerequisites?: number[];
}

export interface PatchMovieDto {
  title?: string;
  releaseYear?: number;
  runtime?: number;
  watched?: boolean;
  prerequisites?: number[];
}

export function validateIdParam(idParam: string): number {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0 || !Number.isInteger(Number(idParam))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Movie ID must be a positive integer');
  }
  return id;
}

export function validateCreateMovie(body: unknown): CreateMovieDto {
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object');
  }

  const { title, releaseYear, runtime, watched, prerequisites } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Title is required and must be a non-empty string');
  }

  if (typeof releaseYear !== 'number' || !Number.isInteger(releaseYear) || releaseYear < 1888 || releaseYear > 2100) {
    throw new AppError(400, 'VALIDATION_ERROR', 'releaseYear must be an integer between 1888 and 2100');
  }

  if (typeof runtime !== 'number' || !Number.isInteger(runtime) || runtime < 1 || runtime > 300) {
    throw new AppError(400, 'VALIDATION_ERROR', 'runtime must be an integer between 1 and 300 minutes');
  }

  if (watched !== undefined && typeof watched !== 'boolean') {
    throw new AppError(400, 'VALIDATION_ERROR', 'watched must be a boolean');
  }

  let validatedPrereqs: number[] | undefined;
  if (prerequisites !== undefined) {
    if (!Array.isArray(prerequisites)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'prerequisites must be an array of movie IDs');
    }

    for (const p of prerequisites) {
      if (typeof p !== 'number' || !Number.isInteger(p) || p <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Each prerequisite must be a positive integer ID');
      }
    }

    // Check for duplicate prerequisite IDs
    const uniquePrereqs = new Set(prerequisites);
    if (uniquePrereqs.size !== prerequisites.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'prerequisites array cannot contain duplicate IDs');
    }
    validatedPrereqs = prerequisites as number[];
  }

  return {
    title: title.trim(),
    releaseYear,
    runtime,
    watched: watched ?? false,
    prerequisites: validatedPrereqs ?? [],
  };
}

export function validatePatchMovie(body: unknown): PatchMovieDto {
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object');
  }

  const { title, releaseYear, runtime, watched, prerequisites } = body as Record<string, unknown>;

  if (
    title === undefined &&
    releaseYear === undefined &&
    runtime === undefined &&
    watched === undefined &&
    prerequisites === undefined
  ) {
    throw new AppError(400, 'VALIDATION_ERROR', 'At least one field must be provided to update');
  }

  const result: PatchMovieDto = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title must be a non-empty string');
    }
    result.title = title.trim();
  }

  if (releaseYear !== undefined) {
    if (typeof releaseYear !== 'number' || !Number.isInteger(releaseYear) || releaseYear < 1888 || releaseYear > 2100) {
      throw new AppError(400, 'VALIDATION_ERROR', 'releaseYear must be an integer between 1888 and 2100');
    }
    result.releaseYear = releaseYear;
  }

  if (runtime !== undefined) {
    if (typeof runtime !== 'number' || !Number.isInteger(runtime) || runtime < 1 || runtime > 300) {
      throw new AppError(400, 'VALIDATION_ERROR', 'runtime must be an integer between 1 and 300 minutes');
    }
    result.runtime = runtime;
  }

  if (watched !== undefined) {
    if (typeof watched !== 'boolean') {
      throw new AppError(400, 'VALIDATION_ERROR', 'watched must be a boolean');
    }
    result.watched = watched;
  }

  if (prerequisites !== undefined) {
    if (!Array.isArray(prerequisites)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'prerequisites must be an array of movie IDs');
    }

    for (const p of prerequisites) {
      if (typeof p !== 'number' || !Number.isInteger(p) || p <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Each prerequisite must be a positive integer ID');
      }
    }

    const uniquePrereqs = new Set(prerequisites);
    if (uniquePrereqs.size !== prerequisites.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'prerequisites array cannot contain duplicate IDs');
    }
    result.prerequisites = prerequisites as number[];
  }

  return result;
}
