# Session Capture Tool - Optimized Version

A standalone portable application for capturing and uploading DAT Loadboard session data with **98% size reduction**.

## 🚀 Key Features

- **98% Smaller Files**: Excludes cache files (113.82 MB → ~1.83 MB)
- **Auto-detection**: Automatically finds available sessions
- **Simple GUI**: Clean interface with progress tracking
- **Portable**: Single EXE file, no installation required
- **Auto-upload**: Automatically uploads to cloud storage after capture
- **Faster Uploads**: Smaller files mean faster upload and download times

## 📊 Optimization Details

### What's Excluded (Safe to Exclude):
- **Cache/** directory (35.41 MB) - Regenerated automatically
- **Code Cache/** directory (76.73 MB) - JavaScript cache, regenerated
- **GPUCache/** (0.53 MB) - GPU cache, regenerated
- **DawnGraphiteCache/** (0.53 MB) - Graphics cache, regenerated
- **DawnWebGPUCache/** (0.53 MB) - WebGPU cache, regenerated

### What's Included (Critical for Session):
- **Network/** (0.09 MB) - Contains Cookies (authentication)
- **Local Storage/** (0.06 MB) - App state
- **Session Storage/** (0.04 MB) - Session data
- **WebStorage/** (1.64 MB) - Contains IndexedDB
- **Preferences** - Browser preferences
- **Lock/Journal/WAL files** - Database integrity files

## 📦 Size Comparison

- **Original Version**: ~115.74 MB per session
- **Optimized Version**: ~1.83 MB per session
- **Reduction**: ~98.4% smaller

## 🎯 Usage

1. **Run the application**: Double-click `DAT Workspace Backup - Optimized.exe`
2. **Auto-detection**: App automatically detects available sessions
3. **Start backup**: Click "Start Backup" button
4. **Monitor progress**: Watch the progress bar and status messages
5. **View results**: Success/error details are displayed when complete

## ⚙️ Configuration

The app uses embedded default credentials. Optionally, you can create a `session-config.env` file in the same directory as the EXE:

```
API_BASE_URL=http://67.205.189.32:3000/api/v1
API_EMAIL=your-email@example.com
API_PASSWORD=your-password
```

## 🔨 Building

To build the portable EXE:

```bash
cd session-capture-optimized
npm install
npm run dist
```

The EXE will be created in `session-capture-optimized/release/`

## 📋 Requirements

- Windows 10 or later
- No installation required (portable)

## 🔧 Technical Details

- Built with Electron
- Uses optimized session capture logic (excludes cache files)
- Supports automatic session detection
- Handles errors gracefully with user-friendly messages
- Includes Lock, Journal, and WAL files for database integrity

## 📝 Differences from Original

- **File Filtering**: Only includes critical session files
- **Size Reduction**: 98% smaller backup files
- **Faster Uploads**: Significantly reduced upload time
- **Same Functionality**: All authentication and session data preserved

## ⚠️ Important Notes

- Cache files are excluded but can be regenerated automatically
- All critical session data (cookies, storage, preferences) is preserved
- Database integrity files (lock, journal, WAL) are included for safety
- The original `session-capture-app` is kept as backup

