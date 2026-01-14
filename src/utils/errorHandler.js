import { MESSAGES } from './constants';

/**
 * Maneja errores de Firebase
 * @param {Error} error - Error de Firebase
 * @returns {string} Mensaje de error amigable
 */
export const handleFirebaseError = (error) => {
    const errorCode = error.code;

    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Email o contraseña incorrectos';

        case 'auth/email-already-in-use':
            return 'Este email ya está registrado';

        case 'auth/weak-password':
            return 'La contraseña es muy débil';

        case 'auth/invalid-email':
            return 'Email inválido';

        case 'auth/network-request-failed':
            return MESSAGES.ERROR.NETWORK_ERROR;

        case 'permission-denied':
            return 'No tienes permisos para realizar esta acción';

        case 'unavailable':
            return 'Servicio no disponible. Intenta más tarde';

        default:
            console.error('Firebase error:', error);
            return MESSAGES.ERROR.GENERIC;
    }
};

/**
 * Maneja errores genéricos
 * @param {Error} error - Error
 * @param {string} context - Contexto del error
 */
export const logError = (error, context = '') => {
    console.error(`[Error ${context}]:`, error);
};

/**
 * Crea un objeto de error personalizado
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error
 * @returns {Object} Objeto de error
 */
export const createError = (message, code = 'GENERIC_ERROR') => {
    return {
        message,
        code,
        timestamp: new Date().toISOString()
    };
};
