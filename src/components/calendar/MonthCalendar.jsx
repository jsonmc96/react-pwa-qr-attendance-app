import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card } from '../common/Card';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import { isSameDate } from '../../utils/dateHelpers';
import { calculateAttendancePercentage } from '../../services/attendance/attendanceRules';

export const MonthCalendar = () => {
    const { user } = useAuth();
    const { getAttendanceForMonth } = useAttendance(user?.uid);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAttendance();
    }, [currentMonth]);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const dates = await getAttendanceForMonth(currentMonth);
            setAttendanceDates(dates);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasAttendance = attendanceDates.some(attendanceDate =>
                isSameDate(date, attendanceDate)
            );

            if (hasAttendance) {
                return 'bg-success-100 text-success-800 font-semibold rounded-lg';
            }
        }
        return null;
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const attendancePercentage = calculateAttendancePercentage(
        attendanceDates.length,
        getDaysInMonth()
    );

    return (
        <Card title="Mi Asistencia">
            {loading ? (
                <div className="text-center py-8">
                    <div className="spinner mx-auto" />
                    <p className="text-gray-600 mt-4">Cargando asistencia...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary-700">
                                {attendanceDates.length}
                            </p>
                            <p className="text-sm text-primary-600">Días asistidos</p>
                        </div>
                        <div className="bg-success-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-success-700">
                                {attendancePercentage}%
                            </p>
                            <p className="text-sm text-success-600">Asistencia</p>
                        </div>
                    </div>

                    <div className="calendar-container">
                        <Calendar
                            value={currentMonth}
                            onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
                            tileClassName={tileClassName}
                            locale="es-ES"
                            className="w-full border-none shadow-sm rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-success-100 border border-success-300 rounded" />
                            <span className="text-gray-600">Asistencia registrada</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
