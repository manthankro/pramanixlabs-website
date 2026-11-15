import { useEffect, useRef, useState } from 'react'
import { useSeo } from '../lib/useSeo'
import { projects as initialProjects, type Project } from '../data/content'
import { supabase } from '../lib/supabase'
import { bookingUrl } from '../lib/booking'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

function mergeProjects(rows: Record<string, unknown>[]): Project[] {
  return rows.map(row => {
    const code = String(row.id)
    const base = initialProjects.find(project => project.code === code)
    return {
      ...base,
      name: String(row.name ?? base?.name ?? 'Untitled project'),
      category: String(row.category ?? base?.category ?? 'Project'),
      description: String(row.description ?? base?.description ?? ''),
      status: String(row.status ?? base?.status ?? 'Project'),
      upcoming: Boolean(row.upcoming),
      image_url: (row.image_url as string | null) ?? null,
      image_alt: (row.image_alt as string | null) ?? null,
      tags: base?.tags ?? [],
      source: base?.source ?? (row.upcoming ? 'concept' : 'private'),
      href: base?.href,
      code,
    } satisfies Project
  })
}

export default function HomePage() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [frameReady, setFrameReady] = useState(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  useSeo({
    title: 'PramanixLabs | 3D product and software studio',
    description: 'Explore PramanixLabs in a 3D cosmic experience. Pune-based product and software studio for AI, SaaS, websites, apps and automation. Start a project inquiry.',
  })

  useEffect(() => {
    if (!supabase) return
    let active = true
    void (async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('sort_order')
        if (active && !error && data?.length) setProjects(mergeProjects(data))
      } catch {
        // Keep the built-in project details if the database is unavailable.
      }
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!frameReady) return
    const target = frame.current?.contentWindow
    target?.postMessage({ type: 'PRAMANIX_PROJECTS_DATA', projects }, window.location.origin)
    target?.postMessage({
      type: 'PRAMANIX_SUPABASE_CONFIG',
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      bookingUrl,
    }, window.location.origin)
  }, [frameReady, projects])

  return (
    <main id="main" style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#020308' }}>
      <iframe
        ref={frame}
        title="PramanixLabs 3D cosmic architecture and services"
        src="/cosmic-architecture.html"
        allow="autoplay"
        onLoad={() => setFrameReady(true)}
        style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
      />
    </main>
  )
}
