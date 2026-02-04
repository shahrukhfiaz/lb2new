# Configuration Update Guide

This guide covers all configuration values that should be updated for a new deployment.

## ✅ Already Updated

1. **Database** - ✅ Updated to new Neon PostgreSQL
2. **Object Storage** - ✅ Updated to new DigitalOcean Spaces bucket

## 🔐 Security Configuration (Should Be Changed)

### 1. JWT Secrets (IMPORTANT!)

**Why change:** JWT secrets should be unique per deployment for security. If the old secrets are compromised, tokens from the old deployment won't work on the new one.

**Current values:**
- `JWT_ACCESS_SECRET`: (64+ character hex string)
- `JWT_REFRESH_SECRET`: (64+ character hex string)

**Action:** Generate new secrets and update `.env` file.

### 2. Session Bundle Encryption Key

**Why change:** This key encrypts session bundles. Should be unique per deployment.

**Current value:**
- `SESSION_BUNDLE_ENCRYPTION_KEY`: (base64 encoded 32-byte key)

**Action:** Generate new encryption key and update `.env` file.

### 3. Super Admin Password

**Why change:** Default password should be changed immediately after first login.

**Current value:**
- Email: `superadmin@digitalstorming.com`
- Password: `ChangeMeSuperSecure123!` (hardcoded in `server.ts`)

**Action:** Change password after first login via admin panel.

## 🌐 Network Configuration

### 4. CORS Origin

**Current value:**
```
CORS_ORIGIN=http://67.205.189.32:3000,http://localhost:3000,https://67.205.189.32
```

**Should be updated to:**
```
CORS_ORIGIN=http://167.99.147.118:3000,http://localhost:3000,https://167.99.147.118
```

**Why:** Allows the new server IP to accept CORS requests.

### 5. API Base URL

**Current value:**
```
API_BASE_URL=http://167.99.147.118:3000
```

**Status:** ✅ Already correct

## 📝 Optional Configuration

### 6. DAT Master Credentials

**Current values:**
- `DAT_MASTER_USERNAME`: (empty)
- `DAT_MASTER_PASSWORD`: (empty)

**Action:** Only needed if using session seeder. Can leave empty if not using.

### 7. Seeder Configuration

**Current values:**
- `SEEDER_PLAYWRIGHT_WS_ENDPOINT`: (empty)
- `SEEDER_API_TOKEN`: (empty)

**Action:** Only needed if using session seeder. Can leave empty if not using.

---

## 🔧 How to Update

### Step 1: Generate New Secrets

Run on server:
```bash
cd /root/dat-loadboard/Server
node -e "const crypto = require('crypto'); console.log('JWT_ACCESS_SECRET=' + crypto.randomBytes(64).toString('hex')); console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(64).toString('hex')); console.log('SESSION_BUNDLE_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('base64'));"
```

### Step 2: Update .env File

```bash
nano .env
```

Update these lines:
- `JWT_ACCESS_SECRET=` → New generated value
- `JWT_REFRESH_SECRET=` → New generated value
- `SESSION_BUNDLE_ENCRYPTION_KEY=` → New generated value
- `CORS_ORIGIN=` → Update to new server IP

### Step 3: Restart Server

```bash
pm2 restart dat-loadboard-server --update-env
```

---

## ⚠️ Important Notes

1. **JWT Secrets**: Changing JWT secrets will invalidate all existing tokens. Users will need to log in again.

2. **Session Bundle Encryption**: Changing the encryption key means you won't be able to decrypt old session bundles. Only change if you don't need to access old bundles.

3. **CORS**: Update CORS_ORIGIN to allow requests from your new server IP and any client applications.

4. **Super Admin**: The password is hardcoded in `server.ts`. To change it permanently, update the code or change it via admin panel after first login.

---

## ✅ Recommended Updates

**Must Update:**
- ✅ Database (already done)
- ✅ Object Storage (already done)
- 🔐 JWT Secrets (recommended for security)
- 🌐 CORS Origin (recommended for new server IP)

**Optional:**
- Session Bundle Encryption Key (only if you don't need old bundles)
- DAT Master Credentials (only if using seeder)

