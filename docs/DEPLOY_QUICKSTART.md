# 🚀 Quick Start: Deploy PWA a Firebase Hosting

## Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

## Paso 2: Login

```bash
firebase login
```

## Paso 3: Inicializar Proyecto

```bash
firebase init hosting
```

**Respuestas**:
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

## Paso 4: Configurar Variables de Entorno

Crear `.env.production` con tus credenciales de Firebase.

## Paso 5: Build

```bash
npm run build
```

## Paso 6: Deploy

```bash
firebase deploy --only hosting
```

## Paso 7: Abrir App

```
https://tu-proyecto.web.app
```

## Paso 8: Instalar en Móvil

### Android
1. Abrir en Chrome
2. Menú → "Instalar app"

### iOS
1. Abrir en Safari
2. Compartir → "Agregar a pantalla de inicio"

---

## Verificar PWA

1. Chrome DevTools → Lighthouse
2. Generate Report
3. PWA score debe ser **100**

---

## Troubleshooting

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
# DevTools → Application → Cache Storage
# Verificar que existan caches
```

---

Para más detalles, ver [PWA_DEPLOYMENT_GUIDE.md](./PWA_DEPLOYMENT_GUIDE.md)
