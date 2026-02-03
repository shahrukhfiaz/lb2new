# Session Capture Troubleshooting

## Problem: "Session capture failed, but DAT is still accessible"

This error means the super admin successfully logged into DAT, but the system couldn't save and upload the session for sharing with other users.

## 🔍 Root Cause

**Most common reason**: **S3/Object Storage credentials are not configured**

The session capture system needs cloud storage (DigitalOcean Spaces or AWS S3) to store session bundles that are shared with all users.

## ✅ Solution

### Step 1: Check Current S3 Configuration

Your backend `.env` file currently has:
```env
OBJECT_STORAGE_ACCESS_KEY=your_key
OBJECT_STORAGE_SECRET_KEY=your_secret
```

These are **placeholder values** and won't work. You need **real** credentials.

### Step 2: Set Up Cloud Storage

**Follow the guide**: `SETUP_DIGITALOCEAN_SPACES.md`

**Quick Summary:**
1. **Create DigitalOcean Space** (10 minutes)
   - Go to: https://cloud.digitalocean.com/
   - Create → Spaces Object Storage
   - Name: `ds-loadboard-sessions`
   - Region: `NYC3`

2. **Generate API Keys**
   - Go to: https://cloud.digitalocean.com/account/api/spaces
   - Generate New Key
   - Save the Access Key and Secret Key

3. **Update Server .env**
   ```bash
   ssh root@157.230.51.160
   cd /root/digital-storming-loadboard
   nano .env
   ```
   
   Update:
   ```env
   OBJECT_STORAGE_ACCESS_KEY=DO00ABC...  # Your real key
   OBJECT_STORAGE_SECRET_KEY=xyz789...    # Your real secret
   ```

4. **Restart Backend**
   ```bash
   pm2 restart digital-storming-loadboard
   ```

## 🐛 Other Possible Issues

### Issue 1: Session Data Directory Not Found

**Error**: "Session data directory not found"

**Cause**: The Chromium partition hasn't created any data yet

**Solution**: 
- This is normal on first login
- Wait a few seconds after DAT login
- Session data will be created as you use DAT
- Try closing and reopening DAT to trigger capture

### Issue 2: Network Connection Error

**Error**: "Cannot connect to server"

**Cause**: Client can't reach the backend API

**Solution**:
1. Verify client `.env` has correct `API_BASE_URL`
2. Check backend server is running: `pm2 status`
3. Test connectivity: `curl http://157.230.51.160:3000/healthz`

### Issue 3: Authentication Error

**Error**: "Authentication error. Please check API credentials"

**Cause**: JWT token is invalid or expired

**Solution**:
1. Logout and login again
2. Check backend logs: `pm2 logs digital-storming-loadboard`
3. Verify `JWT_ACCESS_SECRET` is set in backend `.env`

### Issue 4: Upload Failed

**Error**: "Upload failed: [specific message]"

**Causes**:
- Invalid S3 credentials
- S3 bucket doesn't exist
- Network issues to S3 endpoint

**Solution**:
1. Verify S3 bucket exists in DigitalOcean dashboard
2. Test S3 connectivity:
   ```bash
   curl -I https://ds-loadboard-sessions.nyc3.digitaloceanspaces.com
   ```
3. Regenerate API keys if needed

## 🔧 Debugging Steps

### 1. Check Client Console Logs

**In the client app:**
- Press `Ctrl+Shift+I` to open DevTools
- Go to Console tab
- Look for these logs when super admin logs into DAT:

```
✅ GOOD LOGS:
📦 Capturing super admin session: [session-id]
📂 Session data path: [path]
✅ Session zipped: [zip-path]
📤 Uploading session bundle: [bundle-key]
✅ Session uploaded successfully
🎉 Super admin session captured and uploaded successfully

❌ ERROR LOGS:
❌ Failed to capture super admin session: [error details]
```

### 2. Check Backend Logs

**On your server:**
```bash
pm2 logs digital-storming-loadboard --lines 100
```

Look for:
- `SESSION_BUNDLE_UPLOAD_REQUESTED`
- `SESSION_BUNDLE_UPLOAD_COMPLETED`
- Any S3-related errors

### 3. Check S3 Upload

**In DigitalOcean dashboard:**
1. Go to Spaces
2. Open your `ds-loadboard-sessions` bucket
3. Check if files are being uploaded in `sessions/` folder

### 4. Check Database

**On your server:**
```bash
# Check if session has bundleKey
cd /root/digital-storming-loadboard
npx prisma studio
```

Look for:
- `DatSession` table
- Find the shared session
- Check if `bundleKey` field is populated

## 🎯 Expected Behavior

### Super Admin Login Flow

1. **Super admin logs into client** ✅
2. **DAT opens automatically** ✅
3. **Super admin logs into DAT** ✅
4. **System detects DAT login** (URL changes from login page)
5. **Waits 3 seconds** (for session to stabilize)
6. **Captures session data** (cookies, storage, cache)
7. **Creates zip file** in temp directory
8. **Requests upload URL** from backend
9. **Uploads to S3** using presigned URL
10. **Completes upload** (updates database)
11. **Shows success message**: "✅ Session saved and shared with all users!"

### Regular User Login Flow

1. **User logs into client** ✅
2. **Downloads session bundle** from S3
3. **Extracts session data** to Chromium partition
4. **DAT opens with saved session** ✅
5. **User is already logged in** ✅

## 📋 Quick Checklist

Before reporting issues, verify:

- [ ] DigitalOcean Space created
- [ ] API keys generated
- [ ] Backend `.env` updated with real credentials
- [ ] Backend restarted after `.env` update
- [ ] Client `.env` has correct `API_BASE_URL`
- [ ] Backend server is running (`pm2 status`)
- [ ] Network connectivity to backend and S3

## 🆘 Still Having Issues?

1. **Check all logs** (client console + backend logs)
2. **Copy error messages** exactly as shown
3. **Verify S3 setup** is complete
4. **Test S3 connectivity** manually
5. **Check backend environment variables**

## 📞 Support

**Most common fix**: Set up DigitalOcean Spaces with real API keys

**Guide**: See `SETUP_DIGITALOCEAN_SPACES.md` for detailed instructions

**Time needed**: 10 minutes

**Cost**: $5/month

