import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Card } from '../common/Card';
import { Loading } from '../common/Loading';

/**
 * Componente selector de usuario con búsqueda
 * @param {Function} onSelectUser - Callback al seleccionar usuario (userId, userName, userEmail)
 */
export const UserSelector = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Cargar usuarios al montar
    useEffect(() => {
        loadUsers();
    }, []);

    // Filtrar usuarios cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = users.filter(user =>
                user.displayName.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'user'));
            const querySnapshot = await getDocs(q);

            const usersList = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                usersList.push({
                    id: doc.id,
                    displayName: data.displayName || data.email,
                    email: data.email,
                    role: data.role
                });
            });

            // Ordenar alfabéticamente por nombre
            usersList.sort((a, b) => a.displayName.localeCompare(b.displayName));

            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Error al cargar usuarios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUserId(user.id);
        onSelectUser(user.id, user.displayName, user.email);
    };

    if (loading) {
        return (
            <Card>
                <Loading message="Cargando usuarios..." />
            </Card>
        );
    }

    return (
        <Card>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span>
                Seleccionar Usuario
            </h3>

            {/* Buscador */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Lista de usuarios */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">🔍</p>
                        <p>No se encontraron usuarios</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedUserId === user.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {user.displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                        {user.displayName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {user.email}
                                    </p>
                                </div>
                                {selectedUserId === user.id && (
                                    <div className="flex-shrink-0">
                                        <span className="text-primary-600 text-xl">✓</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {filteredUsers.length > 0 && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                </p>
            )}
        </Card>
    );
};
