export const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'font-medium py-3 px-6 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 text-white shadow-md hover:bg-primary-700 active:bg-primary-800',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
        success: 'bg-success-600 text-white shadow-md hover:bg-success-700 active:bg-success-800',
        danger: 'bg-danger-600 text-white shadow-md hover:bg-danger-700 active:bg-danger-800',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
