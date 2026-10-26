import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes/api.js';
import { sendError } from './lib/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'academix-api',
    assistantMode: (process.env.LLM_MODE || 'demo').toLowerCase() === 'api' ? 'api' : 'demo',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRouter);
app.use(express.static(frontendDist, { index: 'index.html' }));

app.use('/api', (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint não encontrado.' } });
});

app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error && !res.headersSent) sendError(res, error);
  });
});

app.use((error, _req, res, _next) => sendError(res, error));
