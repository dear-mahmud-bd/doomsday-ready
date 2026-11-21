import { Router, Request, Response, NextFunction } from 'express';
import { cinemaService } from '../services/cinemaService.js';
import {
  validateCreateCinema,
  validateCinemaIdParam,
  validateBookingQuery,
} from '../validators/cinemaValidator.js';

export const cinemasRouter = Router();

// GET /api/cinemas - List all cinemas
cinemasRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cinemas = await cinemaService.getAllCinemas();
    res.status(200).json(cinemas);
  } catch (err) {
    next(err);
  }
});

// POST /api/cinemas - Create cinema
cinemasRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = validateCreateCinema(req.body);
    const created = await cinemaService.createCinema(dto);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/cinemas/:id/booking?groupSize=X - Calculate optimal seat bundles
cinemasRouter.get('/:id/booking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateCinemaIdParam(req.params.id);
    const { groupSize } = validateBookingQuery(req.query);
    const quote = await cinemaService.getBookingQuote(id, groupSize);
    res.status(200).json(quote);
  } catch (err) {
    next(err);
  }
});
