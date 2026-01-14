import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { QRDisplay } from './QRDisplay';
import { getQRHistory } from '../../services/firebase/firestoreHistory';
import { formatDate } from '../../utils/dateHelpers';
import { useNavigate } from 'react-router-dom';

export const QRHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQR, setSelectedQR] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const qrHistory = await getQRHistory(30);
            setHistory(qrHistory);
        } catch (err) {
            console.error('Error loading QR history:', err);
            setError('Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    const handleViewQR = (qr) => {
        setSelectedQR(qr);
    };

    const handleCloseModal = () => {
        setSelectedQR(null);
    };

    const handleDownloadQR = (qr) => {
        // Crear un canvas temporal para generar el QR
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Renderizar QR temporalmente
        import('qrcode.react').then(({ QRCodeCanvas }) => {
            const QRCode = QRCodeCanvas;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Generar QR
            canvas.width = 512;
            canvas.height = 512;

            // Aquí deberías usar la librería para generar el QR
            // Por simplicidad, usamos el método existente
            const link = document.createElement('a');
            link.download = `qr-${qr.date}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            document.body.removeChild(tempDiv);
        });
    };

    if (loading) {
        return <Loading text="Cargando historial..." />;
    }

    return (
        <>
            <Card title="Historial de Códigos QR">
                {error && (
                    <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📋</span>
                        <p className="text-gray-600">No hay códigos QR generados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((qr) => {
                            const isExpired = new Date() > qr.expiresAt;
                            const isToday = qr.date === new Date().toISOString().split('T')[0];

                            return (
                                <div
                                    key={qr.id}
                                    className={`
                    p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                    ${isExpired ? 'opacity-60' : ''}
                  `}
                                    onClick={() => handleViewQR(qr)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {formatDate(qr.date, 'EEEE, dd MMMM yyyy')}
                                                </h3>
                                                {isToday && (
                                                    <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                                                        Hoy
                                                    </span>
                                                )}
                                                {isExpired && (
                                                    <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-full">
                                                        Expirado
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Generado: {formatDate(qr.generatedAt, 'dd/MM/yyyy HH:mm')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 font-mono">
                                                Hash: {qr.qrHash.substring(0, 16)}...
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewQR(qr);
                                                }}
                                            >
                                                Ver QR
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={loadHistory}>
                        Actualizar
                    </Button>
                </div>
            </Card>

            {/* Modal para ver QR grande */}
            {selectedQR && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Código QR
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600 mb-1">
                                Fecha: <span className="font-semibold">{formatDate(selectedQR.date)}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDate(selectedQR.generatedAt, 'dd/MM/yyyy HH:mm')}
                            </p>
                        </div>

                        <div className="flex justify-center mb-6">
                            <QRDisplay value={selectedQR.qrHash} size={300} />
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    const canvas = document.querySelector('canvas');
                                    if (canvas) {
                                        const url = canvas.toDataURL('image/png');
                                        const link = document.createElement('a');
                                        link.download = `qr-asistencia-${selectedQR.date}.png`;
                                        link.href = url;
                                        link.click();
                                    }
                                }}
                            >
                                Descargar QR
                            </Button>
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={handleCloseModal}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
