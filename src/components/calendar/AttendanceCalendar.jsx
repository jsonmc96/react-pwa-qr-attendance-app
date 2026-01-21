import { useState, useEffect, useRef } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths as subMonthsFn,
    isSameMonth,
    isSameDay,
    isToday,
    subMonths,
    eachMonthOfInterval,
    startOfYear,
    endOfYear
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { DayDetailModal } from './DayDetailModal';

/**
 * Componente de calendario mensual para mostrar asistencia
 * UX tipo Native App - Tema Light Integrado
 */
export const AttendanceCalendar = ({ userId, onMonthChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para el modal de detalles
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // Cargar asistencia del mes actual
    useEffect(() => {
        if (userId) {
            loadMonthAttendance();
        }
    }, [currentMonth, userId]);

    // Auto-scroll al mes activo
    useEffect(() => {
        if (scrollRef.current) {
            const activePill = scrollRef.current.querySelector('[data-active="true"]');
            if (activePill) {
                activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentMonth]);

    const loadMonthAttendance = async () => {
        setLoading(true);
        try {
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

    // Verificar asistencia
    const hasAttendance = (date) => {
        return attendanceDates.some(attendanceDate => {
            const compareDate = typeof attendanceDate === 'string'
                ? new Date(attendanceDate + 'T00:00:00')
                : attendanceDate;
            return isSameDay(date, compareDate);
        });
    };

    // Manejar click en un día
    const handleDayClick = (date) => {
        if (hasAttendance(date)) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedDate(null), 300); // Limpiar después de animación
    };

    // --- UX COMPONENTS ---

    // 1. Navegación de meses (Estilo Tab Clean)
    const renderMonthSelector = () => {
        // Rango dinámico
        const months = [-2, -1, 0, 1, 2].map(offset => addMonths(currentMonth, offset));

        return (
            <div className="bg-white pt-6 pb-2 rounded-t-3xl shadow-sm border-b border-gray-100 relative z-10 mx-4 mt-6">
                {/* Header de Año */}
                <div className="px-6 mb-2 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {format(currentMonth, 'yyyy')}
                    </h2>
                    {!isSameMonth(currentMonth, new Date()) && (
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                        >
                            Volver a Hoy
                        </button>
                    )}
                </div>

                {/* Scroll Horizontal de Meses */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-hide mask-fade-right snap-x snap-mandatory"
                >
                    {/* Espaciador para centrar en mobile si es necesario */}
                    <div className="w-[calc(50%-50px)] flex-shrink-0 md:hidden"></div>

                    {months.map((date, i) => {
                        const isActive = isSameMonth(date, currentMonth);
                        return (
                            <button
                                key={date.toString()} // Key estable para evitar re-montaje innecesario
                                data-active={isActive}
                                onClick={() => setCurrentMonth(date)}
                                className={`
                                    flex-shrink-0 relative py-2 w-[100px] rounded-full text-sm font-bold capitalize transition-all duration-300
                                    snap-center flex items-center justify-center
                                    ${isActive
                                        ? 'bg-primary-600 text-white shadow-md scale-100 z-10'
                                        : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600 scale-90'
                                    }
                                `}
                            >
                                {format(date, 'MMMM', { locale: es })}
                            </button>
                        );
                    })}

                    {/* Espaciador final */}
                    <div className="w-[calc(50%-50px)] flex-shrink-0 md:hidden"></div>
                </div>
            </div>
        );
    };

    // 2. Calendario Visual (Tema Light)
    const renderCalendarGrid = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const grid = [];
        let day = startDate;

        // Header Semanal
        const weekHeader = (
            <div className="grid grid-cols-7 mb-4 px-2">
                {days.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>
        );

        // Generar celdas
        while (day <= endDate) {
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);
                const dayHasAttendance = hasAttendance(day);

                weekDays.push(
                    <div key={day.toString()} className="aspect-square p-1 flex items-center justify-center relative">
                        {isCurrentMonth ? (
                            <div
                                onClick={() => handleDayClick(cloneDay)}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center relative
                                    transition-all duration-200
                                    ${dayHasAttendance ? 'cursor-pointer active:scale-95' : ''}
                                    ${isDayToday && !dayHasAttendance
                                        ? 'bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-200 shadow-sm'
                                        : 'text-gray-700'
                                    }
                                    ${dayHasAttendance
                                        ? 'bg-success-50 text-success-700 font-bold hover:bg-success-100'
                                        : ''
                                    }
                                `}
                            >
                                <span className="text-sm z-10">{format(day, 'd')}</span>

                                {/* Indicador Asistencia - Punto Flotante */}
                                {dayHasAttendance && (
                                    <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                                        <div className="w-3 h-3 bg-success-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                );
                day = addDays(day, 1);
            }
            grid.push(<div key={day} className="grid grid-cols-7 gap-y-1">{weekDays}</div>);
        }

        return (
            <div className="bg-white mx-4 p-4 pb-24 min-h-[400px] rounded-b-3xl -mt-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-hidden border-t border-gray-50">
                {/* Loader Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {weekHeader}
                <div className="space-y-2">{grid}</div>
            </div>
        );
    };

    // 4. FAB - Botón Flotante (Primary Color)
    const renderFAB = () => (
        <button
            onClick={() => navigate(ROUTES.USER_SCAN_QR)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 group"
            aria-label="Registrar Asistencia"
        >
            <div className="absolute inset-0 bg-primary-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 translate-y-2"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-xl transform transition-transform duration-200 group-active:scale-95 border-2 border-white/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            </div>
        </button>
    );

    return (
        <div className="relative pb-10">
            {renderMonthSelector()}
            {renderCalendarGrid()}
            {renderFAB()}

            {/* Modal de Detalle */}
            <DayDetailModal
                date={selectedDate}
                userId={userId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};
