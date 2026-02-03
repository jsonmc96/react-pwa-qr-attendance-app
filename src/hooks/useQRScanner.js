import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export const useQRScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const codeReaderRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanningRef = useRef(false);

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
                    facingMode: 'environment'
                }
            });
            stream.getTracks().forEach(track => track.stop());
            setHasPermission(true);
            return { success: true };
        } catch (err) {
            console.error('Camera permission denied:', err);

            // Use the new permission utilities for better error messages
            const { getPermissionErrorDetails } = await import('../utils/permissions');
            const errorDetails = getPermissionErrorDetails(err, 'camera');

            setHasPermission(false);
            setError(errorDetails.message);

            return {
                success: false,
                error: errorDetails.message,
                errorCode: errorDetails.code,
                isPermissionError: errorDetails.isPermissionError,
                os: errorDetails.os
            };
        }
    };

    const startScanning = async (videoElementId, onSuccess, onError, userData = null) => {
        try {
            setError(null);

            // ✅ VALIDACIÓN 1: Verificar ventana horaria PRIMERO
            // Es una validación "gratis" (no requiere permisos del usuario)
            // No tiene sentido pedir permisos si ni siquiera es la hora correcta
            const { isWithinAllowedTime } = await import('../utils/timeValidation');
            const timeValidation = isWithinAllowedTime();

            if (!timeValidation.isValid) {
                const errorMsg = timeValidation.message;
                setError(errorMsg);
                if (onError) onError(errorMsg);
                return {
                    success: false,
                    error: errorMsg,
                    errorCode: 'TIME_VALIDATION_FAILED',
                    isPermissionError: false
                };
            }

            // ✅ VALIDACIÓN 2: Verificar tipo de empleado y ubicación GPS (si aplica)
            // Validar GPS ANTES de pedir cámara (para empleados presenciales)
            if (userData && userData.employeeType === 'onsite') {
                const { validateOnsiteLocation } = await import('../utils/locationValidation');
                const { getSystemConfig } = await import('../services/backend/providers/firebase/admin');

                // Obtener configuración de geofence
                const systemConfig = await getSystemConfig();
                const geofence = systemConfig.churchLocation;

                // Validar ubicación (esto pedirá permiso de GPS si no lo tiene)
                const locationValidation = await validateOnsiteLocation(geofence);

                if (!locationValidation.isValid) {
                    const errorMsg = locationValidation.error || locationValidation.message;
                    setError(errorMsg);
                    if (onError) onError(errorMsg);
                    return {
                        success: false,
                        error: errorMsg,
                        errorCode: 'GPS_VALIDATION_FAILED',
                        isPermissionError: false
                    };
                }

                console.log('✅ Location validated:', locationValidation.distance, 'meters from church');
            }

            // ✅ VALIDACIÓN 3: Solicitar permiso de cámara AL FINAL
            // Solo pedimos cámara si pasó todas las validaciones anteriores
            // Verificar si NO tenemos permiso (null o false)
            if (hasPermission !== true) {
                const permissionResult = await requestPermission();
                if (!permissionResult.success) {
                    return permissionResult; // Return detailed error info
                }
            }


            // Marcar como scanning primero
            setIsScanning(true);
            scanningRef.current = true;

            // Esperar a que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar que el elemento existe
            const videoElement = document.getElementById(videoElementId);
            if (!videoElement) {
                throw new Error('Elemento de video no encontrado');
            }

            videoRef.current = videoElement;

            // ✨ OPTIMIZACIÓN: Crear hints para mejor detección
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

            // ✨ CRÍTICO: TRY_HARDER = true para detectar en ángulos y distancias
            hints.set(DecodeHintType.TRY_HARDER, true);

            console.log('🎯 Hints configured: QR_CODE only, TRY_HARDER enabled');

            const codeReader = new BrowserQRCodeReader(hints);
            codeReaderRef.current = codeReader;

            // ✨ COMPATIBILIDAD MÓVIL: Obtener stream manualmente
            // iOS requiere: ideal (no strict), muted, playsInline
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },  // ideal (no strict) para iOS
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                },
                audio: false  // Explícitamente false para evitar problemas
            };

            console.log('📹 Requesting camera stream...');
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            videoElement.srcObject = stream;

            // ✅ iOS Safari compatibility: muted + playsInline para autoplay
            videoElement.muted = true;
            videoElement.playsInline = true;
            videoElement.setAttribute('playsinline', '');  // Legacy iOS Safari

            // Asegurar que el video esté completamente listo
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Video timeout')), 5000);

                videoElement.onloadedmetadata = () => {
                    console.log('📹 Video metadata loaded');
                    clearTimeout(timeout);
                    resolve();
                };
            });

            // Reproducir video
            await videoElement.play();
            console.log('▶️ Video playing');

            // Esperar un frame adicional
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verificar dimensiones
            if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                throw new Error('Video sin dimensiones válidas');
            }

            console.log(`📐 Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            console.log('🔍 Starting QR detection loop...');

            // ✨ SOLUCIÓN AL ERROR AlignOK: Usar decodeOnce en loop
            const detectQR = async () => {
                if (!scanningRef.current) {
                    console.log('⏹️ Scanning stopped');
                    return;
                }

                try {
                    // Verificar que el video sigue listo
                    if (videoElement.readyState < 2) {
                        console.warn('⚠️ Video not ready, skipping frame');
                        setTimeout(detectQR, 100);
                        return;
                    }

                    // ✅ FIX: Usar decodeOnceFromVideoElement (no decodeFromVideoElement)
                    const result = await codeReader.decodeOnceFromVideoElement(videoElement);

                    if (result) {
                        console.log('✅ QR DETECTADO:', result.getText());

                        if (scanningRef.current) {
                            scanningRef.current = false; // Detener loop
                            onSuccess(result.getText());
                            return;
                        }
                    }
                } catch (err) {
                    // NotFoundException es normal cuando no hay QR en el frame
                    if (err.name === 'NotFoundException') {
                        // Silencioso, es esperado
                    } else {
                        console.error('❌ Scanner error:', err.name, err.message);
                    }
                }

                // Continuar escaneando
                if (scanningRef.current) {
                    setTimeout(detectQR, 100); // 10 intentos por segundo
                }
            };

            // Iniciar loop de detección
            detectQR();

            return true;
        } catch (err) {
            console.error('Error starting scanner:', err);

            // Use permission utilities for better error messages
            const { getPermissionErrorDetails } = await import('../utils/permissions');
            const errorDetails = getPermissionErrorDetails(err, 'camera');

            setError(errorDetails.message);
            setIsScanning(false);
            scanningRef.current = false;

            // Limpiar stream si falló
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            if (onError) onError(errorDetails.message);

            return {
                success: false,
                error: errorDetails.message,
                errorCode: errorDetails.code,
                isPermissionError: errorDetails.isPermissionError,
                os: errorDetails.os
            };
        }
    };

    const stopScanning = async () => {
        try {
            console.log('Stopping scanner...');

            // Marcar como no escaneando
            scanningRef.current = false;
            setIsScanning(false);

            // ✨ FIX CRÍTICO: Detener stream manualmente
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('Track stopped:', track.label);
                });
                streamRef.current = null;
            }

            // Limpiar video element
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.pause();
                videoRef.current = null;
            }

            // Limpiar reader reference
            if (codeReaderRef.current) {
                codeReaderRef.current = null;
            }

            console.log('Scanner stopped successfully');
        } catch (err) {
            console.error('Error stopping scanner:', err);
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
