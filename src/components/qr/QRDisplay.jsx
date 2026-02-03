import QRCode from 'qrcode.react';
import { QR_CONFIG } from '../../utils/constants';

export const QRDisplay = ({ value, size = QR_CONFIG.SIZE, date }) => {
    if (!value) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
                <p className="text-gray-500">No hay código QR para mostrar</p>
            </div>
        );
    }

    // Siempre usar tamaño completo (1024px) para máxima calidad
    const fullSize = QR_CONFIG.SIZE; // 1024px para LED/TV
    const displaySize = size; // Tamaño pasado como prop (200px o 300px para UI)

    return (
        <div className="flex flex-col items-center gap-4">
            {/* QR visible para mostrar en pantalla (escalado visualmente) */}
            <div id="daily-qr-display" className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl border-2 border-primary-200 shadow-lg relative">
                {/* Decoración de esquinas */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary-400 rounded-br-lg"></div>

                {/* QR con tamaño de visualización */}
                <QRCode
                    value={value}
                    size={displaySize}
                    level={QR_CONFIG.LEVEL}
                    includeMargin={true}
                    fgColor="#2563eb"
                    bgColor="#ffffff"
                />
            </div>

            {/* QR de ALTA RESOLUCIÓN (1024px) INVISIBLE para descargas */}
            {/* Posicionado fuera de la vista pero renderizado para html2canvas */}
            <div id="daily-qr-container" className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                <div className="bg-white p-16 rounded-[60px] relative inline-block" style={{ width: 'fit-content' }}>
                    {/* Decoración de esquinas - estilo brackets */}
                    <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-400 rounded-tl-3xl"></div>
                    <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-400 rounded-tr-3xl"></div>
                    <div className="absolute bottom-32 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-400 rounded-bl-3xl"></div>
                    <div className="absolute bottom-32 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-400 rounded-br-3xl"></div>

                    {/* Contenido centrado */}
                    <div className="flex flex-col items-center gap-8">
                        {/* QR en resolución completa 1024px */}
                        <QRCode
                            value={value}
                            size={fullSize}
                            level={QR_CONFIG.LEVEL}
                            includeMargin={true}
                            fgColor="#2563eb"
                            bgColor="#ffffff"
                        />

                        {/* Texto descriptivo */}
                        <p className="text-gray-600 text-2xl text-center max-w-2xl px-8">
                            Escanea este código QR para registrar tu asistencia
                        </p>

                        {/* Fecha formateada */}
                        <p className="text-gray-700 text-xl font-medium">
                            {(() => {
                                // Parsear fecha manualmente para evitar problemas de zona horaria
                                const dateStr = date || new Date().toISOString().split('T')[0];
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const localDate = new Date(year, month - 1, day);

                                return localDate.toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            })()}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center max-w-xs">
                Escanea este código QR para registrar tu asistencia
            </p>
        </div>
    );
};
