import { useState, useEffect } from 'react';
import { updateEmployeeType, updateVehicleStatus } from '../../services/backend/providers/firebase/admin';
import { getAllUsers } from '../../services/backend/providers/firebase/users';
import { EMPLOYEE_TYPES } from '../../config/appConfig';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { EmployeeCard } from './EmployeeCard';
import { initializeSpots } from '../../services/firebase/parkingMapSync';

export const EmployeeTypeManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [initializingParking, setInitializingParking] = useState(false);

    // Filtros
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Media query for responsive design (>= 768px = desktop)
    const isDesktop = useMediaQuery('(min-width: 768px)');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateType = async (uid, newType) => {
        try {
            setUpdating(uid);
            setError(null);
            setSuccess(null);

            await updateEmployeeType(uid, newType);

            // Update local state
            setUsers(users.map(u =>
                u.uid === uid ? { ...u, employeeType: newType } : u
            ));

            setSuccess('Tipo de empleado actualizado correctamente');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error al actualizar tipo de empleado');
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const handleUpdateVehicle = async (uid, hasVehicle) => {
        try {
            setUpdating(uid);
            setError(null);
            setSuccess(null);

            await updateVehicleStatus(uid, hasVehicle);

            // Update local state
            setUsers(users.map(u =>
                u.uid === uid ? { ...u, hasVehicle } : u
            ));

            setSuccess('Permiso de vehículo actualizado correctamente');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error al actualizar permiso de vehículo');
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const handleInitParking = async () => {
        if (!window.confirm("¿Estás seguro de que quieres inicializar o restaurar todos los puestos de parqueadero según el boceto (3 VIP + 8 generales)?")) return;
        try {
            setInitializingParking(true);
            setError(null);
            setSuccess(null);
            await initializeSpots();
            setSuccess('Base de datos del parqueadero restaurada con el nuevo diseño correctamente (11 puestos).');
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Error al restaurar puestos de parqueadero');
            console.error(err);
        } finally {
            setInitializingParking(false);
        }
    };

    // Filtrado de usuarios
    const filteredUsers = users.filter(user => {
        // Filtro por tipo
        if (typeFilter !== 'all') {
            if (user.employeeType !== typeFilter) {
                return false;
            }
        }

        // Filtro por búsqueda (nombre o email)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const name = (user.displayName || '').toLowerCase();
            const email = (user.email || '').toLowerCase();

            if (!name.includes(query) && !email.includes(query)) {
                return false;
            }
        }

        return true;
    });

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Accesos y Vehículos</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Gestión de Accesos y Vehículos</h2>
                <button
                    onClick={handleInitParking}
                    disabled={initializingParking}
                    className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 disabled:opacity-50 transition-colors shadow-sm self-start sm:self-auto"
                >
                    🔄 {initializingParking ? 'Inicializando...' : 'Restaurar Diseño Parqueadero'}
                </button>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    {success}
                </div>
            )}

            {/* Info sobre tipos */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
                <p className="text-gray-700">
                    <strong className="text-blue-900">Vehículo:</strong> Determina si el usuario tiene acceso al menú de Parking.<br />
                    <strong className="text-blue-900">Asistencia:</strong> Define si requiere validación GPS (Presencial) o no (Remoto).
                </p>
            </div>

            {/* Filtros */}
            <div className="mb-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Filtro por tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por tipo
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">Todos</option>
                            <option value={EMPLOYEE_TYPES.ONSITE}>Solo Presenciales</option>
                            <option value={EMPLOYEE_TYPES.REMOTE}>Solo Remotos</option>
                        </select>
                    </div>

                    {/* Búsqueda */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar empleado
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nombre o email..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Contador de resultados */}
                <p className="text-sm text-gray-600">
                    Mostrando {filteredUsers.length} de {users.length} empleados
                </p>
            </div>

            {/* Lista de usuarios - Responsive */}
            {isDesktop ? (
                // Vista Desktop: Tabla
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.displayName || 'Sin nombre'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleUpdateVehicle(user.uid, !user.hasVehicle)}
                                            disabled={updating === user.uid}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all shadow-sm ${user.hasVehicle
                                                ? 'bg-indigo-600 text-white shadow-indigo-200'
                                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                }`}
                                        >
                                            {user.hasVehicle ? '🚘 TIENE' : '🚶 NO'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex gap-2">
                                            <button
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}
                                                onClick={() => handleUpdateType(user.uid, EMPLOYEE_TYPES.ONSITE)}
                                                disabled={updating === user.uid}
                                            >
                                                Presencial
                                            </button>
                                            <button
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}
                                                onClick={() => handleUpdateType(user.uid, EMPLOYEE_TYPES.REMOTE)}
                                                disabled={updating === user.uid}
                                            >
                                                Remoto
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            ) : (
                // Vista Mobile: Cards
                <div className="grid grid-cols-1 gap-3">
                    {filteredUsers.map(user => (
                        <EmployeeCard
                            key={user.uid}
                            user={user}
                            onUpdateType={handleUpdateType}
                            onUpdateVehicle={handleUpdateVehicle}
                            updating={updating}
                        />
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
