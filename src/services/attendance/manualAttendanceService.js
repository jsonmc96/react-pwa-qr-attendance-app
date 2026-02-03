import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../../config/appConfig';
import { hasAttendanceToday } from '../firebase/firestore';

/**
 * Registra asistencia manual por parte de un administrador
 * @param {string} adminUid - UID del administrador que registra
 * @param {string} userId - UID del usuario al que se le registra asistencia
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} reason - Motivo del registro manual (opcional)
 * @returns {Promise<Object>} Resultado del registro
 */
export const registerManualAttendance = async (adminUid, userId, date, reason = '') => {
    try {
        console.log('[ManualAttendance] ===== STARTING REGISTRATION =====');

        // Validar que no exista ya un registro para esta fecha
        const alreadyRegistered = await hasAttendanceToday(userId, date);

        if (alreadyRegistered) {
            throw new Error('El usuario ya tiene asistencia registrada para esta fecha');
        }

        // ID del documento: userId_fecha
        const attendanceId = `${userId}_${date}`;
        const attendanceRef = doc(db, COLLECTIONS.ATTENDANCE_RECORDS, attendanceId);

        // Datos del registro manual
        const attendanceData = {
            userId,
            date,
            timestamp: serverTimestamp(), // Fecha real de la asistencia
            registrationType: 'manual',
            registeredBy: adminUid,
            reason: reason || 'Registro manual por administrador',
            manualRegistrationDate: serverTimestamp(), // Fecha cuando se hizo el registro
        };

        console.log('[ManualAttendance] Attendance ID:', attendanceId);
        console.log('[ManualAttendance] Data to write:', JSON.stringify({
            ...attendanceData,
            timestamp: '[serverTimestamp]',
            manualRegistrationDate: '[serverTimestamp]'
        }, null, 2));

        await setDoc(attendanceRef, attendanceData);

        console.log(`[ManualAttendance] ✅ SUCCESS: Manual attendance registered for user ${userId} on ${date} by admin ${adminUid}`);

        return {
            success: true,
            message: 'Asistencia manual registrada correctamente',
            attendanceId,
        };
    } catch (error) {
        console.error('[ManualAttendance] ❌ ERROR:', error);
        console.error('[ManualAttendance] Error code:', error.code);
        console.error('[ManualAttendance] Error message:', error.message);
        throw error;
    }
};

/**
 * Valida que un usuario tiene permisos de administrador
 * Esta validación también se hace en Firestore rules, pero se verifica aquí para mejor UX
 * @param {Object} user - Usuario a validar
 * @returns {boolean} True si es admin
 */
export const validateAdminPermission = (user) => {
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    if (user.role !== 'admin') {
        throw new Error('Solo administradores pueden registrar asistencia manual');
    }

    return true;
};

/**
 * Obtiene el historial de asistencia manual
 * @param {Object} filters - Filtros opcionales (userId, dateFrom, dateTo)
 * @returns {Promise<Array>} Array de registros de asistencia manual
 */
export const getManualAttendanceHistory = async (filters = {}) => {
    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');

        let q = collection(db, COLLECTIONS.ATTENDANCE_RECORDS);

        // Filtrar solo registros manuales
        q = query(q, where('registrationType', '==', 'manual'));

        // Filtros adicionales
        if (filters.userId) {
            q = query(q, where('userId', '==', filters.userId));
        }

        if (filters.dateFrom) {
            q = query(q, where('date', '>=', filters.dateFrom));
        }

        if (filters.dateTo) {
            q = query(q, where('date', '<=', filters.dateTo));
        }

        const snapshot = await getDocs(q);
        const records = [];

        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return records;
    } catch (error) {
        console.error('Error getting manual attendance history:', error);
        throw error;
    }
};
