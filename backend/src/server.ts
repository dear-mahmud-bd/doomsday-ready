import { app } from './app.js';
import { config } from './config/index.js';
import { runMigrations } from './db/migrate.js';

async function bootstrap() {
  try {
    // Attempt migrations on startup if DB is accessible
    await runMigrations().catch((err) => {
      console.warn('Database migration skipped or failed (will retry on DB availability):', err.message);
    });

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`API documentation available at http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();
