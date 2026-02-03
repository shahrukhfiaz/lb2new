@echo off
REM DAT Loadboard Log Viewer
REM Opens the log file in Notepad

echo ========================================
echo    DAT Loadboard Log Viewer
echo ========================================
echo.

set "LOG_DIR=%APPDATA%\dat-loadboard\logs"

if not exist "%LOG_DIR%" (
    echo [ERROR] Log directory not found: %LOG_DIR%
    echo.
    echo Make sure the app has run at least once.
    echo.
    pause
    exit /b 1
)

echo Log directory: %LOG_DIR%
echo.

REM Find the latest log file
for /f "delims=" %%i in ('dir /b /o-d "%LOG_DIR%\app-*.log" 2^>nul') do (
    echo Opening latest log file: %%i
    echo.
    start notepad "%LOG_DIR%\%%i"
    goto :done
)

echo [ERROR] No log files found in %LOG_DIR%
echo Make sure the app has run at least once.
echo.
pause
exit /b 1

:done
echo Log file opened in Notepad.
echo.
echo To view logs in real-time, use PowerShell:
echo Get-Content "%LOG_DIR%\app-*.log" -Wait -Tail 50
echo.
pause

