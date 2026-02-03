# PowerShell Session Capture Script
param(
    [string]$SessionId = "cmgsg863g0001tpngelspcz9k"
)

Write-Host "🚀 Starting Session Capture Script..." -ForegroundColor Green
Write-Host "Session ID: $SessionId" -ForegroundColor Yellow
Write-Host ""

# Run the session capture script
node session-capture-script.js $SessionId

Write-Host ""
Write-Host "✅ Session capture script completed." -ForegroundColor Green
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
