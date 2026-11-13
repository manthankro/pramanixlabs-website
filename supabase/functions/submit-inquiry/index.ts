import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const origins = (Deno.env.get('SITE_ORIGIN') ?? 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim())
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } })

Deno.serve(async request => {
  const origin = request.headers.get('origin') ?? ''
  const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' }
  if (!origins.includes(origin)) return new Response('Origin not allowed', { status: 403 })
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (request.method !== 'POST') return Response.json({ success: false }, { status: 405, headers })
  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const topic = String(body.topic ?? '').trim()
    const message = String(body.message ?? '').trim()
    if (String(body.company_website ?? '').trim()) return Response.json({ success: true, emailSent: false }, { status: 200, headers })
    const topics = ['AI & intelligent systems', 'Cybersecurity & digital safety', 'Software & web development', 'Digital learning & knowledge', 'Something else']
    if (name.length < 1 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !topics.includes(topic) || message.length < 10 || message.length > 5000) {
      return Response.json({ success: false, error: 'Invalid inquiry fields' }, { status: 400, headers })
    }
    const sourceIp = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const encoder = new TextEncoder()
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}:${sourceIp}`))
    const ipHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
    const { data: allowed, error: limitError } = await supabase.rpc('claim_inquiry_slot', { p_ip_hash: ipHash })
    if (limitError) throw limitError
    if (allowed !== true) return Response.json({ success: false, error: 'Please wait before sending another inquiry.' }, { status: 429, headers })
    const { error: insertError } = await supabase.from('inquiries').insert({ name, email, topic, message })
    if (insertError) throw insertError
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const recipient = Deno.env.get('INQUIRY_RECIPIENT')
    const sender = Deno.env.get('INQUIRY_FROM')
    let emailSent = false
    if (resendKey && recipient && sender) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: [recipient], reply_to: email, subject: `Website inquiry: ${topic}`, text: `From: ${name}\nReply to: ${email}\nTopic: ${topic}\n\n${message}` }),
      })
      emailSent = response.ok
      if (!response.ok) console.error('Inquiry email provider returned', response.status)
    }
    return Response.json({ success: true, emailSent }, { status: 200, headers })
  } catch (error) {
    console.error('Inquiry submission failed', error)
    return Response.json({ success: false, error: 'Unable to accept inquiry' }, { status: 500, headers })
  }
})
