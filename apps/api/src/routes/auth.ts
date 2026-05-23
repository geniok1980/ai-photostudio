import { Hono } from 'hono';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index';
import { generateToken, verifyToken } from '../services/auth';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';

const authRouter = new Hono();

// POST /register
authRouter.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const db = getDb();
    const existing = db.query('SELECT id FROM users WHERE email = $email').get({ $email: email });

    if (existing) {
      return c.json({ error: 'User with this email already exists' }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, free_attempts_used, balance_generations)
       VALUES ($id, $email, $password_hash, $name, $role, $free_attempts_used, $balance_generations)`
    ).run({
      $id: id,
      $email: email,
      $password_hash: passwordHash,
      $name: name || email.split('@')[0],
      $role: 'user',
      $free_attempts_used: 0,
      $balance_generations: 0,
    });

    const token = generateToken({ id, email, role: 'user' });

    return c.json({
      token,
      user: {
        id,
        email,
        name: name || email.split('@')[0],
        role: 'user',
        balance_generations: 0,
      },
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /login
authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const db = getDb();
    const user = db.query(
      'SELECT id, email, password_hash, name, role, balance_generations FROM users WHERE email = $email'
    ).get({ $email: email }) as any;

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance_generations: user.balance_generations,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /me
authRouter.get('/me', authMiddleware(), async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const db = getDb();

    const userData = db.query(
      'SELECT id, email, name, role, free_attempts_used, balance_generations, created_at FROM users WHERE id = $id'
    ).get({ $id: user.id }) as any;

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: userData });
  } catch (err) {
    console.error('Get me error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default authRouter;
