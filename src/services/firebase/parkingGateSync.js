import { 
    doc, 
    onSnapshot, 
    runTransaction, 
    Timestamp,
    collection,
    addDoc 
} from 'firebase/firestore';
import { db } from './config';
import { FIRESTORE_COLLECTIONS } from '../../utils/constants';

const GATE_DOC_PATH = 'system_status/parking_gate';

/**
 * Suscribe a los cambios en el estado del portón en tiempo real.
 * @param {Function} callback Función que recibe el nuevo estado.
 * @returns {Function} Función para cancelar la suscripción (unsubscribe).
 */
export const subscribeToGateStatus = (callback) => {
    const gateRef = doc(db, GATE_DOC_PATH);
    
    return onSnapshot(gateRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const now = Date.now();
            const cooldownUntil = data.cooldownUntil?.toMillis() || 0;
            
            callback({
                isBusy: data.isBusy || false,
                lastActionBy: data.lastActionBy || '',
                cooldownRemaining: Math.max(0, Math.ceil((cooldownUntil - now) / 1000)),
                lastActionAt: data.lastActionAt?.toMillis() || 0
            });
        } else {
            callback({
                isBusy: false,
                lastActionBy: '',
                cooldownRemaining: 0,
                lastActionAt: 0
            });
        }
    }, (error) => {
        console.error("Error subscribing to gate status:", error);
    });
};

/**
 * Intenta bloquear el portón para realizar una acción.
 * Usa una transacción para asegurar que solo un usuario lo logre.
 * @param {string} userName Nombre del usuario que realiza la acción.
 * @returns {Promise<boolean>} True si se logró bloquear, False si ya estaba ocupado o en cooldown.
 */
export const lockGateForAction = async (userName) => {
    const gateRef = doc(db, GATE_DOC_PATH);
    
    try {
        return await runTransaction(db, async (transaction) => {
            const gateDoc = await transaction.get(gateRef);
            const now = Date.now();
            
            if (gateDoc.exists()) {
                const data = gateDoc.data();
                const cooldownUntil = data.cooldownUntil?.toMillis() || 0;
                
                // Si está ocupado o en cooldown, no permitir
                if (data.isBusy || cooldownUntil > now) {
                    return false;
                }
            }
            
            // Bloquear
            transaction.set(gateRef, {
                isBusy: true,
                lastActionBy: userName,
                lastActionAt: Timestamp.now(),
                cooldownUntil: Timestamp.fromMillis(0) // Reset cooldown while busy
            }, { merge: true });
            
            return true;
        });
    } catch (error) {
        console.error("Error locking gate:", error);
        return false;
    }
};

/**
 * Libera el portón y establece un cooldown.
 * @param {number} cooldownSeconds Segundos de espera.
 */
export const releaseGateWithCooldown = async (cooldownSeconds = 10) => {
    const gateRef = doc(db, GATE_DOC_PATH);
    const cooldownUntil = Date.now() + (cooldownSeconds * 1000);
    
    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(gateRef, {
                isBusy: false,
                cooldownUntil: Timestamp.fromMillis(cooldownUntil)
            });
        });
    } catch (error) {
        console.error("Error releasing gate:", error);
    }
};

/**
 * Libera el portón inmediatamente (en caso de error crítico).
 */
export const forceReleaseGate = async () => {
    const gateRef = doc(db, GATE_DOC_PATH);
    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(gateRef, {
                isBusy: false,
                cooldownUntil: Timestamp.fromMillis(0)
            });
        });
    } catch (error) {
        console.error("Error force releasing gate:", error);
        throw error; // Rethrow to handle in the component
    }
};

/**
 * Registra un evento de acción del portón en el historial.
 * @param {Object} eventData Datos del evento.
 */
export const saveGateEvent = async (eventData) => {
    try {
        const historyRef = collection(db, FIRESTORE_COLLECTIONS.PARKING_HISTORY);
        await addDoc(historyRef, {
            userId: eventData.userId || 'unknown',
            userName: eventData.userName || 'Usuario',
            timestamp: Timestamp.now(),
            action: eventData.action || 'pulse',
            success: eventData.success ?? true,
            message: eventData.message || ''
        });
    } catch (error) {
        console.error("Error saving gate event:", error);
    }
};
