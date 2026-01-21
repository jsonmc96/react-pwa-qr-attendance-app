import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../utils/constants';

export const RoleGuard = ({ children, allowedRole }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    // Soportar tanto un rol único como un array de roles
    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    if (!allowedRoles.includes(user.role)) {
        // Redirigir al dashboard correspondiente
        const redirectTo = user.role === ROLES.ADMIN
            ? ROUTES.ADMIN_DASHBOARD
            : ROUTES.USER_DASHBOARD;

        return <Navigate to={redirectTo} replace />;
    }

    return children;
};
