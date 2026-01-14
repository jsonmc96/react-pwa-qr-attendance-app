import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../common/Loading';
import { ROUTES } from '../../utils/constants';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading fullScreen text="Verificando sesión..." />;
    }

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return children;
};
