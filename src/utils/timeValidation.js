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
 * Check if current time is within allowed attendance window (07:00-07:31 AM Ecuador)
 * @returns {Object} { isValid: boolean, message: string, ecuadorTime: Date }
 */
export const isWithinAllowedTime = () => {
    const ecuadorTime = getEcuadorTime();
    const currentHour = ecuadorTime.getHours();
    const currentMinute = ecuadorTime.getMinutes();

    const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE } = ATTENDANCE_WINDOW;

    // Convert to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = START_HOUR * 60 + START_MINUTE;
    const endTimeInMinutes = END_HOUR * 60 + END_MINUTE;

    const isValid = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;

    let message;
    if (currentTimeInMinutes < startTimeInMinutes) {
        message = VALIDATION_MESSAGES.TIME_WINDOW.BEFORE;
    } else if (currentTimeInMinutes > endTimeInMinutes) {
        message = VALIDATION_MESSAGES.TIME_WINDOW.AFTER;
    } else {
        message = VALIDATION_MESSAGES.TIME_WINDOW.ACTIVE;
    }

    return {
        isValid,
        message,
        ecuadorTime,
    };
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
 * @returns {Object} { milliseconds: number, minutes: number, isWindowOpen: boolean }
 */
export const getTimeUntilWindow = () => {
    const ecuadorTime = getEcuadorTime();
    const currentHour = ecuadorTime.getHours();
    const currentMinute = ecuadorTime.getMinutes();

    const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE } = ATTENDANCE_WINDOW;

    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = START_HOUR * 60 + START_MINUTE;
    const endTimeInMinutes = END_HOUR * 60 + END_MINUTE;

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
 * @returns {string} "07:00 - 07:31 AM"
 */
export const getAttendanceWindowDisplay = () => {
    const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE } = ATTENDANCE_WINDOW;

    const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };

    return `${formatTime(START_HOUR, START_MINUTE)} - ${formatTime(END_HOUR, END_MINUTE)}`;
};
