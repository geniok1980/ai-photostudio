import { Hono } from 'hono';
import { getDb } from '../db/index';

const packagesRouter = new Hono();

// GET / - list active packages
packagesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const packages = db.query(
      'SELECT id, name, price, generations_count, description FROM packages WHERE is_active = 1 ORDER BY price ASC'
    ).all();

    return c.json({ packages });
  } catch (err) {
    console.error('List packages error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default packagesRouter;
