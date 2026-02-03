import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

export const PersonalQRModal = ({ onClose }) => {
    const { user } = useAuth();
    const [userQR, setUserQR] = useState('');

    useEffect(() => {
        // Generar QR con el UID del usuario
        if (user) {
            setUserQR(user.uid);
        }
    }, [user]);

    const handleDownloadQR = async () => {
        try {
            const qrContainer = document.getElementById('personal-qr-container');
            if (!qrContainer) {
                console.error('QR container not found');
                return;
            }

            const canvas = await html2canvas(qrContainer, {
                backgroundColor: null,
                scale: 2,
                logging: false
            });

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `mi-qr-${user.displayName || user.email}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (error) {
            console.error('Error downloading QR:', error);
        }
    };

    const getInitials = () => {
        if (user.displayName) {
            const names = user.displayName.split(' ');
            if (names.length >= 2) {
                return names[0][0] + names[1][0];
            }
            return names[0][0];
        }
        return user.email[0].toUpperCase();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-md w-full relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Título */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Mi Código QR</h2>
                    <p className="text-sm text-gray-600">
                        {user.displayName || user.email}
                    </p>
                </div>

                {/* QR visible para pantalla */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl border-2 border-primary-200 shadow-lg relative">
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary-400 rounded-br-lg"></div>

                        <div className="relative">
                            <QRCodeSVG
                                value={userQR}
                                size={250}
                                level="H"
                                includeMargin={true}
                                fgColor="#2563eb"
                                bgColor="#ffffff"
                            />

                            {/* Iniciales en el centro */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                                    <span className="text-white font-bold text-2xl">{getInitials()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR de alta resolución oculto para descargas */}
                <div id="personal-qr-container" className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
                    <div className="bg-white p-16 rounded-[60px] relative inline-block">
                        <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-400 rounded-tl-3xl"></div>
                        <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-400 rounded-tr-3xl"></div>
                        <div className="absolute bottom-32 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-400 rounded-bl-3xl"></div>
                        <div className="absolute bottom-32 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-400 rounded-br-3xl"></div>

                        <div className="flex flex-col items-center gap-8">
                            <div className="relative">
                                <QRCodeSVG
                                    value={userQR}
                                    size={1024}
                                    level="H"
                                    includeMargin={true}
                                    fgColor="#2563eb"
                                    bgColor="#ffffff"
                                />

                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-64 h-64 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl border-[16px] border-white">
                                        <span className="text-white font-bold text-[120px]">{getInitials()}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-2xl text-center max-w-2xl px-8">
                                Código QR Personal
                            </p>

                            <p className="text-gray-700 text-xl font-medium">
                                {user.displayName || user.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadQR}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-medium transition-all active:scale-95"
                    >
                        📥 Descargar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all active:scale-95"
                    >
                        Cerrar
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Este es tu código QR personal para registro de asistencia
                </p>
            </div>
        </div>
    );
};
