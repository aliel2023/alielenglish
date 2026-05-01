import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GMAIL_USER = Deno.env.get('GMAIL_USER') || '';
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD') || '';
const OWNER_EMAIL = 'alielenglish@gmail.com';

function b64(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendEmail(to: string, subject: string, body: string) {
  const message = [
    `From: ${GMAIL_USER}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\r\n');

  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: b64(message) })
  });

  if (!res.ok) {
    console.error('Gmail API error:', await res.text());
    throw new Error('Failed to send email');
  }

  return await res.json();
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createJWT()
    })
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get access token');
  return data.access_token;
}

async function createJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64(JSON.stringify({
    iss: GMAIL_USER,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }));

  const signature = b64(await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(Deno.env.get('GMAIL_PRIVATE_KEY') || ''),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${header}.${payload}`)
  ));

  return `${header}.${payload}.${signature}`;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { user_email, full_name } = await req.json();

    if (!user_email || !full_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const subject = `🎉 Yeni İstifadəçi: ${full_name}`;
    const body = `Ad Soyad: ${full_name}\nEmail: ${user_email}\nQeydiyyat tarixi: ${new Date().toISOString()}\nPlan: Pulsuz\n---\nAlielenglish Platform`;

    await sendEmail(OWNER_EMAIL, subject, body);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
