import { useEffect } from 'react';

export const Toast = ({
    type = 'info',
    message,
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const types = {
        success: {
            bg: 'bg-success-50 border-success-200',
            text: 'text-success-800',
            icon: '✅'
        },
        error: {
            bg: 'bg-danger-50 border-danger-200',
            text: 'text-danger-800',
            icon: '❌'
        },
        warning: {
            bg: 'bg-warning-50 border-warning-200',
            text: 'text-warning-800',
            icon: '⚠️'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            icon: 'ℹ️'
        }
    };

    const config = types[type];

    return (
        <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      ${config.bg} border-2 ${config.text}
      px-6 py-4 rounded-2xl shadow-lg
      flex items-center gap-3
      animate-slide-down
      max-w-md w-full mx-4
    `}>
            <span className="text-2xl">{config.icon}</span>
            <p className="flex-1 font-medium text-sm">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
};
