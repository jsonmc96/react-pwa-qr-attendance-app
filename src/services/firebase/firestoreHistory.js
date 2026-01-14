import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from './config';
import { FIRESTORE_COLLECTIONS } from '../../utils/constants';

/**
 * Obtiene el historial de QR generados
 * @param {number} limitCount - Número máximo de registros
 * @returns {Promise<Array>} Array de QR generados
 */
export const getQRHistory = async (limitCount = 30) => {
    try {
        const qrRef = collection(db, FIRESTORE_COLLECTIONS.DAILY_QR);
        const q = query(
            qrRef,
            orderBy('generatedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const qrHistory = [];

        querySnapshot.forEach((doc) => {
            qrHistory.push({
                id: doc.id,
                ...doc.data(),
                // Convertir Timestamp a Date
                generatedAt: doc.data().generatedAt?.toDate(),
                expiresAt: doc.data().expiresAt?.toDate()
            });
        });

        return qrHistory;
    } catch (error) {
        console.error('Error getting QR history:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de asistencia por fecha
 * @param {string} date - Fecha en formato ISO
 * @returns {Promise<Object>} Estadísticas del día
 */
export const getAttendanceStats = async (date) => {
    try {
        const attendanceRef = collection(db, FIRESTORE_COLLECTIONS.ATTENDANCE);
        const q = query(
            attendanceRef,
            where('date', '==', date)
        );

        const querySnapshot = await getDocs(q);

        return {
            date,
            totalAttendance: querySnapshot.size,
            records: querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }))
        };
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        throw error;
    }
};
