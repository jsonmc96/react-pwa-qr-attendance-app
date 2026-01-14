import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DayDetailModal = ({ date, hasAttendance, onClose }) => {
    if (!date) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {format(date, 'd')}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                            {format(date, 'EEEE, MMMM yyyy', { locale: es })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Estado */}
                <div className="mb-6">
                    {hasAttendance ? (
                        <div className="bg-success-50 border-2 border-success-200 rounded-xl p-4 text-center">
                            <div className="text-5xl mb-2">✅</div>
                            <p className="text-success-900 font-semibold text-lg">
                                Asistencia Registrada
                            </p>
                            <p className="text-success-700 text-sm mt-1">
                                Tu asistencia fue registrada este día
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
                            <div className="text-5xl mb-2">📅</div>
                            <p className="text-gray-700 font-semibold text-lg">
                                Sin Asistencia
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                                No hay registro de asistencia para este día
                            </p>
                        </div>
                    )}
                </div>

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};
