import { useState } from 'react';
import { exportToPDF, exportToExcel } from '../../utils/reportExport';

/**
 * Componente de botones de exportación
 * @param {Array} data - Datos de asistencia
 * @param {string} reportType - 'date' | 'user'
 * @param {Object} filters - Filtros aplicados
 * @param {boolean} disabled - Deshabilitar botones
 */
export const ExportButtons = ({ data, reportType, filters, disabled = false }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportPDF = async () => {
        if (disabled || exporting) return;

        setExporting(true);
        try {
            exportToPDF(data, reportType, filters);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Error al exportar a PDF: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = async () => {
        if (disabled || exporting) return;

        setExporting(true);
        try {
            exportToExcel(data, reportType, filters);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error al exportar a Excel: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-lg">📥</span>
                Exportar Reporte
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botón PDF */}
                <button
                    onClick={handleExportPDF}
                    disabled={disabled || exporting}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">📄</span>
                    <span>{exporting ? 'Exportando...' : 'Descargar PDF'}</span>
                </button>

                {/* Botón Excel */}
                <button
                    onClick={handleExportExcel}
                    disabled={disabled || exporting}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">📊</span>
                    <span>{exporting ? 'Exportando...' : 'Descargar Excel'}</span>
                </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
                Los archivos se descargarán automáticamente
            </p>
        </div>
    );
};
