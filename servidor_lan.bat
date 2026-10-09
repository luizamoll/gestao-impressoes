@echo off
cd /d "%~dp0src\main\resources\static"

where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0servidor_lan.py"
  exit /b
)

where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0servidor_lan.py"
  exit /b
)

echo Python nao encontrado.
pause
