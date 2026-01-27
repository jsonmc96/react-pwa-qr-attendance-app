import { getMobileOS } from '../../utils/permissions';

/**
 * PermissionInstructions Component
 * Shows OS-specific instructions for enabling permissions
 */
export const PermissionInstructions = ({ type = 'camera', onRetry }) => {
    const os = getMobileOS();

    const instructions = {
        ios: {
            camera: {
                title: '📱 Habilitar Cámara en iPhone',
                steps: [
                    'Abre la app "Configuración" de tu iPhone',
                    'Desplázate hacia abajo y toca "Safari"',
                    'Toca "Cámara"',
                    'Selecciona "Permitir"',
                    'Regresa a esta página y toca "Reintentar"'
                ],
                alternative: 'Si instalaste esta app como PWA, ve a Configuración → [Nombre de la App] → Cámara → Permitir'
            },
            location: {
                title: '📍 Habilitar Ubicación en iPhone',
                steps: [
                    'Abre la app "Configuración" de tu iPhone',
                    'Desplázate hacia abajo y toca "Safari"',
                    'Toca "Ubicación"',
                    'Selecciona "Preguntar" o "Permitir"',
                    'Regresa a esta página y toca "Reintentar"'
                ],
                alternative: 'Si instalaste esta app como PWA, ve a Configuración → Privacidad → Ubicación → [Nombre de la App] → Permitir'
            }
        },
        android: {
            camera: {
                title: '📱 Habilitar Cámara en Android',
                steps: [
                    'Toca el ícono de candado o información (ⓘ) en la barra de direcciones',
                    'Busca "Cámara" en la lista de permisos',
                    'Cambia a "Permitir"',
                    'Recarga la página y toca "Reintentar"'
                ],
                alternative: 'También puedes ir a Configuración → Apps → [Navegador] → Permisos → Cámara → Permitir'
            },
            location: {
                title: '📍 Habilitar Ubicación en Android',
                steps: [
                    'Toca el ícono de candado o información (ⓘ) en la barra de direcciones',
                    'Busca "Ubicación" en la lista de permisos',
                    'Cambia a "Permitir"',
                    'Recarga la página y toca "Reintentar"'
                ],
                alternative: 'También puedes ir a Configuración → Apps → [Navegador] → Permisos → Ubicación → Permitir'
            }
        },
        desktop: {
            camera: {
                title: '🎥 Habilitar Cámara en el Navegador',
                steps: [
                    'Haz clic en el ícono de candado o cámara en la barra de direcciones',
                    'Busca "Cámara" en la lista de permisos',
                    'Selecciona "Permitir"',
                    'Recarga la página si es necesario'
                ],
                alternative: 'También puedes ir a la configuración del navegador → Privacidad y seguridad → Permisos del sitio → Cámara'
            },
            location: {
                title: '📍 Habilitar Ubicación en el Navegador',
                steps: [
                    'Haz clic en el ícono de candado en la barra de direcciones',
                    'Busca "Ubicación" en la lista de permisos',
                    'Selecciona "Permitir"',
                    'Recarga la página si es necesario'
                ],
                alternative: 'También puedes ir a la configuración del navegador → Privacidad y seguridad → Permisos del sitio → Ubicación'
            }
        }
    };

    const content = instructions[os]?.[type] || instructions.desktop[type];

    return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-left">
            {/* Icon and Title */}
            <div className="flex items-start gap-3 mb-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 mb-1">
                        Permiso Denegado
                    </h3>
                    <p className="text-sm text-orange-800">
                        {content.title}
                    </p>
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                    📋 Sigue estos pasos:
                </p>
                <ol className="space-y-2">
                    {content.steps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-700 flex gap-2">
                            <span className="font-bold text-orange-600 min-w-[20px]">
                                {index + 1}.
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Alternative */}
            {content.alternative && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-900">
                        <strong>💡 Alternativa:</strong> {content.alternative}
                    </p>
                </div>
            )}

            {/* Retry Button */}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors active:scale-95"
                >
                    🔄 Reintentar
                </button>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-600 text-center mt-3">
                Después de habilitar el permiso, es posible que necesites recargar la página
            </p>
        </div>
    );
};
