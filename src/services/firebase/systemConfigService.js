import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS, SYSTEM_CONFIG_DOC_ID, ATTENDANCE_WINDOW } from '../../config/appConfig';

/**
 * Cache para configuración de ventana de asistencia
 * Reduce llamadas a Firestore
 */
let attendanceWindowCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la configuración de la ventana de asistencia desde Firestore
 * Usa cache en memoria para mejorar performance
 * @returns {Promise<Object>} Configuración de ventana de asistencia
 */
export const getAttendanceWindowConfig = async () => {
    try {
        // Verificar cache
        const now = Date.now();
        if (attendanceWindowCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
            return attendanceWindowCache;
        }

        // Obtener desde Firestore
        const configRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, SYSTEM_CONFIG_DOC_ID);
        const configSnap = await getDoc(configRef);

        if (configSnap.exists() && configSnap.data().attendanceWindow) {
            const config = configSnap.data().attendanceWindow;

            // Actualizar cache
            attendanceWindowCache = config;
            cacheTimestamp = now;

            return config;
        }

        // Fallback a configuración hardcodeada si no existe en BD
        console.warn('No attendance window config in Firestore, using defaults from appConfig');
        return {
            startHour: ATTENDANCE_WINDOW.START_HOUR,
            startMinute: ATTENDANCE_WINDOW.START_MINUTE,
            endHour: ATTENDANCE_WINDOW.END_HOUR,
            endMinute: ATTENDANCE_WINDOW.END_MINUTE,
            toleranceMinutes: 0,
            activeDays: [0, 1, 2, 3, 4, 5, 6], // Todos los días por defecto
        };
    } catch (error) {
        console.error('Error loading attendance window config:', error);

        // Fallback a configuración hardcodeada en caso de error
        return {
            startHour: ATTENDANCE_WINDOW.START_HOUR,
            startMinute: ATTENDANCE_WINDOW.START_MINUTE,
            endHour: ATTENDANCE_WINDOW.END_HOUR,
            endMinute: ATTENDANCE_WINDOW.END_MINUTE,
            toleranceMinutes: 0,
            activeDays: [0, 1, 2, 3, 4, 5, 6],
        };
    }
};

/**
 * Actualiza la configuración de la ventana de asistencia
 * Solo puede ser llamado por admin
 * @param {string} adminUid - UID del administrador
 * @param {Object} config - Nueva configuración
 * @returns {Promise<void>}
 */
export const updateAttendanceWindowConfig = async (adminUid, config) => {
    try {
        const configRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, SYSTEM_CONFIG_DOC_ID);

        // Validar configuración
        const { startHour, startMinute, endHour, endMinute, toleranceMinutes, activeDays } = config;

        if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
            throw new Error('Hora debe estar entre 0 y 23');
        }

        if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
            throw new Error('Minutos deben estar entre 0 y 59');
        }

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (startTimeInMinutes >= endTimeInMinutes) {
            throw new Error('Hora de inicio debe ser menor que hora de fin');
        }

        if (toleranceMinutes < 0 || toleranceMinutes > 120) {
            throw new Error('Tolerancia debe estar entre 0 y 120 minutos');
        }

        if (!Array.isArray(activeDays) || activeDays.some(d => d < 0 || d > 6)) {
            throw new Error('Días activos deben ser un array de números entre 0 (Domingo) y 6 (Sábado)');
        }

        // Guardar configuración
        await setDoc(configRef, {
            attendanceWindow: {
                startHour,
                startMinute,
                endHour,
                endMinute,
                toleranceMinutes,
                activeDays,
            },
            updatedAt: serverTimestamp(),
            updatedBy: adminUid,
        }, { merge: true });

        // Invalidar cache
        attendanceWindowCache = null;
        cacheTimestamp = null;

        console.log('Attendance window config updated successfully');
    } catch (error) {
        console.error('Error updating attendance window config:', error);
        throw error;
    }
};

/**
 * Inicializa la configuración por defecto si no existe
 * Útil para migración inicial
 * @param {string} adminUid - UID del administrador
 * @returns {Promise<void>}
 */
export const initializeDefaultConfig = async (adminUid) => {
    try {
        const configRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, SYSTEM_CONFIG_DOC_ID);
        const configSnap = await getDoc(configRef);

        // Solo inicializar si no existe
        if (!configSnap.exists() || !configSnap.data().attendanceWindow) {
            await setDoc(configRef, {
                attendanceWindow: {
                    startHour: ATTENDANCE_WINDOW.START_HOUR,
                    startMinute: ATTENDANCE_WINDOW.START_MINUTE,
                    endHour: ATTENDANCE_WINDOW.END_HOUR,
                    endMinute: ATTENDANCE_WINDOW.END_MINUTE,
                    toleranceMinutes: 0,
                    activeDays: [0, 1, 2, 3, 4, 5, 6],
                },
                updatedAt: serverTimestamp(),
                updatedBy: adminUid,
            }, { merge: true });

            console.log('Default attendance window config initialized');
        }
    } catch (error) {
        console.error('Error initializing default config:', error);
        throw error;
    }
};

/**
 * Invalida el cache manualmente
 * Útil después de actualizaciones
 */
export const invalidateCache = () => {
    attendanceWindowCache = null;
    cacheTimestamp = null;
};
