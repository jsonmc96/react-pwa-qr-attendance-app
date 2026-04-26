export const parkingGateService = {
    /**
     * Envía un comando al portón del parqueadero.
     * @param {'abrir' | 'cerrar'} accion 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    sendGateCommand: async (accion) => {
        const apiUrl = import.meta.env.VITE_PARKING_GATE_API_URL;
        
        if (!apiUrl) {
            throw new Error('La URL de la API del portón no está configurada.');
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accion })
            });

            if (!response.ok) {
                // Intenta obtener el mensaje de error de la API
                let errorMessage = 'Error al enviar el comando.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si no es JSON, usa el status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Suponemos que la API retorna algo como { success: true, message: "..." }
            // O simplemente status 200/201.
            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                // Ignore if not JSON
            }

            return {
                success: true,
                message: data.message || `Comando '${accion}' enviado correctamente.`
            };
        } catch (error) {
            console.error('Error in sendGateCommand:', error);
            throw new Error(error.message || 'Error de red al intentar conectar con el portón.');
        }
    }
};
