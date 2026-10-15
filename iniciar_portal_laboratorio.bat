@echo off
setlocal
cd /d "%~dp0"

set "SERVER_ADDRESS=127.0.0.1"
set "PORT=18081"

echo ============================================================
echo Portal UNH - Laboratorio de autenticacao
echo Porta: 18081  ^|  Acesso somente neste computador
echo ============================================================
echo.
echo Abra no navegador: http://127.0.0.1:18081/login
echo Mantenha esta janela aberta enquanto usa o laboratorio.
echo Para desligar, pressione Ctrl+C.
echo.

if not exist "mvnw.cmd" (
    echo ERRO: mvnw.cmd nao foi encontrado nesta pasta.
    pause
    exit /b 1
)

call ".\mvnw.cmd" spring-boot:run
if errorlevel 1 (
    echo.
    echo Falha ao iniciar. Confira acima a mensagem de erro.
    echo Se a porta 18081 estiver ocupada, feche a instancia anterior.
    pause
    exit /b 1
)

echo.
echo O servidor foi encerrado.
pause
