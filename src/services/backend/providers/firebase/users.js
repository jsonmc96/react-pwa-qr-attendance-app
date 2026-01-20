import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { FIRESTORE_COLLECTIONS } from '../../../../utils/constants';

/**
 * Obtiene el perfil de un usuario
 * @param {string} uid - UID del usuario
 * @returns {Promise<{uid, email, displayName, role}>}
 */
export const getProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, uid));

        if (!userDoc.exists()) {
            throw new Error('Usuario no encontrado');
        }

        const userData = userDoc.data();

        return {
            uid,
            email: userData.email,
            displayName: userData.displayName || userData.email,
            role: userData.role
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};
