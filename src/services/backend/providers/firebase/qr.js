import { generateDailyQR, getTodayQR, regenerateDailyQR } from '../../../qr/qrGenerator';

/**
 * Genera el QR del día (admin)
 * @param {string} adminUid - UID del admin
 * @returns {Promise<{qrHash, date, isNew}>}
 */
export const generateToday = async (adminUid) => {
    return await generateDailyQR(adminUid);
};

/**
 * Obtiene el QR del día actual
 * @returns {Promise<{qrHash, date} | null>}
 */
export const getToday = async () => {
    return await getTodayQR();
};

/**
 * Regenera el QR del día (admin)
 * @param {string} adminUid - UID del admin
 * @returns {Promise<{qrHash, date, isNew}>}
 */
export const regenerateToday = async (adminUid) => {
    return await regenerateDailyQR(adminUid);
};
