import { Header } from '../../components/layout/Header';

import { Card } from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getTodayISO } from '../../utils/dateHelpers';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Panel de Administrador" />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Welcome Card */}
                <Card featured>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                            <span className="text-3xl">👨‍💼</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                ¡Bienvenido, {user?.displayName || 'Admin'}!
                            </h2>
                            <p className="text-gray-600 text-sm mt-1 capitalize">
                                {formatDate(getTodayISO(), 'EEEE, dd MMMM yyyy')}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.ADMIN_GENERATE_QR)}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md shadow-primary-600/20">
                                <span className="text-3xl">📱</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Generar QR</h3>
                                <p className="text-sm text-gray-600">Crear código QR del día</p>
                            </div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Card>

                    <Card hover className="cursor-pointer" onClick={() => navigate('/admin/qr-history')}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-600/20">
                                <span className="text-3xl">📋</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Historial QR</h3>
                                <p className="text-sm text-gray-600">Ver códigos generados</p>
                            </div>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Card>

                    <Card hover className="cursor-pointer" onClick={() => navigate(ROUTES.ADMIN_REPORTS)}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-md shadow-success-600/20">
                                <span className="text-3xl">📊</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Reportes</h3>
                                <p className="text-sm text-gray-600">Ver asistencia de usuarios</p>
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
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">ℹ️</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Panel de Administración</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Genera códigos QR únicos para cada día</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Revisa el historial de códigos generados</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 mt-0.5">•</span>
                                    <span>Consulta reportes de asistencia de usuarios</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </main>


        </div>
    );
};
