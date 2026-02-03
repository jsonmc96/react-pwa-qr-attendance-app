# 🚀 Guía de Deploy con Versión Automática

## Uso Simple

```powershell
.\deploy-with-version.ps1
```

El script te preguntará qué tipo de cambios hiciste y actualizará la versión automáticamente.

---

## 📚 Tipos de Versión (Semantic Versioning)

### Formato: `MAJOR.MINOR.PATCH`
Ejemplo: `2.3.5`

---

### 🟢 PATCH (1.0.1 → 1.0.2)
**Cuándo usar:** Correcciones de bugs o mejoras pequeñas

**Ejemplos:**
- ✅ Arreglar error de cámara
- ✅ Mejorar mensajes de error
- ✅ Corregir validación de horario
- ✅ Optimizar velocidad del scanner
- ✅ Arreglar texto mal escrito

**Regla:** Si **arreglaste** algo que estaba mal → PATCH

---

### 🟡 MINOR (1.0.2 → 1.1.0)
**Cuándo usar:** Nueva funcionalidad (sin romper nada existente)

**Ejemplos:**
- ✅ Agregar página de ranking
- ✅ Nuevo reporte de asistencia
- ✅ Validación de GPS para empleados
- ✅ Exportar a Excel
- ✅ Notificaciones PWA de actualización
- ✅ Mostrar versión en la app

**Regla:** Si **agregaste** algo nuevo → MINOR

---

### 🔴 MAJOR (1.1.0 → 2.0.0)
**Cuándo usar:** Cambios que rompen compatibilidad

**Ejemplos:**
- ✅ Cambiar estructura de la base de datos (requiere migración)
- ✅ Eliminar funcionalidades que la gente usa
- ✅ Cambiar completamente el sistema de autenticación
- ✅ Rediseño total que requiere reinstalar la app
- ✅ Cambiar de Firebase a otro backend

**Regla:** Si **rompiste** algo que funcionaba → MAJOR

---

## 🎯 Regla Rápida

| Pregunta | Respuesta | Tipo |
|----------|-----------|------|
| ¿Rompiste algo? | Sí | 🔴 MAJOR |
| ¿Agregaste algo nuevo? | Sí | 🟡 MINOR |
| ¿Arreglaste un bug? | Sí | 🟢 PATCH |

---

## 📋 Ejemplo de Flujo

```
PS> .\deploy-with-version.ps1

🚀 ============================================
🚀   DEPLOY CON ACTUALIZACIÓN DE VERSIÓN
🚀 ============================================

📦 Versión actual: 1.0.1

📚 ¿Qué tipo de cambios hiciste?

  1. 🟢 PATCH (1.0.2)  - Corrección de bugs, mejoras pequeñas
     Ejemplos: Arreglar error de cámara, mejorar mensajes

  2. 🟡 MINOR (1.1.0)  - Nueva funcionalidad (sin romper nada)
     Ejemplos: Nueva página, nuevo reporte, validación GPS

  3. 🔴 MAJOR (2.0.0)  - Cambios que rompen compatibilidad
     Ejemplos: Cambiar estructura DB, eliminar funciones

Selecciona el tipo de cambio [1/2/3] (Enter = 1 PATCH): 1

✨ Nueva versión: 🟢 1.0.2 (PATCH)

¿Continuar con el deploy de la versión 1.0.2? [S/n]: s

🔄 Actualizando versión en .env...
✅ Versión actualizada: 1.0.2

🔨 Compilando aplicación...
[... build output ...]

🚀 Desplegando a Firebase...
[... deploy output ...]

✅ ============================================
✅   DEPLOY EXITOSO!
✅ ============================================

📱 Versión publicada: 1.0.2
🌐 Los usuarios verán esta versión en la app
```

---

## 💡 Consejos

1. **Por defecto es PATCH**: Si solo presionas Enter, se incrementa PATCH (lo más común)
2. **La versión se muestra en la app**: Los usuarios la verán en el login y dentro de la app
3. **Git tags opcionales**: El script te pregunta si quieres crear un tag de Git
4. **No olvides hacer push**: Si creas un tag, recuerda hacer `git push --tags`

---

## 🔄 Historial de Versiones Recomendado

```
1.0.0 - Versión inicial
1.0.1 - Fix: Error de cámara en iOS
1.0.2 - Fix: Validación de horario
1.1.0 - Feature: Notificaciones PWA
1.1.1 - Fix: Mensajes de error detallados
2.0.0 - Breaking: Nuevo sistema de autenticación
```

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si me equivoco de versión?**  
R: Puedes editar `.env` manualmente y volver a hacer deploy.

**P: ¿Los usuarios ven la versión automáticamente?**  
R: Sí, después del deploy verán la nueva versión en el login y dentro de la app.

**P: ¿Puedo saltarme versiones?**  
R: No es recomendable. Sigue el orden: 1.0.0 → 1.0.1 → 1.0.2 → 1.1.0 → etc.

**P: ¿Qué pasa si no pongo nada y solo presiono Enter?**  
R: Se incrementa PATCH automáticamente (opción 1), que es lo más común.
