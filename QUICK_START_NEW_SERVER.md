# Quick Start Guide - New Server Deployment
## Digital Storming Loadboard V2 (67.205.189.32)

---

## 🚀 Deploy Server in 5 Minutes

### 1. SSH to New Server
```bash
ssh root@67.205.189.32
```

### 2. Clone & Setup
```bash
# Clone repository
cd /root
git clone <your-repo-url> digital-storming-v2
cd digital-storming-v2/Server

# Copy environment configuration
cp NEW_SERVER_CONFIG.env .env

# Generate JWT secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"

# Edit .env and paste the secrets above
nano .env
```

### 3. Install & Migrate
```bash
# Install dependencies
npm install

# Run database migration
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Build
npm run build
```

### 4. Start Server
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup

# Check status
pm2 status
pm2 logs digital-storming-loadboard --lines 50
```

### 5. Test API
```bash
# Health check
curl http://67.205.189.32:3000/api/v1/healthz

# Should return: {"status":"ok","timestamp":"..."}
```

---

## 💻 Build Client

### Windows PowerShell:
```powershell
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Copy new server config
copy NEW_SERVER_CONFIG.env .env

# Install dependencies
npm install

# For testing
npm run dev

# For production installer
npm run dist

# Installer will be at:
# release-new\Digital Storming Loadboard V2-1.0.0-Setup.exe
```

---

## 🔐 Key Information

### New Server Details:
```
Server IP:    67.205.189.32
API Port:     3000
Proxy Port:   3128
API URL:      http://67.205.189.32:3000/api/v1
```

### New Database (Neon PostgreSQL):
```
Host:     ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech
Database: neondb
User:     neondb_owner
```

### Default Admin Credentials:
```
Email:    superadmin@digitalstorming.com
Password: ChangeMeSuperSecure123!
```
**⚠️ Change this in .env BEFORE deploying!**

---

## ✅ Verify Deployment

### Check Server:
```bash
# Server running?
pm2 status

# See logs
pm2 logs digital-storming-loadboard --lines 100

# Test API
curl http://67.205.189.32:3000/api/v1/healthz

# Test login
curl -X POST http://67.205.189.32:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@digitalstorming.com","password":"ChangeMeSuperSecure123!"}'
```

### Check Database:
```bash
# Connect to database
psql 'postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

# List tables
\dt

# Should see:
# LoginHistory, SessionActivity, SecurityAlert, User, Session, etc.

# Exit
\q
```

### Check Client:
1. Install `Digital Storming Loadboard V2-1.0.0-Setup.exe`
2. Run the application
3. Login with credentials
4. Verify DAT window opens
5. Check AppData folder: `%APPDATA%\digital-storming-loadboard-v2`

---

## 🧪 Test Single Session Feature

### Test 1: Multiple Device Login
1. **Computer A**: Login with `test@test.com`
2. **Computer B**: Login with same credentials
3. **Computer A**: Should show "logged out from another device"
4. **Computer A**: Should auto-logout after 3 seconds
5. **Computer B**: Remains logged in

### Test 2: Session Validation
1. Login on any computer
2. Wait 60 seconds
3. Check network tab (F12) - should see calls to `/auth/session-status`
4. Verify no unexpected logouts

### Test 3: Admin Panel
1. Login as super admin
2. Open admin panel: `http://67.205.189.32:3000`
3. Check for new API endpoints:
   - `GET /api/v1/login-history`
   - `GET /api/v1/session-activity/active`
   - `GET /api/v1/security-alerts`

---

## 📊 Database Schema

### New Tables Added:
- ✅ **LoginHistory** - All login attempts
- ✅ **SessionActivity** - Active sessions
- ✅ **SecurityAlert** - Security notifications

### User Table Updates:
- ✅ `currentSessionToken` - Active session tracking
- ✅ `lastLoginAt` - Last login timestamp
- ✅ `lastLoginIP` - Last login IP

---

## 🔍 Monitoring

### Check Server Health:
```bash
# Server status
pm2 status

# CPU & Memory usage
pm2 monit

# Real-time logs
pm2 logs digital-storming-loadboard --lines 100 --tail

# Restart if needed
pm2 restart digital-storming-loadboard
```

### Check Database:
```bash
# Connect
psql 'postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

# Count users
SELECT COUNT(*) FROM "User";

# View recent logins
SELECT email, "ipAddress", "loginAt" FROM "LoginHistory" ORDER BY "loginAt" DESC LIMIT 10;

# View active sessions
SELECT u.email, s."ipAddress", s."loginAt" FROM "SessionActivity" s JOIN "User" u ON s."userId" = u.id WHERE s."isActive" = true;
```

---

## 🚨 Troubleshooting

### Server Won't Start:
```bash
# Check logs
pm2 logs digital-storming-loadboard --lines 200

# Common issues:
# 1. Port 3000 already in use
netstat -tulpn | grep 3000

# 2. Database connection failed
# Verify DATABASE_URL in .env

# 3. Missing dependencies
npm install
```

### Client Can't Connect:
1. **Check .env file:**
   - Verify `API_BASE_URL=http://67.205.189.32:3000/api/v1`
   
2. **Test API from browser:**
   - Open: `http://67.205.189.32:3000/api/v1/healthz`
   - Should see: `{"status":"ok"}`

3. **Check firewall:**
   ```bash
   # On server
   ufw status
   ufw allow 3000/tcp
   ```

### Migration Errors:
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset --force

# Or apply migrations manually
npx prisma migrate deploy
```

---

## 📝 Important Notes

### ⚠️ This is a NEW System:
- **Separate server** (67.205.189.32)
- **Separate database** (Neon PostgreSQL)
- **Separate client** (Digital Storming Loadboard V2)
- **Does NOT affect** old production (157.230.51.160)

### ✅ Both Apps Can Run:
- Old: `DAT One Client` → `%APPDATA%\dat-one-client`
- New: `Digital Storming Loadboard V2` → `%APPDATA%\digital-storming-loadboard-v2`

### 🔒 New Security Features:
- Single active session per user
- Login history tracking
- Device fingerprinting
- Real-time session validation
- Admin force logout capability

---

## 📞 Need Help?

1. **Server logs:** `pm2 logs digital-storming-loadboard`
2. **Client logs:** Press F12 in app, check Console
3. **Deployment guide:** `NEW_SERVER_DEPLOYMENT_GUIDE.md`
4. **Implementation details:** `IMPLEMENTATION_SUMMARY.md`
5. **Full plan:** `single-session.plan.md`

---

## 🎉 You're Done!

Your new Digital Storming Loadboard V2 is now running with:
- ✅ Single session security
- ✅ Login tracking
- ✅ Device fingerprinting
- ✅ Session validation
- ✅ Completely separate from old system

**Next:** Deploy to users and monitor admin panel for activity!

