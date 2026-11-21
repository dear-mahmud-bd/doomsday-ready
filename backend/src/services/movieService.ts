import { MovieRepository, PgMovieRepository, InMemoryMovieRepository } from '../repositories/movieRepository.js';
import { CreateMovieDto, PatchMovieDto } from '../validators/movieValidator.js';
import { AppError } from '../errors/AppError.js';
import { MovieNode, RewatchPlanResult } from '../algorithms/types.js';
import { wouldCreateCycle } from '../algorithms/cycle.js';
import { calculateRewatchOrder } from '../algorithms/rewatchOrder.js';

export class MovieService {
  private repo: MovieRepository;

  constructor(repo?: MovieRepository) {
    if (repo) {
      this.repo = repo;
    } else {
      this.repo = process.env.NODE_ENV === 'test' ? new InMemoryMovieRepository() : new PgMovieRepository();
    }
  }

  async getAllMovies(): Promise<MovieNode[]> {
    return this.repo.findAll();
  }

  async getMovieById(id: number): Promise<MovieNode> {
    const movie = await this.repo.findById(id);
    if (!movie) {
      throw new AppError(404, 'NOT_FOUND', `Movie with id ${id} was not found`);
    }
    return movie;
  }

  async createMovie(dto: CreateMovieDto): Promise<MovieNode> {
    // 1. Check title uniqueness (case-insensitive)
    const existingTitle = await this.repo.findByTitle(dto.title);
    if (existingTitle) {
      throw new AppError(409, 'DUPLICATE_TITLE', 'A movie with this title already exists');
    }

    // 2. Validate all prerequisite IDs exist
    const allMovies = await this.repo.findAll();
    const movieMap = new Map<number, MovieNode>(allMovies.map((m) => [m.id, m]));

    if (dto.prerequisites && dto.prerequisites.length > 0) {
      for (const pId of dto.prerequisites) {
        if (!movieMap.has(pId)) {
          throw new AppError(400, 'INVALID_PREREQUISITE', `Prerequisite movie ID ${pId} does not exist`);
        }
      }
    }

    // 3. Since this is a brand new movie, it has a new ID that no existing movie depends on yet.
    // However, if it depends on itself (handled in validator, but double check)
    // We create the movie
    return this.repo.create({
      title: dto.title,
      releaseYear: dto.releaseYear,
      runtime: dto.runtime,
      watched: dto.watched ?? false,
      prerequisites: dto.prerequisites || [],
    });
  }

  async updateMovie(id: number, dto: PatchMovieDto): Promise<MovieNode> {
    // 1. Verify movie exists
    const movie = await this.repo.findById(id);
    if (!movie) {
      throw new AppError(404, 'NOT_FOUND', `Movie with id ${id} was not found`);
    }

    // 2. Check title uniqueness if title is changing
    if (dto.title && dto.title.toLowerCase() !== movie.title.toLowerCase()) {
      const existing = await this.repo.findByTitle(dto.title);
      if (existing && existing.id !== id) {
        throw new AppError(409, 'DUPLICATE_TITLE', 'A movie with this title already exists');
      }
    }

    // 3. If prerequisites are updated:
    if (dto.prerequisites !== undefined) {
      const allMovies = await this.repo.findAll();
      const movieMap = new Map<number, MovieNode>(allMovies.map((m) => [m.id, m]));

      // Verify all prerequisite IDs exist
      for (const pId of dto.prerequisites) {
        if (!movieMap.has(pId)) {
          throw new AppError(400, 'INVALID_PREREQUISITE', `Prerequisite movie ID ${pId} does not exist`);
        }
      }

      // Check for cycles using pure wouldCreateCycle
      // getPrerequisites function resolves prerequisite edges from the current graph
      // Note: edges of the movie being edited are replaced by dto.prerequisites
      const getPrereqs = (nodeId: number): number[] => {
        if (nodeId === id) {
          return dto.prerequisites!;
        }
        return movieMap.get(nodeId)?.prerequisites || [];
      };

      const hasCycle = wouldCreateCycle(id, dto.prerequisites, getPrereqs);
      if (hasCycle) {
        throw new AppError(409, 'CIRCULAR_DEPENDENCY', 'Setting this prerequisite would create a cyclic dependency');
      }
    }

    return this.repo.update(id, dto);
  }

  async getRewatchOrder(id: number): Promise<RewatchPlanResult> {
    const allMovies = await this.repo.findAll();
    const movieMap = new Map<number, MovieNode>(allMovies.map((m) => [m.id, m]));

    if (!movieMap.has(id)) {
      throw new AppError(404, 'NOT_FOUND', `Movie with id ${id} was not found`);
    }

    return calculateRewatchOrder(id, movieMap);
  }

  // Helper for test resets
  async resetForTest(): Promise<void> {
    if (this.repo.clearAll) {
      await this.repo.clearAll();
    }
  }
}

export const movieService = new MovieService();
