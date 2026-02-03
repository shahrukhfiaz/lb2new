# DAT Loadboard Installer Build Script
# This script builds the installer while handling code signing extraction issues

Write-Host "Building DAT Loadboard Installer..." -ForegroundColor Cyan

# Set environment variable to skip code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

# Clear any problematic cache entries
$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
if (Test-Path $cachePath) {
    Write-Host "Clearing winCodeSign cache..." -ForegroundColor Yellow
    Remove-Item "$cachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Run the build
Write-Host "Starting electron-builder..." -ForegroundColor Green
npm run dist

# Check if installer was created
$installerPath = Get-ChildItem "release-new\DAT Loadboard-*.exe" -ErrorAction SilentlyContinue
if ($installerPath) {
    Write-Host "`n✅ Installer created successfully!" -ForegroundColor Green
    Write-Host "Location: $($installerPath.FullName)" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($installerPath.Length / 1MB, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  No installer found. Check the output above for errors." -ForegroundColor Yellow
}

