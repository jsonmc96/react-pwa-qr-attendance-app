export const EmptyState = ({
    icon = '📭',
    title = 'No hay datos',
    message,
    action,
    actionLabel,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl">{icon}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
                {title}
            </h3>

            {message && (
                <p className="text-sm text-gray-600 max-w-sm mb-6">
                    {message}
                </p>
            )}

            {action && actionLabel && (
                <button
                    onClick={action}
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
