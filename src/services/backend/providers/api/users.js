import { fetchWithAuth } from './auth';
import { ENDPOINTS } from './config';

/**
 * Obtiene el perfil de un usuario
 * @param {string} uid - UID del usuario
 * @returns {Promise<{uid, email, displayName, role}>}
 */
export const getProfile = async (uid) => {
    try {
        const response = await fetchWithAuth(`${ENDPOINTS.USERS.PROFILE}/${uid}`);

        if (!response.ok) {
            throw new Error('Error obteniendo perfil de usuario');
        }

        const data = await response.json();

        return {
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            role: data.role
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};
