import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { initDb } from './db/index';
import authRouter from './routes/auth';
import locationsRouter from './routes/locations';
import packagesRouter from './routes/packages';
import generateRouter from './routes/generate';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';

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

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'AI PhotoStudio API' }));

// Mount routes under /api prefix
app.route('/api/auth', authRouter);
app.route('/api/locations', locationsRouter);
app.route('/api/packages', packagesRouter);
app.route('/api/generate', generateRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/admin', adminRouter);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`API server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export type AppType = typeof app;
