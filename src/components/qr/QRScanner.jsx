import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PermissionInstructions } from '../common/PermissionInstructions';
import { useQRScanner } from '../../hooks/useQRScanner';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import { MESSAGES } from '../../utils/constants';

export const QRScanner = ({ onSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { startScanning, stopScanning, isScanning, error: scanError } = useQRScanner();
    const { registerAttendance, loading, checkCanRegister } = useAttendance(user?.uid);
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(true);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    useEffect(() => {
        checkEligibility();

        return () => {
            stopScanning();
        };
    }, []);

    const checkEligibility = async () => {
        setChecking(true);
        try {
            const result = await checkCanRegister();
            setAlreadyRegistered(!result.canRegister);
        } catch (err) {
            console.error('Error checking eligibility:', err);
        } finally {
            setChecking(false);
        }
    };

    const handleStartScan = async () => {
        setResult(null);
        setIsProcessing(false);
        setPermissionError(null);

        const scanResult = await startScanning(
            'qr-video',
            async (decodedText) => {
                // Evitar múltiples llamadas
                if (isProcessing) {
                    console.log('Ya procesando QR, ignorando escaneo duplicado');
                    return;
                }

                setIsProcessing(true);

                // QR escaneado exitosamente
                await stopScanning();

                // Mostrar feedback de procesamiento
                setResult({
                    success: null,
                    message: 'Validando código QR...'
                });

                // Registrar asistencia con datos de validación
                const attendanceResult = await registerAttendance(decodedText, user, null);

                if (attendanceResult.success) {
                    setResult({
                        success: true,
                        message: MESSAGES.SUCCESS.ATTENDANCE_REGISTERED,
                        data: attendanceResult.data
                    });

                    // Vibración de éxito
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]);
                    }

                    // Redirigir al calendario después de 2 segundos
                    if (onSuccess) {
                        setTimeout(() => {
                            onSuccess(attendanceResult);
                        }, 2000);
                    }
                } else {
                    setResult({
                        success: false,
                        message: attendanceResult.error,
                        errorType: attendanceResult.errorType
                    });

                    // Vibración de error
                    if ('vibrate' in navigator) {
                        navigator.vibrate([100, 50, 100, 50, 100]);
                    }

                    setIsProcessing(false);
                }
            },
            (error) => {
                setResult({
                    success: false,
                    message: error
                });
                setIsProcessing(false);
            },
            user // Pass user data for validation
        );

        // Handle the result - could be boolean (success) or object (error details)
        if (scanResult === true) {
            // Success case - scanning started
            return;
        }

        if (scanResult === false || (scanResult && !scanResult.success)) {
            // Check if it's a permission error
            if (scanResult && scanResult.isPermissionError) {
                setPermissionError({
                    type: 'camera',
                    os: scanResult.os
                });
            } else {
                setResult({
                    success: false,
                    message: scanResult?.error || scanError || 'No se pudo iniciar el escáner. Verifica los permisos de cámara.'
                });
            }
            setIsProcessing(false);
        }
    };

    const handleStopScan = async () => {
        await stopScanning();
        setResult(null);
    };

    const handleRetry = () => {
        setResult(null);
        setPermissionError(null);
    };

    const handleGoToCalendar = () => {
        navigate('/user/attendance');
    };

    if (checking) {
        return (
            <Card title="Registrar Asistencia">
                <div className="text-center py-12">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Verificando estado...</p>
                </div>
            </Card>
        );
    }

    if (alreadyRegistered) {
        return (
            <Card title="Registrar Asistencia">
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-5xl">✅</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        ¡Ya registraste tu asistencia hoy!
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Tu asistencia del día de hoy ya está registrada
                    </p>
                    <Button
                        variant="primary"
                        onClick={handleGoToCalendar}
                    >
                        Ver Mi Calendario
                    </Button>
                </div>
            </Card>
        );
    }

    // Modo Fullscreen cuando está escaneando
    if (isScanning) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                {/* Video Fullscreen */}
                <video
                    id="qr-video"
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                />

                {/* Overlay con instrucciones */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Área de enfoque visual (opcional) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-4 border-white/30 rounded-3xl animate-pulse" />
                    </div>

                    {/* Instrucción flotante */}
                    <div className="absolute top-20 left-0 right-0 text-center">
                        <div className="inline-block bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                            <p className="text-white font-semibold text-lg">
                                📸 Apunta al código QR
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botón de cancelar */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
                    <button
                        onClick={handleStopScan}
                        className="bg-white/90 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-white transition-all active:scale-95"
                    >
                        ✕ Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Card title="Registrar Asistencia">
            <div className="space-y-4">

                {/* Permission Error State */}
                {permissionError && (
                    <PermissionInstructions
                        type={permissionError.type}
                        onRetry={handleRetry}
                    />
                )}

                {!result && !permissionError && (
                    <div className="text-center py-8">
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <span className="text-5xl">📷</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Escanea el código QR
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Escanea el código QR del día para registrar tu asistencia
                        </p>

                        {/* Instrucciones */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-blue-900 font-semibold mb-2">📋 Instrucciones:</p>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Permite el acceso a la cámara</li>
                                <li>• Apunta al código QR del día</li>
                                <li>• La detección es automática e instantánea</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleStartScan}
                            variant="primary"
                            disabled={loading}
                        >
                            📸 Iniciar Escáner
                        </Button>
                    </div>
                )}

                {result && (
                    <div className={`
            p-6 rounded-2xl text-center animate-scale-in
            ${result.success === null ? 'bg-blue-50 border-2 border-blue-200' : ''}
            ${result.success === true ? 'bg-success-50 border-2 border-success-200' : ''}
            ${result.success === false ? 'bg-danger-50 border-2 border-danger-200' : ''}
          `}>
                        {/* Loading state */}
                        {result.success === null && (
                            <>
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="font-medium text-blue-800">
                                    {result.message}
                                </p>
                            </>
                        )}

                        {/* Success state */}
                        {result.success === true && (
                            <>
                                <div className="text-7xl mb-4 animate-bounce">
                                    ✅
                                </div>
                                <h3 className="text-2xl font-bold text-success-900 mb-2">
                                    ¡Asistencia Registrada!
                                </h3>
                                <p className="text-success-700 mb-4">
                                    {result.message}
                                </p>
                                {result.data && (
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <p className="text-sm text-gray-600">
                                            Registrado a las:{' '}
                                            <span className="font-semibold text-gray-900">
                                                {new Date(result.data.timestamp).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleGoToCalendar}
                                    variant="success"
                                    fullWidth
                                >
                                    Ver Mi Calendario
                                </Button>
                            </>
                        )}

                        {/* Error state */}
                        {result.success === false && (
                            <>
                                <div className="text-7xl mb-4">
                                    {result.errorType === 'expired' ? '⏰' :
                                        result.errorType === 'duplicate' ? '⚠️' : '❌'}
                                </div>
                                <h3 className="text-xl font-bold text-danger-900 mb-2">
                                    {result.errorType === 'expired' ? 'Código QR Expirado' :
                                        result.errorType === 'duplicate' ? 'Ya Registrado' :
                                            'Error al Registrar'}
                                </h3>
                                <p className="text-danger-700 mb-6">
                                    {result.message}
                                </p>

                                <div className="bg-white rounded-lg p-4 mb-4 text-left">
                                    <p className="text-sm text-gray-700">
                                        {result.errorType === 'expired' && (
                                            <>
                                                <strong>💡 Solución:</strong> Solicita al administrador que genere un nuevo código QR para hoy.
                                            </>
                                        )}
                                        {result.errorType === 'duplicate' && (
                                            <>
                                                <strong>💡 Información:</strong> Tu asistencia de hoy ya está registrada. Solo puedes registrar una vez por día.
                                            </>
                                        )}
                                        {!result.errorType && (
                                            <>
                                                <strong>💡 Sugerencias:</strong> Verifica que el código QR sea del día actual y que tengas conexión a internet.
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {result.errorType !== 'duplicate' && (
                                        <Button
                                            onClick={handleRetry}
                                            variant="primary"
                                            fullWidth
                                        >
                                            Intentar de Nuevo
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleGoToCalendar}
                                        variant="secondary"
                                        fullWidth
                                    >
                                        Ver Calendario
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {scanError && !result && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                        <p className="font-semibold mb-1">Error de cámara</p>
                        <p>{scanError}</p>
                        <p className="text-xs mt-2">
                            💡 Verifica que hayas dado permisos de cámara al navegador
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};
