import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Construye los datos del reporte en formato estructurado
 * @param {Array} records - Registros de asistencia
 * @param {string} reportType - 'date' | 'user'
 * @param {Object} filters - Filtros aplicados
 * @returns {Object} { headers, rows, metadata }
 */
export const buildReportData = (records, reportType, filters) => {
    const headers = ['#', 'Usuario', 'Email', 'Fecha', 'Hora'];

    const rows = records.map((record, index) => {
        const date = new Date(record.date + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const formattedTime = record.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return [
            index + 1,
            record.userName || 'Usuario Desconocido',
            record.userEmail || '',
            formattedDate,
            formattedTime
        ];
    });

    const metadata = {
        reportType: reportType === 'date' ? 'Reporte por Fecha' : 'Reporte por Usuario',
        generatedAt: new Date().toLocaleString('es-ES'),
        totalRecords: records.length,
        filters: buildFilterText(reportType, filters)
    };

    return { headers, rows, metadata };
};

/**
 * Construye el texto de filtros aplicados
 */
const buildFilterText = (reportType, filters) => {
    if (reportType === 'date') {
        const startDate = new Date(filters.startDate + 'T00:00:00').toLocaleDateString('es-ES');
        const endDate = new Date(filters.endDate + 'T00:00:00').toLocaleDateString('es-ES');
        return `Rango: ${startDate} - ${endDate}`;
    } else {
        return `Usuario: ${filters.userName} (${filters.userEmail})`;
    }
};

/**
 * Exporta los datos a PDF
 * @param {Array} records - Registros de asistencia
 * @param {string} reportType - 'date' | 'user'
 * @param {Object} filters - Filtros aplicados
 */
export const exportToPDF = (records, reportType, filters) => {
    const { headers, rows, metadata } = buildReportData(records, reportType, filters);

    // Crear documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE ASISTENCIA', 105, 15, { align: 'center' });

    // Metadata
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tipo: ${metadata.reportType}`, 14, 25);
    doc.text(`Filtros: ${metadata.filters}`, 14, 31);
    doc.text(`Total de registros: ${metadata.totalRecords}`, 14, 37);
    doc.text(`Generado: ${metadata.generatedAt}`, 14, 43);

    // Tabla
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 50,
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [59, 130, 246], // primary-600
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251] // gray-50
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' }, // #
            1: { cellWidth: 50 }, // Usuario
            2: { cellWidth: 55 }, // Email
            3: { cellWidth: 30, halign: 'center' }, // Fecha
            4: { cellWidth: 30, halign: 'center' }  // Hora
        }
    });

    // Footer con número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Generar nombre de archivo
    const fileName = generateFileName(reportType, filters, 'pdf');

    // Descargar
    doc.save(fileName);
};

/**
 * Exporta los datos a Excel
 * @param {Array} records - Registros de asistencia
 * @param {string} reportType - 'date' | 'user'
 * @param {Object} filters - Filtros aplicados
 */
export const exportToExcel = (records, reportType, filters) => {
    const { headers, rows, metadata } = buildReportData(records, reportType, filters);

    // Crear datos para Excel con metadata
    const excelData = [
        ['REPORTE DE ASISTENCIA'],
        [],
        [`Tipo: ${metadata.reportType}`],
        [`Filtros: ${metadata.filters}`],
        [`Total de registros: ${metadata.totalRecords}`],
        [`Generado: ${metadata.generatedAt}`],
        [],
        headers,
        ...rows
    ];

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Estilos y anchos de columna
    ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 25 }, // Usuario
        { wch: 30 }, // Email
        { wch: 12 }, // Fecha
        { wch: 10 }  // Hora
    ];

    // Merge cells para el título
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } } // Título
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');

    // Generar nombre de archivo
    const fileName = generateFileName(reportType, filters, 'xlsx');

    // Descargar
    XLSX.writeFile(wb, fileName);
};

/**
 * Genera el nombre del archivo para exportación
 */
const generateFileName = (reportType, filters, extension) => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (reportType === 'date') {
        return `reporte_asistencia_${filters.startDate}_${filters.endDate}_${timestamp}.${extension}`;
    } else {
        const userName = filters.userName.replace(/\s+/g, '_').toLowerCase();
        return `reporte_asistencia_${userName}_${timestamp}.${extension}`;
    }
};
