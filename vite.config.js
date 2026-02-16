import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'SRO Sales Dashboard',
        short_name: 'SRO Sales',
        description: 'Enterprise Leads Extraction & Sales Intelligence',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/sales',
        start_url: '/sales',
        icons: []
      },
      devOptions: {
        enabled: false // Disable in dev to avoid icon errors
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces to allow access from 26.32.68.132
    port: 5173
  }
})
