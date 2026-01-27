/**
 * Location Validation Utilities
 * Handles GPS permissions and geofence validation
 */

import { getDistance } from 'geolib';
import { GPS_CONFIG, VALIDATION_MESSAGES } from '../config/appConfig';

/**
 * Check if geolocation is supported by the browser
 * @returns {boolean} True if geolocation is supported
 */
export const isGeolocationSupported = () => {
    return 'geolocation' in navigator;
};

/**
 * Request location permission and get current position
 * @returns {Promise<Object>} { success: boolean, position?: Object, error?: string }
 */
export const getCurrentPosition = async () => {
    return new Promise(async (resolve) => {
        if (!isGeolocationSupported()) {
            resolve({
                success: false,
                error: 'Geolocalización no soportada por este navegador',
            });
            return;
        }

        const options = {
            enableHighAccuracy: GPS_CONFIG.ENABLE_HIGH_ACCURACY,
            timeout: GPS_CONFIG.TIMEOUT,
            maximumAge: GPS_CONFIG.MAXIMUM_AGE,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    success: true,
                    position: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                    },
                });
            },
            async (error) => {
                // Use the new permission utilities for better error messages
                const { getPermissionErrorDetails } = await import('./permissions');
                const errorDetails = getPermissionErrorDetails(error, 'location');

                resolve({
                    success: false,
                    error: errorDetails.message,
                    errorCode: errorDetails.code,
                    isPermissionError: errorDetails.isPermissionError,
                    os: errorDetails.os,
                });
            },
            options
        );
    });
};

/**
 * Calculate distance between two GPS coordinates
 * @param {Object} point1 - { lat: number, lng: number }
 * @param {Object} point2 - { lat: number, lng: number }
 * @returns {number} Distance in meters
 */
export const calculateDistance = (point1, point2) => {
    return getDistance(
        { latitude: point1.lat, longitude: point1.lng },
        { latitude: point2.lat, longitude: point2.lng }
    );
};

/**
 * Check if current position is within geofence
 * @param {Object} currentPosition - { lat: number, lng: number }
 * @param {Object} geofence - { lat: number, lng: number, radiusMeters: number }
 * @returns {Object} { isValid: boolean, distance: number, message: string }
 */
export const isWithinGeofence = (currentPosition, geofence) => {
    const distance = calculateDistance(currentPosition, geofence);
    const isValid = distance <= geofence.radiusMeters;

    return {
        isValid,
        distance,
        message: isValid
            ? VALIDATION_MESSAGES.LOCATION.WITHIN_RANGE
            : VALIDATION_MESSAGES.LOCATION.OUT_OF_RANGE,
    };
};

/**
 * Request location permission (without getting position)
 * Useful for checking permission status
 * @returns {Promise<Object>} { granted: boolean, error?: string }
 */
export const requestLocationPermission = async () => {
    if (!isGeolocationSupported()) {
        return {
            granted: false,
            error: 'Geolocalización no soportada',
        };
    }

    // Check if Permissions API is available
    if ('permissions' in navigator) {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return {
                granted: result.state === 'granted',
                state: result.state, // 'granted', 'denied', or 'prompt'
            };
        } catch (error) {
            // Permissions API not fully supported, fallback to trying getCurrentPosition
            const positionResult = await getCurrentPosition();
            return {
                granted: positionResult.success,
                error: positionResult.error,
            };
        }
    }

    // Fallback: try to get position to trigger permission prompt
    const positionResult = await getCurrentPosition();
    return {
        granted: positionResult.success,
        error: positionResult.error,
    };
};

/**
 * Validate location for onsite employee
 * @param {Object} geofence - { lat: number, lng: number, radiusMeters: number }
 * @returns {Promise<Object>} { isValid: boolean, position?: Object, distance?: number, error?: string }
 */
export const validateOnsiteLocation = async (geofence) => {
    // Get current position
    const positionResult = await getCurrentPosition();

    if (!positionResult.success) {
        return {
            isValid: false,
            error: positionResult.error,
        };
    }

    // Check if within geofence
    const geofenceResult = isWithinGeofence(positionResult.position, geofence);

    return {
        isValid: geofenceResult.isValid,
        position: positionResult.position,
        distance: geofenceResult.distance,
        message: geofenceResult.message,
    };
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
};
