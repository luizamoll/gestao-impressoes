@echo off
cd /d "%~dp0"

echo.
echo UNH Sistemas - Gestao de Impressoes
echo ------------------------------------
echo Atualizando...
echo.

git fetch origin
if errorlevel 1 goto erro

git switch feat/estrutura-mvp-esg
if errorlevel 1 goto erro

git pull --ff-only origin feat/estrutura-mvp-esg
if errorlevel 1 goto erro

echo.
echo Iniciando acesso local e pela rede...
echo.

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul
if errorlevel 1 (
  start "Servidor UNH" /min cmd /c call "%~dp0servidor_lan.bat"
  timeout /t 2 /nobreak >nul
)

for /f %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object {$_.IPAddress -notlike '169.254*' -and $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback'} ^| Sort-Object InterfaceMetric ^| Select-Object -First 1 -ExpandProperty IPAddress)"') do set "LAN_IP=%%i"

start "" "http://127.0.0.1:8000/impressao.html"

echo.
echo Sistema aberto neste computador.
echo.
if defined LAN_IP (
  echo Para outra pessoa na mesma rede:
  echo http://%LAN_IP%:8000/impressao.html
) else (
  echo Nao foi possivel identificar o IP automaticamente.
  echo Execute ipconfig e use o endereco IPv4.
)
echo.
echo IMPORTANTE: se o Windows perguntar sobre Firewall,
echo permita o Python em redes privadas.
echo.
pause
exit /b 0

:erro
echo.
echo Nao foi possivel atualizar o projeto.
pause
exit /b 1
