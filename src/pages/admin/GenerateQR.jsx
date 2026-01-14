import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { QRGenerator } from '../../components/qr/QRGenerator';

export const GenerateQR = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Generar QR" />

            <div className="max-w-2xl mx-auto px-4 py-6">
                <QRGenerator />
            </div>

            <BottomNav />
        </div>
    );
};
