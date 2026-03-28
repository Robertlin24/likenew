# Script para configurar DATABASE_URL en DigitalOcean
# Ejecutar desde PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION DATABASE_URL DIGITALOCEAN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pon tu URI aquí o define $env:DATABASE_URL antes de ejecutar el script
if (-not $env:DATABASE_URL) {
    Write-Host "[AVISO] Define `$env:DATABASE_URL con tu cadena completa (o edita esta variable en el script)." -ForegroundColor Yellow
    $DATABASE_URL = "postgresql://doadmin:TU_PASSWORD@TU_HOST:25060/defaultdb?sslmode=require"
} else {
    $DATABASE_URL = $env:DATABASE_URL
}

Write-Host "Valor de DATABASE_URL a configurar:" -ForegroundColor Yellow
Write-Host $DATABASE_URL -ForegroundColor White
Write-Host ""

Write-Host "PASOS EN DIGITALOCEAN:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Ve a tu App en DigitalOcean" -ForegroundColor White
Write-Host "2. Components -> likenew-app-app-backend -> Settings" -ForegroundColor White
Write-Host "3. Environment Variables -> + Add environment variable" -ForegroundColor White
Write-Host "4. Key: DATABASE_URL" -ForegroundColor White
Write-Host "5. Value: (copia el valor de arriba)" -ForegroundColor White
Write-Host "6. Scope: Run and build time" -ForegroundColor White
Write-Host "7. Save" -ForegroundColor White
Write-Host "8. Overview -> Actions -> Force Rebuild and Deploy" -ForegroundColor White
Write-Host ""

Write-Host "VALOR PARA COPIAR:" -ForegroundColor Green
Write-Host $DATABASE_URL -ForegroundColor Cyan
Write-Host ""

Write-Host "Presiona Ctrl+C para copiar el valor de arriba" -ForegroundColor Yellow
Write-Host ""

# Copiar al portapapeles
$DATABASE_URL | Set-Clipboard
Write-Host "[OK] Valor copiado al portapapeles!" -ForegroundColor Green
Write-Host ""
