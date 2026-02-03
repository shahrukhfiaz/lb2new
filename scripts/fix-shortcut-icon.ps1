# PowerShell script to fix desktop shortcut icon
# This script updates existing shortcuts to use the correct icon

$ErrorActionPreference = "Stop"

Write-Host "Fixing DAT Loadboard shortcut icons..." -ForegroundColor Cyan
Write-Host ""

# Find the installation directory from registry
$installDir = $null
try {
    $installDir = (Get-ItemProperty -Path "HKLM:\Software\DAT Loadboard" -Name "Install_Dir" -ErrorAction SilentlyContinue).Install_Dir
} catch {
    # Try to find it in common locations
    $commonPaths = @(
        "${env:ProgramFiles}\DAT Loadboard",
        "${env:ProgramFiles(x86)}\DAT Loadboard"
    )
    foreach ($path in $commonPaths) {
        if (Test-Path "$path\DAT Loadboard.exe") {
            $installDir = $path
            break
        }
    }
}

if (-not $installDir -or -not (Test-Path "$installDir\DAT Loadboard.exe")) {
    Write-Host "ERROR: Could not find DAT Loadboard installation directory" -ForegroundColor Red
    Write-Host "Please reinstall the app or manually update the shortcut icon" -ForegroundColor Yellow
    exit 1
}

$iconPath = "$installDir\icon.ico"
$exePath = "$installDir\DAT Loadboard.exe"

if (-not (Test-Path $iconPath)) {
    Write-Host "WARNING: icon.ico not found at $iconPath" -ForegroundColor Yellow
    Write-Host "Using executable icon instead..." -ForegroundColor Yellow
    $iconPath = "$exePath,0"
}

Write-Host "Installation directory: $installDir" -ForegroundColor Green
Write-Host "Icon path: $iconPath" -ForegroundColor Green
Write-Host ""

# Fix desktop shortcut
$desktopShortcut = "$env:USERPROFILE\Desktop\DAT Loadboard.lnk"
$publicDesktopShortcut = "$env:PUBLIC\Desktop\DAT Loadboard.lnk"

function Fix-Shortcut {
    param([string]$ShortcutPath)
    
    if (Test-Path $ShortcutPath) {
        try {
            $shell = New-Object -ComObject WScript.Shell
            $shortcut = $shell.CreateShortcut($ShortcutPath)
            $shortcut.TargetPath = $exePath
            $shortcut.IconLocation = $iconPath
            $shortcut.Save()
            Write-Host "✓ Fixed: $ShortcutPath" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "✗ Failed to fix: $ShortcutPath - $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

$fixed = 0

if (Fix-Shortcut $desktopShortcut) { $fixed++ }
if (Fix-Shortcut $publicDesktopShortcut) { $fixed++ }

# Fix Start Menu shortcuts
$startMenuPaths = @(
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\DAT Loadboard\DAT Loadboard.lnk",
    "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs\DAT Loadboard\DAT Loadboard.lnk"
)

foreach ($startMenuPath in $startMenuPaths) {
    if (Fix-Shortcut $startMenuPath) { $fixed++ }
}

Write-Host ""
if ($fixed -gt 0) {
    Write-Host "Successfully fixed $fixed shortcut(s)!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Refreshing icon cache..." -ForegroundColor Cyan
    
    # Refresh icon cache
    try {
        & "$env:SystemRoot\System32\ie4uinit.exe" -show
        Write-Host "✓ Icon cache refreshed" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not refresh icon cache automatically" -ForegroundColor Yellow
        Write-Host "  You may need to log out and back in, or restart Windows Explorer" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "If the icon still doesn't update, try:" -ForegroundColor Yellow
    Write-Host "  1. Right-click the shortcut > Properties > Change Icon" -ForegroundColor Yellow
    Write-Host "  2. Browse to: $iconPath" -ForegroundColor Yellow
    Write-Host "  3. Or restart Windows Explorer (taskkill /f /im explorer.exe && explorer.exe)" -ForegroundColor Yellow
} else {
    Write-Host "No shortcuts found to fix." -ForegroundColor Yellow
    Write-Host "If you have a shortcut, you can manually update it:" -ForegroundColor Yellow
    Write-Host "  Right-click > Properties > Change Icon > Browse to: $iconPath" -ForegroundColor Yellow
}

Write-Host ""
pause

