import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { AttendanceCalendar } from '../../components/calendar/AttendanceCalendar';
import { ManualAttendanceModal } from '../../components/admin/ManualAttendanceModal';

export const AdminManualAttendance = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Este callback se llama cuando el calendario necesita cargar datos de un mes
    // Para admin, retornamos array vacío ya que no queremos mostrar asistencias previas
    const handleMonthChange = async (month) => {
        return [];
    };

    // Cuando el admin hace clic en un día del calendario
    const handleDayClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Asistencia Manual" />

            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* Reutilizamos el mismo componente de calendario que usa el usuario */}
                <AttendanceCalendar
                    userId={null} // No hay userId porque el admin no está viendo su propia asistencia
                    onMonthChange={handleMonthChange}
                    onDayClick={handleDayClick} // Permitir click en cualquier día
                    adminMode={true} // Indicar que es modo admin
                />

                {/* Información */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>ℹ️ Instrucciones:</strong> Haz clic en cualquier día del calendario para registrar manualmente la asistencia de uno o varios usuarios.
                    </p>
                </div>
            </main>

            {/* Modal de Registro Manual */}
            {isModalOpen && selectedDate && (
                <ManualAttendanceModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
};
