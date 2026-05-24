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
    const { locationId, modeId, conceptId, categoryId, productDescription } = await c.req.json();

    const db = getDb();
    const currentModeId = modeId || 'portrait';

    if (currentModeId === 'product') {
      // Product mode validation
      if (!conceptId) {
        return c.json({ error: 'conceptId is required for product mode' }, 400);
      }

      const concept = db.query(
        'SELECT id, name, prompt_template FROM concepts WHERE id = $id AND is_active = 1'
      ).get({ $id: conceptId }) as any;

      if (!concept) {
        return c.json({ error: 'Concept not found' }, 404);
      }

      const description = productDescription || 'a product';
      const prompt = concept.prompt_template.replace('{product_description}', description);

      const userData = db.query(
        'SELECT id, balance_generations, spark_balance, free_attempts_used, role FROM users WHERE id = $id'
      ).get({ $id: user.id }) as any;

      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }

      const isFreeUser = userData.role === 'user' && userData.spark_balance <= 0 && userData.balance_generations <= 0;
      const freeLimit = 2;

      if (isFreeUser && userData.free_attempts_used >= freeLimit) {
        return c.json({ error: 'Free attempts exhausted. Please purchase a package.' }, 403);
      }

      const generationId = uuidv4();

      db.prepare(
        `INSERT INTO generations (id, user_id, location_id, mode_id, concept_id, category_id, product_description, original_photo_url, status)
         VALUES ($id, $user_id, $location_id, $mode_id, $concept_id, $category_id, $product_description, $original_photo_url, 'processing')`
      ).run({
        $id: generationId,
        $user_id: user.id,
        $location_id: null,
        $mode_id: currentModeId,
        $concept_id: conceptId,
        $category_id: categoryId || null,
        $product_description: description,
        $original_photo_url: `https://placehold.co/600x800/png?text=${encodeURIComponent('Product Photo')}`,
      });

      generateAndSave(generationId, prompt, user.id, isFreeUser)
        .catch((err: any) => console.error(`Product generation ${generationId} failed:`, err));

      return c.json({
        generation: { id: generationId, status: 'processing', message: 'Product photo generation started' },
      }, 202);
    }

    // Original portrait mode
    if (!locationId) {
      return c.json({ error: 'locationId is required for portrait mode' }, 400);
    }

    const location = db.query(
      'SELECT id, prompt FROM locations WHERE id = $id AND is_active = 1'
    ).get({ $id: locationId }) as any;

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    const userData = db.query(
      'SELECT id, balance_generations, spark_balance, free_attempts_used, role FROM users WHERE id = $id'
    ).get({ $id: user.id }) as any;

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const isFreeUser = userData.role === 'user' && userData.balance_generations <= 0 && userData.spark_balance <= 0;
    const freeLimit = 2;

    if (isFreeUser && userData.free_attempts_used >= freeLimit) {
      return c.json({ error: 'Free attempts exhausted. Please purchase a package.' }, 403);
    }

    const generationId = uuidv4();

    db.prepare(
      `INSERT INTO generations (id, user_id, location_id, mode_id, original_photo_url, status)
       VALUES ($id, $user_id, $location_id, $mode_id, $original_photo_url, 'processing')`
    ).run({
      $id: generationId,
      $user_id: user.id,
      $location_id: locationId,
      $mode_id: currentModeId,
      $original_photo_url: `https://placehold.co/600x800/png?text=${encodeURIComponent('User Photo')}`,
    });

    generateAndSave(generationId, location.prompt, user.id, isFreeUser)
      .catch((err) => console.error(`Generation ${generationId} failed:`, err));

    return c.json({
      generation: { id: generationId, status: 'processing', message: 'Photo generation started' },
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
      `SELECT g.id, g.mode_id, g.location_id, l.name as location_name,
              g.concept_id, c.display_name as concept_name,
              g.category_id, pc.display_name as category_name,
              g.product_description,
              g.original_photo_url, g.result_url, g.infographic_url,
              g.thumbnail_url, g.status, g.error_message, g.duration_ms,
              g.created_at, g.completed_at
       FROM generations g
       LEFT JOIN locations l ON g.location_id = l.id
       LEFT JOIN concepts c ON g.concept_id = c.id
       LEFT JOIN product_categories pc ON g.category_id = pc.id
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
      `SELECT g.id, g.mode_id, g.location_id, l.name as location_name,
              l.prompt as location_prompt, g.concept_id, c.display_name as concept_name,
              g.category_id, pc.display_name as category_name,
              g.product_description,
              g.original_photo_url, g.result_url, g.infographic_url,
              g.thumbnail_url, g.status, g.error_message, g.duration_ms,
              g.created_at, g.completed_at
       FROM generations g
       LEFT JOIN locations l ON g.location_id = l.id
       LEFT JOIN concepts c ON g.concept_id = c.id
       LEFT JOIN product_categories pc ON g.category_id = pc.id
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

// Background generation for portrait mode
async function generateAndSave(
  generationId: string,
  prompt: string,
  userId: string,
  isFreeUser: boolean
): Promise<void> {
  const db = getDb();

  try {
    const placeholderBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await generatePhoto(placeholderBase64, prompt);

    db.prepare(
      `UPDATE generations SET status = 'completed', result_url = $result_url,
       duration_ms = $duration_ms, completed_at = CURRENT_TIMESTAMP
       WHERE id = $id`
    ).run({
      $id: generationId,
      $result_url: result.imageUrl,
      $duration_ms: result.durationMs,
    });

    if (isFreeUser) {
      db.prepare('UPDATE users SET free_attempts_used = free_attempts_used + 1 WHERE id = $id')
        .run({ $id: userId });
    } else {
      db.prepare('UPDATE users SET balance_generations = balance_generations - 1 WHERE id = $id')
        .run({ $id: userId });
    }
  } catch (err: any) {
    console.error(`Generation ${generationId} failed:`, err);

    db.prepare(
      `UPDATE generations SET status = 'failed', error_message = $error_message,
       completed_at = CURRENT_TIMESTAMP WHERE id = $id`
    ).run({
      $id: generationId,
      $error_message: err.message || 'Unknown error',
    });
  }
}

// Background generation for product mode with spark deduction
async function generateAndSaveWithSpark(
  generationId: string,
  prompt: string,
  userId: string,
  isFreeUser: boolean
): Promise<void> {
  const db = getDb();

  try {
    const placeholderBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await generatePhoto(placeholderBase64, prompt);

    db.prepare(
      `UPDATE generations SET status = 'completed', result_url = $result_url,
       duration_ms = $duration_ms, completed_at = CURRENT_TIMESTAMP
       WHERE id = $id`
    ).run({
      $id: generationId,
      $result_url: result.imageUrl,
      $duration_ms: result.durationMs,
    });

    // Deduct spark or balance
    if (isFreeUser) {
      db.prepare('UPDATE users SET free_attempts_used = free_attempts_used + 1 WHERE id = $id')
        .run({ $id: userId });
    } else {
      // Try sparks first, then fall back to generations balance
      const userData = db.query(
        'SELECT spark_balance, balance_generations FROM users WHERE id = $id'
      ).get({ $id: userId }) as any;

      if (userData && userData.spark_balance >= 4) {
        db.prepare('UPDATE users SET spark_balance = spark_balance - 4 WHERE id = $id')
          .run({ $id: userId });
        // Record spark transaction
        const userAfter = db.query('SELECT spark_balance FROM users WHERE id = $id').get({ $id: userId }) as any;
        db.prepare(
          `INSERT INTO spark_transactions (id, user_id, amount, balance_after, transaction_type, reference_id)
           VALUES ($id, $user_id, $amount, $balance_after, 'generation', $reference_id)`
        ).run({
          $id: uuidv4(),
          $user_id: userId,
          $amount: -4,
          $balance_after: userAfter.spark_balance,
          $reference_id: generationId,
        });
      } else if (userData && userData.balance_generations > 0) {
        db.prepare('UPDATE users SET balance_generations = balance_generations - 1 WHERE id = $id')
          .run({ $id: userId });
      }
    }
  } catch (err: any) {
    console.error(`Product generation ${generationId} failed:`, err);

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
