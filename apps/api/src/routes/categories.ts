import { Hono } from 'hono';
import { getDb } from '../db/index';

const categoriesRouter = new Hono();

// GET / - list active product categories
categoriesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const categories = db.query(
      'SELECT id, name, display_name, icon, sort_order FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();
    return c.json({ categories });
  } catch (err) {
    console.error('List categories error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default categoriesRouter;
