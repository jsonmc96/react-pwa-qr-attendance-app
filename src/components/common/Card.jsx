export const Card = ({
    children,
    title,
    subtitle,
    hover = false,
    featured = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'bg-white rounded-2xl shadow-sm p-6 animate-fade-in transition-all duration-200';
    const hoverClass = hover ? 'hover:shadow-md hover:-translate-y-0.5' : '';
    const featuredClass = featured
        ? 'bg-gradient-to-br from-white to-primary-50 border-2 border-primary-200 shadow-lg'
        : '';

    return (
        <div
            className={`${baseClasses} ${hoverClass} ${featuredClass} ${className}`}
            {...props}
        >
            {title && (
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
