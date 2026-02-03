// Script para verificar y actualizar rol de admin
// Ejecutar en Firebase Console > Firestore > Query

// 1. Primero, obtén tu UID de usuario
// Ve a Authentication > Users y copia tu UID

// 2. Verifica el documento en Firestore:
// Colección: users
// Documento: [TU_UID]

// 3. El documento debe tener esta estructura:
{
    "uid": "tu-uid-aqui",
        "email": "tu-email@example.com",
            "displayName": "Tu Nombre",
                "role": "admin",  // ← ESTE CAMPO ES CRÍTICO
                    "employeeType": "onsite" // o "remote"
}

// 4. Si el campo "role" no existe o no es "admin", actualízalo manualmente:
// - Ve a Firestore Console
// - Encuentra tu documento en la colección "users"
// - Edita el campo "role" y ponle el valor: admin
// - Guarda los cambios

// IMPORTANTE: El campo debe ser exactamente "admin" (minúsculas, sin espacios)
