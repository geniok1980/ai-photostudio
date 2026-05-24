import { Hono } from 'hono';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';

const infographicsRouter = new Hono();

// All routes require auth
infographicsRouter.use('/*', authMiddleware());

// GET /templates - list infographic templates
infographicsRouter.get('/templates', async (c) => {
  try {
    const db = getDb();
    const templates = db.query(
      'SELECT id, name, preview_url, config FROM infographic_templates WHERE is_active = 1'
    ).all();
    return c.json({ templates });
  } catch (err) {
    console.error('List infographic templates error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /render - save rendered infographic
infographicsRouter.post('/render', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const { generationId, infographicDataUrl } = await c.req.json();

    if (!generationId || !infographicDataUrl) {
      return c.json({ error: 'generationId and infographicDataUrl are required' }, 400);
    }

    const db = getDb();

    // Verify the generation belongs to this user
    const generation = db.query(
      'SELECT id FROM generations WHERE id = $id AND user_id = $user_id'
    ).get({ $id: generationId, $user_id: user.id }) as any;

    if (!generation) {
      return c.json({ error: 'Generation not found' }, 404);
    }

    // Save infographic URL (in production, upload to cloud storage)
    const placeholderUrl = `https://placehold.co/600x800/png?text=Infographic+${generationId}`;
    db.prepare(
      'UPDATE generations SET infographic_url = $url WHERE id = $id'
    ).run({ $url: placeholderUrl, $id: generationId });

    return c.json({
      success: true,
      infographic_url: placeholderUrl,
    });
  } catch (err) {
    console.error('Render infographic error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default infographicsRouter;
