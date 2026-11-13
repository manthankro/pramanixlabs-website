import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, ImagePlus, Inbox, LayoutList, LockKeyhole, LogOut, RefreshCw } from 'lucide-react'
import Brand from '../components/Brand'
import { PORTFOLIO_BUCKET, supabase } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'

type ProjectRow = {
  id: string
  name: string
  category: string
  description: string
  status: string
  upcoming: boolean
  image_url: string | null
  image_alt: string | null
  sort_order: number
}

type InquiryRow = {
  id: string
  name: string
  email: string
  topic: string
  message: string
  created_at: string
}

type Phase = 'checking' | 'signed-out' | 'denied' | 'ready'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function AdminPage() {
  useSeo({
    title: 'Studio dashboard — PramanixLabs',
    description: 'Private studio access for PramanixLabs.',
    robots: 'noindex,nofollow',
  })

  const [phase, setPhase] = useState<Phase>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [rowState, setRowState] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'portfolio' | 'inquiries'>('portfolio')
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [inboxState, setInboxState] = useState<'idle' | 'loading' | 'error'>('idle')

  const loadProjects = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('projects')
      .select('id,name,category,description,status,upcoming,image_url,image_alt,sort_order')
      .order('sort_order')
    if (error) {
      setRowState(previous => ({ ...previous, __global: error.message }))
      return
    }
    setRows((data ?? []) as ProjectRow[])
  }, [])

  useEffect(() => {
    const client = supabase
    if (!client) return
    let alive = true

    const verify = async (hasSession: boolean) => {
      if (!alive) return
      if (!hasSession) {
        setPhase('signed-out')
        setRows([])
        return
      }
      // Keep an established dashboard on screen during token refreshes.
      setPhase(previous => (previous === 'ready' ? previous : 'checking'))
      const { data, error } = await client.rpc('is_site_admin')
      if (!alive) return
      if (error || data !== true) {
        setPhase('denied')
        return
      }
      setPhase('ready')
      void loadProjects()
    }

    client.auth.getSession().then(({ data }) => verify(Boolean(data.session)))
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      void verify(Boolean(session))
    })

    return () => {
      alive = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProjects])

  const loadInquiries = useCallback(async () => {
    if (!supabase) return
    setInboxState('loading')
    const { data, error } = await supabase
      .from('inquiries')
      .select('id,name,email,topic,message,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      setInboxState('error')
      return
    }
    setInquiries((data ?? []) as InquiryRow[])
    setInboxState('idle')
  }, [])

  useEffect(() => {
    if (tab === 'inquiries' && phase === 'ready') void loadInquiries()
  }, [tab, phase, loadInquiries])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setSigningIn(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSigningIn(false)
    if (error) setAuthError(error.message)
  }

  async function saveProject(event: FormEvent<HTMLFormElement>, project: ProjectRow) {
    event.preventDefault()
    if (!supabase) return
    const form = event.currentTarget
    const data = new FormData(form)
    setRowState(previous => ({ ...previous, [project.id]: 'Saving…' }))

    let imageUrl = project.image_url
    const file = data.get('image')

    if (data.get('remove_image') === 'on') imageUrl = null

    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setRowState(previous => ({ ...previous, [project.id]: 'Use a JPEG, PNG, WebP or AVIF image.' }))
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setRowState(previous => ({ ...previous, [project.id]: 'Images must be 5 MB or smaller.' }))
        return
      }
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${project.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from(PORTFOLIO_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) {
        setRowState(previous => ({ ...previous, [project.id]: uploadError.message }))
        return
      }
      imageUrl = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path).data.publicUrl
    }

    const row: ProjectRow = {
      id: project.id,
      name: String(data.get('name') ?? '').trim(),
      category: String(data.get('category') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      status: String(data.get('status') ?? '').trim(),
      upcoming: data.get('upcoming') === 'on',
      image_url: imageUrl,
      image_alt: String(data.get('image_alt') ?? '').trim() || null,
      sort_order: Number(data.get('sort_order') ?? project.sort_order) || 0,
    }

    const { error } = await supabase.from('projects').upsert(row)
    if (error) {
      setRowState(previous => ({ ...previous, [project.id]: error.message }))
      return
    }
    setRows(previous =>
      previous
        .map(item => (item.id === row.id ? row : item))
        .sort((a, b) => a.sort_order - b.sort_order),
    )
    setRowState(previous => ({ ...previous, [project.id]: 'Saved.' }))
  }

  if (!supabase) {
    return (
      <main className="admin-shell">
        <div className="admin-topbar">
          <Brand href="/" />
          <a href="/" className="text-link">
            Back to site
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>
        <div className="admin-card">
          <LockKeyhole aria-hidden="true" />
          <h1>Studio dashboard</h1>
          <p>
            This dashboard is private. It activates once the Supabase project URL and anon key are set as
            build environment variables.
          </p>
          <p className="admin-hint">
            Follow <code>docs/DEPLOYMENT.md</code> to connect Supabase. Never place a service-role key in
            this application.
          </p>
        </div>
      </main>
    )
  }

  if (phase === 'checking') {
    return (
      <main className="admin-shell admin-shell--center">
        <p className="admin-loading">Checking secure session…</p>
      </main>
    )
  }

  if (phase === 'signed-out' || phase === 'denied') {
    return (
      <main className="admin-shell">
        <div className="admin-topbar">
          <Brand href="/" />
          <a href="/" className="text-link">
            Back to site
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>
        <form className="admin-card" onSubmit={signIn}>
          <LockKeyhole aria-hidden="true" />
          <p className="eyebrow">PRIVATE STUDIO ACCESS</p>
          <h1>Welcome back.</h1>
          <p>
            Sign in with an account provisioned by the studio owner. There is no public sign-up for this
            area.
          </p>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </label>
          <button className="button button-primary" disabled={signingIn} type="submit">
            {signingIn ? 'Signing in…' : 'Sign in'}
            <ArrowUpRight aria-hidden="true" size={16} />
          </button>
          <p className={`form-status${phase === 'denied' || authError ? ' is-error' : ''}`} role="status">
            {phase === 'denied'
              ? 'This account does not have studio access. Ask the project owner to add it to the admin allowlist.'
              : authError}
          </p>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <div className="admin-topbar">
        <Brand href="/" />
        <div className="admin-topbar-actions">
          <a href="/" className="text-link">
            View site
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
          <button type="button" className="ghost-button" onClick={() => void supabase?.auth.signOut()}>
            <LogOut aria-hidden="true" size={14} />
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">PRAMANIXLABS / STUDIO</p>
            <h1>Portfolio &amp; inquiries</h1>
          </div>
          <p className="admin-heading-note">
            Changes publish instantly to the public site. Access is enforced by Supabase authentication
            and database policies.
          </p>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Dashboard sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'portfolio'}
            className={tab === 'portfolio' ? 'is-active' : ''}
            onClick={() => setTab('portfolio')}
          >
            <LayoutList aria-hidden="true" size={15} />
            Portfolio
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'inquiries'}
            className={tab === 'inquiries' ? 'is-active' : ''}
            onClick={() => setTab('inquiries')}
          >
            <Inbox aria-hidden="true" size={15} />
            Inquiries
          </button>
        </div>

        {rowState.__global && (
          <p className="admin-alert" role="alert">
            {rowState.__global}
          </p>
        )}

        {tab === 'portfolio' && (
          <section aria-label="Portfolio projects" className="admin-list">
            <p className="admin-hint">
              Project IDs match the seeded records and are not editable. Toggle “Upcoming innovation” to
              move an entry into the exploration section on the public site.
            </p>
            {rows.length === 0 && (
              <p className="admin-empty">
                No project rows are visible. Apply the database migration, or check that this account is
                on the admin allowlist.
              </p>
            )}
            {rows.map(project => (
              <form
                className="admin-project"
                key={project.id}
                onSubmit={event => void saveProject(event, project)}
              >
                <div className="admin-project-head">
                  <span className="admin-project-id">{project.id}</span>
                  <h2>{project.name}</h2>
                </div>

                <div className="admin-project-grid">
                  <label className="field">
                    <span>Name</span>
                    <input name="name" defaultValue={project.name} required maxLength={80} />
                  </label>
                  <label className="field">
                    <span>Category</span>
                    <input name="category" defaultValue={project.category} required maxLength={60} />
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <input name="status" defaultValue={project.status} required maxLength={60} />
                  </label>
                  <label className="field">
                    <span>Sort order</span>
                    <input
                      name="sort_order"
                      type="number"
                      min={0}
                      max={999}
                      defaultValue={project.sort_order}
                    />
                  </label>
                  <label className="field admin-project-wide">
                    <span>Description</span>
                    <textarea name="description" defaultValue={project.description} rows={3} required maxLength={600} />
                  </label>
                  <label className="field admin-project-wide">
                    <span>Image alt text</span>
                    <input
                      name="image_alt"
                      defaultValue={project.image_alt ?? ''}
                      maxLength={160}
                      placeholder="Describe the image for screen readers"
                    />
                  </label>
                </div>

                <div className="admin-project-media">
                  {project.image_url ? (
                    <img src={project.image_url} alt="" />
                  ) : (
                    <span className="admin-media-empty">
                      <ImagePlus aria-hidden="true" size={18} />
                      No image
                    </span>
                  )}
                  <div className="admin-media-fields">
                    <label className="field">
                      <span>Replace image (JPEG, PNG, WebP or AVIF, max 5 MB)</span>
                      <input name="image" type="file" accept={ALLOWED_TYPES.join(',')} />
                    </label>
                    {project.image_url && (
                      <label className="check-label">
                        <input name="remove_image" type="checkbox" />
                        Remove the current image
                      </label>
                    )}
                  </div>
                </div>

                <div className="admin-project-foot">
                  <label className="check-label">
                    <input name="upcoming" type="checkbox" defaultChecked={project.upcoming} />
                    Upcoming innovation (shown as in exploration)
                  </label>
                  <button className="button button-primary" type="submit">
                    Save changes
                  </button>
                  <span className="admin-row-state" role="status">
                    {rowState[project.id] ?? ''}
                  </span>
                </div>
              </form>
            ))}
          </section>
        )}

        {tab === 'inquiries' && (
          <section aria-label="Inquiry inbox" className="admin-inbox">
            <div className="admin-inbox-top">
              <p className="admin-hint">
                Messages submitted through the public form. Only allowlisted accounts can read them.
              </p>
              <button
                type="button"
                className="ghost-button"
                onClick={() => void loadInquiries()}
                disabled={inboxState === 'loading'}
              >
                <RefreshCw aria-hidden="true" size={14} />
                {inboxState === 'loading' ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            {inboxState === 'error' && (
              <p className="admin-alert" role="alert">
                The inbox could not be loaded. Check your session and the row-level security policies.
              </p>
            )}
            {inquiries.length === 0 && inboxState !== 'loading' && (
              <p className="admin-empty">No inquiries yet. New messages will appear here.</p>
            )}
            {inquiries.map(inquiry => (
              <article className="inquiry" key={inquiry.id}>
                <div className="inquiry-meta">
                  <span>{inquiry.topic}</span>
                  <time dateTime={inquiry.created_at}>{formatDate(inquiry.created_at)}</time>
                </div>
                <h2>
                  {inquiry.name}
                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                </h2>
                <p>{inquiry.message}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
