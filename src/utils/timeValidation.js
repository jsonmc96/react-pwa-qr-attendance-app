/**
 * Time Validation Utilities
 * Handles timezone-aware time validation for Ecuador timezone
 */

import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';
import { TIMEZONE, ATTENDANCE_WINDOW, VALIDATION_MESSAGES } from '../config/appConfig';

/**
 * Get current time in Ecuador timezone
 * @returns {Date} Current date/time in Ecuador timezone
 */
export const getEcuadorTime = () => {
    const now = new Date();
    return toZonedTime(now, TIMEZONE.ECUADOR);
};

/**
 * Check if current time is within allowed attendance window
 * Reads configuration dynamically from Firestore
 * @returns {Promise<Object>} { isValid: boolean, message: string, ecuadorTime: Date, config: Object }
 */
export const isWithinAllowedTime = async () => {
    const ecuadorTime = getEcuadorTime();
    const currentHour = ecuadorTime.getHours();
    const currentMinute = ecuadorTime.getMinutes();
    const currentDay = ecuadorTime.getDay(); // 0=Sunday, 6=Saturday

    // Importar dinámicamente para evitar dependencia circular
    const { getAttendanceWindowConfig } = await import('../services/firebase/systemConfigService');

    // Obtener configuración desde Firestore (con cache)
    const config = await getAttendanceWindowConfig();

    const { startHour, startMinute, endHour, endMinute, toleranceMinutes = 0, activeDays = [0, 1, 2, 3, 4, 5, 6] } = config;

    // Verificar si hoy es un día activo
    if (!activeDays.includes(currentDay)) {
        return {
            isValid: false,
            message: 'Hoy no es un día de asistencia configurado.',
            ecuadorTime,
            config,
        };
    }

    // Convert to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute + toleranceMinutes;

    const isValid = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;

    let message;
    if (currentTimeInMinutes < startTimeInMinutes) {
        const startTime = formatTime(startHour, startMinute);
        const endTime = formatTime(endHour, endMinute);
        message = `La ventana de asistencia aún no ha comenzado. Disponible de ${startTime} a ${endTime}.`;
    } else if (currentTimeInMinutes > endTimeInMinutes) {
        const startTime = formatTime(startHour, startMinute);
        const endTime = formatTime(endHour, endMinute);
        message = `La ventana de asistencia ha finalizado. Disponible de ${startTime} a ${endTime}.`;
    } else {
        message = VALIDATION_MESSAGES.TIME_WINDOW.ACTIVE;
    }

    return {
        isValid,
        message,
        ecuadorTime,
        config,
    };
};

/**
 * Helper function to format time
 * @private
 */
const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
};

/**
 * Get formatted time string in Ecuador timezone
 * @param {Date} date - Date to format (optional, defaults to now)
 * @param {string} formatStr - Format string (default: 'HH:mm:ss')
 * @returns {string} Formatted time string
 */
export const getFormattedEcuadorTime = (date = new Date(), formatStr = 'HH:mm:ss') => {
    return formatInTimeZone(date, TIMEZONE.ECUADOR, formatStr);
};

/**
 * Calculate time until attendance window starts
 * @returns {Promise<Object>} { milliseconds: number, minutes: number, isWindowOpen: boolean }
 */
export const getTimeUntilWindow = async () => {
    const ecuadorTime = getEcuadorTime();
    const currentHour = ecuadorTime.getHours();
    const currentMinute = ecuadorTime.getMinutes();

    // Importar dinámicamente para evitar dependencia circular
    const { getAttendanceWindowConfig } = await import('../services/firebase/systemConfigService');
    const config = await getAttendanceWindowConfig();

    const { startHour, startMinute, endHour, endMinute, toleranceMinutes = 0 } = config;

    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute + toleranceMinutes;

    // Window is currently open
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        const remainingMinutes = endTimeInMinutes - currentTimeInMinutes;
        return {
            milliseconds: remainingMinutes * 60 * 1000,
            minutes: remainingMinutes,
            isWindowOpen: true,
            isBeforeWindow: false,
            isAfterWindow: false,
        };
    }

    // Before window
    if (currentTimeInMinutes < startTimeInMinutes) {
        const minutesUntilStart = startTimeInMinutes - currentTimeInMinutes;
        return {
            milliseconds: minutesUntilStart * 60 * 1000,
            minutes: minutesUntilStart,
            isWindowOpen: false,
            isBeforeWindow: true,
            isAfterWindow: false,
        };
    }

    // After window (calculate time until tomorrow's window)
    const minutesUntilTomorrow = (24 * 60) - currentTimeInMinutes + startTimeInMinutes;
    return {
        milliseconds: minutesUntilTomorrow * 60 * 1000,
        minutes: minutesUntilTomorrow,
        isWindowOpen: false,
        isBeforeWindow: false,
        isAfterWindow: true,
    };
};

/**
 * Get attendance window display string
 * @returns {Promise<string>} "07:00 - 09:30 AM"
 */
export const getAttendanceWindowDisplay = async () => {
    // Importar dinámicamente para evitar dependencia circular
    const { getAttendanceWindowConfig } = await import('../services/firebase/systemConfigService');
    const config = await getAttendanceWindowConfig();

    const { startHour, startMinute, endHour, endMinute } = config;

    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
};
