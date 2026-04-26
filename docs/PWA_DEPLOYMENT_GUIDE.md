# 📱 Guía Completa: PWA + Firebase Hosting

## 📋 Índice

1. [Configuración PWA Completa](#configuración-pwa)
2. [Firebase Hosting Setup](#firebase-hosting)
3. [Proceso de Deploy](#deploy)
4. [Instalación en Dispositivos](#instalación)
5. [Verificación y Testing](#verificación)
6. [Troubleshooting](#troubleshooting)

---

## Configuración PWA

### ✅ Componentes Implementados

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| **Manifest.json** | ✅ | Generado por vite-plugin-pwa |
| **Service Worker** | ✅ | Generado automáticamente |
| **Iconos PWA** | ✅ | `/public/icons/` |
| **Screenshots** | ✅ | `/public/screenshots/` |
| **Modo Standalone** | ✅ | `display: 'standalone'` |
| **Cache Offline** | ✅ | Workbox configurado |
| **iOS Support** | ✅ | Meta tags + Apple icons |
| **Android Support** | ✅ | Maskable icons |

### Manifest.json (Generado Automáticamente)

El archivo `vite.config.js` genera el manifest con:

```javascript
{
  name: 'Control de Asistencia QR',
  short_name: 'Asistencia',
  description: 'App de control de asistencia con códigos QR',
  theme_color: '#1e40af',        // Color de la barra de estado
  background_color: '#ffffff',   // Color del splash screen
  display: 'standalone',         // Modo app nativa (sin barra del navegador)
  orientation: 'portrait',       // Orientación preferida
  scope: '/',
  start_url: '/',
  icons: [
    { src: '/icons/icon-192x192.png', sizes: '192x192', purpose: 'any' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', purpose: 'any' },
    { src: '/icons/icon-maskable.png', sizes: '512x512', purpose: 'maskable' }
  ]
}
```

### Service Worker - Estrategias de Cache

#### 1. **Offline Shell** (Precaching)
```javascript
globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
```
- Cachea todos los archivos estáticos al instalar
- La app funciona completamente offline

#### 2. **Firebase Firestore** (Network First)
```javascript
{
  urlPattern: /firestore\.googleapis\.com/,
  handler: 'NetworkFirst',
  networkTimeoutSeconds: 10
}
```
- Intenta red primero (datos frescos)
- Fallback a cache si offline
- Timeout de 10 segundos

#### 3. **Firebase Auth** (Network First)
```javascript
{
  urlPattern: /identitytoolkit\.googleapis\.com/,
  handler: 'NetworkFirst'
}
```
- Autenticación siempre intenta red primero
- Cache de 1 hora

#### 4. **Google Fonts** (Cache First)
```javascript
{
  urlPattern: /fonts\.googleapis\.com/,
  handler: 'CacheFirst',
  maxAgeSeconds: 365 * 24 * 60 * 60 // 1 año
}
```
- Fonts raramente cambian
- Cache agresivo para performance

#### 5. **Imágenes** (Cache First)
```javascript
{
  urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',
  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
}
```

### Iconos PWA

**Ubicación**: `/public/icons/`

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `icon-192x192.png` | 192x192 | Android, Chrome |
| `icon-512x512.png` | 512x512 | Splash screen, Android |
| `icon-maskable.png` | 512x512 | Android adaptive icons |

**Características del icono actual**:
- ✅ QR code estilizado con checkmark
- ✅ Gradiente azul (#2563eb → #1e40af)
- ✅ Fondo con patrones geométricos
- ✅ Funciona en fondos claros y oscuros

### Screenshots

**Ubicación**: `/public/screenshots/mobile-1.png`

- Tamaño: 390x844 (iPhone 12/13/14)
- Muestra la pantalla principal con QR
- Mejora la experiencia de instalación

---

## Firebase Hosting

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login en Firebase

```bash
firebase login
```

Se abrirá el navegador para autenticarte con tu cuenta de Google.

### 3. Inicializar Firebase en el Proyecto

```bash
cd c:\Projects\react-pwa-qr-attendance-app
firebase init hosting
```

**Responde las preguntas**:

```
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File dist/index.html already exists. Overwrite? No
```

### 4. Configuración Firebase (firebase.json)

Ya está creado con la configuración óptima:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      },
      {
        "source": "sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  }
}
```

**Características**:
- ✅ SPA rewrites (todas las rutas van a index.html)
- ✅ Cache agresivo para assets (1 año)
- ✅ Service Worker sin cache (siempre actualizado)
- ✅ Headers optimizados

---

## Proceso de Deploy

### Paso 1: Configurar Variables de Entorno

Crear archivo `.env.production`:

```bash
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
VITE_QR_SECRET=tu_secreto_super_seguro_cambiar_esto
```

### Paso 2: Build de Producción

```bash
npm run build
```

**Salida esperada**:
```
vite v5.0.8 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-abc123.js       234.56 kB
dist/manifest.webmanifest         1.45 kB
dist/sw.js                        12.34 kB
✓ built in 12.34s
```

**Archivos generados en `/dist`**:
- `index.html` - HTML principal
- `assets/` - JS, CSS minificados
- `manifest.webmanifest` - Manifest PWA
- `sw.js` - Service Worker
- `workbox-*.js` - Workbox runtime
- `icons/` - Iconos copiados
- `screenshots/` - Screenshots copiados

### Paso 3: Preview Local (Opcional)

```bash
npm run preview
```

Abre `http://localhost:4173` para ver el build de producción localmente.

### Paso 4: Deploy a Firebase Hosting

```bash
firebase deploy --only hosting
```

**Salida esperada**:
```
=== Deploying to 'tu-proyecto'...

i  deploying hosting
i  hosting[tu-proyecto]: beginning deploy...
i  hosting[tu-proyecto]: found 45 files in dist
✔  hosting[tu-proyecto]: file upload complete
i  hosting[tu-proyecto]: finalizing version...
✔  hosting[tu-proyecto]: version finalized
i  hosting[tu-proyecto]: releasing new version...
✔  hosting[tu-proyecto]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/tu-proyecto/overview
Hosting URL: https://tu-proyecto.web.app
```

### Paso 5: Verificar Deploy

Abre la URL en el navegador:
```
https://tu-proyecto.web.app
```

---

## Instalación en Dispositivos

### 📱 Android (Chrome)

#### Método 1: Banner Automático
1. Abre la app en Chrome
2. Espera el banner "Agregar a pantalla de inicio"
3. Toca "Instalar"

#### Método 2: Manual
1. Abre la app en Chrome
2. Toca el menú (⋮) en la esquina superior derecha
3. Selecciona "Instalar app" o "Agregar a pantalla de inicio"
4. Confirma la instalación

**Verificación**:
- ✅ Icono aparece en el drawer de apps
- ✅ Se abre en modo standalone (sin barra de Chrome)
- ✅ Splash screen con tu icono y colores

### 🍎 iOS (Safari)

#### Instalación
1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Edita el nombre si quieres
5. Toca "Agregar"

**Verificación**:
- ✅ Icono aparece en la pantalla de inicio
- ✅ Se abre en modo standalone
- ✅ Barra de estado con tu theme_color

**Nota iOS**: Safari no soporta Service Worker completamente, pero la app funciona.

### 💻 Desktop (Chrome, Edge)

1. Abre la app en Chrome/Edge
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Click en "Instalar"
4. La app se abre en ventana independiente

---

## Verificación y Testing

### 1. Lighthouse Audit

**Chrome DevTools → Lighthouse → Generate Report**

**Categorías a verificar**:
- ✅ **Performance**: > 90
- ✅ **Accessibility**: > 90
- ✅ **Best Practices**: > 90
- ✅ **SEO**: > 90
- ✅ **PWA**: 100 (crítico)

**Checklist PWA**:
```
✓ Installable
✓ Provides a valid apple-touch-icon
✓ Configured for a custom splash screen
✓ Sets a theme color for the address bar
✓ Content is sized correctly for the viewport
✓ Has a <meta name="viewport"> tag with width or initial-scale
✓ Provides a valid manifest
✓ Registers a service worker that controls page and start_url
✓ Service worker successfully serves offline content
✓ Page load is fast enough on mobile networks
```

### 2. Verificar Manifest

**Chrome DevTools → Application → Manifest**

Verifica:
- ✅ Name, short_name, description
- ✅ Icons (3 iconos visibles)
- ✅ Theme color, background color
- ✅ Display: standalone
- ✅ Start URL

### 3. Verificar Service Worker

**Chrome DevTools → Application → Service Workers**

Verifica:
- ✅ Estado: "activated and is running"
- ✅ Scope: "/"
- ✅ Source: "/sw.js"

**Application → Cache Storage**

Verifica caches creados:
- ✅ `workbox-precache-v2-...` (app shell)
- ✅ `firestore-cache`
- ✅ `firebase-auth-cache`
- ✅ `google-fonts-cache`
- ✅ `images-cache`

### 4. Probar Modo Offline

1. Abre la app
2. **Chrome DevTools → Network → Offline** (checkbox)
3. Recarga la página (F5)
4. ✅ La app debe cargar completamente
5. ✅ Debe mostrar banner "Modo sin conexión"

### 5. Probar en Dispositivo Real

#### Opción A: Usando ngrok (Desarrollo)
```bash
npm install -g ngrok
npm run dev
# En otra terminal:
ngrok http 3000
```

Abre la URL de ngrok en tu móvil.

#### Opción B: Red Local
```bash
npm run dev
```

Vite mostrará:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

Abre la URL de Network en tu móvil (mismo WiFi).

#### Opción C: Firebase Hosting (Producción)
```bash
npm run build
firebase deploy --only hosting
```

Abre la URL de Firebase en tu móvil.

---

## Troubleshooting

### Problema 1: "Add to Home Screen" no aparece

**Causas**:
- No estás en HTTPS (obligatorio para PWA)
- Manifest inválido
- Service Worker no registrado
- Ya instalaste la app

**Solución**:
```bash
# Verificar en Chrome DevTools → Console
# Debe aparecer: "✅ Persistencia LOCAL configurada"

# Verificar manifest
# DevTools → Application → Manifest
# No debe haber errores

# Verificar Service Worker
# DevTools → Application → Service Workers
# Debe estar "activated"
```

### Problema 2: Service Worker no se actualiza

**Causa**: Cache del navegador

**Solución**:
```bash
# En DevTools → Application → Service Workers
# Click en "Unregister"
# Reload la página

# O en código (main.jsx):
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}
```

### Problema 3: Iconos no se ven en iOS

**Causa**: iOS requiere apple-touch-icon específico

**Solución**: Ya está en `index.html`:
```html
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### Problema 4: App no funciona offline

**Causa**: Service Worker no cacheó los archivos

**Verificación**:
```bash
# DevTools → Application → Cache Storage
# Debe haber múltiples caches

# DevTools → Network → Offline
# Reload → Debe cargar
```

**Solución**:
```bash
# Rebuild
npm run build

# Clear cache
# DevTools → Application → Clear storage → Clear site data

# Reload
```

### Problema 5: Firebase deploy falla

**Error**: `Error: HTTP Error: 403, The caller does not have permission`

**Solución**:
```bash
# Re-login
firebase logout
firebase login

# Verificar proyecto
firebase projects:list

# Usar proyecto correcto
firebase use tu-proyecto-id
```

---

## Comandos Útiles

### Desarrollo
```bash
npm run dev                    # Servidor de desarrollo
npm run build                  # Build de producción
npm run preview                # Preview del build
```

### Firebase
```bash
firebase login                 # Login
firebase logout                # Logout
firebase projects:list         # Listar proyectos
firebase use proyecto-id       # Cambiar proyecto
firebase deploy --only hosting # Deploy hosting
firebase hosting:channel:deploy preview  # Deploy a canal preview
```

### Testing PWA
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://tu-app.web.app --view

# PWA Asset Generator (iconos)
npm install -g pwa-asset-generator
pwa-asset-generator logo.png ./public/icons
```

---

## Checklist Final

### Antes de Deploy
- [ ] Variables de entorno configuradas en `.env.production`
- [ ] `npm run build` ejecuta sin errores
- [ ] Preview local funciona (`npm run preview`)
- [ ] Lighthouse PWA score = 100
- [ ] Service Worker registrado correctamente
- [ ] Modo offline funciona
- [ ] Iconos de todos los tamaños presentes

### Después de Deploy
- [ ] URL de Firebase Hosting accesible
- [ ] App se puede instalar en Android
- [ ] App se puede instalar en iOS
- [ ] App se puede instalar en Desktop
- [ ] Modo offline funciona en producción
- [ ] Firebase Auth funciona
- [ ] Firestore funciona
- [ ] QR generation/scanning funciona

---

## URLs Importantes

| Recurso | URL |
|---------|-----|
| **Firebase Console** | https://console.firebase.google.com |
| **Hosting Dashboard** | https://console.firebase.google.com/project/TU-PROYECTO/hosting |
| **PWA Builder** | https://www.pwabuilder.com |
| **Lighthouse** | Chrome DevTools → Lighthouse |
| **Can I Use (PWA)** | https://caniuse.com/?search=pwa |

---

## Recursos Adicionales

### Documentación
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)

### Herramientas
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Maskable.app](https://maskable.app/) - Editor de iconos maskable
- [Favicon Generator](https://realfavicongenerator.net/)

---

## 🎉 ¡Listo!

Tu PWA está completamente configurada y lista para:

✅ **Instalarse** en Android, iOS y Desktop  
✅ **Funcionar offline** con Service Worker  
✅ **Desplegar** a Firebase Hosting  
✅ **Cachear** datos de Firebase  
✅ **Actualizar** automáticamente  

**Próximo paso**: Ejecutar `npm run build && firebase deploy --only hosting`
