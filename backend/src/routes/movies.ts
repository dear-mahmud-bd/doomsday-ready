import { Router, Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movieService.js';
import { validateCreateMovie, validatePatchMovie, validateIdParam } from '../validators/movieValidator.js';

export const moviesRouter = Router();

// GET /api/movies - List all movies
moviesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const movies = await movieService.getAllMovies();
    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
});

// POST /api/movies - Create new movie
moviesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = validateCreateMovie(req.body);
    const created = await movieService.createMovie(dto);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id - Get movie by id
moviesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateIdParam(req.params.id);
    const movie = await movieService.getMovieById(id);
    res.status(200).json(movie);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/movies/:id - Update movie fields / replace prerequisites
moviesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateIdParam(req.params.id);
    const dto = validatePatchMovie(req.body);
    const updated = await movieService.updateMovie(id, dto);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id/rewatch-order - Calculate topological rewatch order
moviesRouter.get('/:id/rewatch-order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateIdParam(req.params.id);
    const plan = await movieService.getRewatchOrder(id);
    res.status(200).json(plan);
  } catch (err) {
    next(err);
  }
});
