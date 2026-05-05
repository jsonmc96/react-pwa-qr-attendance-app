import { EMPLOYEE_TYPES } from '../../config/appConfig';
import { Button } from '../common/Button';

/**
 * Card component for displaying employee info in mobile view
 */
export const EmployeeCard = ({ user, onUpdateType, onUpdateVehicle, updating }) => {
    const isUpdating = updating === user.uid;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            {/* Header with icon and name */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {user.displayName || 'Sin nombre'}
                        </h3>
                        {/* Toggle Vehículo Rápido */}
                        <button
                            onClick={() => onUpdateVehicle(user.uid, !user.hasVehicle)}
                            disabled={isUpdating}
                            className={`px-2 py-0.5 rounded-lg text-[8px] font-black transition-all ${user.hasVehicle
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {user.hasVehicle ? '🚘 TIENE' : '🚶 NO'}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
            </div>

            {/* Current type badge */}
            <div className="flex gap-2 mb-3">
                <span className={`
                    inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase rounded-full
                    ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }
                `}>
                    {user.employeeType === EMPLOYEE_TYPES.ONSITE ? '🏢 Presencial' : '🏠 Remoto'}
                </span>
                
                {user.hasVehicle && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-800">
                        🚘 Vehículo
                    </span>
                )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    className={`
                        px-3 py-2 rounded-lg text-xs font-black uppercase transition-all
                        ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }
                    `}
                    onClick={() => onUpdateType(user.uid, EMPLOYEE_TYPES.ONSITE)}
                    disabled={isUpdating}
                >
                    Presencial
                </button>
                <button
                    className={`
                        px-3 py-2 rounded-lg text-xs font-black uppercase transition-all
                        ${user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }
                    `}
                    onClick={() => onUpdateType(user.uid, EMPLOYEE_TYPES.REMOTE)}
                    disabled={isUpdating}
                >
                    Remoto
                </button>
            </div>
        </div>
    );
};
