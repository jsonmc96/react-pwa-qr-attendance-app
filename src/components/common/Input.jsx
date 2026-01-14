export const Input = ({
    type = 'text',
    label,
    error,
    placeholder,
    value,
    onChange,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`
          w-full px-4 py-3 border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200 text-base
          ${error ? 'border-danger-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
};
