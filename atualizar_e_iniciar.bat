@echo off
cd /d %~dp0

echo.
echo ================================
echo  Gestao de Impressoes
echo ================================
echo.
echo Atualizando projeto...
git pull

if errorlevel 1 (
  echo.
  echo Nao foi possivel atualizar o projeto.
  pause
  exit /b 1
)

echo.
echo Iniciando sistema...
echo Quando aparecer "Started GestaoImpressoesApplication", abra:
echo http://localhost:8080
echo.
call mvnw.cmd spring-boot:run

pause
