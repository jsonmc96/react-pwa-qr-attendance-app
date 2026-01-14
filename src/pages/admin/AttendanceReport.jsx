import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/common/Card';

export const AttendanceReport = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Reportes de Asistencia" />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Card title="Reportes">
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📊</span>
                        <p className="text-gray-600">
                            Funcionalidad de reportes en desarrollo
                        </p>
                    </div>
                </Card>
            </div>

            <BottomNav />
        </div>
    );
};
