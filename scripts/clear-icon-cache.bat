@echo off
REM Script to clear Windows icon cache
REM This helps Windows recognize the new app icon after rebuilding

echo Clearing Windows icon cache...
echo.
echo This will refresh the icon cache so Windows shows the correct app icon.
echo You may need to run this as Administrator.
echo.

REM Method 1: Use ie4uinit.exe (Windows built-in utility)
echo Attempting to clear icon cache using ie4uinit.exe...
ie4uinit.exe -show

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Icon cache cleared successfully!
    echo You may need to restart Windows Explorer or log out and back in.
) else (
    echo.
    echo Note: If the above command failed, you may need to:
    echo 1. Run this script as Administrator
    echo 2. Or manually restart Windows Explorer
    echo 3. Or log out and log back in
)

echo.
echo Additional steps to ensure icon appears:
echo 1. Completely uninstall the app before reinstalling
echo 2. Delete any leftover folders in %%LOCALAPPDATA%%
echo 3. Rebuild the app with: npm run dist
echo 4. Install the new build
echo.
pause


