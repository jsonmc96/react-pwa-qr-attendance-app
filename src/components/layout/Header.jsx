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
        <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg sticky top-0 z-40 safe-top">
            {isOffline && (
                <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium animate-pulse">
                    📡 Modo sin conexión
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div>
                        <h1 className="text-xl font-bold">{title}</h1>
                        {user && (
                            <p className="text-xs text-primary-100 mt-0.5">{user.email}</p>
                        )}
                    </div>

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Salir
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
