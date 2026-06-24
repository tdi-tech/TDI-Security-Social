@echo off
title Administrador de carpeta MAGNO
color 0A

set "CARPETA=C:\Users\magno\OneDrive\Desktop\MAGNO"

:MENU
cls
echo =====================================
echo      CARPETA MAGNO
echo =====================================
echo.
echo 1. Ocultar carpeta
echo 2. Mostrar carpeta
echo 3. Salir
echo.
set /p OPCION=Selecciona una opcion: 

if "%OPCION%"=="1" goto OCULTAR
if "%OPCION%"=="2" goto MOSTRAR
if "%OPCION%"=="3" exit

echo.
echo Opcion no valida.
pause
goto MENU

:OCULTAR
if not exist "%CARPETA%" (
    echo.
    echo La carpeta no existe:
    echo %CARPETA%
    pause
    goto MENU
)

attrib +h +s "%CARPETA%"
echo.
echo La carpeta MAGNO ha sido ocultada.
pause
goto MENU

:MOSTRAR
if not exist "%CARPETA%" (
    echo.
    echo La carpeta no existe:
    echo %CARPETA%
    pause
    goto MENU
)

attrib -h -s "%CARPETA%"
echo.
echo La carpeta MAGNO ahora es visible.
pause
goto MENU
