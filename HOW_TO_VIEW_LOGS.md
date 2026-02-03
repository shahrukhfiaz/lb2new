# How to View Logs for DAT Loadboard App

## Log File Location

When running the app from the installer, logs are automatically saved to:

**Windows:**
```
%APPDATA%\dat-loadboard\logs\app-YYYY-MM-DD.log
```

**Example:**
```
C:\Users\YourUsername\AppData\Roaming\dat-loadboard\logs\app-2025-11-05.log
```

## Viewing Logs

### Method 1: Using File Explorer (Easiest)

1. Press `Windows + R` to open Run dialog
2. Type: `%APPDATA%\dat-loadboard\logs`
3. Press Enter
4. Open the most recent `app-YYYY-MM-DD.log` file with Notepad

### Method 2: Using Command Prompt

1. Open Command Prompt or PowerShell
2. Run:
   ```cmd
   cd %APPDATA%\dat-loadboard\logs
   dir
   ```
3. Open the latest log file with Notepad:
   ```cmd
   notepad app-2025-11-05.log
   ```

### Method 3: Using PowerShell (View Latest Log)

```powershell
Get-Content "$env:APPDATA\dat-loadboard\logs\app-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 100
```

### Method 4: Real-time Log Monitoring (PowerShell)

Watch logs in real-time as the app runs:

```powershell
Get-Content "$env:APPDATA\dat-loadboard\logs\app-$(Get-Date -Format 'yyyy-MM-dd').log" -Wait -Tail 50
```

## What's Logged

- ✅ **Errors**: Always logged (red messages)
- ✅ **Warnings**: Always logged
- ✅ **Info**: Logged in production mode
- ✅ **Debug**: Logged when DEBUG=true is set

## Enable Debug Mode

To see more detailed logs, set the DEBUG environment variable:

1. Right-click the app shortcut
2. Select "Properties"
3. In "Target" field, add ` --debug` at the end:
   ```
   "C:\Program Files\DAT Loadboard\DAT Loadboard.exe" --debug
   ```

Or create a batch file to launch with debug:

```batch
@echo off
set DEBUG=true
"C:\Program Files\DAT Loadboard\DAT Loadboard.exe"
```

## Log Format

Each log entry includes:
- **Timestamp**: ISO format date/time
- **Level**: LOG, INFO, WARN, ERROR, DEBUG
- **Message**: The actual log message

Example:
```
[2025-11-05T09:57:01.234Z] [LOG] 🔄 Creating DAT BrowserWindow...
[2025-11-05T09:57:01.456Z] [ERROR] ❌ Failed to create first tab: Error message
```

## Troubleshooting

### If logs folder doesn't exist:

The folder is created automatically when the app starts. If it doesn't exist:
1. Make sure the app has run at least once
2. Check Windows permissions for `%APPDATA%\dat-loadboard`

### If you can't find logs:

1. Check if the app is actually running
2. Look for the most recent log file (sorted by date)
3. Check Windows Event Viewer for Electron errors:
   - Open Event Viewer
   - Navigate to: Windows Logs > Application
   - Filter for "Electron" or "DAT Loadboard"

## Quick Log Viewer Script

Save this as `view-logs.bat` in the logs folder:

```batch
@echo off
echo DAT Loadboard Log Viewer
echo ========================
echo.
echo Log file location: %APPDATA%\dat-loadboard\logs
echo.
cd /d "%APPDATA%\dat-loadboard\logs"
if exist "app-*.log" (
    echo Latest log files:
    dir /b /o-d app-*.log | findstr /n "."
    echo.
    echo Opening latest log file...
    for /f "delims=" %%i in ('dir /b /o-d app-*.log') do (
        notepad "%%i"
        goto :done
    )
) else (
    echo No log files found. Make sure the app has run at least once.
)
:done
pause
```

