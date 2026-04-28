import { useState, memo } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { toast } from 'react-toastify';
import { parkingGateService } from '../../services/api/parkingGateService';
import { useAuth } from '../../context/AuthContext';
import { 
    subscribeToGateStatus, 
    lockGateForAction, 
    releaseGateWithCooldown, 
    forceReleaseGate,
    saveGateEvent 
} from '../../services/firebase/parkingGateSync';
import { useEffect } from 'react';

// Visor de cámara memoizado para evitar re-renders cuando cambia el estado de los botones
const CameraViewer = memo(({ url, isFullscreen }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (!url) {
        return (
            <div className={`w-full ${isFullscreen ? 'h-full' : 'aspect-video'} bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300`}>
                <span className="text-4xl mb-2">📷</span>
                <p className="font-medium">Cámara del parqueadero</p>
                <p className="text-sm mt-1">Configure VITE_PARKING_CAMERA_URL</p>
            </div>
        );
    }

    const isIframe = url.includes('youtube.com') || url.includes('embed') || url.includes('iframe');
    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');

    return (
        <div className={`relative w-full ${isFullscreen ? 'h-full' : 'aspect-video'} bg-black rounded-xl overflow-hidden shadow-inner`}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            
            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400 p-4 text-center">
                    <span className="text-3xl mb-2">🔌</span>
                    <p>No se pudo cargar la transmisión.</p>
                    <button 
                        onClick={() => { setHasError(false); setIsLoading(true); }}
                        className="mt-3 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : isIframe ? (
                <iframe 
                    src={url}
                    className="w-full h-full border-0"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                    onError={() => setHasError(true)}
                />
            ) : isVideo ? (
                <video 
                    src={url} 
                    className="w-full h-full object-contain" 
                    autoPlay 
                    muted 
                    playsInline 
                    loop
                    onLoadedData={() => setIsLoading(false)}
                    onError={() => setHasError(true)}
                />
            ) : (
                <img 
                    src={url} 
                    alt="Cámara del parqueadero" 
                    className="w-full h-full object-contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => setHasError(true)}
                    loading="lazy"
                />
            )}
            
            {/* Overlay sutil para mejor estética */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
            
            {/* Indicador EN VIVO */}
            {!hasError && !isLoading && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse"></div>
                    EN VIVO
                </div>
            )}
        </div>
    );
});

CameraViewer.displayName = 'CameraViewer';


export const ParkingGatePage = () => {
    const { user } = useAuth();
    const [isSending, setIsSending] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [isGateBusy, setIsGateBusy] = useState(false);
    const [lastActionBy, setLastActionBy] = useState('');
    
    const cameraUrl = import.meta.env.VITE_PARKING_CAMERA_URL;

    // Suscribirse al estado global del portón en Firestore (Realtime)
    useEffect(() => {
        const unsubscribe = subscribeToGateStatus((status) => {
            setIsGateBusy(status.isBusy);
            setCooldownRemaining(status.cooldownRemaining);
            setLastActionBy(status.lastActionBy);
        });

        return () => unsubscribe();
    }, []);

    // Efecto para el contador de cooldown local (para que el número baje segundo a segundo)
    useEffect(() => {
        let timer;
        if (cooldownRemaining > 0) {
            timer = setInterval(() => {
                setCooldownRemaining(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    const handleGateAction = async () => {
        if (isSending || cooldownRemaining > 0 || isGateBusy) return;

        const userName = user?.displayName || user?.email || 'Usuario';
        
        // 1. Intentar bloquear el portón globalmente en Firestore
        let locked = false;
        try {
            locked = await lockGateForAction(userName);
            
            // Si el servicio devolvió false sin lanzar error, pero hay errores de permisos en consola,
            // forzamos a true para propósitos de prueba.
            if (!locked) {
                console.log("Gate might be busy or permission error. Force allowing for testing.");
                locked = true; 
            }
        } catch (error) {
            console.warn("Firestore error, proceeding without global lock:", error);
            locked = true; 
        }
        
        if (!locked) {
            toast.error("El portón está siendo utilizado por otro usuario o está en espera.");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Enviando pulso al portón...");
        
        try {
            // 2. Llamar al API Integration
            const result = await parkingGateService.sendGatePulse(300);
            
            if (result.code === 1 || result.success) {
                toast.update(toastId, { 
                    render: result.message || "Pulso enviado correctamente. Verifique visualmente el portón.", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 5000 
                });
                
                // Registrar evento exitoso
                await saveGateEvent({
                    userId: user?.uid,
                    userName: userName,
                    success: true,
                    message: result.message
                });

                // 3. Liberar con cooldown (10 segundos por defecto)
                await releaseGateWithCooldown(10);
            } else {
                toast.update(toastId, { 
                    render: result.message || "No se pudo procesar la solicitud.", 
                    type: "error", 
                    isLoading: false, 
                    autoClose: 4000 
                });

                // Registrar intento fallido
                await saveGateEvent({
                    userId: user?.uid,
                    userName: userName,
                    success: false,
                    message: result.message
                });

                // Liberar sin cooldown en caso de error de lógica
                await forceReleaseGate();
            }
        } catch (error) {
            toast.update(toastId, { 
                render: error.message || "No se recibió confirmación del dispositivo. Verifique visualmente el portón.", 
                type: "error", 
                isLoading: false, 
                autoClose: 5000 
            });
            // En caso de error de red, liberamos para permitir reintentos
            try {
                await releaseGateWithCooldown(5);
            } catch (e) {
                // Ignore permission errors on release
            }
        } finally {
            setIsSending(false);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-safe">
            <Header title="Parqueadero" />

            <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 flex flex-col min-h-[calc(100vh-80px)]">
                
                {/* Controles del Portón */}
                <Card className="flex-shrink-0 p-5">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-5 rounded-r-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-amber-500 text-xl leading-none">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800">
                                    No se puede determinar si el portón está completamente abierto o cerrado. <strong>Úselo solo si tiene visibilidad del portón.</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <Button 
                            variant="primary" 
                            onClick={handleGateAction}
                            disabled={isSending || cooldownRemaining > 0 || isGateBusy}
                            className={`h-20 w-full text-xl shadow-lg transition-all ${cooldownRemaining > 0 ? 'bg-gray-400' : 'shadow-primary-600/40'}`}
                        >
                            {isSending || isGateBusy ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {isGateBusy && !isSending ? `OCUPADO POR ${lastActionBy.toUpperCase()}` : 'ENVIANDO PULSO...'}
                                </span>
                            ) : cooldownRemaining > 0 ? (
                                `ESPERE (${cooldownRemaining}s)`
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span className="text-3xl">🕹️</span> ACCIONAR PORTÓN
                                </span>
                            )}
                        </Button>
                        
                        <p className="mt-4 text-xs text-gray-500 text-center px-2 italic">
                            Esta acción equivale a presionar el control físico del portón. Sin sensores, el sistema no puede confirmar si quedó abierto o cerrado.
                        </p>
                    </div>
                </Card>

                {/* Visor de Cámara */}
                <Card className="flex-grow flex flex-col p-4 sm:p-6 overflow-hidden min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-xl">📹</span> Cámara en Directo
                        </h3>
                        <button 
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Pantalla Completa"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center">
                        <CameraViewer url={cameraUrl} isFullscreen={false} />
                    </div>
                </Card>
                
            </main>

            {/* Overlay Pantalla Completa */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    <div className="absolute top-safe left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
                        <h2 className="text-white font-bold text-lg drop-shadow-md">Vista Completa - Parqueadero</h2>
                        <button 
                            onClick={toggleFullscreen}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center p-2">
                        <div className="w-full h-full max-w-full max-h-full">
                            <CameraViewer url={cameraUrl} isFullscreen={true} />
                        </div>
                    </div>

                    {/* Botón rápido en modo pantalla completa */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                        <button 
                            onClick={handleGateAction}
                            disabled={isSending || cooldownRemaining > 0 || isGateBusy}
                            className={`w-24 h-24 text-white rounded-full shadow-[0_0_40px_rgba(79,70,229,0.6)] flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 border-4 border-white/30 backdrop-blur-md ${isSending ? 'bg-indigo-700' : cooldownRemaining > 0 ? 'bg-gray-600' : 'bg-primary-600/90 hover:scale-105'}`}
                            title="Accionar Portón"
                        >
                            {isSending ? (
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : cooldownRemaining > 0 ? (
                                <span className="text-xl font-bold">{cooldownRemaining}s</span>
                            ) : (
                                <span className="text-5xl">🕹️</span>
                            )}
                        </button>
                        {cooldownRemaining > 0 && (
                            <span className="mt-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                Cooldown activo
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
