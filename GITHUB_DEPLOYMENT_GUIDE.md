# 🚀 GitHub Deployment Guide
## Push Server Code to dat-commercial Repository

---

## 📋 Repository Information

**Repository:** https://github.com/shahrukhfiaz/dat-commercial  
**Status:** Empty (ready for initial commit)  
**Visibility:** Public

---

## 🎯 Quick Push (Automated)

### Option 1: Using PowerShell (Recommended for Windows)

```powershell
.\PUSH_TO_GITHUB.ps1
```

### Option 2: Using Batch File

```cmd
PUSH_TO_GITHUB.bat
```

The scripts will:
1. ✅ Initialize Git in Server folder
2. ✅ Add remote repository
3. ✅ Stage all files
4. ✅ Create initial commit
5. ✅ Push to GitHub

---

## 🔧 Manual Push (Step-by-Step)

### Step 1: Navigate to Server Directory

```bash
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client\Server"
```

### Step 2: Initialize Git Repository

```bash
git init
```

### Step 3: Add Remote Repository

```bash
git remote add origin https://github.com/shahrukhfiaz/dat-commercial.git
```

### Step 4: Stage All Files

```bash
git add .
```

### Step 5: Create Initial Commit

```bash
git commit -m "Initial commit: DAT Commercial Server v1.0.0 - Production Ready

Features:
- User management with role-based access control
- Shared DAT session capture and distribution
- Login history tracking with geolocation
- Session activity monitoring
- Security alerts system
- Single session enforcement
- Admin panel with Login History, Active Sessions, Security Alerts
- High-performance Squid proxy configuration
- Automated deployment scripts
- PostgreSQL with Prisma ORM
- DigitalOcean Spaces / S3 integration
- JWT authentication
- Device fingerprinting
- Force logout capabilities

Ready for production deployment on Ubuntu/Debian servers."
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

**Note:** You'll be prompted for GitHub credentials. Use:
- Username: `shahrukhfiaz`
- Password: Your GitHub Personal Access Token (not your account password)

---

## 🔑 GitHub Authentication

### Creating Personal Access Token

If you don't have a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: `DAT Commercial Deploy`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

---

## 📦 What Will Be Uploaded

### Uploaded Files:
```
Server/
├── src/                          # ✅ All TypeScript source code
│   ├── config/                   # Configuration files
│   ├── controllers/              # API controllers
│   ├── db/                       # Database client
│   ├── jobs/                     # Background workers
│   ├── middleware/               # Express middleware
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   ├── utils/                    # Utilities
│   └── server.ts                 # Entry point
├── prisma/                       # ✅ Database schema & migrations
│   ├── migrations/
│   └── schema.prisma
├── public/                       # ✅ Admin panel
│   ├── admin.js
│   └── index.html
├── package.json                  # ✅ Dependencies
├── package-lock.json             # ✅ Lock file
├── tsconfig.json                 # ✅ TypeScript config
├── ecosystem.config.js           # ✅ PM2 config
├── deploy-new-server.sh          # ✅ Deployment script
├── install-squid-proxy.sh        # ✅ Proxy setup
├── env.example                   # ✅ Environment template
├── README_GITHUB.md              # ✅ Repository README
└── .gitignore                    # ✅ Git ignore rules
```

### Excluded Files (via .gitignore):
```
❌ node_modules/                  # Dependencies (reinstalled)
❌ dist/                          # Build output (rebuilt)
❌ logs/                          # Log files
❌ .env                           # Environment variables (SECURED)
❌ production.env                 # Production credentials (SECURED)
❌ *.log                          # Log files
```

**IMPORTANT:** `production.env` is **NOT** uploaded for security. You'll copy it manually to the server.

---

## 🔒 Security Considerations

### Files NOT Uploaded (Kept Secure):
1. ❌ `production.env` - Contains all credentials
2. ❌ `.env` - Local environment variables
3. ❌ `node_modules/` - Will be installed on server
4. ❌ `logs/` - Server-generated logs
5. ❌ `dist/` - Will be built on server

### What You'll Do on Server:
1. Clone the repo
2. Copy `production.env` separately (via SCP or manual)
3. Rename `production.env` to `.env`
4. Run deployment script

---

## 📝 After Pushing to GitHub

### Verify Upload:

1. Visit: https://github.com/shahrukhfiaz/dat-commercial
2. Check files are present:
   - ✅ `src/` folder with all TypeScript files
   - ✅ `prisma/` folder with schema
   - ✅ `public/` folder with admin panel
   - ✅ `README_GITHUB.md`
   - ✅ `package.json`
   - ✅ Deployment scripts

3. Verify `production.env` is **NOT** present (security)

---

## 🚀 Deploy from GitHub to Server

### Step 1: Create Spaces Bucket

```
URL: https://cloud.digitalocean.com/spaces
Name: ds-loadboard-sessions-v2
Region: NYC3
Access: Private
```

### Step 2: SSH to Server

```bash
ssh root@67.205.189.32
# Password: FpLF-quVn5x52bK
```

### Step 3: Clone Repository

```bash
cd /root
git clone https://github.com/shahrukhfiaz/dat-commercial.git
cd dat-commercial
```

### Step 4: Copy Environment File

**From your local machine:**

```bash
scp "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client\Server\production.env" root@67.205.189.32:/root/dat-commercial/.env
```

Or manually:
1. Copy content from `Server/production.env`
2. On server: `nano .env`
3. Paste content
4. Save (Ctrl+X, Y, Enter)

### Step 5: Run Deployment

```bash
chmod +x deploy-new-server.sh install-squid-proxy.sh
./deploy-new-server.sh

# When prompted for Squid credentials:
# Username: loadboard_proxy
# Password: DS!Pr0xy#2025$Secur3
```

### Step 6: Verify Deployment

```bash
# Check PM2
pm2 status

# Test API
curl http://localhost:3000/api/v1/healthz

# View logs
pm2 logs digital-storming-loadboard
```

---

## 🔄 Making Updates

### When you update code:

```bash
cd Server
git add .
git commit -m "Description of changes"
git push
```

### On server:

```bash
cd /root/dat-commercial
git pull
npm install          # If dependencies changed
npm run build
pm2 restart digital-storming-loadboard
```

---

## 📊 Repository Statistics

After push, your repo will contain:

- **Files:** ~50+ files
- **Directories:** 15+
- **Lines of Code:** ~8,000+
- **Languages:**
  - TypeScript (primary)
  - JavaScript (admin panel)
  - SQL (migrations)
  - Shell (deployment)
  - HTML (admin UI)

---

## ✅ Checklist

Before pushing:
- [x] .gitignore created
- [x] env.example created
- [x] README_GITHUB.md created
- [x] All source files ready
- [x] Deployment scripts executable
- [x] production.env excluded from Git

After pushing:
- [ ] Repository shows all files
- [ ] README displays correctly
- [ ] No sensitive data exposed
- [ ] Deployment scripts present
- [ ] Can clone successfully

---

## 🎯 Quick Commands Reference

### Push to GitHub:
```bash
cd Server
git init
git remote add origin https://github.com/shahrukhfiaz/dat-commercial.git
git add .
git commit -m "Initial commit: DAT Commercial Server v1.0.0"
git push -u origin main
```

### Clone on Server:
```bash
git clone https://github.com/shahrukhfiaz/dat-commercial.git
```

### Update on Server:
```bash
cd dat-commercial
git pull
npm install
npm run build
pm2 restart digital-storming-loadboard
```

---

## 🆘 Troubleshooting

### Issue: Authentication Failed

**Solution:** Use Personal Access Token instead of password
- Go to: https://github.com/settings/tokens
- Generate new token with `repo` scope
- Use token as password

### Issue: Repository Not Empty

**Solution:** Force push
```bash
git push -u origin main --force
```

### Issue: Remote Already Exists

**Solution:** Update remote
```bash
git remote remove origin
git remote add origin https://github.com/shahrukhfiaz/dat-commercial.git
```

---

## 📞 Quick Links

- **Repository:** https://github.com/shahrukhfiaz/dat-commercial
- **Your Profile:** https://github.com/shahrukhfiaz
- **Create Token:** https://github.com/settings/tokens
- **DigitalOcean Spaces:** https://cloud.digitalocean.com/spaces
- **Server IP:** 67.205.189.32

---

## 🎉 Success!

After pushing, your repository will be:
- ✅ Production ready
- ✅ Fully documented
- ✅ Easy to deploy
- ✅ Secure (no exposed credentials)
- ✅ Maintainable

**Ready to push?** Run `.\PUSH_TO_GITHUB.ps1`

---

**Last Updated:** Ready for deployment  
**Version:** 1.0.0  
**Status:** ✅ All files prepared

