@echo off
cd /d %~dp0

echo.
echo Gestao de Impressoes
echo --------------------
echo Atualizando...
echo.

git fetch origin
git switch feat/estrutura-mvp-esg
if errorlevel 1 (
  echo.
  echo Nao foi possivel acessar a versao correta.
  pause
  exit /b 1
)

git pull origin feat/estrutura-mvp-esg
if errorlevel 1 (
  echo.
  echo Nao foi possivel atualizar o projeto.
  pause
  exit /b 1
)

echo.
echo Abrindo o sistema...
start "" "%~dp0src\main\resources\static\index.html"
exit /b 0
