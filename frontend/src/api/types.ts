export interface Movie {
  id: number;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: number[];
}

export interface CreateMovieInput {
  title: string;
  releaseYear: number;
  runtime: number;
  watched?: boolean;
  prerequisites?: number[];
}

export interface PatchMovieInput {
  title?: string;
  releaseYear?: number;
  runtime?: number;
  watched?: boolean;
  prerequisites?: number[];
}

export interface RewatchOrderResponse {
  target: {
    id: number;
    title: string;
  };
  order: Movie[];
  total: number;
  watchedCount: number;
  remainingRuntime: number;
}

export interface Cinema {
  id: number;
  name: string;
  bundleSizes: number[];
}

export interface CreateCinemaInput {
  name: string;
  bundleSizes: number[];
}

export interface BundleCount {
  size: number;
  count: number;
}

export interface BookingQuotePossible {
  cinema: {
    id: number;
    name: string;
  };
  groupSize: number;
  possible: true;
  totalBundles: number;
  bundles: BundleCount[];
}

export interface BookingQuoteImpossible {
  cinema: {
    id: number;
    name: string;
  };
  groupSize: number;
  possible: false;
}

export type BookingQuoteResponse = BookingQuotePossible | BookingQuoteImpossible;

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
