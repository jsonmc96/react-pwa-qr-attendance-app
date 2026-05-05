import { useState, memo, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
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
import { SwipeButton } from '../../components/common/SwipeButton';
import { ParkingMap } from '../../components/parking/ParkingMap';
import { releaseUserSpot } from '../../services/firebase/parkingMapSync';

// ─── Visor de cámara memoizado ────────────────────────────────────────────────
const CameraViewer = memo(({ url, isFullscreen }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (!url) {
        return (
            <div className={`w-full ${isFullscreen ? 'h-full' : 'aspect-video'} bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-600`}>
                <span className="text-5xl mb-3 opacity-40">📷</span>
                <p className="font-semibold text-sm">Cámara no configurada</p>
                <p className="text-xs mt-1 opacity-60">Configure VITE_PARKING_CAMERA_URL</p>
            </div>
        );
    }

    const isIframe = url.includes('youtube.com') || url.includes('embed') || url.includes('iframe');
    const isVideo  = url.endsWith('.mp4') || url.endsWith('.webm');

    return (
        <div className={`relative w-full ${isFullscreen ? 'h-full' : 'aspect-video'} bg-black rounded-xl overflow-hidden shadow-inner`}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="w-8 h-8 border-4 border-slate-600 border-t-white rounded-full animate-spin" />
                </div>
            )}
            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center">
                    <span className="text-4xl mb-3 opacity-50">🔌</span>
                    <p className="text-sm font-medium">No se pudo cargar la transmisión.</p>
                    <button 
                        onClick={() => { setHasError(false); setIsLoading(true); }}
                        className="mt-3 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : isIframe ? (
                <iframe src={url} className="w-full h-full border-0" allowFullScreen
                    onLoad={() => setIsLoading(false)} onError={() => setHasError(true)} />
            ) : isVideo ? (
                <video src={url} className="w-full h-full object-contain" autoPlay muted playsInline loop
                    onLoadedData={() => setIsLoading(false)} onError={() => setHasError(true)} />
            ) : (
                <img src={url} alt="Cámara del parqueadero" className="w-full h-full object-contain"
                    onLoad={() => setIsLoading(false)} onError={() => setHasError(true)} loading="lazy" />
            )}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
            {!hasError && !isLoading && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    EN VIVO
                </div>
            )}
        </div>
    );
});
CameraViewer.displayName = 'CameraViewer';


// ─── Componente principal ─────────────────────────────────────────────────────
export const ParkingGatePage = () => {
    const { user } = useAuth();
    const [isSending, setIsSending]               = useState(false);
    const [isFullscreen, setIsFullscreen]         = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [isGateBusy, setIsGateBusy]             = useState(false);
    const [lastActionBy, setLastActionBy]         = useState('');
    // 'idle' | 'confirming' | 'occupying'
    const [flow, setFlow]                         = useState('idle');
    // 'camera' | 'map'
    const [activeTab, setActiveTab]               = useState('camera');

    const cameraUrl = import.meta.env.VITE_PARKING_CAMERA_URL;

    // Suscripción al estado global del portón
    useEffect(() => {
        const unsubscribe = subscribeToGateStatus((status) => {
            setIsGateBusy(status.isBusy);
            setCooldownRemaining(status.cooldownRemaining);
            setLastActionBy(status.lastActionBy);
        });
        return () => unsubscribe();
    }, []);

    // Contador regresivo de cooldown
    useEffect(() => {
        if (cooldownRemaining <= 0) return;
        const timer = setInterval(() => {
            setCooldownRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    // ── Acción principal del portón ──────────────────────────────────────────
    const handleGateAction = async () => {
        if (isSending || cooldownRemaining > 0 || isGateBusy) return;

        const userName = user?.displayName || user?.email || 'Usuario';
        let locked = false;
        try {
            locked = await lockGateForAction(userName);
            if (!locked) locked = true; // fallback for permission issues
        } catch {
            locked = true;
        }

        if (!locked) {
            toast.error("El portón está siendo utilizado por otro usuario.");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Enviando pulso al portón...");

        try {
            const result = await parkingGateService.sendGatePulse(300);
            const ok = result.code === 1 || result.success;

            toast.update(toastId, {
                render: ok
                    ? (result.message || "✅ Pulso enviado. Verifica el portón.")
                    : (result.message || "No se pudo procesar la solicitud."),
                type: ok ? "success" : "error",
                isLoading: false,
                autoClose: ok ? 5000 : 4000,
            });

            await saveGateEvent({ userId: user?.uid, userName, success: ok, message: result.message });
            await (ok ? releaseGateWithCooldown(10) : forceReleaseGate());

            if (ok) setFlow('confirming');
        } catch (error) {
            toast.update(toastId, {
                render: error.message || "Sin respuesta del dispositivo. Verifica el portón.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
            try { await releaseGateWithCooldown(5); } catch (_) { /* ignore */ }
        } finally {
            setIsSending(false);
        }
    };

    // ── Handlers de flujo ────────────────────────────────────────────────────
    const handleConfirmEntry = () => {
        setFlow('occupying');
        setActiveTab('map'); // Abrir tab de mapa al entrar
    };

    const handleConfirmExit = async () => {
        const toastId = toast.loading("Liberando puesto...");
        await releaseUserSpot(user?.uid);
        toast.update(toastId, {
            render: "🚀 Puesto liberado. ¡Buen viaje!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
        });
        setFlow('idle');
    };

    const handleSpotSelected = () => setFlow('idle');
    const handleSkip         = () => setFlow('idle');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-safe">
            <Header title="Parqueadero" />

            <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">

                {/* ── Card de Control del Portón ─────────────────────────── */}
                <Card className="p-5">
                    {/* Aviso */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-5 rounded-r-lg flex gap-3 items-start">
                        <span className="text-xl leading-none mt-0.5">⚠️</span>
                        <p className="text-sm text-amber-800">
                            No se puede determinar si el portón está completamente abierto o cerrado.{' '}
                            <strong>Úselo solo si tiene visibilidad del portón.</strong>
                        </p>
                    </div>

                    {/* SwipeButton */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-sm">
                            <SwipeButton
                                onSuccess={handleGateAction}
                                text={isGateBusy ? `Ocupado por ${lastActionBy}` : "Desliza para accionar"}
                                disabled={isSending || cooldownRemaining > 0 || isGateBusy}
                                loading={isSending}
                                small={true}
                            />
                            {cooldownRemaining > 0 && (
                                <p className="text-center text-[10px] text-indigo-600 font-bold mt-2 animate-pulse tracking-wider">
                                    ESPERA DE SEGURIDAD: {cooldownRemaining}s
                                </p>
                            )}
                        </div>

                        {/* ── Flujo: Confirmar Entrada / Salida ─────────── */}
                        {flow === 'confirming' && (
                            <div className="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-lg">
                                <p className="text-sm font-bold text-gray-800 text-center mb-4">
                                    ¿Cuál es tu siguiente paso?
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* ENTRAR */}
                                    <button
                                        onClick={handleConfirmEntry}
                                        className="group flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl transition-all active:scale-95 hover:shadow-md"
                                    >
                                        <span className="text-3xl mb-1.5">🏠</span>
                                        <span className="text-xs font-black text-emerald-700 tracking-wide">ENTRAR</span>
                                        <span className="text-[9px] text-emerald-500 mt-0.5">Seleccionar puesto</span>
                                    </button>

                                    {/* SALIR */}
                                    <button
                                        onClick={handleConfirmExit}
                                        className="group flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl transition-all active:scale-95 hover:shadow-md"
                                    >
                                        <span className="text-3xl mb-1.5">🚗</span>
                                        <span className="text-xs font-black text-amber-700 tracking-wide">SALIR</span>
                                        <span className="text-[9px] text-amber-500 mt-0.5">Liberar mi puesto</span>
                                    </button>
                                </div>

                                {/* Omitir – más visible pero sin robar espacio */}
                                <button
                                    onClick={handleSkip}
                                    className="w-full mt-3 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>↩️</span>
                                    Omitir — Solo mantenimiento
                                </button>
                            </div>
                        )}

                        {/* ── Flujo: Seleccionar Puesto (se muestra inline aquí en mobile) ── */}
                        {flow === 'occupying' && (
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
                                        📍 Selecciona tu puesto
                                    </h4>
                                    <button
                                        onClick={() => setFlow('idle')}
                                        className="text-xs text-indigo-600 font-semibold hover:underline"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                                <ParkingMap user={user} onSpotSelected={handleSpotSelected} />
                            </div>
                        )}

                        {/* Hint en idle */}
                        {flow === 'idle' && !isGateBusy && (
                            <p className="text-[10px] text-gray-400 text-center px-4 italic leading-relaxed">
                                Desliza para accionar el portón. Luego podrás indicar si estás entrando o saliendo.
                            </p>
                        )}
                    </div>
                </Card>

                {/* ── Card de Tabs: Cámara / Mapa ───────────────────────── */}
                <Card className="overflow-hidden p-0">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('camera')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 md:py-2.5 text-xs md:text-sm font-bold transition-all ${
                                activeTab === 'camera'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>📷</span> Cámara
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 md:py-2.5 text-xs md:text-sm font-bold transition-all ${
                                activeTab === 'map'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>🗺️</span> Mapa
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                        {activeTab === 'camera' && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <span>📹</span> Transmisión en Directo
                                    </h3>
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                        title="Pantalla completa"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>
                                <CameraViewer url={cameraUrl} isFullscreen={false} />
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <span>🗺️</span> Estado del Parqueadero
                                    </h3>
                                </div>
                                <ParkingMap user={user} readOnly={false} onSpotSelected={handleSpotSelected} />
                            </div>
                        )}
                    </div>
                </Card>

            </main>

            {/* ── Overlay Pantalla Completa (Cámara) ────────────────────── */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
                        <h2 className="text-white font-bold text-lg drop-shadow-md">Vista Completa — Parqueadero</h2>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-grow flex items-center justify-center p-2">
                        <div className="w-full h-full max-w-full max-h-full">
                            <CameraViewer url={cameraUrl} isFullscreen={true} />
                        </div>
                    </div>

                    {/* Botón rápido en pantalla completa */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                        <button
                            onClick={handleGateAction}
                            disabled={isSending || cooldownRemaining > 0 || isGateBusy}
                            className={`w-24 h-24 text-white rounded-full shadow-[0_0_40px_rgba(79,70,229,0.6)] flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 border-4 border-white/30 backdrop-blur-md ${
                                isSending           ? 'bg-indigo-700' :
                                cooldownRemaining > 0 ? 'bg-gray-600'   :
                                'bg-indigo-600/90 hover:scale-105'
                            }`}
                        >
                            {isSending ? (
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
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
