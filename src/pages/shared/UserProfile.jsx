import { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { PersonalQRModal } from '../../components/user/PersonalQRModal';
import { getMonthlyAttendance } from '../../services/attendance/attendanceService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const UserProfile = () => {
    const { user } = useAuth();
    const [monthlyAttendance, setMonthlyAttendance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    }, [user]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            // Obtener asistencias del mes actual
            const currentMonth = new Date();
            const attendance = await getMonthlyAttendance(user.uid, currentMonth);
            setMonthlyAttendance(attendance?.length || 0);
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };


    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Mi Perfil" />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Información Personal */}
                <Card>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
                            <span className="text-3xl text-white font-bold">
                                {(user.displayName || user.email).charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {user.displayName || 'Usuario'}
                            </h2>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Usuario'}
                                </span>
                                {user.employeeType && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.employeeType === 'onsite'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {user.employeeType === 'onsite' ? '🏢 Presencial' : '🏠 Remoto'}
                                    </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.hasVehicle
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {user.hasVehicle ? '🚘 Con Vehículo' : '🚶 Sin Vehículo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Estadísticas */}
                <Card>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Estadísticas del Mes
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-success-50 to-emerald-50 p-4 rounded-xl border border-success-100">
                            <p className="text-sm text-success-700 font-medium mb-1">Total Asistencias</p>
                            <p className="text-3xl font-bold text-success-800">
                                {loading ? '...' : monthlyAttendance}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-700 font-medium mb-1">Mes Actual</p>
                            <p className="text-lg font-bold text-blue-800 capitalize">
                                {format(new Date(), 'MMMM', { locale: es })}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* QR Personal */}
                <Card>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">🎫</span>
                        Mi QR Personal
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Muestra este código QR al administrador para que registre tu asistencia manualmente
                    </p>

                    <Button
                        onClick={() => setShowQRModal(true)}
                        variant="primary"
                        fullWidth
                    >
                        📱 Ver Mi Código QR
                    </Button>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>ℹ️ Nota:</strong> Este QR se genera automáticamente cada vez que lo abres. Es válido únicamente para registro manual por parte del administrador.
                        </p>
                    </div>
                </Card>

                {/* Información de Sesión */}
                <Card>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">ℹ️</span>
                        Información de Sesión
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">ID de Usuario:</span>
                            <span className="text-gray-900 font-mono text-xs">{user.uid}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Última actualización:</span>
                            <span className="text-gray-900">
                                {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                            </span>
                        </div>
                    </div>
                </Card>
            </main>

            {/* Modal QR Personal */}
            {showQRModal && (
                <PersonalQRModal onClose={() => setShowQRModal(false)} />
            )}
        </div>
    );
};
