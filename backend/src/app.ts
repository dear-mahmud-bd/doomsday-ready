import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { swaggerRouter } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './errors/AppError.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Documentation routes under /api
app.use('/api', swaggerRouter);

// Health check under /api/health
app.use('/api/health', healthRouter);

// 404 handler for unmatched routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
});

// Centralized error handler
app.use(errorHandler);
