/**
 * Configuración del API REST
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh'
    },
    USERS: {
        PROFILE: '/api/users' // + /:uid
    },
    QR: {
        GENERATE: '/api/qr/generate',
        TODAY: '/api/qr/today',
        REGENERATE: '/api/qr/regenerate'
    },
    ATTENDANCE: {
        SCAN: '/api/attendance/scan',
        MONTHLY: '/api/attendance/monthly',
        CAN_REGISTER: '/api/attendance/can-register'
    }
};
