import { WataPayApi } from 'wata-pay';

let api: WataPayApi | null = null;

function getApi(): WataPayApi {
  if (!api) {
    const token = process.env.WATA_API_TOKEN;
    if (!token) {
      throw new Error('WATA_API_TOKEN environment variable is not set');
    }
    api = new WataPayApi(token, 'sandbox');
  }
  return api;
}

export interface PaymentLinkResult {
  id: string;
  url: string;
  amount: number;
  currency: string;
}

export async function createPaymentLink(
  amount: number,
  orderId: string,
  description: string
): Promise<PaymentLinkResult> {
  const link = await getApi().createLink({
    amount,
    currency: 'RUB',
    orderId,
    description,
    type: 'OneTime',
    successRedirectUrl: process.env.SUCCESS_REDIRECT_URL || 'http://localhost:5173/payments/success',
    failRedirectUrl: process.env.FAIL_REDIRECT_URL || 'http://localhost:5173/payments/fail',
  });

  return {
    id: link.id,
    url: link.url,
    amount: link.amount,
    currency: link.currency,
  };
}

export async function verifyWebhook(rawBody: string, signature: string): Promise<boolean> {
  return getApi().handleWebhook(rawBody, signature);
}

export async function getTransaction(transactionId: string) {
  return getApi().getTransaction(transactionId);
}
