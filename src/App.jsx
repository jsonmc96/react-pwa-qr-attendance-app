import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './router';
import { useOfflineSync } from './hooks/useOfflineSync';

function AppContent() {
    useOfflineSync(); // Activar sincronización offline

    return <AppRouter />;
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
