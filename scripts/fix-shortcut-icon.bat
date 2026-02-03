@echo off
REM Batch script to fix desktop shortcut icon
REM This script updates existing shortcuts to use the correct icon

echo Fixing DAT Loadboard shortcut icons...
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available
    echo Please use the PowerShell script instead: scripts\fix-shortcut-icon.ps1
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0fix-shortcut-icon.ps1"

