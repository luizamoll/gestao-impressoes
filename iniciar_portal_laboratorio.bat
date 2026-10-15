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

if not exist "mvnw.cmd" (
    echo ERRO: mvnw.cmd nao foi encontrado nesta pasta.
    pause
    exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
    echo Git nao encontrado. Iniciando com a versao local.
) else (
    echo Conferindo atualizacoes do laboratorio no GitHub...
    git pull --ff-only
    if errorlevel 1 (
        echo.
        echo AVISO: nao foi possivel atualizar automaticamente.
        echo Nenhum arquivo local foi descartado. Sera usada a versao existente.
    )
)
echo.
echo Portal local: http://127.0.0.1:18081/
echo Login customizado: http://127.0.0.1:18081/login
echo.
echo Use a porta 18081. A porta 18080 pode executar a tela antiga.
echo Mantenha esta janela aberta enquanto usa o laboratorio.
echo Para desligar, pressione Ctrl+C.
echo.

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
