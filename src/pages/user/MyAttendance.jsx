import { Header } from '../../components/layout/Header';

import { AttendanceCalendar } from '../../components/calendar/AttendanceCalendar';
import { useMonthlyAttendance } from '../../hooks/useMonthlyAttendance';
import { useAuth } from '../../context/AuthContext';

export const MyAttendance = () => {
    const { user } = useAuth();
    const { loadMonth } = useMonthlyAttendance(user?.uid);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Mi Asistencia" />

            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* Calendario optimizado - 1 sola consulta Firestore por mes */}
                <AttendanceCalendar
                    userId={user?.uid}
                    onMonthChange={loadMonth}
                />

                {/* Información adicional */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Los días marcados en verde indican que registraste tu asistencia.
                    </p>
                </div>
            </main>


        </div>
    );
};
