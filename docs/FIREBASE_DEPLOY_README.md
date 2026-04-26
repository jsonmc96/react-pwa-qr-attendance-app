# 🚀 Deploy a Firebase - Guía Rápida

## ⚡ Comandos Rápidos

### Primera vez
```bash
npm install -g firebase-tools
firebase login
# Configurar .env.production
npm run deploy:rules
npm run deploy
```

### Deploys futuros
```bash
npm run deploy
```

---

## 📚 Documentación Completa

Toda la documentación de deploy está en la carpeta de artifacts:

| Documento | Descripción |
|-----------|-------------|
| **DEPLOY_COMMANDS.md** | ⚡ Comandos exactos y resumen ejecutivo |
| **DEPLOY_CHECKLIST.md** | ✅ Checklist rápido de deploy |
| **FIREBASE_DEPLOY_GUIDE.md** | 📖 Guía completa paso a paso |
| **FIRESTORE_RULES_EXPLAINED.md** | 🔒 Explicación detallada de reglas de seguridad |

---

## 📋 Setup Inicial (15 minutos)

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Configurar Variables de Entorno

Crea `.env.production` basándote en `.env.production.example`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_BACKEND_PROVIDER=firebase
VITE_QR_SECRET=tu_secreto_super_seguro_cambiar_esto
```

**Obtener credenciales:**
1. https://console.firebase.google.com
2. Tu proyecto → ⚙️ Settings → Project settings
3. Your apps → Web app → firebaseConfig

### 4. Habilitar Authentication

1. Firebase Console → Authentication → Sign-in method
2. Email/Password → Enable → Save

### 5. Crear Usuarios de Prueba

**Firebase Console → Authentication → Users → Add user:**

- **Admin**: `admin@test.com` / `Admin123!`
- **User**: `user@test.com` / `User123!`

### 6. Crear Documentos en Firestore

**Firebase Console → Firestore Database → Start collection → `users`:**

Para cada usuario creado:
```
Document ID: [UID del usuario]
Fields:
  email: "admin@test.com"
  displayName: "Admin Test"
  role: "admin"  // o "user"
  uid: "[UID del usuario]"
```

### 7. Deploy Firestore Rules
```bash
npm run deploy:rules
```

### 8. Deploy App
```bash
npm run deploy
```

---

## 🔄 Workflow de Deploy

```bash
# Hacer cambios en el código
# ...

# Deploy
npm run deploy

# Verificar
# Abre https://tu-proyecto.web.app
```

---

## 📦 Scripts NPM Disponibles

```bash
npm run dev                    # Desarrollo local
npm run build                  # Build de producción
npm run preview                # Preview del build
npm run deploy                 # Build + Deploy Hosting
npm run deploy:rules           # Deploy Firestore Rules
npm run deploy:all             # Deploy todo (Hosting + Rules)
npm run deploy:preview         # Deploy a canal preview
```

---

## ✅ Verificación Post-Deploy

1. **Abrir app**: https://tu-proyecto.web.app
2. **Login**: admin@test.com / Admin123!
3. **PWA**: Busca ícono de instalación (⊕) en barra de direcciones
4. **Offline**: F12 → Network → Offline → Reload
5. **Lighthouse**: F12 → Lighthouse → PWA score = 100

---

## 🐛 Troubleshooting

### Error: "auth/unauthorized-domain"
```
Firebase Console → Authentication → Settings → Authorized domains
Agrega: tu-proyecto.web.app
```

### Error: "Missing or insufficient permissions"
```bash
npm run deploy:rules
```

### Error: "invalid-api-key"
```bash
# Verifica .env.production
# Rebuild
npm run build
firebase deploy --only hosting
```

---

## 📱 URLs Importantes

- **App**: https://tu-proyecto.web.app
- **Firebase Console**: https://console.firebase.google.com
- **Hosting**: https://console.firebase.google.com/project/tu-proyecto/hosting
- **Firestore**: https://console.firebase.google.com/project/tu-proyecto/firestore
- **Authentication**: https://console.firebase.google.com/project/tu-proyecto/authentication

---

## 📖 Más Información

Ver documentación completa en los artifacts (carpeta `.gemini/antigravity/brain/[conversation-id]/`)

---

**¿Listo para deployar?**

```bash
npm run deploy
```

🎉 Tu PWA estará en producción en 2-3 minutos!
