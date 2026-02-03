#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PUSHING LOGIN FIX TO GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location Server

Write-Host "Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Staging changes..." -ForegroundColor Yellow
git add src/services/auth.service.ts
git add hotfix-login.sh
Write-Host ""

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Fix: Resolve foreign key constraint error in login history

- Fixed LoginHistory foreign key violation when user doesn't exist
- Only record login history when user exists to avoid FK constraint error
- Added hotfix deployment script for quick server updates"
Write-Host ""

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host " PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can deploy on your server by running:" -ForegroundColor Cyan
Write-Host "  cd ~/digital-storming-loadboard-v2/Server" -ForegroundColor White
Write-Host "  git pull" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  pm2 restart digital-storming-loadboard" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"

