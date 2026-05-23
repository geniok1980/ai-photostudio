import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';
import { generatePhoto } from '../services/openrouter';

const generateRouter = new Hono();

// All routes require auth
generateRouter.use('/*', authMiddleware());

// POST / - create a generation
generateRouter.post('/', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const { locationId } = await c.req.json();

    if (!locationId) {
      return c.json({ error: 'locationId is required' }, 400);
    }

    const db = getDb();

    // Get the location
    const location = db.query(
      'SELECT id, prompt FROM locations WHERE id = $id AND is_active = 1'
    ).get({ $id: locationId }) as any;

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    // Get user info
    const userData = db.query(
      'SELECT id, balance_generations, free_attempts_used, role FROM users WHERE id = $id'
    ).get({ $id: user.id }) as any;

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check balance
    // Free users get 2 free attempts; paying users use their balance
    const isFreeUser = userData.role === 'user' && userData.balance_generations <= 0;
    const freeLimit = 2;

    if (isFreeUser && userData.free_attempts_used >= freeLimit) {
      return c.json({ error: 'Free attempts exhausted. Please purchase a package.' }, 403);
    }

    // Create the generation record
    const generationId = uuidv4();
    const placeholderPhotoUrl = `https://placehold.co/600x800/png?text=${encodeURIComponent('User Photo')}`;

    db.prepare(
      `INSERT INTO generations (id, user_id, location_id, original_photo_url, status)
       VALUES ($id, $user_id, $location_id, $original_photo_url, 'processing')`
    ).run({
      $id: generationId,
      $user_id: user.id,
      $location_id: locationId,
      $original_photo_url: placeholderPhotoUrl,
    });

    // Start generation in the background (don't await)
    generateAndSave(generationId, location.prompt, user.id, isFreeUser)
      .catch((err) => console.error(`Generation ${generationId} failed:`, err));

    return c.json({
      generation: {
        id: generationId,
        status: 'processing',
        message: 'Photo generation started',
      },
    }, 202);
  } catch (err) {
    console.error('Create generation error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /history - list user's generations
generateRouter.get('/history', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const db = getDb();

    const generations = db.query(
      `SELECT g.id, g.location_id, l.name as location_name, g.original_photo_url,
              g.result_url, g.thumbnail_url, g.status, g.error_message, g.duration_ms,
              g.created_at, g.completed_at
       FROM generations g
       LEFT JOIN locations l ON g.location_id = l.id
       WHERE g.user_id = $user_id
       ORDER BY g.created_at DESC
       LIMIT 50`
    ).all({ $user_id: user.id });

    return c.json({ generations });
  } catch (err) {
    console.error('Get history error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:id - check generation status
generateRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const { id } = c.req.param();
    const db = getDb();

    const generation = db.query(
      `SELECT g.id, g.location_id, l.name as location_name, l.prompt as location_prompt,
              g.original_photo_url, g.result_url, g.thumbnail_url, g.status,
              g.error_message, g.duration_ms, g.created_at, g.completed_at
       FROM generations g
       LEFT JOIN locations l ON g.location_id = l.id
       WHERE g.id = $id AND g.user_id = $user_id`
    ).get({ $id: id, $user_id: user.id });

    if (!generation) {
      return c.json({ error: 'Generation not found' }, 404);
    }

    return c.json({ generation });
  } catch (err) {
    console.error('Get generation error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Background generation function
async function generateAndSave(
  generationId: string,
  prompt: string,
  userId: string,
  isFreeUser: boolean
): Promise<void> {
  const db = getDb();

  try {
    // Use a placeholder photo (base64 encoded 1x1 transparent pixel)
    const placeholderBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await generatePhoto(placeholderBase64, prompt);

    // Update generation record
    db.prepare(
      `UPDATE generations SET status = 'completed', result_url = $result_url,
       duration_ms = $duration_ms, completed_at = CURRENT_TIMESTAMP
       WHERE id = $id`
    ).run({
      $id: generationId,
      $result_url: result.imageUrl,
      $duration_ms: result.durationMs,
    });

    // Decrement balance or increment free attempts
    if (isFreeUser) {
      db.prepare('UPDATE users SET free_attempts_used = free_attempts_used + 1 WHERE id = $id')
        .run({ $id: userId });
    } else {
      db.prepare('UPDATE users SET balance_generations = balance_generations - 1 WHERE id = $id')
        .run({ $id: userId });
    }
  } catch (err: any) {
    console.error(`Generation ${generationId} failed:`, err);

    // Update generation with error
    db.prepare(
      `UPDATE generations SET status = 'failed', error_message = $error_message,
       completed_at = CURRENT_TIMESTAMP WHERE id = $id`
    ).run({
      $id: generationId,
      $error_message: err.message || 'Unknown error',
    });
  }
}

export default generateRouter;
