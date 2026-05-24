import { Hono } from 'hono';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';

const sparksRouter = new Hono();

// Public price list
sparksRouter.get('/prices', async (c) => {
  try {
    const db = getDb();
    const packages = db.query(
      'SELECT id, name, price, sparks_count, generations_count, description FROM packages WHERE is_active = 1 AND price > 0 ORDER BY price ASC'
    ).all();
    return c.json({ packages });
  } catch (err) {
    console.error('Get spark prices error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// All remaining routes require auth
sparksRouter.use('/balance', authMiddleware());
sparksRouter.use('/history', authMiddleware());

// GET /balance - get current spark balance and info
sparksRouter.get('/balance', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const db = getDb();

    const userData = db.query(
      'SELECT id, spark_balance, total_sparks_earned FROM users WHERE id = $id'
    ).get({ $id: user.id }) as any;

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      balance: userData.spark_balance,
      total_earned: userData.total_sparks_earned,
    });
  } catch (err) {
    console.error('Get spark balance error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /history - get spark transaction history
sparksRouter.get('/history', async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const db = getDb();

    const transactions = db.query(
      `SELECT id, amount, balance_after, transaction_type, reference_id, created_at
       FROM spark_transactions
       WHERE user_id = $user_id
       ORDER BY created_at DESC
       LIMIT 50`
    ).all({ $user_id: user.id });

    return c.json({ transactions });
  } catch (err) {
    console.error('Get spark history error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /prices - get available spark pricing tiers
sparksRouter.get('/prices', async (c) => {
  try {
    const db = getDb();
    const packages = db.query(
      'SELECT id, name, price, sparks_count, generations_count, description FROM packages WHERE is_active = 1 AND price > 0 ORDER BY price ASC'
    ).all();
    return c.json({ packages });
  } catch (err) {
    console.error('Get spark prices error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default sparksRouter;
