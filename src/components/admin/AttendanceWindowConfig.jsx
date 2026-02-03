import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceWindowConfig, updateAttendanceWindowConfig, invalidateCache } from '../../services/firebase/systemConfigService';

/**
 * Componente para configurar la franja horaria de asistencia (solo admin)
 */
export const AttendanceWindowConfig = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estado del formulario
    const [config, setConfig] = useState({
        startHour: 7,
        startMinute: 0,
        endHour: 9,
        endMinute: 30,
        toleranceMinutes: 0,
        activeDays: [0, 1, 2, 3, 4, 5, 6],
    });

    const daysOfWeek = [
        { value: 0, label: 'Dom' },
        { value: 1, label: 'Lun' },
        { value: 2, label: 'Mar' },
        { value: 3, label: 'Mié' },
        { value: 4, label: 'Jue' },
        { value: 5, label: 'Vie' },
        { value: 6, label: 'Sáb' },
    ];

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const currentConfig = await getAttendanceWindowConfig();
            setConfig(currentConfig);
        } catch (err) {
            console.error('Error loading config:', err);
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: parseInt(value, 10) || 0,
        }));
        setError(null);
        setSuccess(null);
    };

    const handleDayToggle = (dayValue) => {
        setConfig(prev => {
            const activeDays = prev.activeDays.includes(dayValue)
                ? prev.activeDays.filter(d => d !== dayValue)
                : [...prev.activeDays, dayValue].sort((a, b) => a - b);

            return { ...prev, activeDays };
        });
    };

    const validateConfig = () => {
        const { startHour, startMinute, endHour, endMinute, toleranceMinutes, activeDays } = config;

        if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
            return 'Las horas deben estar entre 0 y 23';
        }

        if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
            return 'Los minutos deben estar entre 0 y 59';
        }

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (startTimeInMinutes >= endTimeInMinutes) {
            return 'La hora de inicio debe ser menor que la hora de fin';
        }

        if (toleranceMinutes < 0 || toleranceMinutes > 120) {
            return 'La tolerancia debe estar entre 0 y 120 minutos';
        }

        if (activeDays.length === 0) {
            return 'Debe seleccionar al menos un día activo';
        }

        return null;
    };

    const handleSave = async () => {
        const validationError = validateConfig();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            await updateAttendanceWindowConfig(user.uid, config);
            invalidateCache();

            setSuccess('Configuración guardada correctamente');

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error('Error saving config:', err);
            setError(err.message || 'Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };

    const getPreview = () => {
        return `${formatTime(config.startHour, config.startMinute)} - ${formatTime(config.endHour, config.endMinute)}${config.toleranceMinutes > 0 ? ` (+${config.toleranceMinutes} min tolerancia)` : ''}`;
    };

    if (loading) {
        return (
            <Card title="Configuración de Franja Horaria">
                <div className="text-center py-8">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Configuración de Franja Horaria">
            <div className="space-y-6">
                {/* Mensajes */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        ✓ {success}
                    </div>
                )}

                {/* Preview */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm text-primary-700 mb-1 font-medium">Vista Previa:</p>
                    <p className="text-lg font-bold text-primary-900">{getPreview()}</p>
                </div>

                {/* Hora de inicio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Inicio
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Hora (0-23)</label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={config.startHour}
                                onChange={(e) => handleInputChange('startHour', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Minutos (0-59)</label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={config.startMinute}
                                onChange={(e) => handleInputChange('startMinute', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Hora de fin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Fin
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Hora (0-23)</label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={config.endHour}
                                onChange={(e) => handleInputChange('endHour', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Minutos (0-59)</label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={config.endMinute}
                                onChange={(e) => handleInputChange('endMinute', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Tolerancia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tolerancia (minutos adicionales)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="120"
                        value={config.toleranceMinutes}
                        onChange={(e) => handleInputChange('toleranceMinutes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minutos adicionales después de la hora de fin
                    </p>
                </div>

                {/* Días activos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días Activos
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayToggle(day.value)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${config.activeDays.includes(day.value)
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Selecciona los días en que se permite registro de asistencia
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="primary"
                        fullWidth
                    >
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                    <Button
                        onClick={loadConfig}
                        disabled={saving}
                        variant="outline"
                    >
                        Recargar
                    </Button>
                </div>

                {/* Información */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                        <strong>ℹ️ Nota:</strong> Los cambios se aplicarán inmediatamente para todos los usuarios. La configuración se almacena en la base de datos.
                    </p>
                </div>
            </div>
        </Card>
    );
};
