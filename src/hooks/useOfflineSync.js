import { useEffect, useCallback } from 'react';
import { useOffline } from '../context/OfflineContext';

export const useOfflineSync = () => {
    const { isOnline, syncQueue, removeFromQueue } = useOffline();

    const syncPendingData = useCallback(async () => {
        if (!isOnline || syncQueue.length === 0) {
            return;
        }

        console.log('Syncing pending data...', syncQueue);

        for (const item of syncQueue) {
            try {
                // Aquí se procesaría cada item de la cola
                // Por ejemplo, registrar asistencia pendiente

                // Si se sincroniza exitosamente, remover de la cola
                removeFromQueue(item.id);
            } catch (error) {
                console.error('Error syncing item:', item, error);
                // Mantener en la cola para reintentar después
            }
        }
    }, [isOnline, syncQueue, removeFromQueue]);

    useEffect(() => {
        // Intentar sincronizar cuando vuelve la conexión
        if (isOnline) {
            syncPendingData();
        }
    }, [isOnline, syncPendingData]);

    return {
        syncPendingData,
        hasPendingSync: syncQueue.length > 0
    };
};
