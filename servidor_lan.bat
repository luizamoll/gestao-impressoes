@echo off
cd /d "%~dp0src\main\resources\static"

where py >nul 2>&1
if not errorlevel 1 (
  py -3 -m http.server 8000 --bind 0.0.0.0
  exit /b
)

where python >nul 2>&1
if not errorlevel 1 (
  python -m http.server 8000 --bind 0.0.0.0
  exit /b
)

echo Python nao encontrado.
pause
