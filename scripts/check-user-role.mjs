// Script para verificar rol de admin en Firestore
// Ejecutar con: node scripts/check-user-role.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// Config de Firebase (copia de src/services/firebase/config.js)
const firebaseConfig = {
    apiKey: "AIzaSyDOWZnSJhPBHRPmFgZZGfqPFvgdcDRdmtA",
    authDomain: "react-pwa-qr-attendance-app.firebaseapp.com",
    projectId: "react-pwa-qr-attendance-app",
    storageBucket: "react-pwa-qr-attendance-app.firebasestorage.app",
    messagingSenderId: "1029906093086",
    appId: "1:1029906093086:web:e3e9a0c2c8b5f8e8f8e8e8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UID del usuario Jefferson Mena (del archivo users.json)
const JEFFERSON_UID = "3aXni8uaPnPAANO9sgmDKHhSWpr2";

async function checkAndFixAdminRole() {
    try {
        console.log('Verificando rol de usuario en Firestore...');
        console.log('UID:', JEFFERSON_UID);

        const userRef = doc(db, 'users', JEFFERSON_UID);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error('❌ ERROR: El documento del usuario NO existe en Firestore');
            console.log('Necesitas crear el documento manualmente en Firebase Console');
            return;
        }

        const userData = userSnap.data();
        console.log('\n📄 Datos actuales del usuario:');
        console.log(JSON.stringify(userData, null, 2));

        if (userData.role === 'admin') {
            console.log('\n✅ El usuario YA tiene rol de admin');
        } else {
            console.log(`\n⚠️ El usuario tiene rol: "${userData.role || 'UNDEFINED'}"`);
            console.log('Actualizando a admin...');

            await updateDoc(userRef, {
                role: 'admin'
            });

            console.log('✅ Rol actualizado a admin');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAndFixAdminRole();
