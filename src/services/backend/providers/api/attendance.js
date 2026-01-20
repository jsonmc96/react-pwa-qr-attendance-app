import { fetchWithAuth } from './auth';
import { ENDPOINTS } from './config';

/**
 * Registra asistencia escaneando QR
 * @param {string} userId - UID del usuario
 * @param {string} qrHash - Hash del QR escaneado
 * @returns {Promise<{success, message?, error?, date?}>}
 */
export const scanQr = async (userId, qrHash) => {
    try {
        const response = await fetchWithAuth(ENDPOINTS.ATTENDANCE.SCAN, {
            method: 'POST',
            body: JSON.stringify({ userId, qrHash })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'Error registrando asistencia'
            };
        }

        // Vibración de éxito (si está disponible)
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }

        return data;
    } catch (error) {
        console.error('Error scanning QR:', error);
        return {
            success: false,
            error: error.message || 'Error al registrar asistencia'
        };
    }
};

/**
 * Obtiene asistencia mensual
 * @param {string} userId - UID del usuario
 * @param {Date} monthDate - Fecha del mes
 * @returns {Promise<Array<string>>} Array de fechas ISO
 */
export const getMonthly = async (userId, monthDate) => {
    try {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;

        const response = await fetchWithAuth(
            `${ENDPOINTS.ATTENDANCE.MONTHLY}?userId=${userId}&year=${year}&month=${month}`
        );

        if (!response.ok) {
            throw new Error('Error obteniendo asistencia mensual');
        }

        const data = await response.json();

        // Retornar array de fechas
        return data.dates || [];
    } catch (error) {
        console.error('Error getting monthly attendance:', error);
        throw error;
    }
};

/**
 * Verifica si puede registrar asistencia hoy
 * @param {string} userId - UID del usuario
 * @returns {Promise<{canRegister, message?}>}
 */
export const canRegisterToday = async (userId) => {
    try {
        const response = await fetchWithAuth(
            `${ENDPOINTS.ATTENDANCE.CAN_REGISTER}?userId=${userId}`
        );

        if (!response.ok) {
            return {
                canRegister: false,
                message: 'Error verificando elegibilidad'
            };
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking registration eligibility:', error);
        return {
            canRegister: false,
            message: 'Error al verificar registro'
        };
    }
};
