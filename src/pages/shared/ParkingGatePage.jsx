import { useState, memo } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { toast } from 'react-toastify';
import { parkingGateService } from '../../services/api/parkingGateService';
import { useAuth } from '../../context/AuthContext';

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
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const cameraUrl = import.meta.env.VITE_PARKING_CAMERA_URL;

    const handleGateAction = async (action) => {
        setIsActionLoading(true);
        const toastId = toast.loading(`Enviando comando para ${action}...`);
        
        try {
            const result = await parkingGateService.sendGateCommand(action);
            toast.update(toastId, { 
                render: result.message, 
                type: "success", 
                isLoading: false, 
                autoClose: 3000 
            });
        } catch (error) {
            toast.update(toastId, { 
                render: error.message || `No se pudo ${action} el portón.`, 
                type: "error", 
                isLoading: false, 
                autoClose: 4000 
            });
        } finally {
            setIsActionLoading(false);
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
                    <div className="text-center mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-3">
                            <span className="text-3xl">🚪</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Control de Accesos</h2>
                        <p className="text-sm text-gray-500">Portón principal</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="primary" 
                            onClick={() => handleGateAction('abrir')}
                            disabled={isActionLoading}
                            className="h-16 text-lg shadow-primary-600/40"
                        >
                            <span className="text-2xl mr-1">🔓</span> ABRIR
                        </Button>
                        
                        <Button 
                            variant="secondary" 
                            onClick={() => handleGateAction('cerrar')}
                            disabled={isActionLoading}
                            className="h-16 text-lg border border-gray-200"
                        >
                            <span className="text-2xl mr-1">🔒</span> CERRAR
                        </Button>
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

                    {/* Botones rápidos en modo pantalla completa */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6 z-10">
                        <button 
                            onClick={() => handleGateAction('abrir')}
                            disabled={isActionLoading}
                            className="w-16 h-16 bg-success-500/90 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                        >
                            🔓
                        </button>
                        <button 
                            onClick={() => handleGateAction('cerrar')}
                            disabled={isActionLoading}
                            className="w-16 h-16 bg-danger-500/90 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                        >
                            🔒
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
