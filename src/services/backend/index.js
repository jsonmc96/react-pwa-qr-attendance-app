/**
 * Backend Abstraction Layer
 * 
 * Selector que determina qué provider usar según VITE_BACKEND_PROVIDER
 * Soporta: 'firebase' | 'api'
 * 
 * Uso:
 * import { backend } from './services/backend';
 * await backend.auth.login(email, password);
 */

const BACKEND_PROVIDER = import.meta.env.VITE_BACKEND_PROVIDER || 'firebase';

console.log(`🔧 Backend Provider: ${BACKEND_PROVIDER}`);

// Lazy loading de providers
let providersPromise = null;

const loadProviders = async () => {
    if (providersPromise) return providersPromise;

    providersPromise = (async () => {
        if (BACKEND_PROVIDER === 'api') {
            // REST API Provider
            const [authProvider, usersProvider, qrProvider, attendanceProvider] = await Promise.all([
                import('./providers/api/auth.js'),
                import('./providers/api/users.js'),
                import('./providers/api/qr.js'),
                import('./providers/api/attendance.js')
            ]);

            console.log('✅ API Provider cargado');
            return { authProvider, usersProvider, qrProvider, attendanceProvider };
        } else {
            // Firebase Provider (default)
            const [authProvider, usersProvider, qrProvider, attendanceProvider] = await Promise.all([
                import('./providers/firebase/auth.js'),
                import('./providers/firebase/users.js'),
                import('./providers/firebase/qr.js'),
                import('./providers/firebase/attendance.js')
            ]);

            console.log('✅ Firebase Provider cargado');
            return { authProvider, usersProvider, qrProvider, attendanceProvider };
        }
    })();

    return providersPromise;
};

// Pre-cargar providers inmediatamente
loadProviders();

/**
 * Backend unificado
 * Expone la misma interfaz independientemente del provider
 */
export const backend = {
    /**
     * Autenticación
     */
    auth: {
        /**
         * Login con email y contraseña
         * @param {string} email 
         * @param {string} password 
         * @returns {Promise<{uid, email, displayName, role, accessToken?}>}
         */
        login: async (email, password) => {
            const { authProvider } = await loadProviders();
            return authProvider.login(email, password);
        },

        /**
         * Cierra sesión
         * @returns {Promise<void>}
         */
        logout: async () => {
            const { authProvider } = await loadProviders();
            return authProvider.logout();
        },

        /**
         * Observa cambios en autenticación
         * @param {Function} callback - Recibe (userData | null)
         * @returns {Function} Cleanup function
         */
        onAuthChange: (callback) => {
            let cleanup = () => { };
            loadProviders().then(({ authProvider }) => {
                cleanup = authProvider.onAuthChange(callback);
            });
            return () => cleanup();
        },

        /**
         * Obtiene la sesión actual (sincrónico cuando ya está cargado)
         * @returns {{uid, email, displayName, role} | null}
         */
        getSession: () => {
            // Intentar obtener de forma sincrónica si ya está cargado
            if (!providersPromise) return null;

            // Si los providers ya están cargados, obtener sincrónicamente
            let session = null;
            loadProviders().then(({ authProvider }) => {
                session = authProvider.getSession();
            });
            return session;
        }
    },

    /**
     * Usuarios
     */
    users: {
        /**
         * Obtiene el perfil de un usuario
         * @param {string} uid 
         * @returns {Promise<{uid, email, displayName, role}>}
         */
        getProfile: async (uid) => {
            const { usersProvider } = await loadProviders();
            return usersProvider.getProfile(uid);
        }
    },

    /**
     * QR Codes
     */
    qr: {
        /**
         * Genera el QR del día (admin)
         * @param {string} adminUid 
         * @returns {Promise<{qrHash, date, isNew}>}
         */
        generateToday: async (adminUid) => {
            const { qrProvider } = await loadProviders();
            return qrProvider.generateToday(adminUid);
        },

        /**
         * Obtiene el QR del día actual
         * @returns {Promise<{qrHash, date} | null>}
         */
        getToday: async () => {
            const { qrProvider } = await loadProviders();
            return qrProvider.getToday();
        },

        /**
         * Regenera el QR del día (admin)
         * @param {string} adminUid 
         * @returns {Promise<{qrHash, date, isNew}>}
         */
        regenerateToday: async (adminUid) => {
            const { qrProvider } = await loadProviders();
            return qrProvider.regenerateToday(adminUid);
        }
    },

    /**
     * Asistencia
     */
    attendance: {
        /**
         * Registra asistencia escaneando QR
         * @param {string} userId 
         * @param {string} qrHash 
         * @param {Object} userData - Datos del usuario (opcional)
         * @param {Object} locationData - Datos de ubicación GPS (opcional)
         * @returns {Promise<{success, message?, error?, date?}>}
         */
        scanQr: async (userId, qrHash, userData = null, locationData = null) => {
            const { attendanceProvider } = await loadProviders();
            return attendanceProvider.scanQr(userId, qrHash, userData, locationData);
        },

        /**
         * Obtiene asistencia mensual
         * @param {string} userId 
         * @param {Date} monthDate 
         * @returns {Promise<Array<string>>} Array de fechas ISO
         */
        getMonthly: async (userId, monthDate) => {
            const { attendanceProvider } = await loadProviders();
            return attendanceProvider.getMonthly(userId, monthDate);
        },

        /**
         * Verifica si puede registrar asistencia hoy
         * @param {string} userId 
         * @returns {Promise<{canRegister, message?}>}
         */
        canRegisterToday: async (userId) => {
            const { attendanceProvider } = await loadProviders();
            return attendanceProvider.canRegisterToday(userId);
        }
    }
};
