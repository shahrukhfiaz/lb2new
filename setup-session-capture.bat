@echo off
echo Setting up Session Capture Script with Auto-Upload...
echo.

REM Copy configuration template
if not exist session-config.env (
    echo Creating configuration file...
    copy session-config.env.example session-config.env
    echo ✅ Configuration file created: session-config.env
    echo.
    echo 📋 Please edit session-config.env with your actual API settings:
    echo    - API_BASE_URL: Your API base URL (already set to http://67.205.189.32:3000/api/v1)
    echo    - API_EMAIL: Your login email (same as DAT Loadboard app)
    echo    - API_PASSWORD: Your login password (same as DAT Loadboard app)
    echo.
) else (
    echo ✅ Configuration file already exists: session-config.env
)

REM Check dependencies
echo Checking dependencies...
node -e "try { require('axios'); console.log('✅ Dependencies OK'); } catch(e) { console.log('❌ Missing dependencies'); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo Installing missing dependencies...
    npm install axios
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit session-config.env with your API settings
echo 2. Login as SUPER ADMIN in DAT Loadboard app
echo 3. Login to DAT website
echo 4. Close the DAT Loadboard app
echo 5. Run capture-session.bat
echo.
pause
