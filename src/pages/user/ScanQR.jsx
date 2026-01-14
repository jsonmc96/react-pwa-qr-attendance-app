import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { QRScanner } from '../../components/qr/QRScanner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export const ScanQR = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Redirigir al calendario después de 2 segundos
        setTimeout(() => {
            navigate(ROUTES.USER_ATTENDANCE);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Registrar Asistencia" />

            <div className="max-w-2xl mx-auto px-4 py-6">
                <QRScanner onSuccess={handleSuccess} />
            </div>

            <BottomNav />
        </div>
    );
};
