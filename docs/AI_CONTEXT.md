# Contexto para IA (Asistentes de Programación)

Este documento sirve como base de conocimiento para cualquier IA que trabaje en este repositorio.

## Convenciones de Código
- **Estilo**: Mobile-first, diseño premium (glassmorphism, gradientes suaves).
- **Componentes**: Deben ser funcionales y usar Hooks.
- **Rendimiento**: Evitar re-renders innecesarios en componentes pesados (como cámaras o mapas) usando `memo`.
- **Nombres**: Usar inglés para variables/código y español para la interfaz de usuario.

## Estado del Proyecto (Abril 2026)
- Se integró un módulo de **Parqueadero** que permite controlar portones vía API y visualizar cámaras.
- Se optimizó el **Lector QR** para que sea "instantáneo".
- La app soporta roles de **Administrador** y **Empleado**.

## Notas Técnicas Críticas
1. **Compatibilidad**: El entorno de ejecución actual es **Node 16**. Debido a esto, se usa **Vite 4** (downgraded desde Vite 5) para evitar errores con la API de Web Crypto. NO actualizar Vite a v5 a menos que se actualice Node a v18+.
2. **Firebase**: Los documentos de usuario en Firestore DEBEN tener un campo `role` (`admin` o `user`).
3. **PWA**: El Service Worker está configurado para `autoUpdate`.

## Módulos Implementados
- Asistencia por QR (Generación y Escaneo).
- Historial de Asistencia (Calendario interactivo).
- Ranking de puntualidad.
- Control de Parqueadero (Acceso remoto y video).
