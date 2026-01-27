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

// GPS Configuration
export const GPS_CONFIG = {
    TIMEOUT: 10000,           // 10 seconds timeout for GPS request
    MAXIMUM_AGE: 30000,       // Accept cached position up to 30 seconds old
    ENABLE_HIGH_ACCURACY: true, // Request high accuracy GPS
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
export const COLLECTIONS = {
    USERS: 'users',
    ATTENDANCE_RECORDS: 'attendanceRecords',
    SYSTEM_CONFIG: 'systemConfig',
};

// System Config Document ID
export const SYSTEM_CONFIG_DOC_ID = 'main';
