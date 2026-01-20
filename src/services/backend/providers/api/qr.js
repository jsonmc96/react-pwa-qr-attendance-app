import { fetchWithAuth } from './auth';
import { ENDPOINTS } from './config';

/**
 * Genera el QR del día (admin)
 * @param {string} adminUid - UID del admin
 * @returns {Promise<{qrHash, date, isNew}>}
 */
export const generateToday = async (adminUid) => {
    try {
        const response = await fetchWithAuth(ENDPOINTS.QR.GENERATE, {
            method: 'POST',
            body: JSON.stringify({ adminUid })
        });

        if (!response.ok) {
            throw new Error('Error generando QR');
        }

        return await response.json();
    } catch (error) {
        console.error('Error generating QR:', error);
        throw error;
    }
};

/**
 * Obtiene el QR del día actual
 * @returns {Promise<{qrHash, date} | null>}
 */
export const getToday = async () => {
    try {
        const response = await fetchWithAuth(ENDPOINTS.QR.TODAY);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Error obteniendo QR del día');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting today QR:', error);
        throw error;
    }
};

/**
 * Regenera el QR del día (admin)
 * @param {string} adminUid - UID del admin
 * @returns {Promise<{qrHash, date, isNew}>}
 */
export const regenerateToday = async (adminUid) => {
    try {
        const response = await fetchWithAuth(ENDPOINTS.QR.REGENERATE, {
            method: 'POST',
            body: JSON.stringify({ adminUid })
        });

        if (!response.ok) {
            throw new Error('Error regenerando QR');
        }

        return await response.json();
    } catch (error) {
        console.error('Error regenerating QR:', error);
        throw error;
    }
};
