# SkillBridge AI - Development Launcher
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    SkillBridge AI - Starting Dev Servers" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Install backend deps
Write-Host "`n[1/4] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r "$backendPath\requirements.txt" -q

# Install frontend deps
Write-Host "[2/4] Installing Node.js dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$frontendPath\node_modules")) {
    Set-Location $frontendPath
    npm install
}

# Start backend
Write-Host "[3/4] Starting FastAPI backend (port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; python -m uvicorn main:app --reload --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend
Write-Host "[4/4] Starting React frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Frontend : http://localhost:5173" -ForegroundColor White
Write-Host " Backend  : http://localhost:8000" -ForegroundColor White
Write-Host " API Docs : http://localhost:8000/docs" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan

Start-Process "http://localhost:5173"
