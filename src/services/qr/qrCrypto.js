/**
 * Genera un hash SHA-256 para el QR
 * @param {string} data - Datos a hashear
 * @returns {Promise<string>} Hash en formato hexadecimal
 */
export const generateHash = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Genera el contenido del QR para un día específico
 * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
 * @param {string} secret - Secreto para generar el hash
 * @returns {Promise<string>} Hash del QR
 */
export const generateQRContent = async (date, secret) => {
    const qrSecret = secret || import.meta.env.VITE_QR_SECRET || 'default_secret_change_this';
    const salt = 'attendance_qr_v1'; // Versión del QR
    const dataToHash = `${date}|${qrSecret}|${salt}`;

    return await generateHash(dataToHash);
};

/**
 * Valida que un hash de QR sea correcto para una fecha
 * @param {string} scannedHash - Hash escaneado del QR
 * @param {string} date - Fecha a validar
 * @param {string} secret - Secreto usado para generar el QR
 * @returns {Promise<boolean>} True si el hash es válido
 */
export const validateQRHash = async (scannedHash, date, secret) => {
    const expectedHash = await generateQRContent(date, secret);
    return scannedHash === expectedHash;
};

/**
 * Genera un ID único para el QR
 * @returns {string} ID único
 */
export const generateQRId = () => {
    return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
