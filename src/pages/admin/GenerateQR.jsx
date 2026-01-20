import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';
import { QRGenerator } from '../../components/qr/QRGenerator';

export const GenerateQR = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
            <Header title="Generar QR" />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <QRGenerator />

                {/* Información */}
                <Card>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">ℹ️</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Información del QR</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>El código QR es válido solo para el día actual</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Compártelo con los usuarios para que registren su asistencia</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Puedes regenerarlo si es necesario (el anterior dejará de funcionar)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Descarga o comparte el QR directamente desde aquí</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Seguridad */}
                <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <h4 className="font-semibold text-yellow-900 mb-1">Seguridad</h4>
                            <p className="text-sm text-yellow-700">
                                Cada código QR incluye un hash SHA-256 único que garantiza la autenticidad y previene duplicados.
                            </p>
                        </div>
                    </div>
                </Card>
            </main>

            <BottomNav />
        </div>
    );
};
