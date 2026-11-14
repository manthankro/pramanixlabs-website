import { useSeo } from '../lib/useSeo'

export default function HomePage() {
  useSeo({
    title: 'PramanixLabs — Imagine. Build. Evolve.',
    description:
      'PramanixLabs is an independent technology studio in Pune building AI systems, software, security diagnostics and digital learning experiences.',
  })

  return (
    <main id="main" style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#020308' }}>
      <iframe
        title="PramanixLabs cosmic architecture experience"
        src="/cosmic-architecture.html"
        style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
      />
    </main>
  )
}
