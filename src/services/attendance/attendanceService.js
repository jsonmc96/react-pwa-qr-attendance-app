import { registerAttendance, hasAttendanceToday, getUserAttendance } from '../firebase/firestore';
import { validateScannedQR } from '../qr/qrValidator';
import { getTodayISO } from '../../utils/dateHelpers';
import { MESSAGES } from '../../utils/constants';

/**
 * Procesa el registro de asistencia
 * @param {string} userId - UID del usuario
 * @param {string} scannedHash - Hash del QR escaneado
 * @returns {Promise<Object>} Resultado del registro
 */
export const processAttendance = async (userId, scannedHash) => {
    try {
        const today = getTodayISO();

        // 1. Verificar si ya registró hoy
        const alreadyRegistered = await hasAttendanceToday(userId, today);

        if (alreadyRegistered) {
            return {
                success: false,
                error: MESSAGES.ERROR.ALREADY_REGISTERED
            };
        }

        // 2. Validar el QR escaneado
        const validation = await validateScannedQR(scannedHash);

        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error || MESSAGES.ERROR.INVALID_QR
            };
        }

        // 3. Registrar asistencia
        await registerAttendance(userId, today, scannedHash);

        // Vibración de éxito (si está disponible)
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }

        return {
            success: true,
            message: MESSAGES.SUCCESS.ATTENDANCE_REGISTERED,
            date: today
        };
    } catch (error) {
        console.error('Error processing attendance:', error);
        return {
            success: false,
            error: error.message || MESSAGES.ERROR.GENERIC
        };
    }
};

/**
 * Obtiene el historial de asistencia de un usuario para un mes
 * @param {string} userId - UID del usuario
 * @param {Date} monthDate - Fecha del mes a consultar
 * @returns {Promise<Array>} Array de fechas con asistencia
 */
export const getMonthlyAttendance = async (userId, monthDate) => {
    try {
        const year = monthDate.getFullYear();
        const month = String(monthDate.getMonth() + 1).padStart(2, '0');

        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, monthDate.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const attendance = await getUserAttendance(userId, startDate, endDate);

        // Retornar solo las fechas
        return attendance.map(record => record.date);
    } catch (error) {
        console.error('Error getting monthly attendance:', error);
        throw error;
    }
};

/**
 * Verifica si el usuario puede registrar asistencia hoy
 * @param {string} userId - UID del usuario
 * @returns {Promise<Object>} Estado de elegibilidad
 */
export const canRegisterToday = async (userId) => {
    try {
        const today = getTodayISO();
        const alreadyRegistered = await hasAttendanceToday(userId, today);

        return {
            canRegister: !alreadyRegistered,
            message: alreadyRegistered ? MESSAGES.ERROR.ALREADY_REGISTERED : null
        };
    } catch (error) {
        console.error('Error checking registration eligibility:', error);
        return {
            canRegister: false,
            message: MESSAGES.ERROR.GENERIC
        };
    }
};
