# 🎨 Sistema de Diseño Premium - PWA Asistencia

## Design Tokens

### Colores
```css
/* Primary - Azul vibrante (iOS-like) */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6
--primary-600: #2563eb  /* Principal */
--primary-700: #1d4ed8
--primary-900: #1e3a8a

/* Success - Verde fresco */
--success-50: #f0fdf4
--success-100: #dcfce7
--success-500: #22c55e
--success-600: #16a34a  /* Principal */
--success-700: #15803d

/* Danger - Rojo suave */
--danger-50: #fef2f2
--danger-100: #fee2e2
--danger-500: #ef4444
--danger-600: #dc2626   /* Principal */
--danger-700: #b91c1c

/* Warning - Naranja cálido */
--warning-50: #fff7ed
--warning-100: #ffedd5
--warning-500: #f97316
--warning-600: #ea580c  /* Principal */

/* Gray - Neutros modernos */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Gradientes
```css
/* Gradiente principal (hero, cards destacados) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Gradiente sutil (fondos) */
background: linear-gradient(to bottom right, #f9fafb, #e5e7eb)

/* Gradiente success */
background: linear-gradient(135deg, #10b981 0%, #059669 100%)

/* Gradiente glass (glassmorphism) */
background: rgba(255, 255, 255, 0.9)
backdrop-filter: blur(10px)
```

### Tipografía
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

/* Font Sizes */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Border Radius
```css
--radius-sm: 0.5rem    /* 8px */
--radius-md: 0.75rem   /* 12px */
--radius-lg: 1rem      /* 16px */
--radius-xl: 1.5rem    /* 24px */
--radius-2xl: 2rem     /* 32px - Principal */
--radius-full: 9999px
```

### Sombras
```css
/* Sombra suave (cards) */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)

/* Sombra media (hover) */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)

/* Sombra grande (modals) */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)

/* Sombra colored (botones primarios) */
box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39)
```

### Spacing
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Tap Targets
```css
/* Mínimo para mobile */
min-height: 44px
min-width: 44px

/* Recomendado para botones principales */
min-height: 48px
padding: 12px 24px
```

### Animaciones
```css
/* Duración */
--duration-fast: 150ms
--duration-base: 200ms
--duration-slow: 300ms

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

/* Transiciones comunes */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Componentes Base

### Button States
```
Primary:
- Default: bg-primary-600 + shadow-colored
- Hover: bg-primary-700 + shadow-lg
- Active: bg-primary-800 + scale-95
- Loading: opacity-80 + spinner
- Disabled: opacity-50 + cursor-not-allowed

Secondary:
- Default: bg-gray-100 + text-gray-900
- Hover: bg-gray-200
- Active: bg-gray-300

Ghost:
- Default: transparent + text-gray-700
- Hover: bg-gray-100
- Active: bg-gray-200
```

### Card Variants
```
Normal:
- bg-white + rounded-2xl + shadow-sm
- padding: 24px (p-6)

Hover:
- hover:shadow-md + transition

Featured:
- gradient border
- shadow-lg
- hover:scale-102
```

### Input States
```
Normal:
- border-gray-300 + rounded-xl
- focus:ring-2 ring-primary-500

Error:
- border-danger-500
- text-danger-600 (mensaje)

Disabled:
- bg-gray-100 + cursor-not-allowed
```

---

## Patrones de UI

### Empty States
```
Estructura:
- Icono grande (emoji o SVG)
- Título descriptivo
- Mensaje de ayuda
- CTA (opcional)

Ejemplo:
┌─────────────────────┐
│       📭            │
│  No hay datos       │
│  Descripción aquí   │
│  [Botón acción]     │
└─────────────────────┘
```

### Loading States
```
Full Screen:
- Overlay blanco 90% opacity
- Spinner centrado
- Texto "Cargando..."

Inline:
- Skeleton screens
- Spinner pequeño
- Texto opcional
```

### Error States
```
Inline Error:
- bg-danger-50
- border-danger-200
- text-danger-700
- Icono ❌

Toast/Alert:
- Posición: top-center
- Auto-dismiss: 3s
- Animación: slide-down
```

---

## Mobile-First Guidelines

### Breakpoints
```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

### Touch Targets
```
Mínimo: 44x44px
Recomendado: 48x48px
Spacing entre targets: 8px
```

### Typography Scale (Mobile)
```
Headings: 24px - 30px
Body: 16px
Small: 14px
Tiny: 12px
```

---

## Accessibility

### Contraste
```
Text normal: 4.5:1
Text grande: 3:1
UI components: 3:1
```

### Focus States
```
ring-2 ring-primary-500 ring-offset-2
outline-none
```

### ARIA Labels
```
Todos los botones de iconos
Todos los inputs
Estados de loading
```

---

Este sistema de diseño garantiza:
✅ Consistencia visual
✅ Experiencia nativa
✅ Mobile-first
✅ Accesibilidad
✅ Performance (solo CSS/Tailwind)
