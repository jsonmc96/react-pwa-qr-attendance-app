import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase/config'; // Ruta corregida

export const DayDetailModal = ({ date, userId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && date && userId) {
            fetchDetails();
        } else {
            // Reset states when closed
            setDetails(null);
            setError(null);
            setLoading(false);
        }
    }, [isOpen, date, userId]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');

            // Query eficiente: solo busca el registro de ese usuario en esa fecha
            const q = query(
                collection(db, 'attendance'),
                where('userId', '==', userId),
                where('date', '==', dateStr),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data();
                setDetails({
                    id: snapshot.docs[0].id,
                    ...docData,
                    // Asegurar que tenemos un objeto Date válido para la hora
                    timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate() : new Date(docData.timestamp || docData.scanAt)
                });
            } else {
                setError('No se encontraron detalles para este día.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Error al cargar los detalles.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !date) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Visual */}
                <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">
                        Detalle de Asistencia
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white bg-white/10 rounded-full p-1 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Fecha Prominente */}
                    <div className="text-center mb-6 border-b border-gray-100 pb-4">
                        <div className="text-4xl font-bold text-gray-800 mb-1">
                            {format(date, 'd')}
                        </div>
                        <div className="text-primary-600 font-medium uppercase tracking-wide text-sm">
                            {format(date, 'MMMM yyyy', { locale: es })}
                        </div>
                        <div className="text-gray-400 text-xs mt-1 capitalize">
                            {format(date, 'EEEE', { locale: es })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-500 text-sm">Cargando detalles...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">
                            {error}
                        </div>
                    ) : details ? (
                        <div className="space-y-4">
                            {/* Hora de Registro */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Hora de Registro</p>
                                        <p className="font-bold text-gray-800 text-lg">
                                            {format(details.timestamp, 'HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estado y QR */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-success-50 border border-success-100 rounded-xl flex flex-col items-center justify-center text-center">
                                    <div className="w-8 h-8 bg-success-500 text-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-bold text-success-700">Asistencia<br />Verificada</p>
                                </div>

                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] text-gray-400 mb-1">ID Transacción</p>
                                    <p className="text-xs font-mono text-blue-800 break-all px-1">
                                        {details.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Footer / Botón */}
                    <div className="mt-8">
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
