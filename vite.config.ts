import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ['VITE_', 'NEXT_PUBLIC_'])

  return {
  plugins: [react()],
  define: {
    // Vercel already has these public values under NEXT_PUBLIC_ names.
    // Map only the two browser-safe Supabase settings; never expose service secrets.
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
  },
  build: {
    // three is only fetched when the hero mounts; its chunk is expected to be large.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three-vendor'
          if (id.includes('/node_modules/@react-three/')) return 'react-three-vendor'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/'))
            return 'react-vendor'
          if (id.includes('/node_modules/lucide-react/')) return 'icons-vendor'
          return undefined
        },
      },
    },
  },
  }
})
