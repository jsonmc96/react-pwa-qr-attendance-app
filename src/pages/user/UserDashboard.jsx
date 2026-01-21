import { Header } from '../../components/layout/Header';

import { Card } from '../../components/common/Card';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Inicio" />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Welcome Card */}
                <Card featured>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                            <span className="text-3xl">👋</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                ¡Hola, {user?.displayName || 'Usuario'}!
                            </h2>
                            <p className="text-gray-600 text-sm mt-1 capitalize">
                                {formatDate(getTodayISO(), 'EEEE, dd MMMM yyyy')}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Install PWA Banner */}
                {isInstallable && (
                    <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <span className="text-2xl">📲</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-primary-900">Instalar App</h3>
                                <p className="text-sm text-primary-700">Accede más rápido desde tu pantalla de inicio</p>
                            </div>
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
                            >
                                Instalar
                            </button>
                        </div>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.USER_SCAN_QR)}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-md shadow-success-600/20">
                                <span className="text-3xl">📷</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Registrar Asistencia</h3>
                                <p className="text-sm text-gray-600">Escanea el código QR del día</p>
                            </div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Card>

                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.USER_ATTENDANCE)}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md shadow-primary-600/20">
                                <span className="text-3xl">📅</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Mi Calendario</h3>
                                <p className="text-sm text-gray-600">Ver historial de asistencia</p>
                            </div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Card>
                </div>

                {/* Info Card */}
                <Card>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💡</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">¿Cómo funciona?</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Escanea el QR generado por el administrador</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Registra tu asistencia una vez por día</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Revisa tu historial en el calendario</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </main>


        </div>
    );
};
