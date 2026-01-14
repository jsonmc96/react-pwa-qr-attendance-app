import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { QRHistory } from '../../components/qr/QRHistory';

export const QRHistoryPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Historial de QR" />

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <QRHistory />
            </main>

            <BottomNav />
        </div>
    );
};
