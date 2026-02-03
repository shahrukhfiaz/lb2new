# Pre-extract winCodeSign archive without symlinks to avoid permission errors
$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$archiveUrl = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
$archivePath = "$cachePath\winCodeSign-2.6.0.7z"
$extractDir = "$cachePath\pre-extracted"

Write-Host "Pre-extracting winCodeSign archive..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path $cachePath | Out-Null
New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

# Download if not exists
if (-not (Test-Path $archivePath)) {
    Write-Host "Downloading archive..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $archiveUrl -OutFile $archivePath
}

# Extract without symlinks using 7zip (copy symlinks as regular files)
Write-Host "Extracting archive (skipping symlinks)..." -ForegroundColor Yellow
$7zipPath = "F:\sessions apps\DAT Final App session capture changes\DAT APP\node_modules\7zip-bin\win\x64\7za.exe"

# Extract everything except darwin directory (macOS files with symlinks)
& $7zipPath x "-o$extractDir" "-x!darwin" $archivePath 2>&1 | Out-Null

Write-Host "Pre-extraction complete!" -ForegroundColor Green

