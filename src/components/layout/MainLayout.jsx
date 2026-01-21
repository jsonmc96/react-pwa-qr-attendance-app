import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Outlet />
            <BottomNav />
        </div>
    );
};
