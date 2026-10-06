@echo off
setlocal
cd /d "%~dp0"

if /I not "%~dp0"=="%TEMP%\gestao-impressoes-launcher\" (
  if not exist "%TEMP%\gestao-impressoes-launcher" mkdir "%TEMP%\gestao-impressoes-launcher"
  copy /Y "%~f0" "%TEMP%\gestao-impressoes-launcher\atualizar_e_iniciar.bat" >nul
  start "" /wait "%TEMP%\gestao-impressoes-launcher\atualizar_e_iniciar.bat" "%CD%"
  exit /b
)

cd /d "%~1"

echo.
echo Gestao de Impressoes
echo --------------------
echo Atualizando...
echo.

git fetch origin
if errorlevel 1 goto erro

git switch feat/estrutura-mvp-esg
if errorlevel 1 goto erro

git pull --ff-only origin feat/estrutura-mvp-esg
if errorlevel 1 goto erro

echo.
echo Abrindo o sistema...
start "" "%CD%\src\main\resources\static\index.html"
exit /b 0

:erro
echo.
echo Nao foi possivel atualizar o projeto.
pause
exit /b 1
