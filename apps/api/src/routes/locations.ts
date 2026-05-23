import { Hono } from 'hono';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const locationsRouter = new Hono();

// GET / - list active locations
locationsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const locations = db.query(
      'SELECT id, name, description, prompt, category, preview_url, sort_order FROM locations WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();

    return c.json({ locations });
  } catch (err) {
    console.error('List locations error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /categories - list unique categories
locationsRouter.get('/categories', async (c) => {
  try {
    const db = getDb();
    const rows = db.query(
      'SELECT DISTINCT category FROM locations WHERE is_active = 1 AND category IS NOT NULL ORDER BY category ASC'
    ).all() as { category: string }[];

    const categories = rows.map((r) => r.category);
    return c.json({ categories });
  } catch (err) {
    console.error('List categories error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:id - get single location
locationsRouter.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = getDb();

    const location = db.query(
      'SELECT id, name, description, prompt, category, preview_url, sort_order FROM locations WHERE id = $id AND is_active = 1'
    ).get({ $id: id });

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    return c.json({ location });
  } catch (err) {
    console.error('Get location error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default locationsRouter;
