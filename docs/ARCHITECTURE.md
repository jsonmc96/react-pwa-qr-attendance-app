# Arquitectura del Proyecto

## Tecnologías Principales
- **Frontend**: React 18 (Vite)
- **Estilos**: Tailwind CSS
- **Estado Global**: React Context API
- **Base de Datos & Auth**: Firebase (Firestore & Auth)
- **PWA**: vite-plugin-pwa (Service Workers, Manifest, Offline Support)
- **Iconos**: Emoji / Lucide-like SVG

## Estructura de Carpetas
- `src/components`: Componentes reutilizables.
  - `common`: Botones, Cards, Inputs.
  - `layout`: Header, BottomNav, MainLayout.
  - `auth`: ProtectedRoute, RoleGuard.
- `src/context`: Proveedores de contexto (AuthContext, etc).
- `src/hooks`: Custom hooks (usePWAInstall, etc).
- `src/pages`: Páginas de la aplicación organizadas por rol (admin, user, shared).
- `src/services`: Capa de abstracción para APIs y Firebase.
- `src/utils`: Helpers, constantes y date-fns.
- `docs/`: Guías y manuales técnicos.
- `scripts/`: Scripts de automatización (PowerShell).

## Flujo de Autenticación
La app usa Firebase Auth con persistencia `LOCAL`. El `RoleGuard` protege las rutas basándose en el campo `role` del documento del usuario en Firestore.

## Estrategia PWA
Se utiliza `vite-plugin-pwa` para generar un Service Worker que permite el funcionamiento offline. Las rutas de Firebase están excluidas del cache para asegurar datos frescos cuando hay conexión.
