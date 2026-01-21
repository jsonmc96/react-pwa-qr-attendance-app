import { Header } from '../../components/layout/Header';

import { Card } from '../../components/common/Card';
import { QRScanner } from '../../components/qr/QRScanner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export const ScanQR = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Redirigir al calendario después de 2 segundos
        setTimeout(() => {
            navigate(ROUTES.USER_ATTENDANCE);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Registrar Asistencia" />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <QRScanner onSuccess={handleSuccess} />

                {/* Instrucciones */}
                <Card>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Instrucciones</h4>
                            <ol className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-semibold">1.</span>
                                    <span>Permite el acceso a la cámara cuando se solicite</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-semibold">2.</span>
                                    <span>Apunta al código QR generado por el administrador</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-semibold">3.</span>
                                    <span>Mantén el código centrado en el cuadro</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 font-semibold">4.</span>
                                    <span>El escaneo y registro son automáticos</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </Card>

                {/* Tips */}
                <Card className="bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h4 className="font-semibold text-success-900 mb-1">Consejo</h4>
                            <p className="text-sm text-success-700">
                                Solo puedes registrar tu asistencia una vez por día. Asegúrate de escanear el código QR correcto.
                            </p>
                        </div>
                    </div>
                </Card>
            </main>


        </div>
    );
};
