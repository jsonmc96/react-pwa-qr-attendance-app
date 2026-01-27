import { useState, useEffect } from 'react';
import { getSystemConfig, updateSystemConfig } from '../../services/backend/providers/firebase/admin';
import { DEFAULT_GEOFENCE } from '../../config/appConfig';

export const SystemConfigSection = () => {
    const [config, setConfig] = useState({
        churchLocation: DEFAULT_GEOFENCE
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const systemConfig = await getSystemConfig();
            setConfig(systemConfig);
        } catch (err) {
            console.error('Error loading config:', err);
            setError('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            await updateSystemConfig(config);

            setSuccess('Configuración guardada correctamente');
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error al guardar configuración');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            churchLocation: {
                ...prev.churchLocation,
                [field]: parseFloat(value) || 0
            }
        }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración del Sistema</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración del Sistema</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    {success}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Ubicación de la Iglesia</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Configura las coordenadas GPS de la iglesia para validar la asistencia de empleados presenciales.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={config.churchLocation.lat}
                                onChange={(e) => handleChange('lat', e.target.value)}
                                disabled={!isEditing}
                                placeholder="-0.1807"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                            <span className="text-xs text-gray-500 mt-1 block">Ejemplo: -0.1807 (Quito)</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={config.churchLocation.lng}
                                onChange={(e) => handleChange('lng', e.target.value)}
                                disabled={!isEditing}
                                placeholder="-78.4678"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                            <span className="text-xs text-gray-500 mt-1 block">Ejemplo: -78.4678 (Quito)</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Radio de Tolerancia (metros)</label>
                            <input
                                type="number"
                                step="10"
                                value={config.churchLocation.radiusMeters}
                                onChange={(e) => handleChange('radiusMeters', e.target.value)}
                                disabled={!isEditing}
                                placeholder="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                            <span className="text-xs text-gray-500 mt-1 block">Distancia máxima permitida desde el punto central</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
                        <p className="text-sm text-gray-700">
                            💡 <strong>Cómo obtener coordenadas:</strong><br />
                            1. Abre Google Maps<br />
                            2. Haz clic derecho en la ubicación de la iglesia<br />
                            3. Copia las coordenadas que aparecen en la parte superior
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                ✏️ Editar Configuración
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        loadConfig();
                                    }}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
