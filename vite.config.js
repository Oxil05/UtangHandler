import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
      manifest: {
        id: 'https://oxil05.github.io/UtangHandler/',
        name: 'UtangHandler - Offline Debt & IOU Manager',
        short_name: 'UtangHandler',
        description: 'Track Utang and Pautang offline with built-in calculator and customer manager',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: './index.html',
        scope: './',
        dir: 'ltr',
        lang: 'en-US',
        categories: ['finance', 'utilities', 'productivity'],
        iarc_rating_id: 'e84b075a-5276-464e-861e-12d4d872d9a2',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile-1.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'UtangHandler Mobile Dashboard'
          },
          {
            src: 'screenshot-mobile-2.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'UtangHandler Calculator & Records'
          }
        ],
        shortcuts: [
          {
            name: 'New Entry',
            short_name: 'Add',
            description: 'Record a new Utang or Pautang',
            url: './index.html'
          },
          {
            name: 'Calculator',
            short_name: 'Calc',
            description: 'Open built-in mobile calculator',
            url: './index.html'
          }
        ]
      }
    })
  ]
})
