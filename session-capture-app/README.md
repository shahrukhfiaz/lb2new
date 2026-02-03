# Session Capture Tool - Portable

A standalone portable application for capturing and uploading DAT Loadboard session data.

## Features

- **Auto-detection**: Automatically finds available sessions
- **Simple GUI**: Clean interface with progress tracking
- **Portable**: Single EXE file, no installation required
- **Auto-upload**: Automatically uploads to cloud storage after capture

## Usage

1. **Run the application**: Double-click `Session Capture Tool.exe`
2. **Select session**: Choose from detected sessions or enter session ID manually
3. **Start capture**: Click "Start Capture" button
4. **Monitor progress**: Watch the progress bar and status messages
5. **View results**: Success/error details are displayed when complete

## Configuration

The app uses embedded default credentials. Optionally, you can create a `session-config.env` file in the same directory as the EXE:

```
API_BASE_URL=http://167.99.147.118:3000/api/v1
API_EMAIL=your-email@example.com
API_PASSWORD=your-password
```

## Building

To build the portable EXE:

```bash
cd session-capture-app
npm install
npm run dist
```

The EXE will be created in `session-capture-app/release/`

## Requirements

- Windows 10 or later
- No installation required (portable)

## Technical Details

- Built with Electron
- Uses existing session capture logic
- Supports automatic session detection
- Handles errors gracefully with user-friendly messages
