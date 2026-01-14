import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'screenshots/*.png', 'robots.txt'],

      // Configuración del manifest para PWA
      manifest: {
        name: 'Control de Asistencia QR',
        short_name: 'Asistencia',
        description: 'App de control de asistencia con códigos QR',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',

        // Iconos para diferentes plataformas
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        // Screenshots para instalación mejorada
        screenshots: [
          {
            src: '/screenshots/mobile-1.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Vista principal de la aplicación'
          }
        ],

        // Categorías para app stores
        categories: ['productivity', 'business'],

        // Configuración adicional para iOS
        prefer_related_applications: false
      },

      // Configuración de Workbox para Service Worker
      workbox: {
        // Archivos a precachear (offline shell)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Estrategias de cache
        runtimeCaching: [
          // Firebase Firestore - Network First (datos frescos)
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },

          // Firebase Auth - Network First
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-auth-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 // 1 hora
              }
            }
          },

          // Google Fonts - Cache First (raramente cambian)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },

          // Google Fonts CSS
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },

          // Imágenes - Cache First con Network Fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          }
        ],

        // Limpiar caches antiguos
        cleanupOutdatedCaches: true,

        // Tamaño máximo de cache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },

      // Opciones de desarrollo
      devOptions: {
        enabled: false, // Cambiar a true para probar PWA en desarrollo
        type: 'module'
      }
    })
  ],

  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: true,
    host: true // Permitir acceso desde red local (para probar en móvil)
  },

  // Optimizaciones de build
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'qr-vendor': ['qrcode.react', 'html5-qrcode']
        }
      }
    }
  }
})
