export const Card = ({
    children,
    title,
    subtitle,
    hover = false,
    className = '',
    ...props
}) => {
    const hoverClass = hover ? 'hover:shadow-lg' : '';

    return (
        <div
            className={`bg-white rounded-xl shadow-md p-6 animate-fade-in transition-shadow duration-200 ${hoverClass} ${className}`}
            {...props}
        >
            {title && (
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
