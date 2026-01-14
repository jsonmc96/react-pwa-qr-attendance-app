import { getTodayISO } from '../../utils/dateHelpers';

/**
 * Regla: Un usuario solo puede registrar asistencia una vez por día
 * @param {Array} attendanceRecords - Registros de asistencia del usuario
 * @param {string} date - Fecha a verificar
 * @returns {boolean} True si puede registrar
 */
export const canRegisterForDate = (attendanceRecords, date = getTodayISO()) => {
    return !attendanceRecords.some(record => record.date === date);
};

/**
 * Calcula el porcentaje de asistencia
 * @param {number} attendedDays - Días asistidos
 * @param {number} totalDays - Total de días
 * @returns {number} Porcentaje (0-100)
 */
export const calculateAttendancePercentage = (attendedDays, totalDays) => {
    if (totalDays === 0) return 0;
    return Math.round((attendedDays / totalDays) * 100);
};

/**
 * Valida que una fecha sea válida para registro
 * @param {string} date - Fecha en formato ISO
 * @returns {boolean} True si es válida
 */
export const isValidAttendanceDate = (date) => {
    const attendanceDate = new Date(date);
    const today = new Date();

    // Solo se puede registrar asistencia para hoy
    return attendanceDate.toDateString() === today.toDateString();
};
