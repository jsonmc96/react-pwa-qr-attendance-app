import React, { useState, useRef, useEffect } from 'react';

/**
 * SwipeButton - Un componente premium para acciones que requieren confirmación consciente.
 * 
 * @param {Function} onSuccess - Se llama cuando el deslizamiento se completa satisfactoriamente.
 * @param {string} text - Texto que se muestra en el track del botón.
 * @param {boolean} disabled - Si el botón está deshabilitado.
 * @param {boolean} loading - Si está en estado de carga (muestra spinner).
 * @param {boolean} small - Si debe mostrarse en versión pequeña.
 */
export const SwipeButton = ({ 
    onSuccess, 
    text = "Desliza para confirmar", 
    disabled = false, 
    loading = false, 
    small = false 
}) => {
    const [isSwiped, setIsSwiped] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const containerRef = useRef(null);
    const handleRef = useRef(null);
    
    const maxDrag = containerRef.current 
        ? containerRef.current.offsetWidth - (small ? 48 : 64) - 8 // padding
        : 0;

    const handleStart = (e) => {
        if (disabled || loading || isSwiped) return;
        setIsDragging(true);
    };

    const handleMove = (e) => {
        if (!isDragging || disabled || loading || isSwiped) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = clientX - rect.left - (small ? 24 : 32); // Center handle
        
        const currentMaxDrag = rect.width - (small ? 48 : 64) - 8;
        const newValue = Math.max(0, Math.min(relativeX, currentMaxDrag));
        
        setDragX(newValue);
        
        // Trigger success if reached 90%
        if (newValue >= currentMaxDrag * 0.95) {
            confirm();
        }
    };

    const handleEnd = () => {
        if (!isDragging || isSwiped) return;
        setIsDragging(false);
        
        const currentMaxDrag = containerRef.current.offsetWidth - (small ? 48 : 64) - 8;
        
        if (dragX < currentMaxDrag * 0.95) {
            // Reset position if not finished
            setDragX(0);
        }
    };

    const confirm = () => {
        setIsDragging(false);
        const currentMaxDrag = containerRef.current.offsetWidth - (small ? 48 : 64) - 8;
        setDragX(currentMaxDrag);
        setIsSwiped(true);
        if (onSuccess) onSuccess();
        
        // Reset after a delay if needed, but usually the parent handles state change
        setTimeout(() => {
            setIsSwiped(false);
            setDragX(0);
        }, 1500);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    const buttonHeight = small ? 'h-14' : 'h-20';
    const handleSize = small ? 'w-12 h-12' : 'w-16 h-16';
    const textSize = small ? 'text-xs' : 'text-sm';

    return (
        <div 
            ref={containerRef}
            className={`relative ${buttonHeight} w-full bg-gray-200 rounded-full p-1 overflow-hidden select-none touch-none shadow-inner border border-gray-300 ${disabled || loading ? 'opacity-60 grayscale' : ''}`}
        >
            {/* Background progress */}
            <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-75"
                style={{ width: `${dragX + (small ? 48 : 64)}px` }}
            ></div>

            {/* Text Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${textSize} font-bold tracking-wider transition-opacity duration-200 ${dragX > 50 ? 'opacity-0' : 'text-gray-500'}`}>
                {loading ? 'PROCESANDO...' : text.toUpperCase()}
            </div>

            {/* Handle */}
            <div
                ref={handleRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className={`absolute left-1 top-1 ${handleSize} bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-75`}
                style={{ transform: `translateX(${dragX}px)` }}
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : isSwiped ? (
                    <span className="text-primary-600 text-xl font-bold">✓</span>
                ) : (
                    <div className="flex gap-1">
                        <span className="w-1 h-4 bg-primary-300 rounded-full"></span>
                        <span className="w-1 h-4 bg-primary-400 rounded-full"></span>
                        <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                    </div>
                )}
            </div>
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        </div>
    );
};
