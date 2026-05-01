import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const KAPITAL_MERCHANT_ID = Deno.env.get('KAPITAL_MERCHANT_ID') || 'YOUR_MERCHANT_ID';
const KAPITAL_SECRET_KEY = Deno.env.get('KAPITAL_SECRET_KEY') || 'YOUR_SECRET_KEY';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifySignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHash('sha256')
    .update(payload + KAPITAL_SECRET_KEY)
    .digest('hex');
  return signature === expected;
}

async function createKapitalOrder(userId: string, amount: number, currency: string) {
  const orderData = {
    merchant_id: KAPITAL_MERCHANT_ID,
    amount: (amount * 100).toString(),
    currency: currency,
    description: 'Alielenglish Pro Plan - Aylıq abunəlik',
    order_id: `aliel_${userId}_${Date.now()}`,
    return_url: 'https://aliel2023.github.io/English/pricing.html?payment=success',
    lang: 'az',
    detail: JSON.stringify({ user_id: userId })
  };

  const res = await fetch('https://ec.kapitalbank.az/api/v1/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  return await res.json();
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { action, user_id, amount, currency } = body;

    if (action === 'create_order') {
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const order = await createKapitalOrder(
        user_id,
        amount || 19,
        currency || 'AZN'
      );

      return new Response(JSON.stringify({ payment_url: order.payment_url }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'webhook') {
      const { order_id, status, signature } = body;

      if (!verifySignature(JSON.stringify(body), signature)) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (status === 'approved') {
        const orderDetail = JSON.parse(body.detail || '{}');
        const userId = orderDetail.user_id;

        if (userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              plan: 'pro',
              plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Profile update error:', error);
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
