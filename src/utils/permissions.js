/**
 * Permission Utilities
 * Handles browser permission checks and OS detection
 */

/**
 * Detect the mobile operating system
 * @returns {'ios' | 'android' | 'desktop'} The detected OS
 */
export const getMobileOS = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }

    // Android detection
    if (/android/i.test(userAgent)) {
        return 'android';
    }

    return 'desktop';
};

/**
 * Check if the browser is Safari
 * @returns {boolean} True if Safari
 */
export const isSafari = () => {
    const userAgent = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(userAgent);
};

/**
 * Check permission state for a given permission
 * @param {string} permissionName - 'camera', 'geolocation', etc.
 * @returns {Promise<{state: string, supported: boolean}>}
 */
export const checkPermissionState = async (permissionName) => {
    // Check if Permissions API is available
    if (!('permissions' in navigator)) {
        return {
            state: 'unknown',
            supported: false,
        };
    }

    try {
        const result = await navigator.permissions.query({ name: permissionName });
        return {
            state: result.state, // 'granted', 'denied', or 'prompt'
            supported: true,
        };
    } catch (error) {
        // Some browsers don't support querying certain permissions
        // (e.g., Safari doesn't support 'camera')
        return {
            state: 'unknown',
            supported: false,
        };
    }
};

/**
 * Check if camera permission is granted
 * @returns {Promise<{granted: boolean, state: string}>}
 */
export const checkCameraPermission = async () => {
    const permissionCheck = await checkPermissionState('camera');

    if (!permissionCheck.supported) {
        // Fallback: try to get a stream and immediately stop it
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return { granted: true, state: 'granted' };
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                return { granted: false, state: 'denied' };
            }
            return { granted: false, state: 'prompt' };
        }
    }

    return {
        granted: permissionCheck.state === 'granted',
        state: permissionCheck.state,
    };
};

/**
 * Check if geolocation permission is granted
 * @returns {Promise<{granted: boolean, state: string}>}
 */
export const checkGeolocationPermission = async () => {
    const permissionCheck = await checkPermissionState('geolocation');

    return {
        granted: permissionCheck.state === 'granted',
        state: permissionCheck.state,
    };
};

/**
 * Get user-friendly error message based on permission error
 * @param {Error} error - The error from getUserMedia or getCurrentPosition
 * @param {string} type - 'camera' | 'location'
 * @returns {Object} { message: string, code: string, isPermissionError: boolean }
 */
export const getPermissionErrorDetails = (error, type = 'camera') => {
    const os = getMobileOS();

    // Camera errors
    if (type === 'camera') {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            return {
                message: os === 'ios'
                    ? 'Permiso de cámara denegado. Por favor, habilita el acceso en Configuración.'
                    : 'Permiso de cámara denegado. Por favor, habilita el acceso en la configuración del navegador.',
                code: 'PERMISSION_DENIED',
                isPermissionError: true,
                os,
            };
        }

        if (error.name === 'NotFoundError') {
            return {
                message: 'No se encontró ninguna cámara en este dispositivo.',
                code: 'NO_CAMERA',
                isPermissionError: false,
            };
        }

        if (error.name === 'NotReadableError') {
            return {
                message: 'La cámara está siendo usada por otra aplicación.',
                code: 'CAMERA_IN_USE',
                isPermissionError: false,
            };
        }
    }

    // Location errors
    if (type === 'location') {
        if (error.code === 1) { // PERMISSION_DENIED
            return {
                message: os === 'ios'
                    ? 'Permiso de ubicación denegado. Por favor, habilita el acceso en Configuración.'
                    : 'Permiso de ubicación denegado. Por favor, habilita el acceso en la configuración del navegador.',
                code: 'PERMISSION_DENIED',
                isPermissionError: true,
                os,
            };
        }

        if (error.code === 2) { // POSITION_UNAVAILABLE
            return {
                message: 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.',
                code: 'POSITION_UNAVAILABLE',
                isPermissionError: false,
            };
        }

        if (error.code === 3) { // TIMEOUT
            return {
                message: 'Se agotó el tiempo de espera. Intenta nuevamente.',
                code: 'TIMEOUT',
                isPermissionError: false,
            };
        }
    }

    return {
        message: 'Error desconocido. Por favor, intenta nuevamente.',
        code: 'UNKNOWN',
        isPermissionError: false,
    };
};
