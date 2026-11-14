import { useSeo } from '../lib/useSeo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export default function HomePage() {
  useSeo({
    title: 'PramanixLabs — Imagine. Build. Evolve.',
    description:
      'PramanixLabs is an independent technology studio in Pune building AI systems and software, with active interests in cybersecurity and digital learning.',
  })

  return (
    <main id="main" style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#020308' }}>
      <iframe
        title="PramanixLabs cosmic architecture experience"
        src="/cosmic-architecture.html"
        onLoad={event => {
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
