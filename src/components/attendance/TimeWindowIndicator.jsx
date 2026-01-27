import { useState, useEffect } from 'react';
import {
    isWithinAllowedTime,
    getFormattedEcuadorTime,
    getTimeUntilWindow,
    getAttendanceWindowDisplay
} from '../../utils/timeValidation';
import './TimeWindowIndicator.css';

export const TimeWindowIndicator = () => {
    const [timeStatus, setTimeStatus] = useState({
        isValid: false,
        message: '',
        ecuadorTime: new Date(),
        timeUntil: null
    });

    useEffect(() => {
        const updateTimeStatus = () => {
            const validation = isWithinAllowedTime();
            const timeUntil = getTimeUntilWindow();

            setTimeStatus({
                ...validation,
                timeUntil
            });
        };

        // Actualizar inmediatamente
        updateTimeStatus();

        // Actualizar cada 10 segundos
        const interval = setInterval(updateTimeStatus, 10000);

        return () => clearInterval(interval);
    }, []);

    const { isValid, message, ecuadorTime, timeUntil } = timeStatus;
    const currentTime = getFormattedEcuadorTime(ecuadorTime, 'HH:mm:ss');
    const windowDisplay = getAttendanceWindowDisplay();

    return (
        <div className={`time-window-indicator ${isValid ? 'active' : 'inactive'}`}>
            <div className="time-window-header">
                <div className={`status-icon ${isValid ? 'valid' : 'invalid'}`}>
                    {isValid ? '✓' : '⏰'}
                </div>
                <div className="time-info">
                    <div className="current-time">{currentTime}</div>
                    <div className="timezone-label">Hora Ecuador</div>
                </div>
            </div>

            <div className="time-window-body">
                <div className="window-display">
                    <span className="label">Horario de asistencia:</span>
                    <span className="value">{windowDisplay}</span>
                </div>

                <div className={`status-message ${isValid ? 'success' : 'warning'}`}>
                    {message}
                </div>

                {!isValid && timeUntil && (
                    <div className="countdown">
                        {timeUntil.isBeforeWindow && (
                            <span>Abre en {timeUntil.minutes} minutos</span>
                        )}
                        {timeUntil.isAfterWindow && (
                            <span>Próxima ventana mañana</span>
                        )}
                    </div>
                )}

                {isValid && timeUntil && (
                    <div className="countdown success">
                        <span>Tiempo restante: {timeUntil.minutes} minutos</span>
                    </div>
                )}
            </div>
        </div>
    );
};
