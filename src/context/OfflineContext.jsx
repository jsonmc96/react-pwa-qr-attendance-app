import { createContext, useContext, useState, useEffect } from 'react';
import { MESSAGES, STORAGE_KEYS } from '../utils/constants';

const OfflineContext = createContext(null);

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
};

export const OfflineProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncQueue, setSyncQueue] = useState([]);

    useEffect(() => {
        // Cargar cola de sincronización desde localStorage
        const savedQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
        if (savedQueue) {
            setSyncQueue(JSON.parse(savedQueue));
        }

        // Listeners para detectar cambios de conectividad
        const handleOnline = () => {
            setIsOnline(true);
            console.log('Connection restored');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('Connection lost');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Guardar cola en localStorage cuando cambia
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(syncQueue));
    }, [syncQueue]);

    const addToQueue = (item) => {
        setSyncQueue(prev => [...prev, { ...item, timestamp: Date.now() }]);
    };

    const removeFromQueue = (itemId) => {
        setSyncQueue(prev => prev.filter(item => item.id !== itemId));
    };

    const clearQueue = () => {
        setSyncQueue([]);
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    };

    const value = {
        isOnline,
        isOffline: !isOnline,
        syncQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        offlineMessage: MESSAGES.INFO.OFFLINE_MODE
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};
