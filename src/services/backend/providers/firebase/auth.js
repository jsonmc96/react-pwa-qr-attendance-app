import { loginWithEmail, logout as fbLogout, onAuthChange as fbOnAuthChange, getCurrentUser } from '../../../firebase/auth';

/**
 * Login con email y contraseña
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{uid, email, displayName, role}>}
 */
export const login = async (email, password) => {
    return await loginWithEmail(email, password);
};

/**
 * Cierra sesión
 * @returns {Promise<void>}
 */
export const logout = async () => {
    await fbLogout();
};

/**
 * Observa cambios en autenticación
 * @param {Function} callback - Recibe (userData | null)
 * @returns {Function} Cleanup function
 */
export const onAuthChange = (callback) => {
    return fbOnAuthChange(callback);
};

/**
 * Obtiene la sesión actual (sincrónico)
 * @returns {{uid, email, displayName, role} | null}
 */
export const getSession = () => {
    const user = getCurrentUser();
    if (!user) return null;

    // Intentar obtener de sessionStorage cache
    try {
        const cached = sessionStorage.getItem('currentUser');
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn('Error reading session cache:', e);
    }

    return null;
};
