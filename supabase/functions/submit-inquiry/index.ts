import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Public inquiry endpoint.
 *
 * Deploy with `--no-verify-jwt`: this route is called from the marketing site,
 * where visitors are anonymous. Abuse protection comes from the strict origin
 * allowlist, the honeypot, the per-IP hashed rate limit and field validation.
 * The service-role key stays inside this function runtime.
 */

const TOPICS = [
  'AI & AI agents',
  'SaaS products & dashboards',
  'Web development',
  'Mobile applications',
  'Custom software',
  'Automation & digital solutions',
  'Something else',
] as const

const MAX_BODY_BYTES = 20_000
const RATE_LIMIT_WINDOW_MINUTES = 15
const RATE_LIMIT_MAX = 5

const allowedOrigins = (Deno.env.get('SITE_ORIGIN') ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(value => value.trim().replace(/\/$/, ''))
  .filter(Boolean)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  } as Record<string, string>
}

function json(payload: Record<string, unknown>, status: number, origin: string) {
  return Response.json(payload, { status, headers: corsHeaders(origin) })
}

Deno.serve(async request => {
  const origin = (request.headers.get('origin') ?? '').replace(/\/$/, '')
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response('Origin not allowed', { status: 403 })
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405, origin)
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ success: false, error: 'Payload too large' }, 413, origin)
  }

  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const topic = String(body.topic ?? '').trim()
    const message = String(body.message ?? '').trim()

    // Honeypot: accept silently so bots get no signal.
    if (String(body.company_website ?? '').trim()) {
      return json({ success: true, emailSent: false }, 200, origin)
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const valid =
      name.length >= 1 &&
      name.length <= 100 &&
      email.length <= 254 &&
      emailPattern.test(email) &&
      (TOPICS as readonly string[]).includes(topic) &&
      message.length >= 10 &&
      message.length <= 5000

    if (!valid) {
      return json({ success: false, error: 'Invalid inquiry fields' }, 400, origin)
    }

    const rawIp =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown'
    const encoder = new TextEncoder()
    const digest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}:${rawIp}`),
    )
    const ipHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')

    const { data: allowed, error: limitError } = await supabase.rpc('claim_inquiry_slot', {
      p_ip_hash: ipHash,
    })
    if (limitError) throw limitError
    if (allowed !== true) {
      return json(
        {
          success: false,
          error: `Too many inquiries. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes or email us directly.`,
          limit: RATE_LIMIT_MAX,
        },
        429,
        origin,
      )
    }

    const { error: insertError } = await supabase.from('inquiries').insert({ name, email, topic, message })
    if (insertError) throw insertError

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const recipient = Deno.env.get('INQUIRY_RECIPIENT')
    const sender = Deno.env.get('INQUIRY_FROM')
    let emailSent = false

    if (resendKey && recipient && sender) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: sender,
          to: [recipient],
          reply_to: email,
          subject: `Website inquiry: ${topic}`,
          text: `From: ${name}\nReply to: ${email}\nTopic: ${topic}\n\n${message}\n\n— Sent from the PramanixLabs website`,
        }),
      })
      emailSent = response.ok
      if (!response.ok) console.error('Inquiry email provider returned', response.status)
    }

    // The inquiry is stored whether or not notifications are configured.
    return json({ success: true, emailSent }, 200, origin)
  } catch (error) {
    console.error('Inquiry submission failed', error instanceof Error ? error.message : 'unknown error')
    return json({ success: false, error: 'Unable to accept inquiry' }, 500, origin)
  }
})
