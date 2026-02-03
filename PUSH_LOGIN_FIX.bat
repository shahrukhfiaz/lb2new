@echo off
echo ========================================
echo  PUSHING LOGIN FIX TO GITHUB
echo ========================================
echo.

cd Server

echo Checking git status...
git status
echo.

echo Staging changes...
git add src/services/auth.service.ts
git add hotfix-login.sh
echo.

echo Committing changes...
git commit -m "Fix: Resolve foreign key constraint error in login history

- Fixed LoginHistory foreign key violation when user doesn't exist
- Only record login history when user exists to avoid FK constraint error
- Added hotfix deployment script for quick server updates"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo  PUSH COMPLETE!
echo ========================================
echo.
echo Now you can deploy on your server by running:
echo   cd ~/digital-storming-loadboard-v2/Server
echo   git pull
echo   npm run build
echo   pm2 restart digital-storming-loadboard
echo.
pause

