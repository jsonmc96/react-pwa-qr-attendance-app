import { createContext, useContext, useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Suscribirse a cambios de autenticación
        const unsubscribe = backend.auth.onAuthChange((userData) => {
            setUser(userData);
            setLoading(false);
        });

        // Cleanup
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await backend.auth.logout();
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    const isAdmin = () => {
        return user?.role === ROLES.ADMIN;
    };

    const isUser = () => {
        return user?.role === ROLES.USER;
    };

    const value = {
        user,
        loading,
        logout,
        isAdmin,
        isUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
