import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerRouter = Router();

const yamlPath = path.join(__dirname, 'openapi.yaml');
let openapiDoc: Record<string, unknown> = {};

try {
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  openapiDoc = YAML.parse(yamlContent);
} catch (err) {
  console.error('Failed to load openapi.yaml:', err);
}

// Raw JSON spec
swaggerRouter.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openapiDoc);
});

// Swagger UI
swaggerRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
