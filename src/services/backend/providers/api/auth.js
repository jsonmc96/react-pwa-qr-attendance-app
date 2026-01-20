import { API_BASE_URL, ENDPOINTS } from './config';

// Estado en memoria
let accessToken = null;
let currentUser = null;
let authChangeCallbacks = [];

/**
 * Helper para hacer fetch con autenticación
 * Maneja refresh automático si el token expiró
 */
export const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Agregar token si existe
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    // Si es 401, intentar refresh y reintentar
    if (response.status === 401 && accessToken) {
        console.log('🔄 Token expirado, intentando refresh...');
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            // Reintentar request con nuevo token
            headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers
            });
        } else {
            // Refresh falló, limpiar sesión
            await logout();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
    }

    return response;
};

/**
 * Refresca el access token usando el refresh token
 * @returns {Promise<boolean>} True si se refrescó exitosamente
 */
const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        // Actualizar tokens
        accessToken = data.accessToken;

        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        console.log('✅ Token refrescado exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error refrescando token:', error);
        return false;
    }
};

/**
 * Intenta restaurar sesión al iniciar la app
 * Se llama automáticamente al cargar el módulo
 */
const initSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.log('🚪 No hay sesión guardada');
        notifyAuthChange(null);
        return;
    }

    console.log('🔑 Sesión detectada, restaurando...');

    const refreshed = await refreshAccessToken();

    if (refreshed) {
        // Obtener datos del usuario
        try {
            const response = await fetchWithAuth('/api/auth/me');

            if (response.ok) {
                const userData = await response.json();
                currentUser = userData;
                console.log('✅ Sesión restaurada:', userData.email);
                notifyAuthChange(currentUser);
            } else {
                console.warn('⚠️ No se pudo obtener datos del usuario');
                await logout();
            }
        } catch (error) {
            console.error('❌ Error restaurando sesión:', error);
            await logout();
        }
    } else {
        console.log('🚪 Refresh token inválido');
        await logout();
    }
};

/**
 * Notifica a todos los callbacks registrados sobre cambios de auth
 */
const notifyAuthChange = (userData) => {
    authChangeCallbacks.forEach(callback => {
        try {
            callback(userData);
        } catch (error) {
            console.error('Error en auth callback:', error);
        }
    });
};

/**
 * Login con email y contraseña
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{uid, email, displayName, role, accessToken}>}
 */
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        const data = await response.json();

        // Guardar tokens
        accessToken = data.accessToken;
        localStorage.setItem('refreshToken', data.refreshToken);

        // Guardar usuario
        currentUser = {
            uid: data.user.uid,
            email: data.user.email,
            displayName: data.user.displayName,
            role: data.user.role
        };

        console.log('✅ Login exitoso:', currentUser.email);

        // Notificar cambio
        notifyAuthChange(currentUser);

        return {
            ...currentUser,
            accessToken
        };
    } catch (error) {
        console.error('❌ Error en login:', error);
        throw error;
    }
};

/**
 * Cierra sesión
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        // Intentar notificar al servidor (opcional)
        if (accessToken) {
            try {
                await fetchWithAuth(ENDPOINTS.AUTH.LOGOUT, {
                    method: 'POST'
                });
            } catch (e) {
                // Ignorar errores del servidor en logout
                console.warn('Error notificando logout al servidor:', e);
            }
        }
    } finally {
        // Limpiar estado local
        accessToken = null;
        currentUser = null;
        localStorage.removeItem('refreshToken');

        console.log('✅ Sesión cerrada');

        // Notificar cambio
        notifyAuthChange(null);
    }
};

/**
 * Observa cambios en autenticación
 * @param {Function} callback - Recibe (userData | null)
 * @returns {Function} Cleanup function
 */
export const onAuthChange = (callback) => {
    // Agregar callback
    authChangeCallbacks.push(callback);

    // Ejecutar inmediatamente con estado actual
    callback(currentUser);

    // Retornar función de cleanup
    return () => {
        const index = authChangeCallbacks.indexOf(callback);
        if (index > -1) {
            authChangeCallbacks.splice(index, 1);
        }
    };
};

/**
 * Obtiene la sesión actual (sincrónico)
 * @returns {{uid, email, displayName, role} | null}
 */
export const getSession = () => {
    return currentUser;
};

// Inicializar sesión al cargar el módulo
initSession().catch(err => {
    console.error('Error en inicialización de sesión:', err);
});
