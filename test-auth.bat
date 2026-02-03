@echo off
echo Testing API Authentication...
echo.

REM Check if required dependencies are installed
echo Checking dependencies...
node -e "try { require('axios'); console.log('✅ Dependencies OK'); } catch(e) { console.log('❌ Missing dependencies. Run: npm install axios'); process.exit(1); }"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Installing missing dependencies...
    npm install axios
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Running authentication test...
node test-auth.js

echo.
echo Authentication test completed.
pause
