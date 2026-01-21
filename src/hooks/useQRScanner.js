import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

export const useQRScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const codeReaderRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup: detener scanner al desmontar
            stopScanning();
        };
    }, []);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
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

    const startScanning = async (videoElementId, onSuccess, onError) => {
        try {
            setError(null);

            // Solicitar permiso si no se ha solicitado
            if (hasPermission === null) {
                const granted = await requestPermission();
                if (!granted) {
                    return false;
                }
            }

            // Marcar como scanning primero
            setIsScanning(true);

            // Esperar a que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar que el elemento existe
            const videoElement = document.getElementById(videoElementId);
            if (!videoElement) {
                throw new Error('Elemento de video no encontrado');
            }

            videoRef.current = videoElement;

            // Crear instancia de ZXing reader
            const codeReader = new BrowserQRCodeReader();
            codeReaderRef.current = codeReader;

            // Configurar constraints de video para máxima calidad y velocidad
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    focusMode: 'continuous',
                    frameRate: { ideal: 30 }
                }
            };

            // Iniciar escaneo continuo
            await codeReader.decodeFromConstraints(
                constraints,
                videoElementId,
                (result, error) => {
                    if (result) {
                        // ✅ QR detectado exitosamente
                        console.log('QR detectado:', result.getText());
                        onSuccess(result.getText());
                    }
                    // Los errores de "no encontrado" son normales durante el escaneo
                    // Solo logueamos errores críticos
                    if (error && error.name !== 'NotFoundException') {
                        console.warn('Scanner error:', error);
                    }
                }
            );

            return true;
        } catch (err) {
            console.error('Error starting scanner:', err);
            const errorMsg = err.message || 'Error al iniciar el escáner';
            setError(errorMsg);
            setIsScanning(false);
            if (onError) onError(errorMsg);
            return false;
        }
    };

    const stopScanning = async () => {
        if (codeReaderRef.current) {
            try {
                codeReaderRef.current.reset();
                setIsScanning(false);
                codeReaderRef.current = null;
                videoRef.current = null;
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
