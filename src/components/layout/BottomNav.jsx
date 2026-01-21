import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { useEffect, useState, useRef } from 'react';

export const BottomNav = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    const adminLinks = [
        { to: ROUTES.ADMIN_DASHBOARD, icon: '🏠', label: 'Inicio' },
        { to: ROUTES.ADMIN_GENERATE_QR, icon: '📱', label: 'Generar QR' },
        { to: ROUTES.USER_SCAN_QR, icon: '📷', label: 'Escanear' },
        { to: ROUTES.RANKING, icon: '🏆', label: 'Ranking' },
        { to: ROUTES.USER_ATTENDANCE, icon: '📅', label: 'Asistencia' }
    ];

    const userLinks = [
        { to: ROUTES.USER_DASHBOARD, icon: '🏠', label: 'Inicio' },
        { to: ROUTES.USER_SCAN_QR, icon: '📷', label: 'Escanear' },
        { to: ROUTES.RANKING, icon: '🏆', label: 'Ranking' },
        { to: ROUTES.USER_ATTENDANCE, icon: '📅', label: 'Asistencia' }
    ];

    const links = isAdmin() ? adminLinks : userLinks;

    // Calcular índice inicial síncronamente antes del primer render
    // Esto evita que "viaje" desde 0 hasta su lugar
    const getIndexByPath = () => links.findIndex(link => location.pathname === link.to);

    const [activeIndex, setActiveIndex] = useState(getIndexByPath);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const newIndex = getIndexByPath();
        if (newIndex !== -1) {
            setActiveIndex(newIndex);
        }

        // Habilitar animaciones después del primer render
        if (!hasMounted) {
            // Pequeño timeout para asegurar que el navegador pintó el estado inicial
            setTimeout(() => setHasMounted(true), 50);
        }
    }, [location.pathname, links]); // Dependencia clave

    const activeLink = links[activeIndex] !== -1 ? links[activeIndex] : links[0];
    const itemWidth = 100 / links.length;

    // Si por alguna razón el índice es -1 (ruta 404), fallback al 0
    const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
            <div className="relative h-16 bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.1)] border-t border-gray-100">

                {/* === EL ELEMENTO QUE VIAJA === */}
                <div
                    className={`absolute top-0 h-full ease-[cubic-bezier(0.175,0.885,0.32,1.275)] pointer-events-none z-20 will-change-transform
                        ${hasMounted ? 'transition-all duration-700' : 'transition-none'} 
                    `}
                    style={{
                        left: `${safeActiveIndex * itemWidth}%`,
                        width: `${itemWidth}%`
                    }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border border-gray-100 shadow-sm"
                        style={{ clipPath: "inset(0 0 50% 0)" }}
                    ></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-white"></div>

                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full text-white shadow-lg shadow-primary-500/40 flex items-center justify-center">
                            <span className="text-2xl">
                                {activeLink ? activeLink.icon : links[0].icon}
                            </span>
                        </div>
                    </div>
                </div>

                {/* === ITEMS FIJOS === */}
                <div className="flex h-full relative z-30">
                    {links.map((link, index) => {
                        const isActive = index === safeActiveIndex;
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="flex-1 flex flex-col items-center justify-end pb-2 cursor-pointer select-none no-underline"
                            >
                                <div className="h-8 flex items-center justify-center">
                                    <span
                                        className={`text-2xl text-gray-400
                                            ${hasMounted ? 'transition-opacity duration-200' : ''} 
                                            ${isActive ? 'opacity-0' : 'opacity-100'}
                                        `}
                                    >
                                        {link.icon}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-medium mt-1 
                                    ${hasMounted ? 'transition-colors duration-300' : ''}
                                    ${isActive ? 'text-primary-600' : 'text-gray-400'}
                                `}>
                                    {link.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
