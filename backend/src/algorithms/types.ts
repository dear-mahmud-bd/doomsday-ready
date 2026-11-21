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
