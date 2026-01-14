import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const useQRScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [error, setError] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        return () => {
            // Cleanup: detener scanner al desmontar
            if (scanner) {
                scanner.stop().catch(err => console.error('Error stopping scanner:', err));
            }
        };
    }, [scanner]);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setHasPermission(true);
            return true;
        } catch (err) {
            console.error('Camera permission denied:', err);
            setHasPermission(false);
            setError('Se requiere permiso de cámara para escanear códigos QR');
            return false;
        }
    };

    const startScanning = async (elementId, onSuccess, onError) => {
        try {
            setError(null);

            // Solicitar permiso si no se ha solicitado
            if (hasPermission === null) {
                const granted = await requestPermission();
                if (!granted) {
                    return false;
                }
            }

            const html5QrCode = new Html5Qrcode(elementId);
            setScanner(html5QrCode);

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: 'environment' }, // Cámara trasera
                config,
                (decodedText) => {
                    // QR escaneado exitosamente
                    onSuccess(decodedText);
                },
                (errorMessage) => {
                    // Error de escaneo (normal mientras busca QR)
                    // No mostrar estos errores al usuario
                }
            );

            setIsScanning(true);
            return true;
        } catch (err) {
            console.error('Error starting scanner:', err);
            const errorMsg = err.message || 'Error al iniciar el escáner';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return false;
        }
    };

    const stopScanning = async () => {
        if (scanner && isScanning) {
            try {
                await scanner.stop();
                setIsScanning(false);
                setScanner(null);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    return {
        isScanning,
        error,
        hasPermission,
        startScanning,
        stopScanning,
        requestPermission
    };
};
