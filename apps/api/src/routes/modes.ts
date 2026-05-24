import { Hono } from 'hono';
import { getDb } from '../db/index';

const modesRouter = new Hono();

// GET / - list active generation modes
modesRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const modes = db.query(
      'SELECT id, name, display_name, description, icon, sort_order FROM generation_modes WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();
    return c.json({ modes });
  } catch (err) {
    console.error('List modes error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default modesRouter;
