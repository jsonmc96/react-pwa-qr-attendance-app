# Funcionalidades del Sistema

## 1. Registro de Asistencia (QR)
- **Generación (Admin)**: Crea un QR único por día con secreto dinámico.
- **Escaneo (Usuario)**: Validación de ubicación y tiempo para evitar registros fraudulentos.
- **Modo Offline**: Registro de eventos localmente cuando no hay red.

## 2. Gestión de Parqueadero (Nuevo)
- **Control Remoto**: Botones para abrir y cerrar el portón principal integrados con API externa.
- **Visor en Directo**: Streaming de cámara (MJPEG/HLS/iFrame) con soporte de pantalla completa y rotación fluida.
- **Acceso Dual**: Disponible tanto para administradores como para empleados desde el menú inferior.

## 3. Reportes y Rankings
- **Calendario**: Vista mensual de asistencias con indicadores de puntualidad (A tiempo, Tarde, Falta).
- **Ranking**: Gamificación para incentivar la puntualidad entre los empleados.

## 4. Perfil de Usuario
- **QR Personal**: Para identificación rápida.
- **Información del Empleado**: Cargo, tipo de empleado (remoto/presencial).

## 5. Capacidades PWA
- **Instalación**: Banner nativo para instalar en iOS/Android.
- **Offline First**: La interfaz carga instantáneamente gracias al Service Worker.
- **Sincronización**: Los datos se envían al servidor cuando la conexión se restaura.
