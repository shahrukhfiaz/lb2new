# 🚀 DEPLOY NOW - All Credentials Configured!
## Digital Storming Loadboard V2 - Ready for Production

---

## ✅ ALL CREDENTIALS CONFIGURED

### Server Access:
- **IP**: `67.205.189.32`
- **Root Password**: `FpLF-quVn5x52bK` ⚠️ Change after deployment

### Database:
- **Type**: Neon PostgreSQL
- **URL**: ✅ Configured in `Server/production.env`

### DigitalOcean Spaces:
- **Access Key**: `DO801A9KCTV9U2VCGQW4`
- **Secret Key**: `ivRsOzJX3jRn2vvH9ruCpRuYj2KknYBYseXIfLMLn5Y`
- **Bucket**: `ds-loadboard-sessions-v2` (create in Step 1)

### Squid Proxy:
- **Username**: `loadboard_proxy` ✅
- **Password**: `DS!Pr0xy#2025$Secur3` ✅
- **Port**: `3128`

### Super Admin:
- **Email**: `superadmin@digitalstorming.com`
- **Password**: `ChangeMeSuperSecure123!` ⚠️ Change after deployment

---

## 🎯 DEPLOYMENT STEPS (30 Minutes Total)

### ⏱️ Step 1: Create DigitalOcean Spaces Bucket (2 minutes)

1. Go to: https://cloud.digitalocean.com/spaces
2. Click **"Create Spaces Bucket"**
3. **Region**: New York 3 (NYC3)
4. **Bucket Name**: `ds-loadboard-sessions-v2`
5. **File Listing**: Private
6. Click **"Create Bucket"**

**✅ Done? Continue to Step 2**

---

### ⏱️ Step 2: Upload Code to Server (5 minutes)

**Option A - Git (Recommended):**

```bash
# On your local Windows machine (PowerShell)
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Initialize git
git init
git add .
git commit -m "Digital Storming Loadboard V2 - Production Ready"

# Push to your GitHub/GitLab (replace with your repo URL)
git remote add origin https://github.com/yourusername/digital-storming-v2.git
git push -u origin main

# Then on server
ssh root@67.205.189.32
cd /root
git clone https://github.com/yourusername/digital-storming-v2.git digital-storming-loadboard-v2
```

**Option B - Direct Upload (Faster):**

```powershell
# On Windows PowerShell
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Create archive (excluding node_modules)
$exclude = @('node_modules', 'release', 'release-new', '.git')
Get-ChildItem -Recurse | Where-Object {
    $item = $_
    -not ($exclude | Where-Object { $item.FullName -like "*\$_\*" })
} | Compress-Archive -DestinationPath digital-storming-v2.zip -Force

# Upload to server
scp digital-storming-v2.zip root@67.205.189.32:/root/

# On server
ssh root@67.205.189.32
cd /root
unzip digital-storming-v2.zip -d digital-storming-loadboard-v2
```

**✅ Code uploaded? Continue to Step 3**

---

### ⏱️ Step 3: Deploy Server (15 minutes - Automated)

```bash
# SSH to server (if not already connected)
ssh root@67.205.189.32

# Navigate to Server directory
cd /root/digital-storming-loadboard-v2/Server

# Make scripts executable
chmod +x deploy-new-server.sh
chmod +x install-squid-proxy.sh

# Run deployment script
./deploy-new-server.sh
```

**During deployment, you'll be prompted:**

```
Enter proxy username: loadboard_proxy
Enter proxy password: DS!Pr0xy#2025$Secur3
```

**The script will:**
- ✅ Install Node.js 18
- ✅ Install PM2
- ✅ Install PostgreSQL client
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Build application
- ✅ **Install Squid Proxy with authentication**
- ✅ Configure firewall
- ✅ Start application with PM2
- ✅ Verify deployment

**Expected output:**
```
==========================================
         DEPLOYMENT SUCCESSFUL!           
==========================================

✓ Server is running at: http://67.205.189.32:3000
✓ Admin Panel: http://67.205.189.32:3000
✓ API Base: http://67.205.189.32:3000/api/v1
```

**✅ Deployment successful? Continue to Step 4**

---

### ⏱️ Step 4: Verify Server (3 minutes)

```bash
# Still on server, run these tests:

# Test 1: Check PM2 status
pm2 status
# Should show: digital-storming-loadboard | online

# Test 2: Check Squid status
systemctl status squid
# Should show: active (running)

# Test 3: Test API
curl http://localhost:3000/api/v1/healthz
# Should return: {"status":"ok","timestamp":"..."}

# Test 4: Test Squid authentication
curl -x http://loadboard_proxy:DS!Pr0xy#2025$Secur3@localhost:3128 http://httpbin.org/ip
# Should return your proxy IP

# Test 5: View logs
pm2 logs digital-storming-loadboard --lines 20
# Should show no errors

# Test 6: Check proxy credentials file
cat /root/squid-proxy-credentials.txt
# Should show your proxy credentials
```

**All tests passed? Continue to Step 5**

---

### ⏱️ Step 5: Build Client (5 minutes)

```powershell
# On your local Windows machine (PowerShell)
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Copy production config
copy client-production.env .env

# Verify credentials are correct
type .env
# Should show:
# PROXY_USERNAME=loadboard_proxy
# PROXY_PASSWORD=DS!Pr0xy#2025$Secur3

# Install dependencies (if not already done)
npm install

# Build installer
npm run dist
```

**Build time:** ~5 minutes

**Installer location:**
```
release-new\Digital Storming Loadboard V2-1.0.0-Setup.exe
```

**✅ Client built? Continue to Step 6**

---

### ⏱️ Step 6: Test Everything (10 minutes)

**Test 1: Admin Panel**
1. Open browser: `http://67.205.189.32:3000`
2. Login:
   - Email: `superadmin@digitalstorming.com`
   - Password: `ChangeMeSuperSecure123!`
3. Should see admin dashboard
4. Check Users tab - should see super admin user

**✅ Admin panel works?**

**Test 2: Install & Test Client**
1. Run installer: `release-new\Digital Storming Loadboard V2-1.0.0-Setup.exe`
2. Launch application: "Digital Storming Loadboard V2"
3. Login:
   - Email: `superadmin@digitalstorming.com`
   - Password: `ChangeMeSuperSecure123!`
4. DAT window should open automatically
5. Press F12 → Network tab → Check proxy is being used

**✅ Client works and DAT opens?**

**Test 3: Squid Proxy**
1. In DAT window, check IP:
   - Go to: https://api.ipify.org
   - Should show server IP (67.205.189.32)
2. Verify authentication:
   - Proxy should be transparent (no login prompts)
   - Traffic routed through Squid

**✅ Proxy working?**

**Test 4: Single Session Security**
1. **Computer A**: Install and login as super admin
2. **Computer B**: Install and login with same credentials
3. **Computer A**: Should show "You have been logged out from another device"
4. **Computer A**: Should auto-logout after 3 seconds

**✅ Single session enforcement working?**

**Test 5: Login History**
```bash
# On server
ssh root@67.205.189.32

# Connect to database
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Query login history
SELECT email, "ipAddress", city, country, "loginAt" 
FROM "LoginHistory" 
ORDER BY "loginAt" DESC 
LIMIT 5;

# Exit
\q
```

**✅ Login history recorded?**

---

## 🎉 DEPLOYMENT COMPLETE!

If all tests passed, you now have:

✅ **Server running** at `67.205.189.32:3000`  
✅ **Squid Proxy** with authentication on port 3128  
✅ **Database** with security features  
✅ **Single session enforcement** working  
✅ **Login history tracking** active  
✅ **DAT session functionality** preserved  
✅ **Client application** built and ready  

---

## 🔐 IMPORTANT: Immediate Security Tasks

**Do these NOW (before distributing client):**

### 1. Change Root Password
```bash
ssh root@67.205.189.32
passwd
# Enter new secure password
```

### 2. Change Super Admin Password
1. Login to admin panel: `http://67.205.189.32:3000`
2. Go to Users tab
3. Click "Password" for super admin
4. Set new strong password

### 3. Rotate DigitalOcean Spaces Keys
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Spaces Keys → Delete old key
3. Generate new key
4. Update on server:
```bash
nano /root/digital-storming-loadboard-v2/Server/.env
# Update OBJECT_STORAGE_ACCESS_KEY and OBJECT_STORAGE_SECRET_KEY
pm2 restart digital-storming-loadboard
```

### 4. Generate New JWT Secrets
```bash
# On server
cd /root/digital-storming-loadboard-v2/Server

# Generate new secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"

# Update .env
nano .env
# Paste new secrets

# Restart
pm2 restart digital-storming-loadboard
```

**⚠️ Note:** Changing JWT secrets will log out all users. They'll need to re-login.

---

## 📊 Monitoring & Maintenance

### Check Server Health
```bash
# PM2 status
pm2 status

# View logs
pm2 logs digital-storming-loadboard

# Live monitoring
pm2 monit
```

### Check Squid Proxy
```bash
# Squid status
systemctl status squid

# Access logs (who's using proxy)
tail -f /var/log/squid/access.log

# Cache logs
tail -f /var/log/squid/cache.log
```

### Check Database
```bash
# Connect to database
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Check user count
SELECT COUNT(*) FROM "User";

# Check recent logins
SELECT email, "ipAddress", "loginAt" FROM "LoginHistory" ORDER BY "loginAt" DESC LIMIT 10;

# Check active sessions
SELECT u.email, s."ipAddress", s."loginAt" 
FROM "SessionActivity" s 
JOIN "User" u ON s."userId" = u.id 
WHERE s."isActive" = true;

# Exit
\q
```

---

## 🚨 Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs digital-storming-loadboard --lines 200

# Check environment
cat /root/digital-storming-loadboard-v2/Server/.env

# Restart
pm2 restart digital-storming-loadboard
```

### Squid Not Working
```bash
# Check status
systemctl status squid

# Check config
squid -k parse

# Restart
systemctl restart squid

# Test authentication
curl -x http://loadboard_proxy:DS!Pr0xy#2025$Secur3@localhost:3128 http://httpbin.org/ip
```

### Client Can't Connect
1. Check `.env` file has correct `API_BASE_URL`
2. Test API: `curl http://67.205.189.32:3000/api/v1/healthz`
3. Check firewall: `ufw status`
4. Rebuild client: `npm run dist`

---

## 📞 Quick Commands Reference

```bash
# SERVER MANAGEMENT
pm2 status                              # Check app status
pm2 restart digital-storming-loadboard  # Restart app
pm2 logs digital-storming-loadboard     # View logs
pm2 monit                               # Live monitoring

# SQUID PROXY
systemctl status squid                  # Check status
systemctl restart squid                 # Restart proxy
tail -f /var/log/squid/access.log       # View access logs
htpasswd /etc/squid/passwords newuser   # Add proxy user

# FIREWALL
ufw status                              # Check firewall
ufw allow 3000/tcp                      # Allow port

# DATABASE
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# SYSTEM
htop                                    # System resources
df -h                                   # Disk space
free -h                                 # Memory usage
```

---

## 🎯 Next Steps After Deployment

1. ✅ Complete security tasks (change passwords, rotate keys)
2. ✅ Test all features thoroughly
3. ✅ Create regular user accounts in admin panel
4. ✅ Distribute client installer to users
5. ✅ Set up automated backups
6. ✅ Monitor logs for issues
7. ✅ Document any custom configurations
8. ✅ Train users on new client

---

## 📝 Credentials Summary

**SAVE THIS SECURELY!**

```
========================================
DIGITAL STORMING LOADBOARD V2 - PRODUCTION
========================================

SERVER:
  IP:     67.205.189.32
  API:    http://67.205.189.32:3000/api/v1
  Admin:  http://67.205.189.32:3000

SQUID PROXY:
  Host:   67.205.189.32
  Port:   3128
  User:   loadboard_proxy
  Pass:   DS!Pr0xy#2025$Secur3

DATABASE:
  Type:   Neon PostgreSQL
  URL:    postgresql://neondb_owner:npg_qHPECT6yZgd7@...

SPACES:
  Bucket: ds-loadboard-sessions-v2
  Region: NYC3
  Key:    DO801A9KCTV9U2VCGQW4
  Secret: ivRsOzJX3jRn2vvH9ruCpRuYj2KknYBYseXIfLMLn5Y

SUPER ADMIN:
  Email:  superadmin@digitalstorming.com
  Pass:   ChangeMeSuperSecure123!

⚠️ CHANGE ALL PASSWORDS AFTER DEPLOYMENT!
========================================
```

---

## 🎉 YOU'RE READY TO DEPLOY!

Follow the 6 steps above in order. Total time: ~30 minutes.

**Start with Step 1:** Create DigitalOcean Spaces bucket

**Good luck! 🚀**

