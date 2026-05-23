import type { Context, Next } from 'hono';
import { verifyToken, type JwtPayload } from '../services/auth';

export function authMiddleware() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: missing or invalid token' }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = verifyToken(token);
      c.set('user', payload);
      await next();
    } catch (err) {
      return c.json({ error: 'Unauthorized: invalid or expired token' }, 401);
    }
  };
}

export function adminMiddleware() {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JwtPayload | undefined;

    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Forbidden: admin access required' }, 403);
    }

    await next();
  };
}
