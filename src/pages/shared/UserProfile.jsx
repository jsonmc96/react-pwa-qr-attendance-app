import { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { getMonthlyAttendance } from '../../services/attendance/attendanceService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';

export const UserProfile = () => {
    const { user } = useAuth();
    const [userQR, setUserQR] = useState('');
    const [monthlyAttendance, setMonthlyAttendance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (user) {
            loadProfileData();
            generateUserQR();
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

    const generateUserQR = () => {
        const timestamp = Date.now();
        const qrData = `USER_QR:${user.uid}:${timestamp}`;
        setUserQR(qrData);
    };

    const handleRefreshQR = () => {
        generateUserQR();
    };

    const handleDownloadQR = async () => {
        try {
            // Obtener el contenedor completo del QR (con iniciales y decoraciones)
            const qrContainer = document.getElementById('qr-container');
            if (!qrContainer) {
                console.error('QR container not found');
                return;
            }

            // Usar html2canvas para capturar todo el diseño
            const canvas = await html2canvas(qrContainer, {
                backgroundColor: null,
                scale: 2, // Mayor calidad
                logging: false
            });

            // Descargar como PNG
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `mi-qr-${user.displayName || user.email}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (error) {
            console.error('Error downloading QR:', error);
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

                    <div className="flex flex-col items-center">
                        {/* QR Code con diseño mejorado e iniciales */}
                        <div id="qr-container" className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl border-2 border-primary-200 shadow-lg mb-4 relative">

                            {/* Decoración de esquinas */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary-400 rounded-br-lg"></div>

                            {/* Contenedor relativo para QR + Iniciales */}
                            <div className="relative inline-block">
                                <QRCodeSVG
                                    id="user-qr-code"
                                    value={userQR}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    fgColor="#2563eb"
                                    bgColor="#ffffff"
                                />

                                {/* Iniciales en el centro del QR */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                        <span className="text-white font-bold text-lg">
                                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                                            {user.displayName && user.displayName.split(' ')[1]
                                                ? user.displayName.split(' ')[1].charAt(0).toUpperCase()
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones - Grid responsivo */}
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                                onClick={handleRefreshQR}
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Actualizar
                            </button>
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                Expandir
                            </button>
                            <button
                                onClick={handleDownloadQR}
                                className="col-span-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar QR
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>ℹ️ Nota:</strong> Este QR se genera automáticamente cada vez que abres esta página. Es válido únicamente para registro manual por parte del administrador.
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

            {/* Modal Fullscreen QR */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div className="relative">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-2xl border-2 border-primary-200 relative">
                            {/* Decoración de esquinas */}
                            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg"></div>

                            {/* Contenedor relativo para QR + Iniciales */}
                            <div className="relative inline-block">
                                <QRCodeSVG
                                    value={userQR}
                                    size={300}
                                    level="H"
                                    includeMargin={true}
                                    fgColor="#2563eb"
                                    bgColor="#ffffff"
                                />

                                {/* Iniciales en el centro del QR (más grande para fullscreen) */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                                        <span className="text-white font-bold text-3xl">
                                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                                            {user.displayName && user.displayName.split(' ')[1]
                                                ? user.displayName.split(' ')[1].charAt(0).toUpperCase()
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
