import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { QRDisplay } from './QRDisplay';
import { generateDailyQR, regenerateDailyQR, getTodayQR } from '../../services/qr/qrGenerator';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getTodayISO } from '../../utils/dateHelpers';

export const QRGenerator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [autoLoading, setAutoLoading] = useState(true);

    // Auto-cargar QR del día al montar
    useEffect(() => {
        loadTodayQR();
    }, []);

    const loadTodayQR = async () => {
        setAutoLoading(true);
        setError(null);

        try {
            const existingQR = await getTodayQR();
            if (existingQR) {
                setQrData({
                    qrHash: existingQR.qrHash,
                    date: existingQR.date,
                    isNew: false
                });
            }
        } catch (err) {
            console.error('Error loading today QR:', err);
            // No mostrar error si no existe, es normal
        } finally {
            setAutoLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await generateDailyQR(user.uid);
            setQrData(result);

            // Vibración de éxito
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
        } catch (err) {
            console.error('Error generating QR:', err);
            setError('Error al generar el código QR. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('¿Estás seguro de regenerar el QR? El anterior dejará de funcionar.')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await regenerateDailyQR(user.uid);
            setQrData(result);

            // Vibración de éxito
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
        } catch (err) {
            console.error('Error regenerating QR:', err);
            setError('Error al regenerar el código QR');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `qr-asistencia-${getTodayISO()}.png`;
            link.href = url;
            link.click();

            // Vibración de confirmación
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        }
    };

    const handleShare = async () => {
        const canvas = document.querySelector('canvas');
        if (canvas && navigator.share) {
            try {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], `qr-asistencia-${getTodayISO()}.png`, { type: 'image/png' });
                    await navigator.share({
                        title: 'Código QR de Asistencia',
                        text: `QR para registrar asistencia - ${formatDate(qrData.date)}`,
                        files: [file]
                    });
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    if (autoLoading) {
        return (
            <Card title="Generar QR del Día">
                <div className="text-center py-12">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Verificando QR del día...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card title="Generar QR del Día">
                {!qrData ? (
                    <div className="text-center py-8">
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">📱</span>
                        </div>
                        <p className="text-gray-600 mb-2 font-medium">
                            No hay código QR generado para hoy
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Genera el código QR para que los usuarios registren su asistencia
                        </p>
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            variant="primary"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generando...
                                </span>
                            ) : (
                                '✨ Generar QR del Día'
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header con fecha */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-2">
                                <span className="text-2xl">📅</span>
                                <span className="font-semibold text-primary-900">
                                    {formatDate(qrData.date, 'EEEE, dd MMMM yyyy')}
                                </span>
                            </div>
                            {!qrData.isNew && (
                                <p className="text-sm text-success-600 flex items-center justify-center gap-1">
                                    <span>✓</span>
                                    <span>QR ya existente para hoy</span>
                                </p>
                            )}
                            {qrData.isNew && (
                                <p className="text-sm text-primary-600 flex items-center justify-center gap-1">
                                    <span>✨</span>
                                    <span>QR generado exitosamente</span>
                                </p>
                            )}
                        </div>

                        {/* QR Display */}
                        <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl">
                                <QRDisplay value={qrData.qrHash} />
                            </div>
                        </div>

                        {/* Info del hash */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Hash del QR:</p>
                            <p className="text-sm font-mono text-gray-700 break-all">
                                {qrData.qrHash}
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleDownload}
                                variant="primary"
                                fullWidth
                            >
                                📥 Descargar
                            </Button>

                            {navigator.share && (
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    fullWidth
                                >
                                    📤 Compartir
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleRegenerate}
                                disabled={loading}
                                variant="secondary"
                                fullWidth
                            >
                                {loading ? 'Regenerando...' : '🔄 Regenerar QR'}
                            </Button>
                        </div>

                        {/* Advertencia de regeneración */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>⚠️ Nota:</strong> Si regeneras el QR, el código anterior dejará de funcionar inmediatamente.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                        <span className="text-lg">❌</span>
                        <span>{error}</span>
                    </div>
                )}
            </Card>

            {/* Botón para ver historial */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Historial de QR</h3>
                        <p className="text-sm text-gray-600">Ver códigos QR anteriores</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/qr-history')}
                    >
                        Ver Historial →
                    </Button>
                </div>
            </Card>
        </div>
    );
};
