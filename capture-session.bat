@echo off
echo ========================================
echo   DAT Loadboard - Session Capture Tool
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Set the session ID (can be passed as argument or set here)
set SESSION_ID=%1
if "%SESSION_ID%"=="" (
    REM Default session ID if not provided
    set SESSION_ID=cmgsg863g0001tpngelspcz9k
    echo ℹ️  No session ID provided, using default
)

echo 📋 Session ID: %SESSION_ID%
echo.

REM Check if session-config.env exists
if exist "session-config.env" (
    echo ✅ Found session-config.env
    echo.
) else (
    echo ⚠️  session-config.env not found
    echo    The script will use default values
    echo    You can create session-config.env from session-config.env.example
    echo.
)

REM Check if required dependencies are installed
echo 🔍 Checking dependencies...
node -e "try { require('axios'); require('adm-zip'); console.log('✅ All dependencies OK'); } catch(e) { console.log('❌ Missing dependencies'); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo.
    echo 📦 Installing missing dependencies...
    echo    This may take a moment...
    npm install axios adm-zip
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ❌ Failed to install dependencies
        echo    Please run: npm install axios adm-zip
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    echo.
)

REM Check if session-capture-script.js exists
if not exist "session-capture-script.js" (
    echo ❌ session-capture-script.js not found
    echo    Please ensure you're running this from the correct directory
    pause
    exit /b 1
)

echo.
echo 🚀 Starting session capture...
echo    This will capture the session data and upload it to the server
echo.

REM Run the session capture script
node session-capture-script.js %SESSION_ID%

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Session capture completed successfully!
) else (
    echo.
    echo ❌ Session capture failed with error code: %ERRORLEVEL%
    echo    Please check the error messages above
)

echo.
pause
