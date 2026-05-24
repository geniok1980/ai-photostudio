import { Hono } from 'hono';
import { getDb } from '../db/index';

const conceptsRouter = new Hono();

// GET / - list concepts, optionally filtered by mode_id
conceptsRouter.get('/', async (c) => {
  try {
    const db = getDb();
    const modeId = c.req.query('mode_id');

    let sql = 'SELECT id, mode_id, name, display_name, description, prompt_template, preview_url, sort_order FROM concepts WHERE is_active = 1';
    const params: any = {};

    if (modeId) {
      sql += ' AND mode_id = $mode_id';
      params.$mode_id = modeId;
    }

    sql += ' ORDER BY sort_order ASC';

    const concepts = db.query(sql).all(params);
    return c.json({ concepts });
  } catch (err) {
    console.error('List concepts error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default conceptsRouter;
