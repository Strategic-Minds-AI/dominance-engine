import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// StripeWebhook — handles Stripe webhook events for subscription management.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const stripeSecretKey = secrets.get('STRIPE_SECRET_KEY');
    const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET');

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    // Verify signature if secret is set
    if (webhookSecret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const parts = signature.split(',');
      const sigMap = {};
      for (const part of parts) { const [k, v] = part.split('='); sigMap[k] = v; }
      const signedPayload = sigMap['t'] + '.' + payload;
      const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
      const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (expectedHex !== sigMap['v1']) return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);

    const PLAN_MAP = {
      'price_1UDBxyCX3kMA1WDRw3U1Z0sW': { plan: 'starter', url_limit: 5 },
      'price_1UDBxyCX3kMA1WDRcfVXLJ6x': { plan: 'professional', url_limit: 25 },
      'price_1UDBxzCX3kMA1WDRFclC6Crw': { plan: 'elite', url_limit: 100 },
      'price_1UDBxzCX3kMA1WDR4kz56LxF': { plan: 'enterprise', url_limit: 9999 },
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = session.subscription;

      let sub = null;
      if (stripeSecretKey && subscriptionId) {
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Stripe-Version': '2025-10-29.clover' },
        });
        sub = await subRes.json();
      }

      const planInfo = PLAN_MAP[sub?.items?.data[0]?.price?.id] || { plan: 'starter', url_limit: 5 };

      const existing = await svc.entities.Subscription.filter({ stripe_subscription_id: subscriptionId }).catch(() => []);
      if (existing.length > 0) {
        await svc.entities.Subscription.update(existing[0].id, {
          status: 'active', plan: planInfo.plan, url_limit: planInfo.url_limit,
          current_period_start: sub ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
        });
      } else {
        await svc.entities.Subscription.create({
          user_id: session.metadata?.user_id || '',
          customer_email: session.customer_email || '',
          stripe_customer_id: sub?.customer || '',
          stripe_subscription_id: subscriptionId,
          plan: planInfo.plan, status: 'active', url_limit: planInfo.url_limit, urls_used: 0,
          current_period_start: sub ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
          onboarding_completed: false,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const existing = await svc.entities.Subscription.filter({ stripe_subscription_id: sub.id }).catch(() => []);
      if (existing.length > 0) {
        await svc.entities.Subscription.update(existing[0].id, { status: 'canceled', canceled_at: new Date().toISOString() });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('StripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}