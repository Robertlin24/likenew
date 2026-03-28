param(
  [string]$BackendEnvPath = "app/app/backend/.env",
  [string]$DoHashPrefix = ""
)

$ErrorActionPreference = "Stop"

function Write-Title($text) {
  Write-Host "`n============================================================" -ForegroundColor Cyan
  Write-Host $text -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Mask-Url([string]$url) {
  if ([string]::IsNullOrWhiteSpace($url)) { return "(vacia)" }
  return ($url -replace ':[^:@/]+@', ':***@')
}

Write-Title "AUDITORIA DESPLIEGUE LIKE NEW (SUPABASE + DIGITALOCEAN)"

if (-not (Test-Path $BackendEnvPath)) {
  Write-Host "[ERROR] No existe el archivo: $BackendEnvPath" -ForegroundColor Red
  exit 1
}

$envLines = Get-Content $BackendEnvPath
$dbLine = $envLines | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
$envLine = $envLines | Where-Object { $_ -match '^\s*ENVIRONMENT\s*=' } | Select-Object -First 1

if (-not $dbLine) {
  Write-Host "[ERROR] No se encontro DATABASE_URL en $BackendEnvPath" -ForegroundColor Red
  exit 1
}

$dbUrl = ($dbLine -split '=', 2)[1].Trim()
$environment = if ($envLine) { (($envLine -split '=', 2)[1].Trim()) } else { "(no definido)" }

Write-Host "[OK] .env encontrado: $BackendEnvPath" -ForegroundColor Green
Write-Host "[INFO] ENVIRONMENT: $environment"
Write-Host "[INFO] DATABASE_URL (mascarada): $(Mask-Url $dbUrl)"

# Hash compatible con log del backend (sha256_prefix)
$sha = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($dbUrl)
$hashBytes = $sha.ComputeHash($bytes)
$hashHex = -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
$hashPrefix = $hashHex.Substring(0, 12)
$hasSslMode = $dbUrl.ToLower().Contains("sslmode=")

Write-Host "[INFO] sha256_prefix local: $hashPrefix"
Write-Host "[INFO] sslmode en URL: $hasSslMode"

# Parseo simple
if ($dbUrl -match '^postgresql(\+asyncpg)?://([^:]+):([^@]+)@([^:/]+):(\d+)/(\S+)$') {
  $user = $Matches[2]
  $dbHost = $Matches[4]
  $port = $Matches[5]
  $dbName = $Matches[6]

  Write-Host "[INFO] User: $user"
  Write-Host "[INFO] Host: $dbHost"
  Write-Host "[INFO] Port: $port"
  Write-Host "[INFO] Database: $dbName"
} else {
  Write-Host "[WARN] DATABASE_URL no coincide con formato esperado de PostgreSQL." -ForegroundColor Yellow
}

if ($DoHashPrefix) {
  Write-Host "`n[INFO] sha256_prefix DO: $DoHashPrefix"
  if ($DoHashPrefix -eq $hashPrefix) {
    Write-Host "[OK] DO y local usan EXACTAMENTE el mismo DATABASE_URL" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] DO y local usan DATABASE_URL diferentes" -ForegroundColor Red
  }
}

Write-Title "PRUEBA DE CONEXION LOCAL"
if (Test-Path "test_supabase_connection.py") {
  try {
    python test_supabase_connection.py
  } catch {
    Write-Host "[WARN] No se pudo ejecutar python test_supabase_connection.py" -ForegroundColor Yellow
    Write-Host "       Error: $($_.Exception.Message)"
  }
} else {
  Write-Host "[WARN] No existe test_supabase_connection.py en la raiz del proyecto." -ForegroundColor Yellow
}

Write-Title "CHECKLIST DIGITALOCEAN"
Write-Host "1) App-level env vars: NO debe existir DATABASE_URL"
Write-Host "2) Backend env vars: solo DATABASE_URL + ENVIRONMENT"
Write-Host "3) Frontend env vars: NO DATABASE_URL"
Write-Host "4) Rutas: /api -> backend, / -> frontend"
Write-Host "5) Redeploy y revisar logs backend"

Write-Host "`n[FIN] Auditoria completada." -ForegroundColor Green
