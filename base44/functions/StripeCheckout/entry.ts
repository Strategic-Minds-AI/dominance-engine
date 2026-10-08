import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// StripeCheckout — handles Stripe checkout sessions, promo codes, and subscription management.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    const stripeSecretKey = secrets.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) return Response.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'create-checkout';

    const h = { 'Authorization': `Bearer ${stripeSecretKey}`, 'Stripe-Version': '2025-10-29.clover', 'Content-Type': 'application/x-www-form-urlencoded' };

    if (action === 'create-checkout') {
      const { priceId, userId, userEmail, promoCode, upgrades = [] } = body;
      if (!priceId) return Response.json({ error: 'priceId is required' }, { status: 400 });

      const params = new URLSearchParams();
      params.append('mode', 'subscription');
      params.append('line_items[0][price]', priceId);
      params.append('line_items[0][quantity]', '1');
      upgrades.forEach((up, i) => {
        params.append(`line_items[${i + 1}][price]`, up);
        params.append(`line_items[${i + 1}][quantity]`, '1');
      });
      params.append('success_url', body.success_url || `${req.headers.get('origin') || ''}/portal/onboarding?status=success`);
      params.append('cancel_url', body.cancel_url || `${req.headers.get('origin') || ''}/pricing?status=canceled`);
      if (userEmail) params.append('customer_email', userEmail);
      if (promoCode) params.append('promotion_code', promoCode);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST', headers: { ...h, 'Idempotency-Key': crypto.randomUUID() }, body: params,
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message || 'Failed to create checkout session' }, { status: res.status });
      return Response.json({ success: true, url: data.url, sessionId: data.id });
    }

    if (action === 'list-promos') {
      const res = await fetch('https://api.stripe.com/v1/promotion_codes?limit=100', { headers: h });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message }, { status: res.status });
      return Response.json({ success: true, promos: data.data.map(p => ({ id: p.id, code: p.code, active: p.active, percentOff: p.coupon?.percent_off })) });
    }

    if (action === 'cancel') {
      const { subscriptionId } = body;
      if (!subscriptionId) return Response.json({ error: 'subscriptionId is required' }, { status: 400 });
      const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, { method: 'DELETE', headers: h });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message }, { status: res.status });
      return Response.json({ success: true, canceled: true, id: data.id, status: data.status });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}