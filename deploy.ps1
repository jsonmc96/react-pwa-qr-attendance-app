# ========================================
# Script de Deploy - Firebase Hosting
# ========================================
# Uso: .\deploy.ps1

Write-Host "🚀 Iniciando proceso de deploy..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .env.production
if (-Not (Test-Path ".env.production")) {
    Write-Host "❌ ERROR: No existe .env.production" -ForegroundColor Red
    Write-Host "📝 Crea el archivo .env.production basándote en .env.production.example" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ .env.production encontrado" -ForegroundColor Green
Write-Host ""

# Build de producción
Write-Host "📦 Ejecutando build de producción..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Build falló" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
Write-Host ""

# Verificar que existe la carpeta dist
if (-Not (Test-Path "dist")) {
    Write-Host "❌ ERROR: No se generó la carpeta dist" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Carpeta dist generada" -ForegroundColor Green
Write-Host ""

# Deploy a Firebase Hosting
Write-Host "🌐 Deploying a Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Deploy falló" -ForegroundColor Red
    Write-Host "💡 Verifica que estés logueado: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Deploy completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Tu app está disponible en:" -ForegroundColor Cyan
Write-Host "   https://tu-proyecto.web.app" -ForegroundColor White
Write-Host ""
