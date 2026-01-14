export const Loading = ({
    size = 'medium',
    text = 'Cargando...',
    fullScreen = false
}) => {
    const sizes = {
        small: 'w-5 h-5 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div
                    className={`
            ${sizes[size]} 
            border-gray-200 border-t-primary-600 
            rounded-full animate-spin
          `}
                />
                <div
                    className={`
            absolute inset-0
            ${sizes[size]} 
            border-gray-200 border-b-primary-600 
            rounded-full animate-spin
          `}
                    style={{ animationDirection: 'reverse', animationDuration: '1s' }}
                />
            </div>
            {text && (
                <p className="text-gray-600 text-sm font-medium animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
