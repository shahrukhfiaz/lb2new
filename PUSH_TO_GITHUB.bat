@echo off
echo ========================================
echo  PUSH SERVER TO GITHUB
echo  Repository: dat-commercial
echo ========================================
echo.

cd Server

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding remote repository...
git remote add origin https://github.com/shahrukhfiaz/dat-commercial.git

echo.
echo Step 3: Staging all files...
git add .

echo.
echo Step 4: Creating initial commit...
git commit -m "Initial commit: DAT Commercial Server v1.0.0 - Production Ready"

echo.
echo Step 5: Pushing to GitHub...
echo You will be prompted for GitHub credentials...
echo.
git push -u origin main

echo.
echo ========================================
echo  PUSH COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Visit: https://github.com/shahrukhfiaz/dat-commercial
echo 2. Verify all files are uploaded
echo 3. Copy production.env to server and rename to .env
echo 4. Run deployment on your server
echo.

pause

