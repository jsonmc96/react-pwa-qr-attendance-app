import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">📱</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Control de Asistencia
                    </h1>
                    <p className="text-primary-100">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
                    <LoginForm />
                </div>

                <p className="text-center text-primary-100 text-sm mt-6">
                    © 2026 Sistema de Asistencia QR
                </p>
            </div>
        </div>
    );
};
