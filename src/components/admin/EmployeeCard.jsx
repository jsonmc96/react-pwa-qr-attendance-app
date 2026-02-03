import { EMPLOYEE_TYPES } from '../../config/appConfig';
import { Button } from '../common/Button';

/**
 * Card component for displaying employee info in mobile view
 */
export const EmployeeCard = ({ user, onUpdateType, updating }) => {
    const isUpdating = updating === user.uid;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            {/* Header with icon and name */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {user.displayName || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
            </div>

            {/* Current type badge */}
            <div className="mb-3">
                <span className={`
                    inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full
                    ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }
                `}>
                    {user.employeeType === EMPLOYEE_TYPES.ONSITE ? (
                        <>🏢 Presencial</>
                    ) : (
                        <>🏠 Remoto</>
                    )}
                </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${user.employeeType === EMPLOYEE_TYPES.ONSITE
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                    `}
                    onClick={() => onUpdateType(user.uid, EMPLOYEE_TYPES.ONSITE)}
                    disabled={isUpdating || user.employeeType === EMPLOYEE_TYPES.ONSITE}
                >
                    {isUpdating ? '...' : 'Presencial'}
                </button>
                <button
                    className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                    `}
                    onClick={() => onUpdateType(user.uid, EMPLOYEE_TYPES.REMOTE)}
                    disabled={isUpdating || user.employeeType === EMPLOYEE_TYPES.REMOTE || !user.employeeType}
                >
                    {isUpdating ? '...' : 'Remoto'}
                </button>
            </div>
        </div>
    );
};
