import { CinemaRepository, PgCinemaRepository, InMemoryCinemaRepository, CinemaEntity } from '../repositories/cinemaRepository.js';
import { CreateCinemaDto } from '../validators/cinemaValidator.js';
import { AppError } from '../errors/AppError.js';
import { calculateOptimalBundles } from '../algorithms/booking.js';
import { BundleCount } from '../algorithms/types.js';

export interface BookingResponsePossible {
  cinema: {
    id: number;
    name: string;
  };
  groupSize: number;
  possible: true;
  totalBundles: number;
  bundles: BundleCount[];
}

export interface BookingResponseImpossible {
  cinema: {
    id: number;
    name: string;
  };
  groupSize: number;
  possible: false;
}

export type BookingResponse = BookingResponsePossible | BookingResponseImpossible;

export class CinemaService {
  private repo: CinemaRepository;

  constructor(repo?: CinemaRepository) {
    if (repo) {
      this.repo = repo;
    } else {
      this.repo = process.env.NODE_ENV === 'test' ? new InMemoryCinemaRepository() : new PgCinemaRepository();
    }
  }

  async getAllCinemas(): Promise<CinemaEntity[]> {
    return this.repo.findAll();
  }

  async getCinemaById(id: number): Promise<CinemaEntity> {
    const cinema = await this.repo.findById(id);
    if (!cinema) {
      throw new AppError(404, 'NOT_FOUND', `Cinema with id ${id} was not found`);
    }
    return cinema;
  }

  async createCinema(dto: CreateCinemaDto): Promise<CinemaEntity> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new AppError(409, 'DUPLICATE_NAME', 'A cinema with this name already exists');
    }

    return this.repo.create({
      name: dto.name,
      bundleSizes: dto.bundleSizes,
    });
  }

  async getBookingQuote(cinemaId: number, groupSize: number): Promise<BookingResponse> {
    const cinema = await this.getCinemaById(cinemaId);
    const result = calculateOptimalBundles(groupSize, cinema.bundleSizes);

    if (!result.possible) {
      return {
        cinema: {
          id: cinema.id,
          name: cinema.name,
        },
        groupSize,
        possible: false,
      };
    }

    return {
      cinema: {
        id: cinema.id,
        name: cinema.name,
      },
      groupSize,
      possible: true,
      totalBundles: result.totalBundles,
      bundles: result.bundles,
    };
  }

  async resetForTest(): Promise<void> {
    if (this.repo.clearAll) {
      await this.repo.clearAll();
    }
  }
}

export const cinemaService = new CinemaService();
