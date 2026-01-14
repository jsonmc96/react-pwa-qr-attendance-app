export const Loading = ({
    size = 'medium',
    text = 'Cargando...',
    fullScreen = false
}) => {
    const sizes = {
        small: 'w-6 h-6 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`
          ${sizes[size]} 
          border-gray-200 border-t-primary-600 
          rounded-full animate-spin
        `}
            />
            {text && (
                <p className="text-gray-600 text-sm font-medium">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
