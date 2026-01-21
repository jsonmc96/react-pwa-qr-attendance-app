import { useState } from 'react';
import { Header } from '../../components/layout/Header';

import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Loading } from '../../components/common/Loading';
import { UserSelector } from '../../components/reports/UserSelector';
import { ExportButtons } from '../../components/reports/ExportButtons';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export const AttendanceReport = () => {
    // Report type state
    const [reportType, setReportType] = useState('date'); // 'date' | 'user'

    // Date report states (existing)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // User report states (new)
    const [selectedUser, setSelectedUser] = useState(null);
    const [userViewMode, setUserViewMode] = useState('total'); // 'total' | 'detail'

    // Common states
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Existing date-based search (UNCHANGED)
    const handleSearch = async () => {
        if (!startDate || !endDate) {
            alert('Por favor selecciona ambas fechas');
            return;
        }

        if (startDate > endDate) {
            alert('La fecha de inicio debe ser anterior a la fecha fin');
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            // Query attendance in date range
            const attendanceRef = collection(db, 'attendance');
            const q = query(
                attendanceRef,
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc'),
                orderBy('timestamp', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const records = [];

            // Get user data for each attendance record
            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();

                // Get user profile
                let userName = 'Usuario Desconocido';
                let userEmail = '';

                try {
                    const userDoc = await getDoc(doc(db, 'users', data.userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        userName = userData.displayName || userData.email;
                        userEmail = userData.email;
                    }
                } catch (error) {
                    console.error('Error getting user data:', error);
                }

                records.push({
                    id: docSnap.id,
                    ...data,
                    userName,
                    userEmail,
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            }

            setAttendanceData(records);
        } catch (error) {
            console.error('Error fetching attendance:', error);

            // Check if it's an index error
            if (error.message.includes('index')) {
                alert('Se requiere crear un índice en Firestore. Revisa la consola para el enlace.');
                console.error('🔥 ÍNDICE FALTANTE - Click en el enlace para crearlo:', error);
            } else {
                alert('Error al cargar los reportes: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // New user-based search
    const handleSearchByUser = async (userId, userName, userEmail) => {
        setLoading(true);
        setHasSearched(true);
        setSelectedUser({ userId, userName, userEmail });

        try {
            // Query all attendance records for this user
            const attendanceRef = collection(db, 'attendance');
            const q = query(
                attendanceRef,
                where('userId', '==', userId),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const records = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                records.push({
                    id: docSnap.id,
                    ...data,
                    userName,
                    userEmail,
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            });

            setAttendanceData(records);
        } catch (error) {
            console.error('Error fetching user attendance:', error);

            if (error.message.includes('index')) {
                alert('Se requiere crear un índice en Firestore. Revisa la consola para el enlace.');
                console.error('🔥 ÍNDICE FALTANTE - Click en el enlace para crearlo:', error);
            } else {
                alert('Error al cargar asistencias del usuario: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (newType) => {
        setReportType(newType);
        setHasSearched(false);
        setAttendanceData([]);
        setSelectedUser(null);
        setUserViewMode('total'); // Reset view mode
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Reportes de Asistencia" />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Tabs para tipo de reporte */}
                <Card>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Tipo de Reporte
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleTabChange('date')}
                            className={`px-4 py-3 rounded-2xl font-semibold transition-all ${reportType === 'date'
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">📅</span>
                                <span>Por Fecha</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('user')}
                            className={`px-4 py-3 rounded-2xl font-semibold transition-all ${reportType === 'user'
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl">👤</span>
                                <span>Por Usuario</span>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* Filtros por Fecha */}
                {reportType === 'date' && (
                    <Card>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-xl">🔍</span>
                            Filtros
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="mt-4 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </Card>
                )}

                {/* Selector de Usuario */}
                {reportType === 'user' && !hasSearched && (
                    <UserSelector onSelectUser={handleSearchByUser} />
                )}

                {/* Loading */}
                {loading && (
                    <Card>
                        <Loading message="Cargando reportes..." />
                    </Card>
                )}

                {/* Resultados */}
                {!loading && hasSearched && (
                    <Card>
                        {attendanceData.length === 0 ? (
                            <EmptyState
                                icon="📊"
                                title="No hay datos disponibles"
                                message={
                                    reportType === 'date'
                                        ? `No se encontraron registros de asistencia entre ${formatDate(startDate)} y ${formatDate(endDate)}.`
                                        : `${selectedUser?.userName} no tiene registros de asistencia.`
                                }
                            />
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-xl">📊</span>
                                        Resultados
                                    </h3>
                                    <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                        {attendanceData.length} registro{attendanceData.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Info del usuario (solo en reporte por usuario) */}
                                {reportType === 'user' && selectedUser && (
                                    <>
                                        <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-100 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {selectedUser.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{selectedUser.userName}</h4>
                                                    <p className="text-sm text-gray-600">{selectedUser.userEmail}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selector de Vista: Total vs Detalle */}
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <span className="text-lg">👁️</span>
                                                Vista del Reporte
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setUserViewMode('total')}
                                                    className={`px-4 py-3 rounded-2xl font-semibold transition-all ${userViewMode === 'total'
                                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-xl">#</span>
                                                        <span>Total</span>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setUserViewMode('detail')}
                                                    className={`px-4 py-3 rounded-2xl font-semibold transition-all ${userViewMode === 'detail'
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-xl">📋</span>
                                                        <span>Detalle</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Vista TOTAL - Solo contador */}
                                {reportType === 'user' && userViewMode === 'total' && (
                                    <div className="text-center py-12">
                                        <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200">
                                            <span className="text-5xl font-bold text-green-700">
                                                {attendanceData.length}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            Total de Asistencias
                                        </h3>
                                        <p className="text-gray-600">
                                            {selectedUser?.userName} tiene {attendanceData.length} registro{attendanceData.length !== 1 ? 's' : ''} de asistencia
                                        </p>
                                    </div>
                                )}

                                {/* Vista DETALLE - Lista completa */}
                                {(reportType === 'date' || (reportType === 'user' && userViewMode === 'detail')) && (
                                    <div className="space-y-3">
                                        {attendanceData.map((record) => (
                                            <div
                                                key={record.id}
                                                className="p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-primary-200 transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-lg">👤</span>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {record.userName}
                                                            </h4>
                                                        </div>
                                                        {record.userEmail && (
                                                            <p className="text-sm text-gray-600 ml-7">
                                                                {record.userEmail}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 ml-7 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <span>📅</span>
                                                                <span>{formatDate(record.date)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span>🕐</span>
                                                                <span>{formatTime(record.timestamp)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Export Buttons */}
                                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                                    <ExportButtons
                                        data={attendanceData}
                                        reportType={reportType}
                                        filters={{
                                            startDate,
                                            endDate,
                                            userName: selectedUser?.userName,
                                            userEmail: selectedUser?.userEmail
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Info */}
                {!hasSearched && (
                    <Card>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">💡</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Acerca de los reportes</h4>
                                <ul className="text-sm text-gray-600 space-y-1.5">
                                    {reportType === 'date' ? (
                                        <>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Consulta la asistencia de todos los usuarios por rango de fechas</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Visualiza el nombre, email, fecha y hora de cada registro</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Exporta los resultados a PDF o Excel</span>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Selecciona un usuario para ver todas sus asistencias</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Visualiza el historial completo ordenado por fecha</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span>Exporta los resultados a PDF o Excel</span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}
            </main>


        </div>
    );
};
