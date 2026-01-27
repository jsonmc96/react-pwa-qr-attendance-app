import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { FIRESTORE_COLLECTIONS } from '../../utils/constants';
import { handleFirebaseError } from '../../utils/errorHandler';

/**
 * Configura la persistencia de sesión LOCAL (sin caducidad)
 * CRÍTICO para PWA: La sesión persiste aunque:
 * - El usuario cierre el navegador/PWA
 * - Reinicie el dispositivo
 * - Pase días/semanas sin abrir la app
 */
export const setupPersistence = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Persistencia LOCAL configurada: sesión sin caducidad');
        return true;
    } catch (error) {
        console.error('❌ Error configurando persistencia:', error);
        return false;
    }
};

// 🔥 IMPORTANTE: Configurar persistencia INMEDIATAMENTE al cargar el módulo
// Esto asegura que esté lista ANTES de cualquier intento de login
setupPersistence().catch(err => {
    console.error('Error en setup inicial de persistencia:', err);
});

/**
 * Inicia sesión con email y contraseña
 * GARANTÍA: La sesión persistirá SIN CADUCIDAD
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Usuario autenticado con rol
 */
export const loginWithEmail = async (email, password) => {
    try {
        // ⚡ CRÍTICO: Verificar/configurar persistencia ANTES de login
        // Esto asegura que la sesión se almacene en localStorage
        const persistenceSet = await setupPersistence();

        if (!persistenceSet) {
            console.warn('⚠️ Persistencia no configurada, reintentando...');
            await setupPersistence();
        }

        // Autenticar usuario
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Usuario autenticado:', user.email);

        // Obtener datos adicionales del usuario (rol)
        const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid));

        if (!userDoc.exists()) {
            // Cerrar sesión si no hay datos en Firestore
            await signOut(auth);
            throw new Error('Usuario no encontrado en la base de datos');
        }

        const userData = userDoc.data();

        console.log('✅ Datos de usuario cargados. Rol:', userData.role);

        return {
            uid: user.uid,
            email: user.email,
            role: userData.role,
            displayName: userData.displayName || email,
            employeeType: userData.employeeType || 'remote' // Default to remote if not set
        };
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

/**
 * Cierra la sesión del usuario
 * Limpia completamente el localStorage de Firebase
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        // Limpiar cache de sessionStorage
        try {
            sessionStorage.removeItem('currentUser');
        } catch (e) {
            // Ignorar errores de sessionStorage
        }

        await signOut(auth);
        console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
        throw new Error(handleFirebaseError(error));
    }
};

/**
 * Observa cambios en el estado de autenticación
 * Se ejecuta automáticamente cuando:
 * - La app se inicia (restaura sesión de localStorage)
 * - El usuario hace login
 * - El usuario hace logout
 * - La sesión expira (NO debería pasar con LOCAL persistence)
 * 
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 * @returns {Function} Función para cancelar la suscripción
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('🔑 Sesión detectada para:', user.email);

            try {
                // Obtener datos del usuario desde Firestore
                const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    const userObject = {
                        uid: user.uid,
                        email: user.email,
                        role: userData.role,
                        displayName: userData.displayName || user.email,
                        employeeType: userData.employeeType || 'remote' // Default to remote if not set
                    };

                    // 💾 Cache en sessionStorage para acceso rápido offline
                    try {
                        sessionStorage.setItem('currentUser', JSON.stringify(userObject));
                    } catch (e) {
                        console.warn('No se pudo cachear usuario en sessionStorage:', e);
                    }

                    console.log('✅ Sesión restaurada exitosamente');
                    callback(userObject);
                } else {
                    console.warn('⚠️ Usuario autenticado pero sin datos en Firestore');
                    callback(null);
                }
            } catch (error) {
                console.error('❌ Error obteniendo datos de usuario:', error);

                // 🔄 Si falla Firestore (offline), intenta usar cache
                try {
                    const cachedUser = sessionStorage.getItem('currentUser');
                    if (cachedUser) {
                        console.log('📦 Usando datos cacheados del usuario');
                        callback(JSON.parse(cachedUser));
                        return;
                    }
                } catch (e) {
                    console.error('Error leyendo cache:', e);
                }

                callback(null);
            }
        } else {
            console.log('🚪 No hay sesión activa');
            // Limpiar cache
            try {
                sessionStorage.removeItem('currentUser');
            } catch (e) {
                // Ignorar errores de sessionStorage
            }
            callback(null);
        }
    });
};

/**
 * Obtiene el usuario actualmente autenticado de Firebase
 * @returns {Object|null} Usuario de Firebase Auth o null
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Verifica si hay una sesión activa (sincrónico)
 * @returns {boolean} True si hay un usuario logueado
 */
export const isUserLoggedIn = () => {
    return auth.currentUser !== null;
};
