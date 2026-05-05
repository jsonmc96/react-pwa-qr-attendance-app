import React, { useState, useEffect } from 'react';
import { subscribeToParkingSpots, toggleSpot, PARKING_LAYOUT } from '../../services/firebase/parkingMapSync';
import { toast } from 'react-toastify';

/**
 * ParkingMap - Representación visual del parqueadero sin posicionamiento absoluto.
 * Evita cualquier sobreposición y se adapta perfectamente a todas las pantallas móviles.
 *
 * Layout:
 *   - Arriba: 3 puestos VIP de administración (horizontal)
 *   - Abajo (Grid de 12 columnas):
 *       - Lado izquierdo (col-span-7): Zona de maniobra transitable de un solo color, con el Portón abajo a la izquierda y el Césped.
 *       - Lado derecho (col-span-5): Los 8 puestos generales apilados de forma ordenada y responsiva.
 */
export const ParkingMap = ({ user, onSpotSelected, readOnly = false }) => {
    const [spotsData, setSpotsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectingId, setSelectingId] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToParkingSpots((data) => {
            setSpotsData(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSpotClick = async (spotId) => {
        if (readOnly || selectingId) return;

        const spot = spotsData[spotId];
        const isMine = spot?.userId === user?.uid;
        const isOccupied = spot?.isOccupied;

        if (isOccupied && !isMine) return;

        setSelectingId(spotId);
        const res = await toggleSpot(spotId, user);

        if (res.success) {
            if (res.action === 'released') {
                toast.success(`Puesto ${spotId} liberado 🚀`);
            } else {
                toast.success(`Puesto ${spotId} reservado ✅`);
                if (onSpotSelected) onSpotSelected(spotId);
            }
        } else {
            toast.error(res.error || "No se pudo actualizar el puesto.");
        }
        setSelectingId(null);
    };

    const getSpotState = (spotId) => {
        const spot = spotsData[spotId] || {};
        const isMine = spot.userId === user?.uid;
        const isOccupied = !!spot.isOccupied;
        const isSelecting = selectingId === spotId;
        return { isMine, isOccupied, isSelecting, userName: spot.userName };
    };

    const generalIds = PARKING_LAYOUT.general.map(s => s.id);
    const freeGeneral = generalIds.filter(id => !spotsData[id]?.isOccupied).length;
    const totalGeneral = PARKING_LAYOUT.general.length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-bold">Cargando mapa...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 select-none">
            {/* Cabecera del Mapa */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <span className="text-xl font-black text-indigo-700 leading-none">
                        {freeGeneral} <span className="text-xs font-bold text-gray-500">libres</span>
                    </span>
                    <span className="text-[8px] text-gray-400 uppercase tracking-widest font-black">
                        de {totalGeneral} generales
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-end max-w-[60%]">
                    {[
                        { color: 'bg-emerald-500', label: 'Libre' },
                        { color: 'bg-slate-500',   label: 'Ocupado' },
                        { color: 'bg-indigo-600',  label: 'Tuyo' },
                        { color: 'bg-amber-500',   label: 'VIP' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-[8px] text-gray-500 font-bold">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenedor Principal del Parqueadero (Adoquín unificado) */}
            <div className="w-full bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-xl flex flex-col gap-4">
                
                {/* 1. SECCIÓN VIP (Arriba - Flujo horizontal con tamaño ajustado) */}
                <div className="w-full">
                    <div className="text-[9px] text-amber-400 font-black uppercase tracking-wider mb-2 flex items-center gap-1">
                        👑 Puestos VIP (Exclusivos)
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {PARKING_LAYOUT.vip.map((spotDef) => {
                            const { isMine, isOccupied, isSelecting, userName } = getSpotState(spotDef.id);
                            const isDisabled = (isOccupied && !isMine) || !!selectingId || readOnly;

                            return (
                                <button
                                    key={spotDef.id}
                                    onClick={() => handleSpotClick(spotDef.id)}
                                    disabled={isDisabled}
                                    className={`
                                        relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200
                                        ${isMine
                                            ? 'bg-indigo-950 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                                            : isOccupied
                                                ? 'bg-slate-800/80 border-slate-700 opacity-60'
                                                : 'bg-amber-950/10 border-amber-500/40 hover:border-amber-400/80 hover:bg-amber-950/20 active:scale-95'
                                        }
                                        ${isSelecting ? 'animate-pulse' : ''}
                                    `}
                                >
                                    <span className="text-base leading-none mb-1">
                                        {isOccupied ? (isMine ? '🚙' : '🚗') : spotDef.icon}
                                    </span>
                                    <span className={`text-[8px] font-bold leading-tight text-center truncate w-full px-0.5
                                        ${isMine ? 'text-indigo-300' : isOccupied ? 'text-slate-500' : 'text-amber-300'}`}>
                                        {isOccupied && !isMine
                                            ? (userName?.split(' ')[0] || 'Ocupado')
                                            : spotDef.label
                                        }
                                    </span>
                                    {isOccupied && (
                                        <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-red-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. SECCIÓN INFERIOR (Zona de Maniobras + Puestos Generales) */}
                <div className="grid grid-cols-12 gap-3 min-h-[220px]">
                    
                    {/* A. Lado Izquierdo: Zona de Maniobras (Adoquín continuo sin carreteras artificiales) */}
                    <div className="col-span-7 flex flex-col justify-between bg-slate-950/30 rounded-xl p-2 border border-slate-800/50 relative overflow-hidden">
                        
                        <div className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">
                            Área de Tránsito (Adoquín)
                        </div>
                        
                        <div className="flex justify-between items-end mt-12 z-10">
                            {/* Portón (Baja desde aquí) */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-8 bg-slate-800 border border-slate-700 rounded-t-md flex items-center justify-center shadow-md">
                                    <span className="text-sm">🚪</span>
                                </div>
                                <span className="text-[8px] text-slate-500 font-black uppercase mt-0.5">Portón</span>
                            </div>

                            {/* Césped */}
                            <div className="text-[8px] text-green-500/80 font-black uppercase tracking-widest pb-0.5">
                                🌿 Césped
                            </div>
                        </div>
                        
                        {/* Indicador de sentido sutil */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest rotate-[-90deg]">
                                Entrada / Salida
                            </span>
                        </div>
                    </div>

                    {/* B. Lado Derecho: Puestos Generales (Flujo vertical perfectamente alineado) */}
                    <div className="col-span-5 flex flex-col gap-1.5">
                        <div className="text-[9px] text-emerald-400 font-black uppercase tracking-wider text-right pr-0.5">
                            🅿️ Generales
                        </div>
                        <div className="flex flex-col gap-1 flex-grow justify-between">
                            {PARKING_LAYOUT.general.map((spotDef, idx) => {
                                const { isMine, isOccupied, isSelecting, userName } = getSpotState(spotDef.id);
                                const isDisabled = (isOccupied && !isMine) || !!selectingId || readOnly;

                                return (
                                    <button
                                        key={spotDef.id}
                                        onClick={() => handleSpotClick(spotDef.id)}
                                        disabled={isDisabled}
                                        className={`
                                            flex-grow flex items-center justify-between px-2 py-1 rounded-lg border transition-all duration-200
                                            ${isMine
                                                ? 'bg-indigo-950 border-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.3)]'
                                                : isOccupied
                                                    ? 'bg-slate-800/80 border-slate-700 opacity-50'
                                                    : 'bg-emerald-950/10 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/20 active:scale-95'
                                            }
                                            ${isSelecting ? 'animate-pulse' : ''}
                                        `}
                                    >
                                        <span className={`text-[9px] font-bold leading-none truncate max-w-[70%]
                                            ${isMine ? 'text-indigo-300' : isOccupied ? 'text-slate-500' : 'text-emerald-400'}`}>
                                            {isOccupied && !isMine
                                                ? `🚗 ${userName?.split(' ')[0] || 'Ocup.'}`
                                                : isMine
                                                    ? `🚙 Tuyo`
                                                    : `Puesto ${idx + 1}`
                                            }
                                        </span>
                                        <div className={`w-2.5 h-2.5 rounded-full border border-slate-900/40 transition-all duration-300
                                            ${isMine
                                                ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                                                : isOccupied
                                                    ? 'bg-slate-500'
                                                    : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                                            }
                                        `} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>

            <p className="text-[9px] text-gray-400 text-center italic px-2 leading-relaxed">
                Toca un puesto libre para seleccionarlo. Al presionar "Salir", se liberará automáticamente.
            </p>
        </div>
    );
};
