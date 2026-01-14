import { useCallback } from 'react';
import { getMonthlyAttendance } from '../services/attendance/attendanceService';

/**
 * Hook para cargar asistencia de un mes desde Firestore
 * Hace 1 SOLA consulta por rango de fechas (startOfMonth → endOfMonth)
 * 
 * @param {string} userId - UID del usuario
 * @returns {Object} Funciones para cargar asistencia
 */
export const useMonthlyAttendance = (userId) => {
    /**
     * Carga la asistencia de un mes específico
     * @param {Date} monthDate - Fecha del mes a consultar
     * @returns {Promise<Array<string>>} Array de fechas ISO (YYYY-MM-DD)
     */
    const loadMonth = useCallback(async (monthDate) => {
        if (!userId) {
            console.warn('useMonthlyAttendance: userId is required');
            return [];
        }

        try {
            // Esta función ya hace 1 sola query con rango de fechas
            const dates = await getMonthlyAttendance(userId, monthDate);
            return dates;
        } catch (error) {
            console.error('Error loading monthly attendance:', error);
            return [];
        }
    }, [userId]);

    return {
        loadMonth
    };
};
