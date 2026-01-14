import { validateQRHash } from './qrCrypto';
import { getDailyQR } from '../firebase/firestore';
import { getTodayISO } from '../../utils/dateHelpers';

/**
 * Valida un QR escaneado
 * @param {string} scannedHash - Hash del QR escaneado
 * @returns {Promise<Object>} Resultado de la validación
 */
export const validateScannedQR = async (scannedHash) => {
    try {
        const today = getTodayISO();

        // Obtener el QR del día desde Firestore
        const dailyQR = await getDailyQR(today);

        if (!dailyQR) {
            return {
                isValid: false,
                error: 'No hay código QR generado para hoy'
            };
        }

        // Verificar si el QR ha expirado
        const now = new Date();
        const expiresAt = dailyQR.expiresAt.toDate();

        if (now > expiresAt) {
            return {
                isValid: false,
                error: 'El código QR ha expirado'
            };
        }

        // Validar el hash
        const isValidHash = scannedHash === dailyQR.qrHash;

        if (!isValidHash) {
            return {
                isValid: false,
                error: 'Código QR inválido'
            };
        }

        return {
            isValid: true,
            qrHash: scannedHash,
            date: today
        };
    } catch (error) {
        console.error('Error validating QR:', error);
        return {
            isValid: false,
            error: 'Error al validar el código QR'
        };
    }
};

/**
 * Valida que el QR sea para el día actual
 * @param {string} date - Fecha del QR
 * @returns {boolean} True si es para hoy
 */
export const isQRForToday = (date) => {
    return date === getTodayISO();
};
