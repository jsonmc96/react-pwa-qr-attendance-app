import { useState, useEffect } from 'react';
import { updateEmployeeType } from '../../services/backend/providers/firebase/admin';
import { getAllUsers } from '../../services/backend/providers/firebase/users';
import { EMPLOYEE_TYPES } from '../../config/appConfig';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { EmployeeCard } from './EmployeeCard';

export const EmployeeTypeManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Tipos de Empleado</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Tipos de Empleado</h2>

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
                    <strong className="text-blue-900">Presencial:</strong> Requiere validación de ubicación GPS<br />
                    <strong className="text-blue-900">Remoto:</strong> Solo requiere validación de horario
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.employeeType === EMPLOYEE_TYPES.ONSITE ? '🏢 Presencial' : '🏠 Remoto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => handleUpdateType(user.uid, EMPLOYEE_TYPES.ONSITE)}
                                                disabled={updating === user.uid || user.employeeType === EMPLOYEE_TYPES.ONSITE}
                                            >
                                                Presencial
                                            </button>
                                            <button
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => handleUpdateType(user.uid, EMPLOYEE_TYPES.REMOTE)}
                                                disabled={updating === user.uid || user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType}
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
