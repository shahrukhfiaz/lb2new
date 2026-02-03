# Digital Storming Loadboard V2 - Deployment Guide
## NEW SERVER (67.205.189.32) - Separate from Old Production

---

## 🎯 Overview

This is a **complete new deployment** with:
- ✅ **New Server**: 67.205.189.32 (separate from old 157.230.51.160)
- ✅ **New Database**: Neon PostgreSQL (separate from old database)
- ✅ **New Client App**: Uses different AppData folder ("Digital Storming Loadboard V2")
- ✅ **Single Session Security**: One active login per user with comprehensive tracking

---

## 🚀 Server Deployment (67.205.189.32)

### Step 1: Server Setup

```bash
# SSH into the new server
ssh root@67.205.189.32

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Git
apt install -y git curl wget
```

### Step 2: Clone Repository

```bash
# Clone your repository
cd /root
git clone <your-repo-url> digital-storming-loadboard-v2
cd digital-storming-loadboard-v2/Server
```

### Step 3: Configure Environment

```bash
# Copy the new server configuration
cp NEW_SERVER_CONFIG.env .env

# Edit .env and update these critical values:
nano .env
```

**Update these in .env:**

```env
# Database (ALREADY SET - Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Generate NEW JWT secrets (run these commands):
# node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
JWT_ACCESS_SECRET=<paste-generated-secret-here>
JWT_REFRESH_SECRET=<paste-generated-secret-here>

# Set up DigitalOcean Spaces (or AWS S3)
OBJECT_STORAGE_ACCESS_KEY=your_new_spaces_key
OBJECT_STORAGE_SECRET_KEY=your_new_spaces_secret
OBJECT_STORAGE_BUCKET=ds-loadboard-sessions-v2  # NEW bucket for V2

# DAT Master Credentials (for session seeder)
DAT_MASTER_EMAIL=your-dat-email@example.com
DAT_MASTER_PASSWORD=your-dat-password
```

### Step 4: Install Dependencies & Build

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build the application
npm run build
```

### Step 5: Start with PM2

```bash
# Start the server
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs digital-storming-loadboard --lines 50
```

### Step 6: Configure Nginx (Optional - for HTTPS)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/loadboard-v2
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name 67.205.189.32;

    location /api/v1 {
        proxy_pass http://localhost:3000/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/loadboard-v2 /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 7: Setup Firewall

```bash
# Allow required ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # API
ufw allow 3128/tcp  # Squid Proxy
ufw enable
```

---

## 💻 Client Deployment

### Step 1: Update Configuration

```bash
# In your local client directory
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Copy the new server configuration
copy NEW_SERVER_CONFIG.env .env
```

### Step 2: Install New Dependencies

```bash
# Install the new packages for device tracking
npm install
```

### Step 3: Build Client

```bash
# For development testing
npm run dev

# For production installer
npm run dist
```

**The installer will be created in:**
```
release-new/Digital Storming Loadboard V2-1.0.0-Setup.exe
```

### Step 4: Key Changes in V2 Client

1. **Different AppData Folder:**
   - Old App: `%APPDATA%/dat-one-client`
   - **New App V2**: `%APPDATA%/digital-storming-loadboard-v2`
   - ✅ Both apps can run simultaneously without conflicts

2. **New Features:**
   - ✅ Device fingerprinting (MAC address, OS info)
   - ✅ Session validation (checks every 60 seconds)
   - ✅ Auto-logout when logged in from another device
   - ✅ Friendly error messages for session conflicts

3. **Connects to New Server:**
   - API: `http://67.205.189.32:3000/api/v1`
   - Proxy: `67.205.189.32:3128`

---

## 🔒 Single Session Security Features

### What's New

1. **One Active Session Per User**
   - Users can only be logged in from ONE device at a time
   - Logging in from a new device automatically logs out the old device
   - Old session gets immediate notification

2. **Comprehensive Tracking**
   - **Login History**: Every login attempt recorded with:
     - IP address & geolocation (city, country)
     - MAC address
     - Device info (OS, browser, hardware)
     - Timestamp
     - Success/failure status
   
   - **Session Activity**: Active sessions tracked with:
     - Login/logout times
     - Last activity timestamp
     - Device metadata
     - Logout reason (manual, forced, new_login)

3. **Admin Notifications**
   - Real-time alerts when users login from multiple devices
   - Security dashboard showing:
     - All active sessions
     - Login history
     - Failed login attempts
     - Suspicious activities

4. **Admin Controls**
   - View all active sessions
   - Force logout any user
   - View login history
   - Monitor security alerts

---

## 📊 Database Schema Changes

### New Tables

1. **LoginHistory** - All login attempts
2. **SessionActivity** - Active session tracking
3. **SecurityAlert** - Admin security notifications

### New User Fields

- `currentSessionToken` - Tracks active session
- `lastLoginAt` - Last successful login
- `lastLoginIP` - Last login IP address

**All fields are NULLABLE** - DAT session functionality unaffected!

---

## 🧪 Testing

### Test Single Session Enforcement

1. **Login from Computer A:**
   ```
   Email: test@test.com
   Password: test123
   ```
   ✅ User logs in successfully
   ✅ DAT session opens

2. **Login from Computer B (same credentials):**
   ```
   Email: test@test.com
   Password: test123
   ```
   ✅ User logs in successfully on Computer B
   ❌ Computer A shows: "You have been logged out from another device"
   ❌ Computer A auto-logs out after 3 seconds

3. **Check Admin Panel:**
   - Login as super admin
   - Navigate to "Security Alerts" tab
   - See alert: "test@test.com logged in from new device"
   - See details: Previous device vs New device, IPs, locations

### Test Login History

1. **Login as any user**
2. **Open Admin Panel** → "Login History"
3. **Verify you see:**
   - User email
   - IP address
   - Location (city, country)
   - Device info
   - Timestamp
   - Success status

---

## 🔍 API Endpoints (New)

### Login History

```
GET /api/v1/login-history/me          - User's own login history
GET /api/v1/login-history/me/stats    - User's login statistics
GET /api/v1/login-history              - All logins (admin only)
```

### Session Activity

```
GET /api/v1/session-activity/active/me       - User's active session
GET /api/v1/session-activity/history/me      - User's session history
GET /api/v1/session-activity/active          - All active sessions (admin)
GET /api/v1/session-activity/stats           - Session statistics (admin)
POST /api/v1/session-activity/:id/logout     - Force logout (admin)
POST /api/v1/session-activity/logout-all/:userId  - Logout all user sessions (admin)
```

### Security Alerts

```
GET /api/v1/security-alerts                - All alerts (admin)
GET /api/v1/security-alerts/unread         - Unread alerts (admin)
GET /api/v1/security-alerts/unread/count   - Unread count (admin)
GET /api/v1/security-alerts/stats          - Alert statistics (admin)
POST /api/v1/security-alerts/:id/read      - Mark as read (admin)
POST /api/v1/security-alerts/read-all      - Mark all as read (admin)
POST /api/v1/security-alerts/:id/dismiss   - Dismiss alert (admin)
```

### Session Validation

```
GET /api/v1/auth/session-status   - Check if current session is valid
```

---

## ✅ Verification Checklist

### Server

- [ ] Server running on 67.205.189.32
- [ ] Database migrated successfully (Neon PostgreSQL)
- [ ] PM2 showing "online" status
- [ ] Health check: `curl http://67.205.189.32:3000/api/v1/healthz`
- [ ] Super admin can login
- [ ] Firewall configured

### Client

- [ ] Client connects to new server (67.205.189.32)
- [ ] Uses different AppData folder
- [ ] Can be installed alongside old app
- [ ] Login works
- [ ] Session validation works
- [ ] Shows "logged out from another device" message

### Security Features

- [ ] Single session enforcement working
- [ ] Login history recorded
- [ ] Session activity tracked
- [ ] Security alerts generated
- [ ] Admin can force logout users
- [ ] Geolocation working

---

## 🚨 Troubleshooting

### Database Connection Error

```bash
# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
psql 'postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

### Server Not Starting

```bash
# Check logs
pm2 logs digital-storming-loadboard --lines 100

# Check port 3000
netstat -tulpn | grep 3000

# Restart
pm2 restart digital-storming-loadboard
```

### Client Can't Connect

1. Check `.env` has correct `API_BASE_URL`
2. Verify server is running: `pm2 status`
3. Test API: `curl http://67.205.189.32:3000/api/v1/healthz`
4. Check firewall allows port 3000

### Session Validation Not Working

1. Check client console (F12) for errors
2. Verify `/api/v1/auth/session-status` endpoint works
3. Check that token is being sent in headers

---

## 📝 Important Notes

1. **Old Production Unaffected:**
   - Old server (157.230.51.160) continues running
   - Old database remains untouched
   - Old client app (DAT One Client) still works

2. **Separate Systems:**
   - New server has its own database
   - New client uses different AppData folder
   - Both can run simultaneously

3. **Data Migration:**
   - If you want to migrate users from old system:
     - Export users from old database
     - Import into new database
     - Users will need to re-login on new client

---

## 🎉 Success!

Your new Digital Storming Loadboard V2 is now deployed with:

✅ Single session security
✅ Comprehensive login tracking
✅ Real-time admin notifications
✅ New server & database
✅ Separate from old production

**Next Steps:**
1. Install client on user machines
2. Configure DigitalOcean Spaces for session storage
3. Setup super admin DAT session
4. Monitor admin panel for security alerts

---

**Need Help?**
- Check server logs: `pm2 logs digital-storming-loadboard`
- Check client console: Press F12 in client app
- Review this guide: `NEW_SERVER_DEPLOYMENT_GUIDE.md`

