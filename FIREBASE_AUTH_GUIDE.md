# 🔐 Guía Completa: Autenticación Firebase para PWA React

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración Firebase](#configuración-firebase)
3. [Persistencia de Sesión](#persistencia-de-sesión)
4. [AuthContext - Estado Global](#authcontext)
5. [Protección de Rutas](#protección-de-rutas)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Troubleshooting](#troubleshooting)

---

## Resumen Ejecutivo

### ✅ Requisitos Cumplidos

| Requisito | Estado | Implementación |
|-----------|--------|----------------|
| Sesión sin caducidad | ✅ | `browserLocalPersistence` |
| Persiste al cerrar navegador | ✅ | localStorage de Firebase |
| Persiste al cerrar PWA | ✅ | localStorage + Service Worker |
| Persiste al reiniciar celular | ✅ | localStorage persistente |
| Redirección automática | ✅ | Router con guards |
| Protección por rol | ✅ | RoleGuard component |
| Estado de carga inicial | ✅ | AuthContext loading state |

### 🔥 Características Clave

- **Persistencia TOTAL**: La sesión NUNCA caduca automáticamente
- **Offline-First**: Cache en sessionStorage para acceso sin conexión
- **Auto-setup**: Persistencia configurada al importar el módulo
- **Logs detallados**: Consola muestra cada paso del proceso
- **Manejo de errores**: Fallbacks y reintentos automáticos

---

## Configuración Firebase

### Archivo: `src/services/firebase/config.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

### Variables de Entorno (`.env`)

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

---

## Persistencia de Sesión

### Archivo: `src/services/firebase/auth.js`

#### 1. Setup Automático de Persistencia

```javascript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './config';

// Configurar persistencia LOCAL (sin caducidad)
export const setupPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Persistencia LOCAL configurada');
    return true;
  } catch (error) {
    console.error('❌ Error configurando persistencia:', error);
    return false;
  }
};

// 🔥 EJECUTAR INMEDIATAMENTE al importar el módulo
setupPersistence();
```

**¿Por qué funciona?**

- `browserLocalPersistence` almacena el token en **localStorage**
- localStorage persiste aunque:
  - Cierres el navegador ✅
  - Cierres la PWA ✅
  - Reinicies el celular ✅
  - Pases días/semanas sin abrir ✅

#### 2. Función de Login Optimizada

```javascript
export const loginWithEmail = async (email, password) => {
  try {
    // ⚡ CRÍTICO: Verificar persistencia ANTES de login
    const persistenceSet = await setupPersistence();
    
    if (!persistenceSet) {
      console.warn('⚠️ Reintentando configurar persistencia...');
      await setupPersistence();
    }
    
    // Autenticar
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Obtener rol desde Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth); // Limpiar si no hay datos
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    const userData = userDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      role: userData.role,
      displayName: userData.displayName || email
    };
  } catch (error) {
    throw new Error(handleFirebaseError(error));
  }
};
```

#### 3. Observer de Autenticación (Auto-restauración)

```javascript
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('🔑 Sesión detectada para:', user.email);
      
      try {
        // Obtener datos de Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          const userObject = {
            uid: user.uid,
            email: user.email,
            role: userData.role,
            displayName: userData.displayName || user.email
          };
          
          // 💾 Cache para modo offline
          sessionStorage.setItem('currentUser', JSON.stringify(userObject));
          
          console.log('✅ Sesión restaurada exitosamente');
          callback(userObject);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos:', error);
        
        // 🔄 Fallback: usar cache si está offline
        const cachedUser = sessionStorage.getItem('currentUser');
        if (cachedUser) {
          console.log('📦 Usando datos cacheados');
          callback(JSON.parse(cachedUser));
          return;
        }
        
        callback(null);
      }
    } else {
      console.log('🚪 No hay sesión activa');
      sessionStorage.removeItem('currentUser');
      callback(null);
    }
  });
};
```

**¿Cómo funciona el auto-login?**

1. Usuario abre la app (puede ser días después del último uso)
2. `onAuthStateChanged` se ejecuta automáticamente
3. Firebase lee el token de localStorage
4. Si es válido, obtiene los datos del usuario
5. Callback ejecuta con los datos → Usuario logueado ✅

#### 4. Logout con Limpieza Completa

```javascript
export const logout = async () => {
  try {
    // Limpiar cache
    sessionStorage.removeItem('currentUser');
    
    // Cerrar sesión en Firebase
    await signOut(auth);
    
    console.log('✅ Sesión cerrada correctamente');
  } catch (error) {
    throw new Error(handleFirebaseError(error));
  }
};
```

---

## AuthContext - Estado Global

### Archivo: `src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../services/firebase/auth';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // CRÍTICO: true al inicio

  useEffect(() => {
    console.log('🚀 Inicializando AuthProvider...');
    
    // Suscribirse a cambios de autenticación
    const unsubscribe = onAuthChange((userData) => {
      console.log('📡 Cambio de autenticación:', userData ? 'Logueado' : 'No logueado');
      setUser(userData);
      setLoading(false); // IMPORTANTE: marcar como cargado
    });

    // Cleanup al desmontar
    return () => {
      console.log('🧹 Limpiando suscripción de auth');
      unsubscribe();
    };
  }, []); // Solo ejecutar una vez

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const isAdmin = () => user?.role === ROLES.ADMIN;
  const isUser = () => user?.role === ROLES.USER;

  const value = {
    user,                    // Objeto usuario o null
    loading,                 // true mientras comprueba sesión
    logout,                  // Función para cerrar sesión
    isAdmin,                 // Helper: ¿es admin?
    isUser,                  // Helper: ¿es usuario?
    isAuthenticated: !!user  // Boolean: ¿está logueado?
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### ¿Por qué `loading` es crítico?

```javascript
// ❌ MAL: Sin loading, parpadeo de redirección
if (!user) return <Navigate to="/login" />;

// ✅ BIEN: Con loading, espera a verificar sesión
if (loading) return <Loading fullScreen />;
if (!user) return <Navigate to="/login" />;
```

**Flujo Timeline:**

```
1. App inicia → loading = true
2. onAuthChange se ejecuta
3. Firebase lee localStorage
4. Si hay token: obtiene datos → setUser(data) → loading = false
5. Si no hay token: setUser(null) → loading = false
```

---

## Protección de Rutas

### 1. ProtectedRoute - Requiere Autenticación

**Archivo: `src/components/auth/ProtectedRoute.jsx`**

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../common/Loading';
import { ROUTES } from '../../utils/constants';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // FASE 1: Verificando sesión...
  if (loading) {
    return <Loading fullScreen text="Verificando sesión..." />;
  }

  // FASE 2: No hay sesión → Redirigir a login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // FASE 3: Sesión válida → Mostrar contenido
  return children;
};
```

### 2. RoleGuard - Proteger por Rol

**Archivo: `src/components/auth/RoleGuard.jsx`**

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../utils/constants';

export const RoleGuard = ({ children, allowedRole }) => {
  const { user } = useAuth();

  // VERIFICACIÓN 1: ¿Está logueado?
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // VERIFICACIÓN 2: ¿Tiene el rol correcto?
  if (user.role !== allowedRole) {
    // Redirigir al dashboard correcto
    const redirectTo = user.role === ROLES.ADMIN 
      ? ROUTES.ADMIN_DASHBOARD 
      : ROUTES.USER_DASHBOARD;
    
    return <Navigate to={redirectTo} replace />;
  }

  // ✅ Logueado Y rol correcto
  return children;
};
```

### 3. Router con Guards

**Archivo: `src/router.jsx`**

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { useAuth } from './context/AuthContext';
import { ROUTES, ROLES } from './utils/constants';

// Páginas
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserDashboard } from './pages/user/UserDashboard';

export const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // O <Loading fullScreen />

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            // Si ya está logueado, redirigir a su dashboard
            user ? (
              <Navigate 
                to={user.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD} 
                replace 
              />
            ) : (
              <LoginPage />
            )
          } 
        />

        {/* Rutas Admin */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole={ROLES.ADMIN}>
                <AdminDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Rutas User */}
        <Route
          path={ROUTES.USER_DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole={ROLES.USER}>
                <UserDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={user ? (user.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD) : ROUTES.LOGIN} 
              replace 
            />
          } 
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## Ejemplos de Uso

### 1. Componente de Login

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from '../services/firebase/auth';
import { ROUTES, ROLES } from '../utils/constants';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(email, password);
      
      // ✅ Login exitoso → Redirigir según rol
      if (user.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.USER_DASHBOARD);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
};
```

### 2. Usar AuthContext en Componentes

```javascript
import { useAuth } from '../context/AuthContext';

export const UserProfile = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // AuthContext + Router manejarán la redirección
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div>
      <h2>Bienvenido, {user.displayName}</h2>
      <p>Email: {user.email}</p>
      <p>Rol: {isAdmin() ? 'Administrador' : 'Usuario'}</p>
      
      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};
```

### 3. Verificar Autenticación Programáticamente

```javascript
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export const SomeComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Usuario no autenticado');
    }
  }, [loading, isAuthenticated]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {user ? `Hola ${user.displayName}` : 'No logueado'}
    </div>
  );
};
```

---

## Troubleshooting

### Problema 1: La sesión no persiste al cerrar la PWA

**Causa**: Persistencia no configurada correctamente

**Solución**:
```javascript
// Verificar en consola del navegador:
// Debe aparecer: "✅ Persistencia LOCAL configurada"

// Si no aparece, ejecutar manualmente:
import { setupPersistence } from './services/firebase/auth';
await setupPersistence();
```

### Problema 2: Redirección infinita en `/login`

**Causa**: El router no detecta que el usuario está logueado

**Solución**:
```javascript
// Verificar que AuthProvider esté en App.jsx:
<AuthProvider>
  <AppRouter />
</AuthProvider>

// Y que AppRouter use useAuth():
const { user } = useAuth();
```

### Problema 3: "Usuario no encontrado en la base de datos"

**Causa**: El usuario existe en Firebase Auth pero no en Firestore

**Solución**:
```javascript
// Crear documento en Firestore:
// Colección: users
// Documento ID: {uid del usuario de Firebase Auth}
{
  email: "user@test.com",
  role: "user", // o "admin"
  displayName: "Nombre Usuario",
  createdAt: Timestamp.now()
}
```

### Problema 4: Sesión caduca después de un tiempo

**Causa**: No estás usando `browserLocalPersistence`

**Verificación**:
```javascript
// Abrir DevTools → Application → Local Storage
// Buscar: firebase:authUser:[PROJECT-ID]:[API-KEY]
// Debe existir un objeto JSON con el token
```

### Problema 5: Loading infinito

**Causa**: `onAuthStateChanged` nunca ejecuta el callback

**Solución**:
```javascript
// Verificar que Firebase esté inicializado:
console.log('Auth instance:', auth);
console.log('Current user:', auth.currentUser);

// Verificar conexión a Firebase:
// DevTools → Network → Filtrar por "firebaseapp"
```

---

## Checklist de Implementación

- [ ] **Firebase configurado** en `config.js`
- [ ] **Variables de entorno** en `.env`
- [ ] **Persistencia** configurada en `auth.js`
- [ ] **AuthProvider** envolviendo la app
- [ ] **ProtectedRoute** y **RoleGuard** creados
- [ ] **Router** con guards implementado
- [ ] **Usuarios de prueba** creados en Firebase
- [ ] **Documentos de usuario** en Firestore con roles
- [ ] **Probado**: Login → Cerrar navegador → Abrir → Sigue logueado ✅

---

## Resumen de Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| [config.js](file:///c:/Projects/react-pwa-qr-attendance-app/src/services/firebase/config.js) | Inicializa Firebase |
| [auth.js](file:///c:/Projects/react-pwa-qr-attendance-app/src/services/firebase/auth.js) | Persistencia + Login/Logout |
| [AuthContext.jsx](file:///c:/Projects/react-pwa-qr-attendance-app/src/context/AuthContext.jsx) | Estado global de autenticación |
| [ProtectedRoute.jsx](file:///c:/Projects/react-pwa-qr-attendance-app/src/components/auth/ProtectedRoute.jsx) | Guard: requiere login |
| [RoleGuard.jsx](file:///c:/Projects/react-pwa-qr-attendance-app/src/components/auth/RoleGuard.jsx) | Guard: requiere rol específico |
| [router.jsx](file:///c:/Projects/react-pwa-qr-attendance-app/src/router.jsx) | Rutas con protección |

---

## 🎉 ¡Listo!

Tu PWA ahora tiene autenticación completamente funcional con:

✅ **Sesión persistente SIN caducidad**  
✅ **Auto-login al abrir la app**  
✅ **Redirección automática según rol**  
✅ **Protección de rutas**  
✅ **Modo offline con cache**  
✅ **Logs detallados para debugging**

**Próximo paso**: Crear usuarios de prueba en Firebase Console y probar el flujo completo.
