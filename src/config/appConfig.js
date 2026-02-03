/**
 * Application Configuration
 * Centralizes all app-wide constants and settings
 */

// Timezone Configuration
export const TIMEZONE = {
    ECUADOR: 'America/Guayaquil', // UTC-5
};

// Attendance Time Window (Ecuador Time)
export const ATTENDANCE_WINDOW = {
    START_HOUR: 7,
    START_MINUTE: 0,
    END_HOUR: 9,//7
    END_MINUTE: 30,//31
};

// Employee Types
export const EMPLOYEE_TYPES = {
    ONSITE: 'onsite',     // Presencial - requires GPS validation
    REMOTE: 'remote',     // Remoto - no GPS required
};

// Geofence Configuration (Default: Quito, Ecuador)
// Admins can update this from the admin panel
export const DEFAULT_GEOFENCE = {
    lat: -0.1807,         // Latitude (example: Quito)
    lng: -78.4678,        // Longitude (example: Quito)
    radiusMeters: 100,    // Tolerance radius in meters
};

// GPS Configuration - Estrategia de 2 intentos para mejor performance indoor
export const GPS_CONFIG = {
    // Primer intento: Network-based (cell towers + WiFi) - Rápido
    FIRST_ATTEMPT: {
        timeout: 8000,              // 8s para intento rápido
        enableHighAccuracy: false,  // Usar cell towers/WiFi (rápido)
        maximumAge: 30000           // Aceptar cache de hasta 30s
    },
    // Segundo intento: GPS satelital - Preciso pero lento
    SECOND_ATTEMPT: {
        timeout: 30000,             // 30s para GPS satelital (iOS indoor)
        enableHighAccuracy: true,   // Usar GPS satelital (preciso)
        maximumAge: 0               // No usar cache (posición fresca)
    },
    // Radio de tolerancia aumentado para interiores
    TOLERANCE_METERS: 150  // 150m (antes 100m) para compensar error GPS indoor
};

// Validation Messages
export const VALIDATION_MESSAGES = {
    TIME_WINDOW: {
        BEFORE: 'La ventana de asistencia aún no ha comenzado. Disponible de 07:00 a 09:30 AM.',
        AFTER: 'La ventana de asistencia ha finalizado. Disponible de 07:00 a 09:30 AM.',
        ACTIVE: 'Ventana de asistencia activa',
    },
    LOCATION: {
        PERMISSION_DENIED: 'Permisos de ubicación denegados. Necesarios para empleados presenciales.',
        UNAVAILABLE: 'No se pudo obtener tu ubicación. Verifica tu GPS.',
        TIMEOUT: 'Tiempo de espera agotado al obtener ubicación.',
        OUT_OF_RANGE: 'Estás fuera del área permitida. Debes estar en la iglesia.',
        WITHIN_RANGE: 'Ubicación verificada correctamente',
    },
    EMPLOYEE_TYPE: {
        NOT_SET: 'Tu tipo de empleado no está configurado. Contacta al administrador.',
    },
};

// Firestore Collection Names
// Firestore Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    ATTENDANCE_RECORDS: 'attendance', // Unified to match firestore.rules
    SYSTEM_CONFIG: 'systemConfig',
};

// System Config Document ID
export const SYSTEM_CONFIG_DOC_ID = 'main';
