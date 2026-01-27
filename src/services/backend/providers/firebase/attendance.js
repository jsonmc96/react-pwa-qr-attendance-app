import { processAttendance, getMonthlyAttendance, canRegisterToday as canRegister } from '../../../attendance/attendanceService';

/**
 * Registra asistencia escaneando QR
 * @param {string} userId - UID del usuario
 * @param {string} qrHash - Hash del QR escaneado
 * @param {Object} userData - Datos del usuario (opcional)
 * @param {Object} locationData - Datos de ubicación GPS (opcional)
 * @returns {Promise<{success, message?, error?, date?}>}
 */
export const scanQr = async (userId, qrHash, userData = null, locationData = null) => {
    return await processAttendance(userId, qrHash, userData, locationData);
};

/**
 * Obtiene asistencia mensual
 * @param {string} userId - UID del usuario
 * @param {Date} monthDate - Fecha del mes
 * @returns {Promise<Array<string>>} Array de fechas ISO
 */
export const getMonthly = async (userId, monthDate) => {
    return await getMonthlyAttendance(userId, monthDate);
};

/**
 * Verifica si puede registrar asistencia hoy
 * @param {string} userId - UID del usuario
 * @returns {Promise<{canRegister, message?}>}
 */
export const canRegisterToday = async (userId) => {
    return await canRegister(userId);
};
