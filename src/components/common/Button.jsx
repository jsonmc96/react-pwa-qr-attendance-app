export const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'relative font-semibold rounded-2xl transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 min-h-[48px]';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 hover:from-primary-700 hover:to-primary-800',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
        success: 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg shadow-success-600/30 hover:shadow-xl hover:shadow-success-600/40',
        danger: 'bg-gradient-to-r from-danger-600 to-danger-700 text-white shadow-lg shadow-danger-600/30 hover:shadow-xl hover:shadow-danger-600/40',
        outline: 'border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 active:bg-primary-100',
        ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
    };

    const sizeClasses = 'px-6 py-3 text-base';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${sizeClasses} ${widthClass} ${className}`}
            {...props}
        >
            {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};
