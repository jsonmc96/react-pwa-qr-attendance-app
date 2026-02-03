import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ReloadPrompt } from './components/common/ReloadPrompt';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './router';
import { useOfflineSync } from './hooks/useOfflineSync';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
    useOfflineSync(); // Activar sincronización offline

    return (
        <>
            <AppRouter />
            <ReloadPrompt />
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}


function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <OfflineProvider>
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
                </OfflineProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
