import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
};
