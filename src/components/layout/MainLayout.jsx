import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Outlet />
            <BottomNav />
            {/* Version indicator */}
            <div className="fixed bottom-16 right-4 z-30">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-mono">
                        v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                    </p>
                </div>
            </div>
        </div>
    );
};
