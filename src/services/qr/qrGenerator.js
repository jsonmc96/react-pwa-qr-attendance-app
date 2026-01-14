import { generateQRContent } from './qrCrypto';
import { saveDailyQR, getDailyQR } from '../firebase/firestore';
import { getTodayISO } from '../../utils/dateHelpers';

/**
 * Genera un QR para el día actual
 * @param {string} adminUid - UID del administrador
 * @returns {Promise<Object>} Objeto con el hash del QR y la fecha
 */
export const generateDailyQR = async (adminUid) => {
    try {
        const today = getTodayISO();

        // Verificar si ya existe un QR para hoy
        const existingQR = await getDailyQR(today);

        if (existingQR) {
            return {
                qrHash: existingQR.qrHash,
                date: existingQR.date,
                isNew: false
            };
        }

        // Generar nuevo hash
        const qrHash = await generateQRContent(today);

        // Guardar en Firestore
        await saveDailyQR(today, qrHash, adminUid);

        return {
            qrHash,
            date: today,
            isNew: true
        };
    } catch (error) {
        console.error('Error generating daily QR:', error);
        throw error;
    }
};

/**
 * Obtiene el QR del día actual
 * @returns {Promise<Object|null>} QR del día o null
 */
export const getTodayQR = async () => {
    try {
        const today = getTodayISO();
        return await getDailyQR(today);
    } catch (error) {
        console.error('Error getting today QR:', error);
        throw error;
    }
};

/**
 * Regenera el QR del día (fuerza nueva generación)
 * @param {string} adminUid - UID del administrador
 * @returns {Promise<Object>} Nuevo QR
 */
export const regenerateDailyQR = async (adminUid) => {
    try {
        const today = getTodayISO();
        const qrHash = await generateQRContent(today);

        // Sobrescribir el QR existente
        await saveDailyQR(today, qrHash, adminUid);

        return {
            qrHash,
            date: today,
            isNew: true
        };
    } catch (error) {
        console.error('Error regenerating daily QR:', error);
        throw error;
    }
};
