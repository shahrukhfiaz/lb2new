# Proxy Usage Summary

## Overview
The DAT Loadboard app uses a Squid proxy server for IP masking, but different services have different proxy configurations.

## Services Using Proxy ✅

### 1. **DAT Website Traffic (Chromium/Electron)**
- **Configuration:** Set via `app.commandLine.appendSwitch('proxy-server')` (line 676)
- **Proxy Server:** `http://67.205.189.32:3128` (or configured via `CLOUD_SERVER_IP` and `CLOUD_PROXY_PORT`)
- **Authentication:** Automatic via `app.on('login')` event handler (lines 575-636)
- **What This Includes:**
  - All DAT website pages (`one.dat.com`, `dat.com`)
  - All web content loaded in the DAT window
  - All BrowserView tabs
  - All HTTP/HTTPS requests made by Chromium/Electron renderer processes
- **Bypass List:** Only `localhost`, `127.0.0.1`, `<local>`, and the proxy server IP itself

### 2. **Session Bundle Downloads**
- **Configuration:** Uses Node.js native `https` module with `HttpsProxyAgent` (lines 1620-1708)
- **Function:** `downloadSessionBundle()` in `src/main/main.js`
- **Proxy Server:** `http://67.205.189.32:3128` (same as Chromium)
- **Authentication:** Included in proxy URL format: `http://username:password@host:port`
- **What This Includes:**
  - Downloads from DigitalOcean Spaces (`dat-commercial.nyc3.digitaloceanspaces.com`)
  - All session bundle downloads for user login

## Services NOT Using Proxy ❌

### 1. **API Calls (Backend Server)**
- **Configuration:** Uses `axios` instance created at line 242: `axios.create({ baseURL: API_BASE_URL, timeout: 45000 })`
- **No Proxy:** The `http` axios instance does NOT have proxy configuration
- **Bypass Reason:** API server IP (`67.205.189.32`) is in the `proxy-bypass-list` (line 680)
- **What This Includes:**
  - Login requests (`/auth/login`)
  - Session validation (`/auth/session-status`)
  - Token refresh (`/auth/refresh`)
  - Session listing (`/sessions/my-sessions`)
  - Download URL requests (`/sessions/${sessionId}/request-download`)
  - Upload completion (`/sessions/${sessionId}/complete-upload`)
  - Upload URL requests (`/sessions/${sessionId}/request-upload`)

### 2. **Session Uploads (Direct to DigitalOcean Spaces)**
- **Configuration:** Direct `axios.put()` call without proxy (line 520)
- **Function:** `uploadSessionFromDirectory()` in `src/main/main.js`
- **What This Includes:**
  - Super admin session uploads directly to DigitalOcean Spaces presigned URLs
  - **Note:** These uploads bypass the proxy entirely

## Configuration Details

### Proxy Server Settings
- **Host:** `67.205.189.32` (or `CLOUD_SERVER_IP` env var)
- **Port:** `3128` (or `CLOUD_PROXY_PORT` env var)
- **Type:** Squid HTTP proxy
- **Authentication:** Username/Password from `CLOUD_PROXY_USERNAME` and `CLOUD_PROXY_PASSWORD`

### Proxy Bypass List
```javascript
proxy-bypass-list: `${cloudServerIP},localhost,127.0.0.1,<local>`
```

This ensures:
- API calls go directly to the backend server (not through proxy)
- Localhost connections work normally
- The proxy server itself is not proxied (avoiding loops)

## Summary Table

| Service | Uses Proxy? | Method | Notes |
|---------|-------------|--------|-------|
| DAT Website (Chromium) | ✅ Yes | Electron `proxy-server` switch | All web traffic goes through proxy |
| Session Downloads | ✅ Yes | Node.js `https` + `HttpsProxyAgent` | Downloads route through proxy |
| API Calls | ❌ No | Direct `axios` | Bypassed via proxy-bypass-list |
| Session Uploads | ❌ No | Direct `axios.put()` | Go directly to DigitalOcean Spaces |

## Why This Configuration?

1. **DAT Traffic Through Proxy:** Masks user IP addresses when accessing DAT website
2. **API Calls Direct:** Ensures reliable backend communication without proxy overhead
3. **Downloads Through Proxy:** May provide better routing/performance for large file downloads
4. **Uploads Direct:** Faster uploads by going directly to cloud storage

