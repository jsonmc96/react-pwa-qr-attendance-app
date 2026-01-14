import { useState } from 'react';
import { loginWithEmail } from '../services/firebase/auth';
import { validateLoginForm } from '../utils/validators';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            // Validar formulario
            const validation = validateLoginForm({ email, password });

            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                throw new Error(firstError);
            }

            // Intentar login
            const user = await loginWithEmail(email, password);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
        clearError: () => setError(null)
    };
};
