import { useState, useCallback } from 'react';
import { processAttendance, getMonthlyAttendance, canRegisterToday } from '../services/attendance/attendanceService';

export const useAttendance = (userId) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const registerAttendance = useCallback(async (qrHash) => {
        setLoading(true);
        setError(null);

        try {
            const result = await processAttendance(userId, qrHash);

            if (!result.success) {
                setError(result.error);
                return result;
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Error al registrar asistencia';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const getAttendanceForMonth = useCallback(async (monthDate) => {
        setLoading(true);
        setError(null);

        try {
            const attendanceDates = await getMonthlyAttendance(userId, monthDate);
            return attendanceDates;
        } catch (err) {
            const errorMsg = err.message || 'Error al obtener asistencia';
            setError(errorMsg);
            return [];
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const checkCanRegister = useCallback(async () => {
        try {
            return await canRegisterToday(userId);
        } catch (err) {
            console.error('Error checking registration:', err);
            return { canRegister: false, message: 'Error al verificar registro' };
        }
    }, [userId]);

    return {
        registerAttendance,
        getAttendanceForMonth,
        checkCanRegister,
        loading,
        error,
        clearError: () => setError(null)
    };
};
