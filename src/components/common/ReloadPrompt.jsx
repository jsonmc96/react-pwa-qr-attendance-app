import { useRegisterSW } from 'virtual:pwa-register/react';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <>
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">
                                    {offlineReady ? '✓' : '🔄'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    {offlineReady
                                        ? 'App lista para trabajar sin conexión'
                                        : 'Nueva versión disponible'}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {offlineReady
                                        ? 'Todos los recursos están guardados'
                                        : 'Toca actualizar para obtener las mejoras'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            {needRefresh && (
                                <button
                                    onClick={() => updateServiceWorker(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 active:scale-95"
                                >
                                    Actualizar
                                </button>
                            )}
                            <button
                                onClick={close}
                                className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
