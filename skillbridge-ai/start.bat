@echo off
echo ====================================================
echo     SkillBridge AI - Starting Development Servers
echo ====================================================

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [1/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [ERROR] pip install failed. Make sure pip is installed.
    pause
    exit /b 1
)

echo [2/4] Installing Node.js dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
)

echo [3/4] Starting FastAPI backend on http://localhost:8000 ...
start "SkillBridge Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

echo [4/4] Starting React frontend on http://localhost:5173 ...
start "SkillBridge Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================================================
echo  Both servers are starting!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ====================================================
echo  Press any key to open the app in your browser...
pause > nul

start http://localhost:5173
