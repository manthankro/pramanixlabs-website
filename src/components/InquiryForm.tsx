import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function InquiryForm() {
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending')
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = { name: String(data.get('name')), email: String(data.get('email')), topic: String(data.get('topic')), message: String(data.get('message')) }
    if (!supabase) { setState('error'); return }
    const { data: result, error } = await supabase.functions.invoke('submit-inquiry', { body: { ...payload, company_website: String(data.get('company_website') ?? '') } })
    setState(error || !result?.success ? 'error' : 'sent')
    if (!error && result?.success) form.reset()
  }
  return <form className="inquiry-form" onSubmit={submit}>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="How should we address you?" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></label></div>
    <label className="honeypot" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off" /></label>
    <label>What are you exploring?<select name="topic" defaultValue=""><option value="" disabled>Select a focus area</option><option>AI & intelligent systems</option><option>Cybersecurity & digital safety</option><option>Software & web development</option><option>Digital learning & knowledge</option><option>Something else</option></select></label>
    <label>A little about it<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="The idea, the challenge, or simply where you are in the journey…" /></label>
    <div className="form-bottom"><button className="button button-blue" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send inquiry'} <span>↗</span></button><p className="form-status" aria-live="polite">{state === 'sent' && 'Thanks — your inquiry has been received.'}{state === 'error' && (supabase ? 'We couldn’t send that just now. Please try again or email pramanixlabs@gmail.com.' : 'Inquiry delivery is being configured. Please email pramanixlabs@gmail.com for now.')}</p></div>
  </form>
}
