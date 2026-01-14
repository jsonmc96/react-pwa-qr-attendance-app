import QRCode from 'qrcode.react';
import { QR_CONFIG } from '../../utils/constants';

export const QRDisplay = ({ value, size = QR_CONFIG.SIZE }) => {
    if (!value) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
                <p className="text-gray-500">No hay código QR para mostrar</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md">
            <QRCode
                value={value}
                size={size}
                level={QR_CONFIG.LEVEL}
                includeMargin={true}
                className="border-4 border-gray-100 rounded-lg"
            />

            <p className="text-xs text-gray-500 text-center max-w-xs">
                Escanea este código QR para registrar tu asistencia
            </p>
        </div>
    );
};
