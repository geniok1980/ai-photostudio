import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { initDb } from './db/index';
import authRouter from './routes/auth';
import locationsRouter from './routes/locations';
import packagesRouter from './routes/packages';
import generateRouter from './routes/generate';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';
import modesRouter from './routes/modes';
import conceptsRouter from './routes/concepts';
import categoriesRouter from './routes/categories';
import sparkRouter from './routes/sparks';
import infographicsRouter from './routes/infographics';

// Initialize database
initDb();
console.log('Database initialized');

const app = new Hono();

// CORS for frontend
app.use('/api/*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Serve static frontend files
app.use('/*', serveStatic({
  root: '../web/dist',
  index: 'index.html',
}));

// Mount routes under /api prefix
app.route('/api/auth', authRouter);
app.route('/api/locations', locationsRouter);
app.route('/api/packages', packagesRouter);
app.route('/api/generate', generateRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/admin', adminRouter);
app.route('/api/modes', modesRouter);
app.route('/api/concepts', conceptsRouter);
app.route('/api/categories', categoriesRouter);
app.route('/api/sparks', sparkRouter);
app.route('/api/infographics', infographicsRouter);

// SPA fallback — serve index.html for non-API, non-file routes
app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  // Serve index.html for SPA routing
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  const html = readFileSync(join(import.meta.dir, '../../web/dist/index.html'), 'utf-8');
  return c.html(html);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`AI PhotoStudio running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export type AppType = typeof app;
