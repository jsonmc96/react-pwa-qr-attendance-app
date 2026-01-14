import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, ROLES } from '../../utils/constants';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = await login(email, password);

            // Redirigir según el rol
            if (user.role === ROLES.ADMIN) {
                navigate(ROUTES.ADMIN_DASHBOARD);
            } else {
                navigate(ROUTES.USER_DASHBOARD);
            }
        } catch (err) {
            // Error ya manejado en el hook
            console.error('Login error:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <Input
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
            />

            <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
            />

            {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
        </form>
    );
};
