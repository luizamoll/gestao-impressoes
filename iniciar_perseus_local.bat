@echo off
setlocal
rem Inicia o Perseus existente sem copiar ou alterar o motor Python.
rem Rode este arquivo a partir da pasta do Portal UNH no Windows.
set "PERSEUS_DIR="
if exist "%USERPROFILE%\perseus-conferencia\iniciar_windows.bat" set "PERSEUS_DIR=%USERPROFILE%\perseus-conferencia"
if not defined PERSEUS_DIR if exist "%USERPROFILE%\Desktop\perseus-conferencia\iniciar_windows.bat" set "PERSEUS_DIR=%USERPROFILE%\Desktop\perseus-conferencia"
if not defined PERSEUS_DIR (
 echo.
 echo Perseus nao localizado nas pastas usuais.
 echo Verifique se o projeto perseus-conferencia esta neste computador.
 echo Pastas consultadas:
 echo - %USERPROFILE%\perseus-conferencia
 echo - %USERPROFILE%\Desktop\perseus-conferencia
 echo Nenhum arquivo do Portal UNH foi modificado.
 echo.
 pause
 exit /b 1
)
echo.
echo Iniciando Perseus instalado em:
echo %PERSEUS_DIR%
echo A interface sera aberta em http://127.0.0.1:8878
echo.
call "%PERSEUS_DIR%\iniciar_windows.bat"
exit /b %ERRORLEVEL%
