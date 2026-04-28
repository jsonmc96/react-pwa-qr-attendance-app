export const parkingGateService = {
    /**
     * Envía un pulso al portón del parqueadero.
     * @param {number} timeMs Tiempo en milisegundos para el pulso.
     * @returns {Promise<{code: string, message: string, payload: any}>}
     */
    sendGatePulse: async (timeMs = 300) => {
        const apiUrl = import.meta.env.VITE_PARKING_GATE_API_URL;
        
        if (!apiUrl) {
            throw new Error('La URL de la API del portón no está configurada.');
        }

        try {
            // El usuario indicó el endpoint: /api/parking/gate/pulse?time_ms=300
            // Usamos POST como se solicitó
            const response = await fetch(`${apiUrl}/api/parking/gate/pulse?time_ms=${timeMs}`, {
                method: 'POST'
            });

            if (!response.ok && response.status !== 429) {
                throw new Error('Error al conectar con el servidor de integración.');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error in sendGatePulse:', error);
            throw error;
        }
    }
};
