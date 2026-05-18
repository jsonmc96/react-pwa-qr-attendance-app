import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'react-pwa-qr-attendance-app';

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);
const TARGET_EMAIL = args[0] || 'daniel.ciseski@adventistas.org';
const NEW_PASSWORD = args[1] || '1763072129';
const DISPLAY_NAME = args[2] || (TARGET_EMAIL ? TARGET_EMAIL.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : 'Usuario');

if (args.length === 0) {
    console.log(`ℹ️ Uso: node scripts/admin-user-tool.mjs <correo> <nueva_contraseña> [nombre_completo]`);
    console.log(`💡 Ejecutando por defecto para: ${TARGET_EMAIL}\n`);
}

async function run() {
    try {
        console.log('🔄 Iniciando herramienta de administración de usuario...');
        
        // 1. Obtener el archivo config de Firebase
        const userProfile = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\JsonMC';
        const configPath = path.join(userProfile, '.config', 'configstore', 'firebase-tools.json');
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`No se encontró el archivo de configuración en ${configPath}. Asegúrate de haber iniciado sesión con 'firebase login'.`);
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let accessToken = config?.tokens?.access_token;
        const refreshToken = config?.tokens?.refresh_token;
        
        if (!accessToken && !refreshToken) {
            throw new Error('No se encontraron tokens en la configuración de Firebase CLI.');
        }
        
        console.log('🔑 Probando el token de acceso existente...');
        
        // Función para realizar lookup de usuario
        async function testLookup(token) {
            const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: [TARGET_EMAIL] })
            });
            return lookupResponse;
        }

        let lookupResponse = await testLookup(accessToken);
        
        // Si el token falló (por ejemplo, expirado 401), intentamos refrescarlo con la clave cliente pública de firebase-tools
        if (lookupResponse.status === 401) {
            console.log('⚠️ El token existente expiró. Intentando refrescar con el refresh_token...');
            
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
                    client_secret: 'aym9Z9sKAt00EAn_CjxL9n3m', // Secreto cliente público oficial de firebase-tools
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });
            
            if (!tokenResponse.ok) {
                const errText = await tokenResponse.text();
                throw new Error(`Error al refrescar token: ${errText}`);
            }
            
            const tokenData = await tokenResponse.json();
            accessToken = tokenData.access_token;
            console.log('✅ Token de acceso refrescado correctamente.');
            
            // Reintentar lookup
            lookupResponse = await testLookup(accessToken);
        }

        if (!lookupResponse.ok) {
            const errText = await lookupResponse.text();
            throw new Error(`Error al buscar usuario: ${errText}`);
        }
        
        const lookupData = await lookupResponse.json();
        let uid = '';
        let userExists = false;
        
        if (lookupData.users && lookupData.users.length > 0) {
            uid = lookupData.users[0].localId;
            userExists = true;
            console.log(`👤 El usuario ya existe en Auth con UID: ${uid}`);
        } else {
            console.log('👤 El usuario NO existe en Auth. Se creará uno nuevo.');
        }
        
        // 4. Crear o actualizar usuario en Firebase Auth
        if (userExists) {
            console.log(`⚙️ Actualizando contraseña de '${TARGET_EMAIL}' a '${NEW_PASSWORD}'...`);
            const updateResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    localId: uid,
                    password: NEW_PASSWORD
                })
            });
            
            if (!updateResponse.ok) {
                const errText = await updateResponse.text();
                throw new Error(`Error al actualizar contraseña: ${errText}`);
            }
            console.log('✅ Contraseña actualizada correctamente en Firebase Auth.');
        } else {
            console.log(`⚙️ Creando nuevo usuario '${TARGET_EMAIL}' con contraseña '${NEW_PASSWORD}'...`);
            const createResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    email: TARGET_EMAIL,
                    password: NEW_PASSWORD,
                    displayName: DISPLAY_NAME,
                    emailVerified: false
                })
            });
            
            if (!createResponse.ok) {
                const errText = await createResponse.text();
                throw new Error(`Error al crear usuario: ${errText}`);
            }
            
            const createData = await createResponse.json();
            uid = createData.localId;
            console.log(`✅ Usuario creado exitosamente con UID: ${uid}`);
        }
        
        // 5. Verificar y escribir en Firestore
        console.log(`🔍 Verificando documento en Firestore para users/${uid}...`);
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
        
        const getDocResponse = await fetch(firestoreUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        let firestoreExists = false;
        if (getDocResponse.ok) {
            firestoreExists = true;
            console.log('📄 El documento de Firestore ya existe.');
        } else if (getDocResponse.status === 404) {
            console.log('📄 El documento de Firestore NO existe. Se creará uno nuevo.');
        } else {
            const errText = await getDocResponse.text();
            console.warn(`⚠️ Advertencia al verificar documento Firestore (código ${getDocResponse.status}): ${errText}`);
        }
        
        if (!firestoreExists) {
            console.log('⚙️ Creando documento de usuario en Firestore...');
            const now = new Date().toISOString();
            const setDocResponse = await fetch(firestoreUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    fields: {
                        uid: { stringValue: uid },
                        email: { stringValue: TARGET_EMAIL },
                        displayName: { stringValue: DISPLAY_NAME },
                        role: { stringValue: 'user' },
                        employeeType: { stringValue: 'onsite' },
                        createdAt: { timestampValue: now }
                    }
                })
            });
            
            if (!setDocResponse.ok) {
                const errText = await setDocResponse.text();
                throw new Error(`Error al guardar en Firestore: ${errText}`);
            }
            console.log('✅ Documento de usuario creado correctamente en Firestore.');
        } else {
            console.log('⚙️ Asegurando campos en el documento de Firestore...');
            const updateDocResponse = await fetch(`${firestoreUrl}?updateMask.fieldPaths=email&updateMask.fieldPaths=displayName&updateMask.fieldPaths=uid`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    fields: {
                        uid: { stringValue: uid },
                        email: { stringValue: TARGET_EMAIL },
                        displayName: { stringValue: DISPLAY_NAME }
                    }
                })
            });
            if (updateDocResponse.ok) {
                console.log('✅ Campos de Firestore actualizados correctamente.');
            } else {
                console.warn('⚠️ No se pudieron actualizar algunos campos de Firestore, pero el usuario ya existe.');
            }
        }
        
        console.log('\n🎉 PROCESO COMPLETADO EXITOSAMENTE.');
        console.log(`📧 Usuario: ${TARGET_EMAIL}`);
        console.log(`🔑 Contraseña: ${NEW_PASSWORD}`);
        console.log(`🆔 UID: ${uid}`);
        
    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
    }
}

run();
