Write-Host "========================================"
Write-Host " PUSH SERVER TO GITHUB" -ForegroundColor Cyan
Write-Host " Repository: dat-commercial"
Write-Host "========================================"
Write-Host ""

Set-Location Server

Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host ""
Write-Host "Step 2: Adding remote repository..." -ForegroundColor Yellow
git remote add origin https://github.com/shahrukhfiaz/dat-commercial.git

Write-Host ""
Write-Host "Step 3: Staging all files..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 4: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: DAT Commercial Server v1.0.0 - Production Ready"

Write-Host ""
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You will be prompted for GitHub credentials..." -ForegroundColor Cyan
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "========================================"
Write-Host " PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://github.com/shahrukhfiaz/dat-commercial"
Write-Host "2. Verify all files are uploaded"
Write-Host "3. Copy production.env to server and rename to .env"
Write-Host "4. Run deployment on your server"
Write-Host ""

Read-Host "Press Enter to continue"

