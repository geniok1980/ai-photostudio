import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const adminRouter = new Hono();

// All admin routes require auth + admin role
adminRouter.use('/*', authMiddleware(), adminMiddleware());

// GET /dashboard - stats
adminRouter.get('/dashboard', async (c) => {
  try {
    const db = getDb();

    const userCount = (db.query('SELECT COUNT(*) as count FROM users').get() as any).count;
    const generationCount = (db.query('SELECT COUNT(*) as count FROM generations').get() as any).count;
    const completedGenerations = (db.query("SELECT COUNT(*) as count FROM generations WHERE status = 'completed'").get() as any).count;
    const revenue = (db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'").get() as any).total;
    const pendingPayments = (db.query("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'").get() as any).count;

    return c.json({
      stats: {
        userCount,
        generationCount,
        completedGenerations,
        revenue,
        pendingPayments,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===== LOCATIONS CRUD =====

// POST /locations
adminRouter.post('/locations', async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, prompt, category, preview_url, sort_order } = body;

    if (!name || !prompt) {
      return c.json({ error: 'Name and prompt are required' }, 400);
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO locations (id, name, description, prompt, category, preview_url, sort_order, is_active)
       VALUES ($id, $name, $description, $prompt, $category, $preview_url, $sort_order, 1)`
    ).run({
      $id: id,
      $name: name,
      $description: description || null,
      $prompt: prompt,
      $category: category || null,
      $preview_url: preview_url || null,
      $sort_order: sort_order || 0,
    });

    const location = db.query('SELECT * FROM locations WHERE id = $id').get({ $id: id });
    return c.json({ location }, 201);
  } catch (err) {
    console.error('Create location error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /locations/:id
adminRouter.put('/locations/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const db = getDb();

    const existing = db.query('SELECT id FROM locations WHERE id = $id').get({ $id: id });
    if (!existing) {
      return c.json({ error: 'Location not found' }, 404);
    }

    const updates: string[] = [];
    const params: Record<string, any> = { $id: id };

    if (body.name !== undefined) { updates.push('name = $name'); params.$name = body.name; }
    if (body.description !== undefined) { updates.push('description = $description'); params.$description = body.description; }
    if (body.prompt !== undefined) { updates.push('prompt = $prompt'); params.$prompt = body.prompt; }
    if (body.category !== undefined) { updates.push('category = $category'); params.$category = body.category; }
    if (body.preview_url !== undefined) { updates.push('preview_url = $preview_url'); params.$preview_url = body.preview_url; }
    if (body.sort_order !== undefined) { updates.push('sort_order = $sort_order'); params.$sort_order = body.sort_order; }
    if (body.is_active !== undefined) { updates.push('is_active = $is_active'); params.$is_active = body.is_active ? 1 : 0; }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    db.prepare(`UPDATE locations SET ${updates.join(', ')} WHERE id = $id`).run(params);

    const location = db.query('SELECT * FROM locations WHERE id = $id').get({ $id: id });
    return c.json({ location });
  } catch (err) {
    console.error('Update location error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /locations/:id
adminRouter.delete('/locations/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = getDb();

    const existing = db.query('SELECT id FROM locations WHERE id = $id').get({ $id: id });
    if (!existing) {
      return c.json({ error: 'Location not found' }, 404);
    }

    db.prepare('DELETE FROM locations WHERE id = $id').run({ $id: id });
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete location error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /locations - list all locations (including inactive)
adminRouter.get('/locations', async (c) => {
  try {
    const db = getDb();
    const locations = db.query(
      'SELECT * FROM locations ORDER BY sort_order ASC'
    ).all();
    return c.json({ locations });
  } catch (err) {
    console.error('List locations error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /locations/:id
adminRouter.get('/locations/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = getDb();
    const location = db.query('SELECT * FROM locations WHERE id = $id').get({ $id: id });
    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }
    return c.json({ location });
  } catch (err) {
    console.error('Get location error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===== PACKAGES CRUD =====

// POST /packages
adminRouter.post('/packages', async (c) => {
  try {
    const body = await c.req.json();
    const { name, price, generations_count, description } = body;

    if (!name || price === undefined || !generations_count) {
      return c.json({ error: 'Name, price, and generations_count are required' }, 400);
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO packages (id, name, price, generations_count, description, is_active)
       VALUES ($id, $name, $price, $gen_count, $description, 1)`
    ).run({
      $id: id,
      $name: name,
      $price: price,
      $gen_count: generations_count,
      $description: description || null,
    });

    const pkg = db.query('SELECT * FROM packages WHERE id = $id').get({ $id: id });
    return c.json({ package: pkg }, 201);
  } catch (err) {
    console.error('Create package error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /packages/:id
adminRouter.put('/packages/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const db = getDb();

    const existing = db.query('SELECT id FROM packages WHERE id = $id').get({ $id: id });
    if (!existing) {
      return c.json({ error: 'Package not found' }, 404);
    }

    const updates: string[] = [];
    const params: Record<string, any> = { $id: id };

    if (body.name !== undefined) { updates.push('name = $name'); params.$name = body.name; }
    if (body.price !== undefined) { updates.push('price = $price'); params.$price = body.price; }
    if (body.generations_count !== undefined) { updates.push('generations_count = $gen_count'); params.$gen_count = body.generations_count; }
    if (body.description !== undefined) { updates.push('description = $description'); params.$description = body.description; }
    if (body.is_active !== undefined) { updates.push('is_active = $is_active'); params.$is_active = body.is_active ? 1 : 0; }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    db.prepare(`UPDATE packages SET ${updates.join(', ')} WHERE id = $id`).run(params);

    const pkg = db.query('SELECT * FROM packages WHERE id = $id').get({ $id: id });
    return c.json({ package: pkg });
  } catch (err) {
    console.error('Update package error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /packages/:id
adminRouter.delete('/packages/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = getDb();

    const existing = db.query('SELECT id FROM packages WHERE id = $id').get({ $id: id });
    if (!existing) {
      return c.json({ error: 'Package not found' }, 404);
    }

    db.prepare('DELETE FROM packages WHERE id = $id').run({ $id: id });
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete package error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /packages - list all packages (including inactive)
adminRouter.get('/packages', async (c) => {
  try {
    const db = getDb();
    const packages = db.query('SELECT * FROM packages ORDER BY price ASC').all();
    return c.json({ packages });
  } catch (err) {
    console.error('List packages error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /packages/:id
adminRouter.get('/packages/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const db = getDb();
    const pkg = db.query('SELECT * FROM packages WHERE id = $id').get({ $id: id });
    if (!pkg) {
      return c.json({ error: 'Package not found' }, 404);
    }
    return c.json({ package: pkg });
  } catch (err) {
    console.error('Get package error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===== USERS =====

// GET /users - list users
adminRouter.get('/users', async (c) => {
  try {
    const db = getDb();
    const users = db.query(
      'SELECT id, email, name, role, free_attempts_used, balance_generations, created_at FROM users ORDER BY created_at DESC'
    ).all();
    return c.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /users/:id - update user
adminRouter.patch('/users/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const db = getDb();

    const existing = db.query('SELECT id FROM users WHERE id = $id').get({ $id: id });
    if (!existing) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updates: string[] = [];
    const params: Record<string, any> = { $id: id };

    if (body.name !== undefined) { updates.push('name = $name'); params.$name = body.name; }
    if (body.role !== undefined) { updates.push('role = $role'); params.$role = body.role; }
    if (body.balance_generations !== undefined) { updates.push('balance_generations = $balance'); params.$balance = body.balance_generations; }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = $id`).run(params);

    const user = db.query(
      'SELECT id, email, name, role, free_attempts_used, balance_generations, created_at FROM users WHERE id = $id'
    ).get({ $id: id });
    return c.json({ user });
  } catch (err) {
    console.error('Update user error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default adminRouter;
