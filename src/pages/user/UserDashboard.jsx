import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getTodayISO } from '../../utils/dateHelpers';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isInstallable, promptInstall } = usePWAInstall();

    const handleInstall = async () => {
        await promptInstall();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Mi Panel" />

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                <Card>
                    <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Hola, {user?.displayName}!
                        </h2>
                        <p className="text-gray-600">
                            {formatDate(getTodayISO(), 'EEEE, dd MMMM yyyy')}
                        </p>
                    </div>
                </Card>

                {isInstallable && (
                    <Card className="bg-primary-50 border-2 border-primary-200">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">📲</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-primary-900">Instalar App</h3>
                                <p className="text-sm text-primary-700">Accede más rápido desde tu pantalla de inicio</p>
                            </div>
                            <Button onClick={handleInstall} variant="primary">
                                Instalar
                            </Button>
                        </div>
                    </Card>
                )}

                <div className="grid gap-4">
                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.USER_SCAN_QR)}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">📷</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Registrar Asistencia</h3>
                                <p className="text-sm text-gray-600">Escanear código QR</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                    </Card>

                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.USER_ATTENDANCE)}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">📅</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Mi Asistencia</h3>
                                <p className="text-sm text-gray-600">Ver calendario mensual</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                    </Card>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};
