import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, Loader2 } from 'lucide-react'
import { inquiryTopics, studio } from '../data/content'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const messages = {
  unavailable: 'Online delivery is not configured yet. Email us directly and we will pick it up there.',
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
      company_website: String(data.get('company_website') ?? ''),
    }

    if (!supabase) {
      setStatus('error')
      setMessage(messages.unavailable)
      return
    }

    setStatus('sending')
    setMessage('')

    const { data: result, error } = await supabase.functions.invoke('submit-inquiry', { body: payload })

    if (error || !result?.success) {
      const code = (error as { context?: { status?: number } } | null)?.context?.status
      setStatus('error')
      setMessage(code === 429 ? messages.rateLimited : code === 400 ? messages.invalid : messages.generic)
      return
    }

    setStatus('sent')
    form.reset()
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
        <span>Focus area</span>
        <select name="topic" required defaultValue="">
          <option value="" disabled>
            Select a focus area
          </option>
          {inquiryTopics.map(topic => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>A little about it</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="The idea, the challenge, or simply where you are in the journey…"
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
              Send inquiry
              <ArrowUpRight aria-hidden="true" size={16} />
            </>
          )}
        </button>
        <p className="form-note">
          {isSupabaseConfigured
            ? 'Your message goes to the studio inbox. No newsletter, no sharing.'
            : `Direct email is the most reliable route right now.`}
        </p>
      </div>

      <p className={`form-status${status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
        {status === 'error' && (
          <>
            {message}{' '}
            <a href={`mailto:${studio.email}`}>{studio.email}</a>
          </>
        )}
      </p>
    </form>
  )
}
