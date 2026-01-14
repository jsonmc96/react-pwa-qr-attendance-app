import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';

export const MyAttendance = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Mi Asistencia" />

            <div className="max-w-4xl mx-auto px-4 py-6">
                <MonthCalendar />
            </div>

            <BottomNav />
        </div>
    );
};
