import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Loading } from '../../components/common/Loading';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export const AttendanceReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
            <Header title="Reportes de Asistencia" />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Filtros */}
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
                                message={`No se encontraron registros de asistencia entre ${formatDate(startDate)} y ${formatDate(endDate)}.`}
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
                                        <span>Los resultados se ordenan por fecha y hora (más recientes primero)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}
            </main>

            <BottomNav />
        </div>
    );
};
