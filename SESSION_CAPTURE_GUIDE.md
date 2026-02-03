# Standalone Session Capture Script with Auto-Upload

This standalone script captures session files **after** the main application is closed, avoiding file locking issues, and **automatically uploads** them to your cloud storage.

## 🎯 Purpose

The main application may have file locking issues when trying to capture session files while the browser is still running. This standalone script runs **after** the main app is closed, ensuring no files are locked, and **automatically uploads** the captured session to your cloud storage.

## ✨ Features

- ✅ **No File Locking Issues** - Runs after the main app is closed
- ✅ **Automatic Cloud Upload** - Uploads to your cloud storage automatically
- ✅ **Database Integration** - Updates your database automatically
- ✅ **One-Click Solution** - Just run the script and everything is done
- ✅ **Comprehensive Capture** - Captures all critical login files
- ✅ **Session Validation** - Verifies all critical components are present

## 🚀 Quick Setup (One-Time)

### Step 1: Configure API Settings
1. **Copy the configuration template**:
   ```bash
   copy session-config.env.example session-config.env
   ```

2. **Edit `session-config.env`** with your actual values:
   ```env
   API_BASE_URL=http://157.230.51.160:3000/api/v1
   API_EMAIL=your-email@example.com
   API_PASSWORD=your-password
   ```

3. **Save the file** - the script will automatically load these settings

### Step 2: Install Dependencies
The script will automatically install required dependencies, but you can also install them manually:
```bash
npm install axios
```

## 📋 Usage Instructions

### Method 1: Using Batch File (Windows) - **RECOMMENDED**
1. **Login as SUPER ADMIN** in the main application
2. **Open DAT and login** to the DAT website
3. **Wait 30 seconds** for all session data to be written to disk
4. **Close the main application completely**
5. **Run the batch file**: Double-click `capture-session.bat`
6. **✅ DONE!** The script automatically:
   - Captures the session files
   - Uploads to your cloud storage
   - Updates your database
   - Shows success confirmation
7. **Test with regular users** - they should now be automatically logged in!

### Method 2: Using PowerShell (Windows)
1. Follow steps 1-4 from Method 1
2. **Right-click** on `capture-session.ps1`
3. **Select "Run with PowerShell"**
4. Follow steps 6-7 from Method 1

### Method 3: Using Node.js directly
1. Follow steps 1-4 from Method 1
2. **Open Command Prompt** in the project directory
3. **Run**: `node session-capture-script.js [sessionId]`
4. Follow steps 6-7 from Method 1

## 🔧 Configuration

### Default Session ID
The script uses `cmgsg863g0001tpngelspcz9k` as the default session ID. You can change this by:

1. **Editing the batch file**: Change `set SESSION_ID=your_session_id`
2. **Editing the PowerShell script**: Change the default parameter
3. **Command line**: `node session-capture-script.js your_session_id`

### User Data Path
The script automatically detects the user data path:
- **Windows**: `%USERPROFILE%\AppData\Roaming\dat-one-client`

## 📁 Output

The script creates a zip file in the system temp directory with the naming pattern:
```
standalone-session-{sessionId}-{timestamp}.zip
```

Example: `standalone-session-cmgsg863g0001tpngelspcz9k-1761178705783.zip`

## 🔍 What Gets Captured

### ✅ Included Files
- **Network Directory** (contains cookies)
- **Local Storage Directory** (contains app state)
- **Session Storage Directory** (contains session data)
- **Preferences File** (browser preferences)
- **IndexedDB Directory** (database storage)
- **WebSQL Directory** (database storage)

### ❌ Excluded Files
- Cache files (`Cache/Cache_Data/`, `code cache/`, `gpucache/`)
- Lock files (`.lock`, `LOCK`)
- Journal files (`.journal`, `-journal`)
- WAL files (`.wal`, `-wal`)

## 🚨 Troubleshooting

### Session Directory Not Found
If you get "Session directory not found":
1. Check that the main app was running with the correct session ID
2. Verify the user data path is correct
3. Look at the list of available partitions in the output

### Files Still Locked
If files are still locked:
1. Ensure the main application is completely closed
2. Wait a few more seconds before running the script
3. Check Task Manager for any remaining Electron processes

### Critical Files Missing
If critical files are missing:
1. Verify you were logged into DAT in the main application
2. Wait longer before closing the main application
3. Check the session validation output in the script

## 📊 Validation

The script automatically validates that all critical components are present:
- ✅ Network Directory
- ✅ Local Storage Directory  
- ✅ Session Storage Directory
- ✅ Preferences File

## 🎉 Success Indicators

You'll know the capture and upload was successful when you see:
- ✅ "Session validation passed! All critical components present."
- ✅ "Critical files preserved for login state: X"
- ✅ "Session capture completed successfully!"
- ✅ "Upload successful!"
- ✅ "COMPLETE SUCCESS! Session captured and uploaded automatically!"

## 🎯 What Happens Automatically

When successful, the script automatically:
1. ✅ **Captures** all critical session files
2. ✅ **Validates** session completeness
3. ✅ **Uploads** to your cloud storage
4. ✅ **Updates** your database
5. ✅ **Shows** success confirmation

## 📤 Manual Fallback

If auto-upload fails, you'll see:
- ⚠️ "Session captured but upload failed!"
- 📋 Manual steps will be provided
- 📦 Zip file location will be shown for manual upload
