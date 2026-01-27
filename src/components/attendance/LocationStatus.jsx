import { useState, useEffect } from 'react';
import {
    isGeolocationSupported,
    getCurrentPosition,
    formatDistance
} from '../../utils/locationValidation';
import './LocationStatus.css';

export const LocationStatus = ({ geofence, onLocationValidated }) => {
    const [locationStatus, setLocationStatus] = useState({
        loading: true,
        hasPermission: null,
        position: null,
        distance: null,
        isValid: null,
        error: null
    });

    useEffect(() => {
        checkLocation();
    }, []);

    const checkLocation = async () => {
        setLocationStatus(prev => ({ ...prev, loading: true, error: null }));

        if (!isGeolocationSupported()) {
            setLocationStatus({
                loading: false,
                hasPermission: false,
                position: null,
                distance: null,
                isValid: false,
                error: 'Tu dispositivo no soporta geolocalización'
            });
            return;
        }

        const result = await getCurrentPosition();

        if (!result.success) {
            setLocationStatus({
                loading: false,
                hasPermission: false,
                position: null,
                distance: null,
                isValid: false,
                error: result.error
            });
            return;
        }

        // Calcular distancia
        const { calculateDistance } = await import('../../utils/locationValidation');
        const distance = calculateDistance(result.position, geofence);
        const isValid = distance <= geofence.radiusMeters;

        setLocationStatus({
            loading: false,
            hasPermission: true,
            position: result.position,
            distance,
            isValid,
            error: null
        });

        // Notificar al padre si la ubicación es válida
        if (onLocationValidated && isValid) {
            onLocationValidated(result.position);
        }
    };

    const { loading, hasPermission, distance, isValid, error } = locationStatus;

    if (loading) {
        return (
            <div className="location-status loading">
                <div className="spinner"></div>
                <p>Verificando ubicación...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-status error">
                <div className="status-icon">📍</div>
                <div className="status-content">
                    <h4>Error de Ubicación</h4>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={checkLocation}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`location-status ${isValid ? 'valid' : 'invalid'}`}>
            <div className="status-icon">
                {isValid ? '✓' : '⚠️'}
            </div>
            <div className="status-content">
                <h4>
                    {isValid ? 'Ubicación Verificada' : 'Fuera de Rango'}
                </h4>
                <p className="distance-info">
                    Distancia: <strong>{formatDistance(distance)}</strong>
                    {!isValid && (
                        <span className="limit-info">
                            {' '}(Máximo: {formatDistance(geofence.radiusMeters)})
                        </span>
                    )}
                </p>
                {!isValid && (
                    <p className="error-message">
                        Debes estar en la iglesia para registrar asistencia
                    </p>
                )}
            </div>
        </div>
    );
};
