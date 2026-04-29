import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'img/icono-192.png',
        'img/icono-512.png',
        'img/icono-180-ios.png',
        'img/icono-167-ios.png',
        'img/icono-152-ios.png'
      ],
      manifest: {
        name: 'A tiempo',
        short_name: 'A tiempo',
        description: 'Sistema de control de jornadas',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: '/img/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/img/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: "/img/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ]
      }
    })

    ],
})
