import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';

export const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const { isOffline } = useOffline();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 safe-top">
            {isOffline && (
                <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium">
                    📡 Modo sin conexión
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        {user && (
                            <p className="text-xs text-gray-600">{user.email}</p>
                        )}
                    </div>

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
