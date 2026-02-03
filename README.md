# Digital Storming Loadboard Client

Electron-based Chromium shell that authenticates users against the Digital Storming Loadboard backend and launches their assigned DAT web session with a pre-provisioned Chromium profile.

## Features
- Branded login window with secure status messaging.
- Calls /auth/login on the backend and surfaces any API errors.
- Lists DAT sessions assigned to the authenticated user (filters /sessions).
- Requests a signed download URL, unpacks the Chromium profile, and launches a dedicated browser window with a custom user agent.
- Supports logout and gracefully restores the login window.

## Getting Started
1. **Install dependencies**
   `ash
   npm install
   `
2. **Create a .env file** (see .env.example for keys)
   `env
   API_BASE_URL=https://api.yourdomain.com/api/v1
   APP_BRAND_NAME=Digital Storming Loadboard
   DEFAULT_DAT_URL=https://one.dat.com
   `
3. **Run the application in development**
   `ash
   npm run dev
   `
4. **Package installers**
   `ash
   npm run dist
   `
   The Windows NSIS installer will appear in elease/.

## Notes
- Replace the placeholder icons in public/assets/ with production-ready artwork (icon.png, icon.ico, and logo.svg).
- The client assumes backend routes:
  - POST /auth/login
  - GET /sessions
  - POST /sessions/:id/request-download
  - POST /sessions/:id/complete-upload
  - POST /sessions/:id/events
- Session archives are extracted into pp.getPath('userData') to reuse Chromium partitions.
- Electron DevTools remain disabled to keep the Chromium shell transparent to end users.

## Customisation
- Update colours and typography in public/styles.css for brand alignment.
- Override the preload and main-process logic under src/preload/ and src/main/ as needed for advanced audit or telemetry requirements.

