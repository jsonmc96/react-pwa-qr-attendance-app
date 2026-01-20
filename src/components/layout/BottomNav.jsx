import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

export const BottomNav = () => {
    const { isAdmin } = useAuth();

    const adminLinks = [
        { to: ROUTES.ADMIN_DASHBOARD, icon: '🏠', label: 'Inicio' },
        { to: ROUTES.ADMIN_GENERATE_QR, icon: '📱', label: 'QR' },
        { to: ROUTES.ADMIN_REPORTS, icon: '📊', label: 'Reportes' }
    ];

    const userLinks = [
        { to: ROUTES.USER_DASHBOARD, icon: '🏠', label: 'Inicio' },
        { to: ROUTES.USER_SCAN_QR, icon: '📷', label: 'Escanear' },
        { to: ROUTES.USER_ATTENDANCE, icon: '📅', label: 'Asistencia' }
    ];

    const links = isAdmin() ? adminLinks : userLinks;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl safe-bottom z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `
                relative flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200
                ${isActive ? 'text-primary-600' : 'text-gray-600'}
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`text-2xl mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-xs font-semibold">{link.label}</span>
                                    {isActive && (
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};
