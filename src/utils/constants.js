// Constantes de la aplicación
export const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

export const ROUTES = {
    LOGIN: '/login',
    ADMIN_DASHBOARD: '/admin',
    ADMIN_GENERATE_QR: '/admin/generate-qr',
    ADMIN_REPORTS: '/admin/reports',
    USER_DASHBOARD: '/user',
    USER_SCAN_QR: '/user/scan-qr',
    USER_SCAN_QR: '/user/scan-qr',
    USER_ATTENDANCE: '/user/attendance',
    RANKING: '/ranking'
};

export const STORAGE_KEYS = {
    THEME: 'app_theme',
    OFFLINE_QUEUE: 'offline_attendance_queue'
};

export const QR_CONFIG = {
    SIZE: 256,
    LEVEL: 'H', // High error correction
    MARGIN: 2
};

export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_LONG: 'EEEE, dd MMMM yyyy',
    ISO: 'yyyy-MM-dd',
    TIME: 'HH:mm:ss'
};

export const MESSAGES = {
    SUCCESS: {
        LOGIN: 'Inicio de sesión exitoso',
        ATTENDANCE_REGISTERED: 'Asistencia registrada correctamente',
        QR_GENERATED: 'Código QR generado exitosamente'
    },
    ERROR: {
        LOGIN_FAILED: 'Error al iniciar sesión. Verifica tus credenciales',
        ALREADY_REGISTERED: 'Ya has registrado tu asistencia hoy',
        INVALID_QR: 'Código QR inválido o expirado',
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
        CAMERA_PERMISSION: 'Se requiere permiso de cámara para escanear el código QR',
        GENERIC: 'Ha ocurrido un error. Intenta nuevamente'
    },
    INFO: {
        OFFLINE_MODE: 'Modo sin conexión. Los datos se sincronizarán cuando vuelvas a estar en línea',
        SYNCING: 'Sincronizando datos...'
    }
};

export const FIRESTORE_COLLECTIONS = {
    USERS: 'users',
    DAILY_QR: 'dailyQR',
    ATTENDANCE: 'attendance'
};
