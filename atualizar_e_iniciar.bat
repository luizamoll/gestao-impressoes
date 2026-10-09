@echo off
cd /d "%~dp0"

echo.
echo Portal UNH - Gestao de Impressoes
echo ---------------------------------
echo Sincronizando com a versao oficial do GitHub...
echo.

git fetch origin feat/estrutura-mvp-esg
if errorlevel 1 goto erro

git switch feat/estrutura-mvp-esg
if errorlevel 1 goto erro

rem O GitHub e a fonte oficial deste projeto.
rem Mantemos um backup automatico caso exista alguma alteracao local rastreada.
for /f "delims=" %%s in ('git status --porcelain --untracked-files=no') do set "DIRTY=1"
if defined DIRTY (
  echo Alteracoes locais encontradas. Criando backup automatico...
  git stash push -m "backup automatico antes de atualizar Portal UNH"
  if errorlevel 1 goto erro
)

git reset --hard origin/feat/estrutura-mvp-esg
if errorlevel 1 goto erro

echo.
echo Reiniciando servidor local com a versao atualizada...
echo.

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1
)

timeout /t 1 /nobreak >nul
start "Portal UNH" /min cmd /c call "%~dp0servidor_lan.bat"
timeout /t 2 /nobreak >nul

for /f %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object {$_.IPAddress -notlike '169.254*' -and $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback'} ^| Sort-Object InterfaceMetric ^| Select-Object -First 1 -ExpandProperty IPAddress)"') do set "LAN_IP=%%i"

start "" "http://127.0.0.1:8000/impressao.html?v=20261009-3"

echo.
echo Portal UNH atualizado e aberto neste computador.
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
echo Nao foi possivel sincronizar o Portal UNH.
echo Envie uma foto desta janela para conferirmos o erro.
pause
exit /b 1
