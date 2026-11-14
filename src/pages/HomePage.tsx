import { useEffect, useRef, useState } from 'react'
import { useSeo } from '../lib/useSeo'
import { projects as initialProjects, type Project } from '../data/content'
import { supabase } from '../lib/supabase'

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
  useSeo({
    title: 'PramanixLabs — Imagine. Build. Evolve.',
    description:
      'PramanixLabs is an independent technology studio in Pune building AI systems and software, with active interests in cybersecurity and digital learning.',
  })

  const frame = useRef<HTMLIFrameElement>(null)
  const [frameReady, setFrameReady] = useState(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('projects')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (active && data?.length) setProjects(mergeProjects(data))
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!frameReady) return
    frame.current?.contentWindow?.postMessage(
      { type: 'PRAMANIX_PROJECTS_DATA', projects },
      window.location.origin,
    )
  }, [frameReady, projects])

  return (
    <main id="main" style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#020308' }}>
      <iframe
        ref={frame}
        title="PramanixLabs cosmic architecture experience"
        src="/cosmic-architecture.html"
        onLoad={event => {
          setFrameReady(true)
          event.currentTarget.contentWindow?.postMessage(
            {
              type: 'PRAMANIX_SUPABASE_CONFIG',
              url: supabaseUrl,
              anonKey: supabaseAnonKey,
            },
            window.location.origin,
          )
        }}
        style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
      />
    </main>
  )
}