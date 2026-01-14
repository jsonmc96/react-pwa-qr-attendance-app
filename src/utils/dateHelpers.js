import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha según el formato especificado
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
};

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha actual en formato ISO
 */
export const getTodayISO = () => {
    return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Obtiene todos los días de un mes específico
 * @param {Date} date - Fecha dentro del mes deseado
 * @returns {Date[]} Array de fechas del mes
 */
export const getDaysInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
};

/**
 * Verifica si dos fechas son del mismo día
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {boolean} True si son el mismo día
 */
export const isSameDate = (date1, date2) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isSameDay(d1, d2);
};

/**
 * Verifica si una fecha es hoy
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
export const isDateToday = (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
};

/**
 * Obtiene el nombre del mes en español
 * @param {Date} date - Fecha
 * @returns {string} Nombre del mes
 */
export const getMonthName = (date) => {
    return format(date, 'MMMM yyyy', { locale: es });
};

/**
 * Convierte una fecha ISO a objeto Date
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {Date} Objeto Date
 */
export const parseISODate = (isoDate) => {
    return parseISO(isoDate);
};

/**
 * Obtiene el timestamp actual
 * @returns {number} Timestamp en milisegundos
 */
export const getCurrentTimestamp = () => {
    return Date.now();
};

/**
 * Calcula la medianoche del día siguiente
 * @param {Date} date - Fecha base
 * @returns {Date} Medianoche del día siguiente
 */
export const getNextMidnight = (date = new Date()) => {
    const midnight = new Date(date);
    midnight.setHours(24, 0, 0, 0);
    return midnight;
};
