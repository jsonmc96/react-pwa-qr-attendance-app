import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { FIRESTORE_COLLECTIONS } from '../../../../utils/constants';

/**
 * Obtiene el perfil de un usuario
 * @param {string} uid - UID del usuario
 * @returns {Promise<{uid, email, displayName, role, employeeType}>}
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
            role: userData.role,
            employeeType: userData.employeeType || 'remote' // Default to remote if not set
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Obtiene todos los usuarios (para ranking/admin)
 * @returns {Promise<Array>} Array de usuarios
 */
export const getAllUsers = async () => {
    try {
        const usersRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
        // Obtener TODOS los usuarios (incluyendo admins)
        const snapshot = await getDocs(usersRef);

        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};
