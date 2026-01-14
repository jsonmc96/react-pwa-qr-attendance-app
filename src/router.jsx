import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { GenerateQR } from './pages/admin/GenerateQR';
import { AttendanceReport } from './pages/admin/AttendanceReport';
import { QRHistoryPage } from './pages/admin/QRHistoryPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { ScanQR } from './pages/user/ScanQR';
import { MyAttendance } from './pages/user/MyAttendance';
import { ROUTES, ROLES } from './utils/constants';
import { useAuth } from './context/AuthContext';

export const AppRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // return null; // O un loading screen
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-900 mx-auto" />
                    <p className="mt-3 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route
                    path={ROUTES.LOGIN}
                    element={
                        user ? (
                            <Navigate to={user.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD} replace />
                        ) : (
                            <LoginPage />
                        )
                    }
                />

                {/* Rutas de Admin */}
                <Route
                    path={ROUTES.ADMIN_DASHBOARD}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.ADMIN}>
                                <AdminDashboard />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.ADMIN_GENERATE_QR}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.ADMIN}>
                                <GenerateQR />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/qr-history"
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.ADMIN}>
                                <QRHistoryPage />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.ADMIN_REPORTS}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.ADMIN}>
                                <AttendanceReport />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />

                {/* Rutas de Usuario */}
                <Route
                    path={ROUTES.USER_DASHBOARD}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.USER}>
                                <UserDashboard />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.USER_SCAN_QR}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.USER}>
                                <ScanQR />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.USER_ATTENDANCE}
                    element={
                        <ProtectedRoute>
                            <RoleGuard allowedRole={ROLES.USER}>
                                <MyAttendance />
                            </RoleGuard>
                        </ProtectedRoute>
                    }
                />

                {/* Ruta por defecto */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={user ? (user.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD) : ROUTES.LOGIN}
                            replace
                        />
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
