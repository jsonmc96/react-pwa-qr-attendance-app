/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida una contraseña (mínimo 6 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es válida
 */
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} True si no está vacío
 */
export const isNotEmpty = (value) => {
    return value && value.trim().length > 0;
};

/**
 * Valida un formulario de login
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Objeto con isValid y errors
 */
export const validateLoginForm = (formData) => {
    const errors = {};

    if (!isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    }

    if (!isValidPassword(formData.password)) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Sanitiza un string removiendo caracteres especiales
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (str) => {
    return str.replace(/[<>]/g, '');
};
