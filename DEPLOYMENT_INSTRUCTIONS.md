# 🚀 Deployment Instructions - Step by Step
## Digital Storming Loadboard V2 (67.205.189.32)

---

## ⚠️ IMPORTANT SECURITY NOTICE

Your credentials have been exposed in our chat. After deployment, please:
1. **Change root password**: `ssh root@67.205.189.32 && passwd`
2. **Rotate DigitalOcean Spaces keys**: https://cloud.digitalocean.com/account/api/tokens
3. **Change super admin password** in the admin panel

---

## 📋 Prerequisites Checklist

✅ Server IP: `67.205.189.32`  
✅ Root Password: `FpLF-quVn5x52bK` ⚠️ (CHANGE AFTER DEPLOYMENT)  
✅ Database URL: Already configured in `production.env`  
✅ DigitalOcean Spaces:
   - Access Key: `DO801A9KCTV9U2VCGQW4`
   - Secret Key: `ivRsOzJX3jRn2vvH9ruCpRuYj2KknYBYseXIfLMLn5Y`
   - Bucket: `ds-loadboard-sessions-v2` (needs to be created)

---

## 🔧 PART 1: Server Deployment

### Step 1: Create DigitalOcean Spaces Bucket

1. Go to: https://cloud.digitalocean.com/spaces
2. Click **"Create"** → **"Spaces Bucket"**
3. **Region**: New York 3 (NYC3)
4. **Bucket Name**: `ds-loadboard-sessions-v2`
5. **File Listing**: Private (recommended)
6. Click **"Create Bucket"**

✅ **Bucket created successfully!**

---

### Step 2: Upload Code to Server

**Option A - Using Git (Recommended):**

```bash
# On your local machine
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Initialize git if not already
git init
git add .
git commit -m "Digital Storming Loadboard V2"

# Push to your repository (GitHub, GitLab, etc.)
git remote add origin <your-repo-url>
git push -u origin main
```

Then on the server:
```bash
ssh root@67.205.189.32
cd /root
git clone <your-repo-url> digital-storming-loadboard-v2
```

**Option B - Using SCP (Alternative):**

```powershell
# On your local machine (PowerShell)
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Create a zip of the Server folder
Compress-Archive -Path Server -DestinationPath server-code.zip

# Upload to server
scp server-code.zip root@67.205.189.32:/root/
```

Then on the server:
```bash
ssh root@67.205.189.32
cd /root
unzip server-code.zip
mv Server digital-storming-loadboard-v2/Server
```

---

### Step 3: SSH to Server

```bash
ssh root@67.205.189.32
# Password: FpLF-quVn5x52bK
```

---

### Step 4: Run Automated Deployment Script

```bash
# Navigate to Server directory
cd /root/digital-storming-loadboard-v2/Server

# Make deployment script executable
chmod +x deploy-new-server.sh

# Run deployment script
./deploy-new-server.sh
```

The script will automatically:
- ✅ Update system packages
- ✅ Install Node.js 18
- ✅ Install PM2
- ✅ Install PostgreSQL client
- ✅ Setup application directory
- ✅ Install dependencies
- ✅ Setup environment file
- ✅ Generate Prisma Client
- ✅ Run database migrations
- ✅ Build application
- ✅ Configure firewall
- ✅ Start application with PM2
- ✅ Setup auto-start on reboot
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

---

### Step 5: Manual Deployment (If Script Fails)

If the automated script doesn't work, run these commands manually:

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Install PM2
npm install -g pm2

# 4. Navigate to app directory
cd /root/digital-storming-loadboard-v2/Server

# 5. Setup environment
cp production.env .env

# 6. Install dependencies
npm install

# 7. Generate Prisma Client
npx prisma generate

# 8. Run migrations
npx prisma migrate deploy

# 9. Build application
npm run build

# 10. Configure firewall
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3128/tcp

# 11. Start with PM2
pm2 start ecosystem.config.js --env production --name digital-storming-loadboard

# 12. Save PM2 config
pm2 save

# 13. Setup auto-start
pm2 startup
```

---

### Step 6: Verify Server Deployment

```bash
# Check PM2 status
pm2 status

# Should show:
# │ digital-storming-loadboard │ online │

# Check logs
pm2 logs digital-storming-loadboard --lines 50

# Test health endpoint
curl http://localhost:3000/api/v1/healthz

# Should return: {"status":"ok","timestamp":"..."}

# Test from external
curl http://67.205.189.32:3000/api/v1/healthz
```

---

### Step 7: Test Admin Panel Login

1. Open browser: `http://67.205.189.32:3000`
2. Login with:
   - Email: `superadmin@digitalstorming.com`
   - Password: `ChangeMeSuperSecure123!`
3. Should see admin dashboard

✅ **Server deployment complete!**

---

## 💻 PART 2: Client Deployment

### Step 1: Setup Client Environment

```powershell
# On your local Windows machine
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

# Copy production environment file
copy client-production.env .env

# Verify .env contents
type .env
```

Should show:
```
API_BASE_URL=http://67.205.189.32:3000/api/v1
CLOUD_SERVER_IP=67.205.189.32
...
```

---

### Step 2: Install Dependencies

```powershell
# Install all dependencies including new ones (macaddress, node-machine-id)
npm install
```

---

### Step 3: Build Installer

```powershell
# Build production installer
npm run dist

# This will take a few minutes...
```

**Installer location:**
```
release-new\Digital Storming Loadboard V2-1.0.0-Setup.exe
```

---

### Step 4: Test Client

1. Run the installer: `release-new\Digital Storming Loadboard V2-1.0.0-Setup.exe`
2. Install the application
3. Launch "Digital Storming Loadboard V2"
4. Login with:
   - Email: `superadmin@digitalstorming.com`
   - Password: `ChangeMeSuperSecure123!`
5. DAT window should open automatically

✅ **Client deployment complete!**

---

## 🧪 PART 3: Testing

### Test 1: Server Health

```bash
# SSH to server
ssh root@67.205.189.32

# Check PM2 status
pm2 status

# Check logs
pm2 logs digital-storming-loadboard --lines 100

# Test API
curl http://67.205.189.32:3000/api/v1/healthz
```

---

### Test 2: Single Session Enforcement

**Computer A:**
1. Install client
2. Login with: `test@test.com` / `test123`
3. Note: DAT window opens

**Computer B:**
1. Install client  
2. Login with: `test@test.com` / `test123` (same credentials)
3. Note: Login successful

**Computer A:**
- Should see: "You have been logged out because you logged in from another device"
- Should auto-logout after 3 seconds

✅ **Single session working!**

---

### Test 3: Login History

```bash
# SSH to server
ssh root@67.205.189.32

# Connect to database
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Query login history
SELECT email, "ipAddress", city, country, "loginAt" 
FROM "LoginHistory" 
ORDER BY "loginAt" DESC 
LIMIT 10;

# Exit
\q
```

Should show login records with IP, location, and timestamp.

---

### Test 4: Session Activity

```bash
# View active sessions
curl -H "Authorization: Bearer <admin-token>" \
  http://67.205.189.32:3000/api/v1/session-activity/active
```

Should show currently logged-in users.

---

### Test 5: DAT Functionality (Most Important!)

1. Login as super admin
2. Verify DAT opens automatically
3. Check DAT session is pre-configured (no login required)
4. Try opening multiple DAT windows (click + button)
5. Create a regular user and test their login
6. Regular user should get the same DAT session

✅ **DAT functionality preserved!**

---

## 📊 Monitoring Commands

### Server Monitoring:

```bash
# PM2 dashboard
pm2 monit

# View logs in real-time
pm2 logs digital-storming-loadboard

# Server resources
htop

# Disk space
df -h

# Database size
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT pg_size_pretty(pg_database_size('neondb'));"
```

### Application Management:

```bash
# Restart application
pm2 restart digital-storming-loadboard

# Stop application
pm2 stop digital-storming-loadboard

# View environment variables
pm2 env digital-storming-loadboard

# Update code and restart
cd /root/digital-storming-loadboard-v2/Server
git pull
npm install
npm run build
pm2 restart digital-storming-loadboard
```

---

## 🔧 Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs digital-storming-loadboard --lines 200

# Common issues:
# 1. Port 3000 in use
netstat -tulpn | grep 3000

# 2. Database connection failed
psql "postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-a012rwq3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT 1;"

# 3. Missing environment variables
cat .env

# 4. Prisma Client not generated
npx prisma generate
```

---

### Client Can't Connect

1. **Check .env file:**
   ```powershell
   type .env
   ```
   Verify `API_BASE_URL=http://67.205.189.32:3000/api/v1`

2. **Test API from browser:**
   Open: `http://67.205.189.32:3000/api/v1/healthz`

3. **Check firewall:**
   ```bash
   ufw status
   ufw allow 3000/tcp
   ```

4. **Rebuild client:**
   ```powershell
   npm run dist
   ```

---

### Database Migration Failed

```bash
# Reset database (CAUTION: Deletes all data!)
npx prisma migrate reset --force

# Or manually apply migrations
npx prisma migrate deploy

# Or create new migration
npx prisma migrate dev --name init
```

---

## 🔐 Security Hardening (After Deployment)

### 1. Change Root Password

```bash
ssh root@67.205.189.32
passwd
# Enter new secure password
```

---

### 2. Rotate DigitalOcean Spaces Keys

1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click on "Spaces Keys"
3. Delete old key: `DO801A9KCTV9U2VCGQW4`
4. Create new key
5. Update `.env` on server with new keys:
   ```bash
   nano /root/digital-storming-loadboard-v2/Server/.env
   # Update OBJECT_STORAGE_ACCESS_KEY and OBJECT_STORAGE_SECRET_KEY
   pm2 restart digital-storming-loadboard
   ```

---

### 3. Change Super Admin Password

1. Login to admin panel: `http://67.205.189.32:3000`
2. Go to Users tab
3. Find `superadmin@digitalstorming.com`
4. Click "Password" button
5. Set new strong password

---

### 4. Generate New JWT Secrets

```bash
# SSH to server
ssh root@67.205.189.32

# Generate new secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"

# Update .env
nano /root/digital-storming-loadboard-v2/Server/.env
# Paste new secrets

# Restart
pm2 restart digital-storming-loadboard
```

**Note:** This will log out all users. They'll need to login again.

---

### 5. Setup SSH Key Authentication

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id root@67.205.189.32

# Test SSH key login
ssh root@67.205.189.32

# Disable password authentication (optional - DANGEROUS!)
# Only do this after confirming SSH key works!
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

---

## ✅ Deployment Checklist

### Server Setup:
- [ ] DigitalOcean Spaces bucket created (`ds-loadboard-sessions-v2`)
- [ ] Code uploaded to server
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Application built
- [ ] PM2 running and auto-start configured
- [ ] Firewall configured
- [ ] Health check passes
- [ ] Admin panel accessible

### Client Setup:
- [ ] Environment file configured
- [ ] Dependencies installed
- [ ] Installer built
- [ ] Client can connect to server
- [ ] Login works
- [ ] DAT session opens

### Security:
- [ ] Root password changed
- [ ] DigitalOcean Spaces keys rotated
- [ ] Super admin password changed
- [ ] JWT secrets regenerated
- [ ] SSH key authentication setup (optional)

### Testing:
- [ ] Single session enforcement works
- [ ] Login history recorded
- [ ] Session activity tracked
- [ ] DAT functionality preserved
- [ ] Multiple DAT windows work
- [ ] Session sharing works

---

## 📞 Quick Reference

### Important URLs:
- **Server**: `http://67.205.189.32:3000`
- **Admin Panel**: `http://67.205.189.32:3000`
- **API**: `http://67.205.189.32:3000/api/v1`
- **Health Check**: `http://67.205.189.32:3000/api/v1/healthz`

### Default Credentials:
- **Email**: `superadmin@digitalstorming.com`
- **Password**: `ChangeMeSuperSecure123!` ⚠️ CHANGE THIS!

### Server Commands:
```bash
pm2 status                              # Check status
pm2 logs digital-storming-loadboard     # View logs
pm2 restart digital-storming-loadboard  # Restart
pm2 monit                               # Live monitoring
```

### File Locations:
- **Server Code**: `/root/digital-storming-loadboard-v2/Server/`
- **Environment**: `/root/digital-storming-loadboard-v2/Server/.env`
- **Logs**: `~/.pm2/logs/`
- **Client AppData**: `%APPDATA%\digital-storming-loadboard-v2`

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ Server running at `67.205.189.32:3000`  
✅ Single session security active  
✅ Login history tracking  
✅ Device fingerprinting  
✅ Admin panel with user management  
✅ DAT session functionality preserved  
✅ Completely separate from old production  

**Congratulations! 🚀**

