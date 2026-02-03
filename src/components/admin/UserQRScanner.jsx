import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { toast } from 'react-toastify';

/**
 * Componente de escaneo de QR personal de usuarios
 * Usa html5-qrcode para mejor control de cámara
 */
export const UserQRScanner = ({ users, selectedUsers = [], onUserScanned }) => {
    const scannerRef = useRef(null);
    const selectedUsersRef = useRef(selectedUsers);
    const processingRef = useRef(false);

    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);

    // Mantener selectedUsers actualizado
    useEffect(() => {
        selectedUsersRef.current = selectedUsers;
        console.log('[Scanner] selectedUsers updated:', selectedUsers);
    }, [selectedUsers]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            console.log('[Scanner] Unmounting');
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        console.log('[Scanner] ===== STOPPING =====');

        if (scannerRef.current) {
            try {
                const scanner = scannerRef.current;

                if (scanner.isScanning) {
                    console.log('[Scanner] Stopping scanner...');
                    await scanner.stop();
                    console.log('[Scanner] ✅ Scanner stopped');
                }

                await scanner.clear();
                console.log('[Scanner] ✅ Scanner cleared');

            } catch (err) {
                console.error('[Scanner] Error stopping:', err);
            }

            scannerRef.current = null;
        }

        setScanning(false);
        processingRef.current = false;
        console.log('[Scanner] ===== STOPPED =====');
    };

    const startScanning = async () => {
        try {
            console.log('[Scanner] ===== STARTING =====');
            setError(null);
            processingRef.current = false;

            // Detener cualquier scanner previo
            await stopScanner();

            // Crear nuevo scanner
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            console.log('[Scanner] Starting camera...');

            // Configuración optimizada - sin qrbox para escaneo de pantalla completa
            const config = {
                fps: 30, // Alta velocidad de escaneo
                aspectRatio: 1.777 // 16:9 para usar toda la pantalla
            };

            // Iniciar scanner
            await scanner.start(
                { facingMode: "environment" },
                config,
                async (decodedText) => {
                    // Prevenir procesamiento concurrente
                    if (processingRef.current) {
                        console.log('[Scanner] Already processing, skip');
                        return;
                    }

                    console.log('[Scanner] QR detected:', decodedText);
                    await handleQRScanned(decodedText);
                },
                (errorMessage) => {
                    // Ignorar errores normales
                }
            );

            console.log('[Scanner] ✅ Camera started');
            setScanning(true);

        } catch (err) {
            console.error('[Scanner] Error starting:', err);
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
            await stopScanner();
        }
    };

    const handleQRScanned = async (qrData) => {
        processingRef.current = true;

        try {
            console.log('[Scanner] Processing:', qrData);

            // Validar formato
            const parts = qrData.split(':');
            if (parts.length !== 3 || parts[0] !== 'USER_QR') {
                console.log('[Scanner] Invalid format');
                setError('QR inválido');
                setTimeout(() => {
                    setError(null);
                    processingRef.current = false;
                }, 2000);
                return;
            }

            const userId = parts[1];
            console.log('[Scanner] UserId:', userId);
            console.log('[Scanner] Current selected (ref):', selectedUsersRef.current);

            // VERIFICAR DUPLICADOS usando ref
            if (selectedUsersRef.current.includes(userId)) {
                console.log('[Scanner] ❌ DUPLICATE');
                toast.success('Usuario ya está en la lista');
                processingRef.current = false;
                return;
            }

            // Verificar usuario existe
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists()) {
                console.log('[Scanner] User not found');
                setError('Usuario no encontrado');
                setTimeout(() => {
                    setError(null);
                    processingRef.current = false;
                }, 2000);
                return;
            }

            const userData = userDoc.data();
            console.log('[Scanner] ✅ User:', userData.displayName);

            // Agregar usuario
            onUserScanned(userId);

            toast.success(`${userData.displayName || userData.email} agregado`);
            processingRef.current = false;

        } catch (err) {
            console.error('[Scanner] Error:', err);
            setError('Error al procesar QR');
            setTimeout(() => {
                setError(null);
                processingRef.current = false;
            }, 2000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Scanner Container */}
            <div id="qr-reader" className="rounded-lg overflow-hidden"></div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-pulse">
                    ❌ {error}
                </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                    <strong>ℹ️ Instrucciones:</strong>
                    {scanning ? (
                        <> Apunta la cámara al QR personal del usuario. Se agregará automáticamente a la lista.</>
                    ) : (
                        <> Presiona "Iniciar Escaneo" para activar la cámara.</>
                    )}
                </p>
            </div>

            {/* Control Button */}
            <button
                onClick={scanning ? stopScanner : startScanning}
                disabled={processingRef.current}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${scanning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                    } ${processingRef.current ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {scanning ? '⏸️ DETENER ESCANEO' : '📷 INICIAR ESCANEO'}
            </button>
        </div>
    );
};
