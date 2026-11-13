import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
