import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['proyectoMarteLogo.jpg'],
      manifest: {
        name: 'Stickers Proyecto Marte',
        short_name: 'Stickers PM',
        description: 'Recorridos de stickers para Proyecto Marte',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'proyectoMarteLogo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: 'proyectoMarteLogo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
