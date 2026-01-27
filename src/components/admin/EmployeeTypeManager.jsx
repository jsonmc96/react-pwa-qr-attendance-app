import { useState, useEffect } from 'react';
import { updateEmployeeType } from '../../services/backend/providers/firebase/admin';
import { getAllUsers } from '../../services/backend/providers/firebase/users';
import { EMPLOYEE_TYPES } from '../../config/appConfig';

export const EmployeeTypeManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Tipos de Empleado</h2>

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

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-gray-700">
                    <strong className="text-blue-900">Presencial:</strong> Requiere validación de ubicación GPS<br />
                    <strong className="text-blue-900">Remoto:</strong> Solo requiere validación de horario
                </p>
            </div>

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
                        {users.map(user => (
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

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay usuarios registrados</p>
                    </div>
                )}
            </div>
        </div>
    );
};
