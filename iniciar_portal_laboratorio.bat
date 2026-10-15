@echo off
setlocal
cd /d "%~dp0"

set "SERVER_ADDRESS=127.0.0.1"
set "PORT=18081"
set "PORTAL_LAB_ENABLED=true"

echo ============================================================
echo Portal UNH - Laboratorio de autenticacao
echo Porta 18081 - somente neste computador
echo ============================================================
echo.

if not exist "mvnw.cmd" (
    echo ERRO: mvnw.cmd nao foi encontrado.
    pause
    exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
    echo Git indisponivel. Usando codigo local.
) else (
    echo Conferindo atualizacoes...
    git pull --ff-only
    if errorlevel 1 (
        echo AVISO: nao foi possivel atualizar. Nenhuma alteracao local foi descartada.
    )
)

powershell.exe -NoProfile -NonInteractive -Command "if (Get-NetTCPConnection -LocalPort 18081 -State Listen -ErrorAction SilentlyContinue) { exit 5 }"
if errorlevel 1 (
    echo.
    echo ERRO: a porta 18081 ja esta ocupada. Feche o servidor antigo primeiro.
    echo Nao sera iniciado outro servidor nesta porta.
    pause
    exit /b 1
)

set "PORTAL_LAB_PASSWORD="
for /f "delims=" %%P in ('powershell.exe -NoProfile -NonInteractive -Command "[guid]::NewGuid().ToString('N')"') do set "PORTAL_LAB_PASSWORD=%%P"
if not defined PORTAL_LAB_PASSWORD (
    echo ERRO: nao foi possivel gerar a senha temporaria.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo CONTA DE TESTES - valida somente enquanto esta janela rodar
echo Usuario: admin.lab
echo Senha temporaria: %PORTAL_LAB_PASSWORD%
echo ============================================================
echo.
echo Abra no navegador: http://127.0.0.1:18081/login
echo Mantenha esta janela aberta. Nao compartilhe a senha.
echo Para encerrar o servidor use Ctrl+C.
echo.

call ".\mvnw.cmd" spring-boot:run
if errorlevel 1 (
    echo.
    echo FALHA ao iniciar o Java. Confira as mensagens acima.
    pause
    exit /b 1
)

echo.
echo Laboratorio encerrado. Senha temporaria nao sera reutilizada.
pause
