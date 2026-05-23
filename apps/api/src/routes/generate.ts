import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';
import { generatePhoto } from '../services/openrouter';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

const generateRouter = new Hono();

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

const rateLimitMiddleware = async (c: any, next: any) => {
  const user = c.get('user') as JwtPayload;
  const now = Date.now();
  const userLimit = rateLimitMap.get(user.id);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(user.id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    }
    userLimit.count++;
  }
  await next();
};

// All routes require auth
generateRouter.use('/*', authMiddleware());
generateRouter.use('/', rateLimitMiddleware);

// POST / - create a generation
generateRouter.post('/', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    
    // Parse multipart form data
    const body = await c.req.parseBody();
    const file = body['file'] as File | undefined;
    const locationId = body['locationId'] as string | undefined;

    if (!file || !locationId) {
      return c.json({ error: 'file and locationId are required' }, 400);
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
    const isFreeUser = userData.role === 'user' && userData.balance_generations <= 0;
    const freeLimit = 2;

    if (isFreeUser && userData.free_attempts_used >= freeLimit) {
      return c.json({ error: 'Free attempts exhausted. Please purchase a package.' }, 403);
    }

    // Save the uploaded file
    const generationId = uuidv4();
    const uploadsDir = join(process.cwd(), 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadsDir, { recursive: true });
    
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${generationId}-original.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
    
    const originalPhotoUrl = `/uploads/${fileName}`;
    const photoBase64 = buffer.toString('base64');

    // Create the generation record
    db.prepare(
      `INSERT INTO generations (id, user_id, location_id, original_photo_url, status)
       VALUES ($id, $user_id, $location_id, $original_photo_url, 'processing')`
    ).run({
      $id: generationId,
      $user_id: user.id,
      $location_id: locationId,
      $original_photo_url: originalPhotoUrl,
    });

    // Start generation in the background
    generateAndSave(generationId, location.prompt, user.id, isFreeUser, photoBase64)
      .catch((err) => console.error(`Generation ${generationId} failed:`, err));

    return c.json({
      generation: {
        id: generationId,
        status: 'processing',
        message: 'Photo generation started',
        originalUrl: originalPhotoUrl,
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
      `SELECT g.id, g.location_id, l.name as location_name, g.original_photo_url as originalUrl,
              g.result_url as resultUrl, g.thumbnail_url as thumbnailUrl, g.status, g.error_message as errorMessage,
              g.duration_ms as durationMs, g.created_at as createdAt, g.completed_at as completedAt
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
              g.original_photo_url as originalUrl, g.result_url as resultUrl, g.thumbnail_url as thumbnailUrl,
              g.status, g.error_message as errorMessage, g.duration_ms as durationMs,
              g.created_at as createdAt, g.completed_at as completedAt
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
  isFreeUser: boolean,
  photoBase64: string
): Promise<void> {
  const db = getDb();

  try {
    const result = await generatePhoto(photoBase64, prompt);

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
