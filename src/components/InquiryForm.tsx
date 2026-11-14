import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, Loader2 } from 'lucide-react'
import { inquiryTopics, studio } from '../data/content'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'info'

const messages = {
  rateLimited: 'That is a few messages in a short time. Please wait a few minutes, or email us directly.',
  invalid: 'Please check the fields above and try again.',
  generic: 'Something went wrong while sending. Please try again, or email us directly.',
} as const

export default function InquiryForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const confirmation = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (status === 'sent') confirmation.current?.focus()
  }, [status])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      topic: String(data.get('topic') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      organization: String(data.get('organization') ?? '').trim(),
      timeline: String(data.get('timeline') ?? '').trim(),
      company_website: String(data.get('company_website') ?? ''),
    }

    if (!supabase) {
      const subject = encodeURIComponent(`[PramanixLabs] ${payload.topic} — ${payload.name}`)
      const emailBody = encodeURIComponent([`Name: ${payload.name}`, `Email: ${payload.email}`, `Service: ${payload.topic}`, payload.organization ? `Company / organization: ${payload.organization}` : '', payload.timeline ? `Preferred timing: ${payload.timeline}` : '', '', payload.message].filter(Boolean).join('\n'))
      setMessage('Your email draft should open. Review it and press Send. If it does not open, use the direct email link below.')
      window.location.href = `mailto:${studio.email}?subject=${subject}&body=${emailBody}`
      setStatus('info')
      return
    }

    setStatus('sending')
    setMessage('')

    const projectMessage = [payload.message, payload.organization ? `Company / organization: ${payload.organization}` : '', payload.timeline ? `Preferred timing: ${payload.timeline}` : ''].filter(Boolean).join('\n\n')
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-inquiry', { body: { ...payload, message: projectMessage } })
      if (error || !result?.success) {
        const code = (error as { context?: { status?: number } } | null)?.context?.status
        setStatus('error')
        setMessage(code === 429 ? messages.rateLimited : code === 400 ? messages.invalid : messages.generic)
        return
      }
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
      setMessage(messages.generic)
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-panel form-panel--sent">
        <span className="form-check" aria-hidden="true">
          <Check size={20} />
        </span>
        <h3 ref={confirmation} tabIndex={-1}>
          Message received.
        </h3>
        <p>
          Thanks for writing. Your inquiry is in the studio inbox, and we can continue the conversation over email.
        </p>
        <button type="button" className="text-button" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="inquiry-form" onSubmit={submit} aria-busy={status === 'sending'}>
      <div className="form-row">
        <label className="field">
          <span>Your name</span>
          <input name="name" autoComplete="name" required maxLength={100} placeholder="How should we address you?" />
        </label>
        <label className="field">
          <span>Email address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@company.com"
          />
        </label>
      </div>

      <label className="field">
        <span>Service you need</span>
        <select id="inquiry-topic" name="topic" required defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {inquiryTopics.map(topic => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label className="field">
          <span>Company or organization <small>(optional)</small></span>
          <input name="organization" autoComplete="organization" maxLength={160} placeholder="Company name" />
        </label>
        <label className="field">
          <span>When are you looking to start? <small>(optional)</small></span>
          <select name="timeline" defaultValue="">
            <option value="">Select a timeframe</option>
            <option>As soon as possible</option>
            <option>Within 1–3 months</option>
            <option>More than 3 months away</option>
            <option>Still exploring</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Project details</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4500}
          rows={5}
          placeholder="What are you trying to build or improve? Who will use it, and what would a useful result look like?"
        />
      </label>

      <label className="honeypot" aria-hidden="true">
        Company website
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="form-actions">
        <button className="button button-primary" disabled={status === 'sending'} type="submit">
          {status === 'sending' ? (
            <>
              Sending
              <Loader2 className="spin" aria-hidden="true" size={16} />
            </>
          ) : (
            <>
              {isSupabaseConfigured ? 'Send project request' : 'Continue by email'}
              <ArrowUpRight aria-hidden="true" size={16} />
            </>
          )}
        </button>
        <p className="form-note">
          {isSupabaseConfigured
            ? 'Your request goes to the studio inbox. We use your details only to respond.'
            : 'No inquiry is sent until you press Send in your email app.'}
        </p>
      </div>
      {!isSupabaseConfigured && <p className="form-note form-note--fallback">Email us at <a href={`mailto:${studio.email}`}>{studio.email}</a>. <a href="#privacy">Privacy notice</a>.</p>}

      <p className={`form-status${status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
        {(status === 'error' || status === 'info') && (
          <>
            {message}{' '}
            {status === 'error' && <a href={`mailto:${studio.email}`}>{studio.email}</a>}
          </>
        )}
      </p>
    </form>
  )
}
