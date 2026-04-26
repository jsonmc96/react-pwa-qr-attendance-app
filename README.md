# PWA Control de Asistencia con QR & Parqueadero

Progressive Web App para control de asistencia empresarial y gestión remota de parqueadero.

![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-4-purple)

## 🚀 Características

- ✅ **PWA Completa**: Instalable en iOS, Android y Desktop
- 🔐 **Autenticación Firebase**: Login con email/contraseña, sesión persistente
- 👥 **Roles**: Admin y Usuario con rutas protegidas
- 📱 **Generación de QR**: Admin genera QR único por día (SHA-256)
- 📷 **Escaneo de QR**: Usuarios registran asistencia con cámara
- 📅 **Calendario**: Visualización mensual de asistencia
- 🔒 **Validación**: Un solo registro por usuario por día
- 📡 **Offline-First**: Funciona sin conexión con Service Worker
- 💾 **Cache Inteligente**: Workbox con estrategias optimizadas
- 🎨 **Mobile-First**: Diseño responsive con Tailwind CSS

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18 + Vite 5 |
| **Estilos** | Tailwind CSS 3.4 |
| **Backend** | Firebase (Auth + Firestore) |
| **QR** | qrcode.react + html5-qrcode |
| **PWA** | vite-plugin-pwa + Workbox 7 |
| **Calendario** | react-calendar |
| **Fechas** | date-fns |
| **Routing** | react-router-dom 6 |
| **Hosting** | Firebase Hosting |

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase
- Navegador moderno (Chrome, Safari, Firefox)

## 🔧 Instalación

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd react-pwa-qr-attendance-app
npm install
```

### 2. Configurar Firebase

**a) Crear proyecto en [Firebase Console](https://console.firebase.google.com/)**

- Habilitar **Authentication** → Email/Password
- Crear base de datos **Firestore**
- Copiar credenciales del proyecto

**b) Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_QR_SECRET=tu_secreto_super_seguro
```

**c) Desplegar reglas de Firestore**

Copiar contenido de `firestore.rules` a Firebase Console → Firestore Database → Rules

**d) Crear usuarios de prueba**

En Firebase Console → Authentication, crear usuarios:

```javascript
// Admin
Email: admin@test.com
Password: tu_password

// Usuario
Email: user@test.com
Password: tu_password
```

En Firestore → Colección `users`, crear documentos:

```javascript
// Documento ID: {uid del admin}
{
  email: "admin@test.com",
  role: "admin",
  displayName: "Admin Test",
  createdAt: Timestamp.now()
}

// Documento ID: {uid del usuario}
{
  email: "user@test.com",
  role: "user",
  displayName: "Usuario Test",
  createdAt: Timestamp.now()
}
```

## 🚀 Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

**Para probar en móvil (misma red WiFi)**:
```bash
npm run dev
# Abre http://192.168.x.x:3000 en tu móvil
```

## 📦 Producción

### Build Local

```bash
npm run build
npm run preview
```

### Deploy a Firebase Hosting

**1. Instalar Firebase CLI**

```bash
npm install -g firebase-tools
```

**2. Login**

```bash
firebase login
```

**3. Inicializar (solo primera vez)**

```bash
firebase init hosting
```

Respuestas:
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

**4. Deploy**

```bash
npm run deploy
```

O manualmente:

```bash
npm run build
firebase deploy --only hosting
```

**5. Abrir App**

```
https://tu-proyecto.web.app
```

## 📱 Instalación como PWA

### Android (Chrome)
1. Abrir la app en Chrome
2. Tocar el menú (⋮)
3. Seleccionar "Instalar app"

### iOS (Safari)
1. Abrir la app en Safari
2. Tocar el botón de compartir (□↑)
3. Seleccionar "Agregar a pantalla de inicio"

### Desktop (Chrome/Edge)
1. Buscar el ícono de instalación (⊕) en la barra de direcciones
2. Click en "Instalar"

## 🏗️ Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
├── context/         # AuthContext, etc.
├── hooks/           # useAuth, useAttendance, etc.
├── pages/           # Admin/User/Shared Pages
├── services/        # APIs y Firebase
├── styles/          # Estilos globales
└── utils/           # Utilidades y constantes
```

## 📚 Documentación

Toda la documentación técnica se encuentra en la carpeta [docs/](./docs):
- [Arquitectura del Proyecto](./docs/ARCHITECTURE.md)
- [Contexto para IA](./docs/AI_CONTEXT.md)
- [Funcionalidades](./docs/FEATURES.md)
- [Guía de Firebase Auth](./docs/FIREBASE_AUTH_GUIDE.md)
- [Guía de Despliegue PWA](./docs/PWA_DEPLOYMENT_GUIDE.md)

## 🐛 Troubleshooting

### Service Worker no funciona
```bash
# DevTools → Application → Service Workers → Unregister
# Reload página
```

### Deploy falla
```bash
firebase logout
firebase login
firebase use tu-proyecto-id
```

### App no funciona offline
```bash
# Verificar caches en DevTools → Application → Cache Storage
# Rebuild: npm run build
```

### "Add to Home Screen" no aparece
- Verificar HTTPS (obligatorio)
- Verificar Lighthouse PWA score = 100
- Verificar que no esté ya instalada

## 🎯 Roadmap

- [ ] Notificaciones Push
- [ ] Geolocalización en registro
- [ ] Reportes avanzados (gráficos)
- [ ] Exportar a Excel/PDF
- [ ] Multi-idioma (i18n)
- [ ] Dark mode completo
- [ ] Tests unitarios (Vitest)
- [ ] Tests E2E (Playwright)

## 📄 Licencia

ISC

## 👨‍💻 Autor

@JsonMC

---

## 🎉 ¡Listo para usar!

La app está completamente configurada y lista para:

✅ Instalarse en Android, iOS y Desktop  
✅ Funcionar offline con Service Worker  
✅ Desplegar a Firebase Hosting  
✅ Cachear datos de Firebase  
✅ Actualizar automáticamente  

**Próximo paso**: `npm run deploy`
