@echo off
cd /d "%~dp0"

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
start "" "src\main\resources\static\index.html"
exit /b 0

:erro
echo.
echo Nao foi possivel atualizar o projeto.
pause
exit /b 1
