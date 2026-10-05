@echo off
cd /d %~dp0

echo.
echo Gestao de Impressoes
echo --------------------
echo Atualizando a versao correta...
echo.

git fetch origin
git switch feat/estrutura-mvp-esg
if errorlevel 1 (
  echo Nao foi possivel acessar a branch feat/estrutura-mvp-esg.
  pause
  exit /b 1
)

git pull origin feat/estrutura-mvp-esg
if errorlevel 1 (
  echo Nao foi possivel atualizar o projeto.
  pause
  exit /b 1
)

echo.
echo Iniciando sistema...
echo http://localhost:8080
echo.
call mvnw.cmd spring-boot:run

pause
