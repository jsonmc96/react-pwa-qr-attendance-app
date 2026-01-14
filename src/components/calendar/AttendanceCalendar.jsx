import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de calendario mensual para mostrar asistencia
 * Optimizado para PWA con 1 sola consulta Firestore por mes
 */
export const AttendanceCalendar = ({ userId, onMonthChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar asistencia del mes actual
    useEffect(() => {
        if (userId) {
            loadMonthAttendance();
        }
    }, [currentMonth, userId]);

    const loadMonthAttendance = async () => {
        setLoading(true);
        try {
            // Llamar al callback proporcionado para cargar datos
            if (onMonthChange) {
                const dates = await onMonthChange(currentMonth);
                setAttendanceDates(dates || []);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            setAttendanceDates([]);
        } finally {
            setLoading(false);
        }
    };

    // Navegación
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Verificar si un día tiene asistencia
    const hasAttendance = (date) => {
        return attendanceDates.some(attendanceDate => {
            // Manejar tanto strings ISO como objetos Date
            const compareDate = typeof attendanceDate === 'string'
                ? new Date(attendanceDate + 'T00:00:00')
                : attendanceDate;
            return isSameDay(date, compareDate);
        });
    };

    // Renderizar header con navegación
    const renderHeader = () => {
        const isCurrentMonth = isSameMonth(currentMonth, new Date());

        return (
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
                    aria-label="Mes anterior"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900 capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    {!isCurrentMonth && (
                        <button
                            onClick={goToToday}
                            className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                        >
                            Ir a hoy
                        </button>
                    )}
                </div>

                <button
                    onClick={nextMonth}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
                    aria-label="Mes siguiente"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    };

    // Renderizar días de la semana
    const renderDaysOfWeek = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        return (
            <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className="text-center text-xs font-semibold text-gray-600 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    // Renderizar celdas del calendario
    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);
                const dayHasAttendance = hasAttendance(day);

                days.push(
                    <div
                        key={day}
                        className={`
              relative aspect-square flex items-center justify-center rounded-lg
              transition-all duration-200
              ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
              ${isDayToday ? 'bg-primary-100 border-2 border-primary-500 font-bold' : ''}
              ${dayHasAttendance && !isDayToday ? 'bg-success-500 text-white font-semibold shadow-sm' : ''}
              ${!isCurrentMonth ? 'opacity-40' : ''}
            `}
                    >
                        <span className="text-sm">
                            {format(day, 'd')}
                        </span>

                        {/* Indicador de asistencia */}
                        {dayHasAttendance && (
                            <div className="absolute top-1 right-1">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                        )}

                        {/* Indicador de día actual */}
                        {isDayToday && !dayHasAttendance && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                <div className="w-1 h-1 bg-primary-600 rounded-full" />
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }

            rows.push(
                <div key={day} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 relative">
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                    <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {renderHeader()}
            {renderDaysOfWeek()}
            {renderCells()}

            {/* Leyenda */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-success-500 rounded" />
                    <span>Asistencia</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-primary-100 border-2 border-primary-500 rounded" />
                    <span>Hoy</span>
                </div>
            </div>
        </div>
    );
};
