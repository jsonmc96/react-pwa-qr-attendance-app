# Deployment Script with Interactive Version Update
# This script helps you choose the right version increment

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   DEPLOY CON ACTUALIZACION DE VERSION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Read current version from .env
Set-Location -Path "$PSScriptRoot\.."
$envContent = Get-Content .env -Raw
if ($envContent -match 'VITE_APP_VERSION=(\d+)\.(\d+)\.(\d+)') {
    $major = [int]$matches[1]
    $minor = [int]$matches[2]
    $patch = [int]$matches[3]
    
    Write-Host "Version actual: $major.$minor.$patch" -ForegroundColor Yellow
    Write-Host ""
    
    # Show version type guide
    Write-Host "Que tipo de cambios hiciste?" -ForegroundColor Cyan
    Write-Host ""
    
    $patchNext = $patch + 1
    $minorNext = $minor + 1
    $majorNext = $major + 1
    
    Write-Host "  1. PATCH ($major.$minor.$patchNext)  - Correccion de bugs, mejoras pequenas" -ForegroundColor Green
    Write-Host "     Ejemplos: Arreglar error de camara, mejorar mensajes, optimizar codigo"
    Write-Host ""
    Write-Host "  2. MINOR ($major.$minorNext.0)  - Nueva funcionalidad (sin romper nada)" -ForegroundColor Yellow
    Write-Host "     Ejemplos: Nueva pagina, nuevo reporte, validacion GPS, exportar Excel"
    Write-Host ""
    Write-Host "  3. MAJOR ($majorNext.0.0)  - Cambios que rompen compatibilidad" -ForegroundColor Red
    Write-Host "     Ejemplos: Cambiar estructura DB, eliminar funciones, rediseno total"
    Write-Host ""
    
    # Ask user for version type
    $choice = Read-Host "Selecciona el tipo de cambio [1/2/3] (Enter = 1 PATCH)"
    
    # Default to patch if empty
    if ([string]::IsNullOrWhiteSpace($choice)) {
        $choice = "1"
    }
    
    # Increment version based on choice
    switch ($choice) {
        "3" { 
            $major++
            $minor = 0
            $patch = 0
            $versionType = "MAJOR"
        }
        "2" { 
            $minor++
            $patch = 0
            $versionType = "MINOR"
        }
        default { 
            # 1 or any other input = patch
            $patch++
            $versionType = "PATCH"
        }
    }
    
    $newVersion = "$major.$minor.$patch"
    Write-Host ""
    Write-Host "Nueva version: $newVersion ($versionType)" -ForegroundColor Green
    Write-Host ""
    
    # Ask for confirmation
    $confirm = Read-Host "Continuar con el deploy de la version $newVersion? [S/n]"
    if ($confirm -eq "n" -or $confirm -eq "N") {
        Write-Host ""
        Write-Host "Deploy cancelado" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Actualizando version en .env y package.json..." -ForegroundColor Cyan
    
    # Update .env file
    $envContent = $envContent -replace 'VITE_APP_VERSION=\d+\.\d+\.\d+', "VITE_APP_VERSION=$newVersion"
    Set-Content -Path .env -Value $envContent -NoNewline
    Write-Host "  .env actualizado: $newVersion" -ForegroundColor Green
    
    # Update package.json file
    $packageContent = Get-Content package.json -Raw
    $packageContent = $packageContent -replace '"version":\s*"\d+\.\d+\.\d+"', "`"version`": `"$newVersion`""
    Set-Content -Path package.json -Value $packageContent -NoNewline
    Write-Host "  package.json actualizado: $newVersion" -ForegroundColor Green
    
    Write-Host ""
    
    # Build and deploy
    Write-Host "Compilando aplicacion..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Desplegando a Firebase..." -ForegroundColor Cyan
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Green
            Write-Host "   DEPLOY EXITOSO!" -ForegroundColor Green
            Write-Host "============================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Version publicada: $newVersion" -ForegroundColor White
            Write-Host "Los usuarios veran esta version en la app" -ForegroundColor White
            Write-Host ""
            
            # Ask about git tag
            $createTag = Read-Host "Crear tag de Git v$newVersion? [S/n]"
            if ($createTag -ne "n" -and $createTag -ne "N") {
                git add .env package.json
                git commit -m "chore: bump version to $newVersion"
                git tag -a "v$newVersion" -m "Release version $newVersion"
                Write-Host "Tag v$newVersion creado" -ForegroundColor Green
                Write-Host ""
                Write-Host "Para subir los cambios a GitHub:" -ForegroundColor Yellow
                Write-Host "   git push" -ForegroundColor White
                Write-Host "   git push --tags" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "Listo! La app esta actualizada" -ForegroundColor Cyan
        }
        else {
            Write-Host ""
            Write-Host "Error en el deploy a Firebase" -ForegroundColor Red
            Write-Host "Revisa los logs arriba para ver el error" -ForegroundColor Yellow
            exit 1
        }
    }
    else {
        Write-Host ""
        Write-Host "Error al compilar la aplicacion" -ForegroundColor Red
        Write-Host "Revisa los errores de compilacion arriba" -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "No se pudo leer la version actual de .env" -ForegroundColor Red
    Write-Host "Verifica que .env tenga: VITE_APP_VERSION=1.0.0" -ForegroundColor Yellow
    exit 1
}
