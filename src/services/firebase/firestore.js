import {
    collection,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { FIRESTORE_COLLECTIONS } from '../../utils/constants';
import { getTodayISO } from '../../utils/dateHelpers';

/**
 * Guarda o actualiza el QR del día
 * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
 * @param {string} qrHash - Hash del QR
 * @param {string} adminUid - UID del admin que genera el QR
 * @returns {Promise<void>}
 */
export const saveDailyQR = async (date, qrHash, adminUid) => {
    try {
        const qrRef = doc(db, FIRESTORE_COLLECTIONS.DAILY_QR, date);

        await setDoc(qrRef, {
            date,
            qrHash,
            generatedBy: adminUid,
            generatedAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(date + 'T23:59:59'))
        });
    } catch (error) {
        console.error('Error saving daily QR:', error);
        throw error;
    }
};

/**
 * Obtiene el QR del día
 * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Datos del QR o null si no existe
 */
export const getDailyQR = async (date) => {
    try {
        const qrRef = doc(db, FIRESTORE_COLLECTIONS.DAILY_QR, date);
        const qrDoc = await getDoc(qrRef);

        if (qrDoc.exists()) {
            return {
                id: qrDoc.id,
                ...qrDoc.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting daily QR:', error);
        throw error;
    }
};

/**
 * Registra la asistencia de un usuario
 * @param {string} userId - UID del usuario
 * @param {string} date - Fecha en formato ISO
 * @param {string} qrHash - Hash del QR escaneado
 * @returns {Promise<void>}
 */
export const registerAttendance = async (userId, date, qrHash) => {
    try {
        // ID único: userId_fecha
        const attendanceId = `${userId}_${date}`;
        const attendanceRef = doc(db, FIRESTORE_COLLECTIONS.ATTENDANCE, attendanceId);

        // Verificar si ya existe
        const existingDoc = await getDoc(attendanceRef);
        if (existingDoc.exists()) {
            throw new Error('Ya has registrado tu asistencia hoy');
        }

        // Crear registro
        await setDoc(attendanceRef, {
            userId,
            date,
            timestamp: Timestamp.now(),
            qrHash
        });
    } catch (error) {
        console.error('Error registering attendance:', error);
        throw error;
    }
};

/**
 * Verifica si el usuario ya registró asistencia hoy
 * @param {string} userId - UID del usuario
 * @param {string} date - Fecha en formato ISO
 * @returns {Promise<boolean>} True si ya registró
 */
export const hasAttendanceToday = async (userId, date = getTodayISO()) => {
    try {
        const attendanceId = `${userId}_${date}`;
        const attendanceRef = doc(db, FIRESTORE_COLLECTIONS.ATTENDANCE, attendanceId);
        const attendanceDoc = await getDoc(attendanceRef);

        return attendanceDoc.exists();
    } catch (error) {
        console.error('Error checking attendance:', error);
        return false;
    }
};

/**
 * Obtiene la asistencia de un usuario en un rango de fechas
 * @param {string} userId - UID del usuario
 * @param {string} startDate - Fecha inicio (ISO)
 * @param {string} endDate - Fecha fin (ISO)
 * @returns {Promise<Array>} Array de registros de asistencia
 */
export const getUserAttendance = async (userId, startDate, endDate) => {
    try {
        const attendanceRef = collection(db, FIRESTORE_COLLECTIONS.ATTENDANCE);
        const q = query(
            attendanceRef,
            where('userId', '==', userId),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const attendance = [];

        querySnapshot.forEach((doc) => {
            attendance.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return attendance;
    } catch (error) {
        console.error('Error getting user attendance:', error);
        throw error;
    }
};

/**
 * Obtiene todos los registros de asistencia de un día (solo admin)
 * @param {string} date - Fecha en formato ISO
 * @returns {Promise<Array>} Array de registros
 */
export const getDailyAttendance = async (date) => {
    try {
        const attendanceRef = collection(db, FIRESTORE_COLLECTIONS.ATTENDANCE);
        const q = query(
            attendanceRef,
            where('date', '==', date),
            orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const attendance = [];

        querySnapshot.forEach((doc) => {
            attendance.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return attendance;
    } catch (error) {
        console.error('Error getting daily attendance:', error);
        throw error;
    }
};
