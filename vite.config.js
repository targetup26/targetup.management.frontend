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
        name: 'Targetup Attendance',
        short_name: 'Attendance',
        description: 'Team Attendance & Management Portal',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/sales',
        start_url: '/sales',
        icons: []
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: true // Let it use the default hostname
  }
})
