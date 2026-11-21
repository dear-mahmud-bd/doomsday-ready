export interface MovieNode {
  id: number;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: number[];
}

export interface RewatchPlanResult {
  target: {
    id: number;
    title: string;
  };
  order: MovieNode[];
  total: number;
  watchedCount: number;
  remainingRuntime: number;
}

export interface BundleCount {
  size: number;
  count: number;
}

export interface BookingCalculationPossible {
  possible: true;
  totalBundles: number;
  bundles: BundleCount[];
}

export interface BookingCalculationImpossible {
  possible: false;
}

export type BookingCalculationResult =
  | BookingCalculationPossible
  | BookingCalculationImpossible;

