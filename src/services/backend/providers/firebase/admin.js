import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { FIRESTORE_COLLECTIONS } from '../../../../utils/constants';

/**
 * Actualiza el tipo de empleado de un usuario (solo admin)
 * @param {string} uid - UID del usuario
 * @param {string} employeeType - Tipo de empleado ('onsite' | 'remote')
 * @returns {Promise<void>}
 */
export const updateEmployeeType = async (uid, employeeType) => {
    try {
        const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
        await updateDoc(userRef, {
            employeeType
        });
    } catch (error) {
        console.error('Error updating employee type:', error);
        throw error;
    }
};

/**
 * Obtiene o crea la configuración del sistema
 * @returns {Promise<Object>} Configuración del sistema
 */
export const getSystemConfig = async () => {
    try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { SYSTEM_CONFIG_DOC_ID, COLLECTIONS } = await import('../../../../config/appConfig');

        const configRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, SYSTEM_CONFIG_DOC_ID);
        const configDoc = await getDoc(configRef);

        if (configDoc.exists()) {
            return configDoc.data();
        }

        // Si no existe, retornar configuración por defecto
        const { DEFAULT_GEOFENCE } = await import('../../../../config/appConfig');
        return {
            churchLocation: DEFAULT_GEOFENCE
        };
    } catch (error) {
        console.error('Error getting system config:', error);
        throw error;
    }
};

/**
 * Actualiza la configuración del sistema (solo admin)
 * @param {Object} config - Nueva configuración
 * @param {Object} config.churchLocation - Ubicación de la iglesia
 * @returns {Promise<void>}
 */
export const updateSystemConfig = async (config) => {
    try {
        const { setDoc, doc } = await import('firebase/firestore');
        const { SYSTEM_CONFIG_DOC_ID, COLLECTIONS } = await import('../../../../config/appConfig');

        const configRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, SYSTEM_CONFIG_DOC_ID);
        await setDoc(configRef, config, { merge: true });
    } catch (error) {
        console.error('Error updating system config:', error);
        throw error;
    }
};
