import { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { registerManualAttendance, validateAdminPermission } from '../../services/attendance/manualAttendanceService';
import { getAllUsers } from '../../services/backend/providers/firebase/users';
import { UserQRScanner } from './UserQRScanner';

/**
 * Modal para registrar asistencia manual desde calendario (admin)
 * Se abre al hacer clic en una fecha del calendario
 * Tiene 2 tabs: Búsqueda manual y Escaneo de QR
 */
export const ManualAttendanceModal = ({ isOpen, onClose, selectedDate }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'qr'
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const scannerKeyRef = useRef(0); // Key para forzar remount del scanner

    // Cargar usuarios al abrir modal
    useEffect(() => {
        if (isOpen && users.length === 0) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Error al cargar usuarios');
        } finally {
            setLoadingUsers(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = (u.displayName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
    });

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };


    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            setError('Debes seleccionar al menos un usuario');
            return;
        }

        try {
            console.log('========== MANUAL ATTENDANCE DEBUG ==========');
            console.log('Authenticated User:', user);
            console.log('User UID:', user?.uid);
            console.log('User Email:', user?.email);
            console.log('User Role:', user?.role);
            console.log('User Display Name:', user?.displayName);
            console.log('============================================');

            validateAdminPermission(user);
            setSubmitting(true);
            setError(null);

            const formattedDate = selectedDate.toISOString().split('T')[0];

            // Registrar asistencia para cada usuario seleccionado
            await Promise.all(
                selectedUsers.map(userId =>
                    registerManualAttendance(user.uid, userId, formattedDate, reason)
                )
            );

            // Success - cerrar modal
            onClose();
            // Reset state
            setSelectedUsers([]);
            setReason('');
            setSearchQuery('');
        } catch (err) {
            console.error('Error registering manual attendance:', err);
            setError(err.message || 'Error al registrar asistencia manual');
        } finally {
            setSubmitting(false);
        }
    };

    // Cuando se escanea un QR y se agrega a la lista
    const handleUserScanned = (userId) => {
        console.log('[ManualAttendanceModal] User scanned:', userId);
        console.log('[ManualAttendanceModal] Current selectedUsers:', selectedUsers);

        // Evitar duplicados chequeando la lista principal
        if (!selectedUsers.includes(userId)) {
            console.log('[ManualAttendanceModal] Adding user to selection');
            setSelectedUsers(prev => {
                const newList = [...prev, userId];
                console.log('[ManualAttendanceModal] New selectedUsers:', newList);
                return newList;
            });
        } else {
            console.log('[ManualAttendanceModal] User already in list, skipping');
        }
    };

    // Forzar remount del scanner cuando se cambia de tab para limpiar recursos
    const handleTabChange = (newTab) => {
        console.log(`[ManualAttendanceModal] Tab changing from ${activeTab} to ${newTab}`);
        if (newTab !== activeTab) {
            // Incrementar key para forzar unmount/remount del scanner si estaba activo
            if (activeTab === 'qr') {
                console.log('[ManualAttendanceModal] Forcing scanner remount');
                scannerKeyRef.current += 1;
            }
            setActiveTab(newTab);
        }
    };

    // Limpiar scanner al cerrar modal
    const handleClose = () => {
        console.log('[ManualAttendanceModal] Modal closing, cleaning up scanner');
        scannerKeyRef.current += 1; // Forzar cleanup
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Registrar Asistencia Manual
                </h2>

                <p className="text-sm text-gray-600 mb-4">
                    Fecha: {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                    <button
                        onClick={() => handleTabChange('manual')}
                        className={`flex-1 px-4 py-3 font-semibold transition-all relative ${activeTab === 'manual'
                            ? 'text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">👤</span>
                            <span>Búsqueda</span>
                        </div>
                        {activeTab === 'manual' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('qr')}
                        className={`flex-1 px-4 py-3 font-semibold transition-all relative ${activeTab === 'qr'
                            ? 'text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">📷</span>
                            <span>Escanear QR</span>
                        </div>
                        {activeTab === 'qr' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'manual' ? (
                    <>
                        {/* Buscador */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar Usuario
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nombre o email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Lista de usuarios */}
                        <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            {loadingUsers ? (
                                <div className="text-center py-4">
                                    <div className="spinner mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <div>
                                    {filteredUsers.map(u => (
                                        <button
                                            key={u.uid}
                                            type="button"
                                            onClick={() => toggleUserSelection(u.uid)}
                                            className={`
                                                w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors
                                                ${selectedUsers.includes(u.uid) ? 'bg-primary-50' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-5 h-5 border-2 rounded flex items-center justify-center
                                                    ${selectedUsers.includes(u.uid)
                                                        ? 'bg-primary-600 border-primary-600'
                                                        : 'border-gray-300'
                                                    }
                                                `}>
                                                    {selectedUsers.includes(u.uid) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {u.displayName || 'Sin nombre'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {filteredUsers.length === 0 && (
                                        <p className="text-center py-4 text-sm text-gray-500">
                                            No se encontraron usuarios
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <UserQRScanner
                        key={scannerKeyRef.current}
                        users={users}
                        selectedUsers={selectedUsers}
                        onUserScanned={handleUserScanned}
                        selectedDate={selectedDate}
                    />
                )}

                {/* Usuarios seleccionados */}
                {selectedUsers.length > 0 && (
                    <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                        <p className="text-sm font-medium text-primary-900 mb-2">
                            Seleccionados ({selectedUsers.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(uid => {
                                const u = users.find(user => user.uid === uid);
                                return (
                                    <span
                                        key={uid}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                                    >
                                        {u?.displayName || 'Usuario'}
                                        <button
                                            onClick={() => toggleUserSelection(uid)}
                                            className="hover:text-primary-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Motivo */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo (opcional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Recuperación por feriado, permiso especial, etc."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                        fullWidth
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        fullWidth
                        disabled={submitting || selectedUsers.length === 0}
                    >
                        {submitting
                            ? 'Registrando...'
                            : `Registrar (${selectedUsers.length})`
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};
