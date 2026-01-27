import { Header } from '../../components/layout/Header';
import { EmployeeTypeManager } from '../../components/admin/EmployeeTypeManager';
import { SystemConfigSection } from '../../components/admin/SystemConfigSection';

export const AdminSettings = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header title="Configuración del Sistema" />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* System Configuration */}
                <SystemConfigSection />

                {/* Employee Type Management */}
                <EmployeeTypeManager />
            </main>
        </div>
    );
};
