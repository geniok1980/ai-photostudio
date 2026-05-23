import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index';
import { authMiddleware } from '../middleware/auth';
import type { JwtPayload } from '../services/auth';
import { createPaymentLink } from '../services/wata';

const paymentsRouter = new Hono();

// POST /create-link - create a payment link for a package
paymentsRouter.post('/create-link', authMiddleware(), async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const { packageId } = await c.req.json();

    if (!packageId) {
      return c.json({ error: 'packageId is required' }, 400);
    }

    const db = getDb();

    // Get the package
    const pkg = db.query(
      'SELECT id, name, price, generations_count FROM packages WHERE id = $id AND is_active = 1'
    ).get({ $id: packageId }) as any;

    if (!pkg) {
      return c.json({ error: 'Package not found' }, 404);
    }

    if (pkg.price <= 0) {
      return c.json({ error: 'This package is free and does not require payment' }, 400);
    }

    // Create payment record
    const paymentId = uuidv4();
    const orderId = paymentId; // Use payment ID as order ID

    db.prepare(
      `INSERT INTO payments (id, user_id, package_id, amount, currency, status)
       VALUES ($id, $user_id, $package_id, $amount, $currency, 'pending')`
    ).run({
      $id: paymentId,
      $user_id: user.id,
      $package_id: packageId,
      $amount: pkg.price,
      $currency: 'RUB',
    });

    // Create WATA Pay link
    const link = await createPaymentLink(
      pkg.price,
      orderId,
      `${pkg.name} — ${pkg.generations_count} generations`
    );

    return c.json({
      payment: {
        id: paymentId,
        package: {
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          generations_count: pkg.generations_count,
        },
        payment_url: link.url,
        amount: link.amount,
        currency: link.currency,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('Create payment link error:', err);
    return c.json({ error: 'Failed to create payment link' }, 500);
  }
});

// POST /webhooks/wata - WATA webhook handler
paymentsRouter.post('/webhooks/wata', async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header('X-Signature') || '';

    // Import dynamically to avoid circular issues
    const { verifyWebhook } = await import('../services/wata');
    const isValid = await verifyWebhook(rawBody, signature);

    if (!isValid) {
      return c.json({ error: 'Invalid webhook signature' }, 401);
    }

    const payload = JSON.parse(rawBody);
    const db = getDb();

    // Handle post_payment event
    if (payload.kind === 'Payment' && payload.transactionStatus === 'Paid') {
      const orderId = payload.orderId;

      if (orderId) {
        // Update payment record
        db.prepare(
          `UPDATE payments SET wata_transaction_id = $transaction_id,
           status = 'completed', paid_at = CURRENT_TIMESTAMP
           WHERE id = $id AND status = 'pending'`
        ).run({
          $id: orderId,
          $transaction_id: payload.transactionId,
        });

        // Find the payment and grant generations to user
        const payment = db.query(
          'SELECT p.id, p.user_id, p.package_id, pk.generations_count FROM payments p JOIN packages pk ON p.package_id = pk.id WHERE p.id = $id AND p.status = \'completed\''
        ).get({ $id: orderId }) as any;

        if (payment) {
          db.prepare('UPDATE users SET balance_generations = balance_generations + $gen WHERE id = $id')
            .run({ $id: payment.user_id, $gen: payment.generations_count });
          console.log(`User ${payment.user_id} granted ${payment.generations_count} generations`);
        }
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// GET /history - user's payment history
paymentsRouter.get('/history', authMiddleware(), async (c) => {
  try {
    const user = c.get('user') as JwtPayload;
    const db = getDb();

    const payments = db.query(
      `SELECT p.id, p.amount, p.currency, p.status, p.created_at, p.paid_at,
              pk.name as package_name, pk.generations_count
       FROM payments p
       JOIN packages pk ON p.package_id = pk.id
       WHERE p.user_id = $user_id
       ORDER BY p.created_at DESC
       LIMIT 50`
    ).all({ $user_id: user.id });

    return c.json({ payments });
  } catch (err) {
    console.error('Get payment history error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default paymentsRouter;
