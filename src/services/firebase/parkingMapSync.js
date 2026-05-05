import { 
    doc, 
    onSnapshot, 
    runTransaction, 
    Timestamp,
    collection,
    query,
    getDocs,
    setDoc,
    where
} from 'firebase/firestore';
import { db } from './config';
import { FIRESTORE_COLLECTIONS } from '../../utils/constants';

const SPOTS_COLLECTION = FIRESTORE_COLLECTIONS.PARKING_SPOTS;

/**
 * Definición fija del layout del parqueadero.
 * 3 puestos VIP de administración + 8 puestos generales.
 */
export const PARKING_LAYOUT = {
    vip: [
        { id: 'VIP-1', label: 'Presidente',        icon: '👑' },
        { id: 'VIP-2', label: 'Dir. Financiero',   icon: '💼' },
        { id: 'VIP-3', label: 'Sec. Ejecutivo',    icon: '📋' },
    ],
    general: [
        { id: 'G1',  label: 'Puesto 1' },
        { id: 'G2',  label: 'Puesto 2' },
        { id: 'G3',  label: 'Puesto 3' },
        { id: 'G4',  label: 'Puesto 4' },
        { id: 'G5',  label: 'Puesto 5' },
        { id: 'G6',  label: 'Puesto 6' },
        { id: 'G7',  label: 'Puesto 7' },
        { id: 'G8',  label: 'Puesto 8' },
    ]
};

/**
 * Suscribe a los cambios en todos los puestos del parqueadero.
 * @param {Function} callback Función que recibe el array de puestos.
 * @returns {Function} Unsubscribe
 */
export const subscribeToParkingSpots = (callback) => {
    const spotsRef = collection(db, SPOTS_COLLECTION);
    
    return onSnapshot(spotsRef, (snapshot) => {
        const spots = {};
        snapshot.forEach(doc => {
            spots[doc.id] = { id: doc.id, ...doc.data() };
        });
        callback(spots);
    }, (error) => {
        console.error("Error subscribing to parking spots:", error);
    });
};

/**
 * Ocupa un puesto o lo libera (deselecciona) si ya está ocupado por el mismo usuario.
 * @param {string} spotId ID del puesto (ej: 'G1', 'VIP-1')
 * @param {Object} userData { uid, displayName }
 * @returns {Promise<Object>} { success: boolean, action: 'occupied' | 'released' }
 */
export const toggleSpot = async (spotId, userData) => {
    try {
        const spotsRef = collection(db, SPOTS_COLLECTION);
        
        // 1. Consultar de antemano qué puestos tiene este usuario (fuera de la transacción)
        const q = query(spotsRef, where("userId", "==", userData.uid));
        const userSpotsSnapshot = await getDocs(q);
        
        const spotRef = doc(db, SPOTS_COLLECTION, spotId);
        
        return await runTransaction(db, async (transaction) => {
            const spotDoc = await transaction.get(spotRef);
            const isAlreadyMine = spotDoc.exists() && spotDoc.data().userId === userData.uid;
            
            // Si el puesto ya está ocupado por otro, fallar
            if (spotDoc.exists() && spotDoc.data().isOccupied && spotDoc.data().userId !== userData.uid) {
                throw new Error("El puesto ya está ocupado");
            }
            
            // Liberar cualquier otro puesto que el usuario tuviera ocupado
            userSpotsSnapshot.forEach(s => {
                if (s.id !== spotId) {
                    transaction.update(doc(db, SPOTS_COLLECTION, s.id), {
                        isOccupied: false,
                        userId: null,
                        userName: null,
                        occupiedAt: null
                    });
                }
            });

            if (isAlreadyMine) {
                // Deseleccionar (liberar)
                transaction.update(spotRef, {
                    isOccupied: false,
                    userId: null,
                    userName: null,
                    occupiedAt: null
                });
                return { success: true, action: 'released' };
            } else {
                // Ocupar
                transaction.set(spotRef, {
                    isOccupied: true,
                    userId: userData.uid,
                    userName: userData.displayName,
                    occupiedAt: Timestamp.now()
                }, { merge: true });
                return { success: true, action: 'occupied' };
            }
        });
    } catch (error) {
        console.error("Error toggling spot:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Libera el puesto ocupado por un usuario.
 * @param {string} userId 
 */
export const releaseUserSpot = async (userId) => {
    try {
        const q = query(collection(db, SPOTS_COLLECTION), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        
        const promises = snapshot.docs.map(s => {
            return setDoc(doc(db, SPOTS_COLLECTION, s.id), {
                isOccupied: false,
                userId: null,
                userName: null,
                occupiedAt: null
            }, { merge: true });
        });
        
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error("Error releasing user spot:", error);
        return false;
    }
};

/**
 * Inicializa todos los puestos del parqueadero en Firestore.
 * Ejecutar una sola vez desde el panel de administrador.
 * Respeta datos existentes gracias a { merge: true }.
 */
export const initializeSpots = async () => {
    const allSpots = [
        ...PARKING_LAYOUT.vip.map(s => ({ ...s, isVip: true })),
        ...PARKING_LAYOUT.general.map(s => ({ ...s, isVip: false }))
    ];

    for (const spot of allSpots) {
        const spotRef = doc(db, SPOTS_COLLECTION, spot.id);
        await setDoc(spotRef, {
            label: spot.label,
            isVip: spot.isVip,
            icon: spot.icon || null,
            isOccupied: false,
            userId: null,
            userName: null
        }, { merge: true });
    }
    console.log(`✅ ${allSpots.length} puestos de parqueadero inicializados.`);
};
