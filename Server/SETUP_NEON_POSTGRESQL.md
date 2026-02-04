# Setup Guide: Neon PostgreSQL Database

This guide will walk you through creating a new Neon PostgreSQL database and connecting it to your server.

---

## 📋 Step 1: Create Neon Account

1. **Go to Neon Website**
   - Visit: https://neon.tech
   - Click **"Sign Up"** or **"Get Started"**

2. **Sign Up Options**
   - You can sign up with:
     - GitHub account (recommended - fastest)
     - Google account
     - Email address

3. **Complete Registration**
   - Follow the prompts to complete your account setup
   - Verify your email if required

---

## 🗄️ Step 2: Create a New Project

1. **Create Project**
   - After logging in, you'll see the Neon dashboard
   - Click **"Create Project"** button

2. **Project Configuration**
   - **Project Name**: `dat-loadboard` (or any name you prefer)
   - **Region**: Choose closest to your server
     - Recommended: `US East (Ohio)` or `US East (N. Virginia)` for server at `167.99.147.118`
   - **PostgreSQL Version**: `15` or `16` (latest stable - recommended)
   - **Compute Size**: 
     - **Free tier**: 0.5 vCPU, 1 GB RAM (good for testing)
     - **Launch**: 1 vCPU, 2 GB RAM (recommended for production)
   
3. **Click "Create Project"**
   - Wait 1-2 minutes for project creation

---

## 🔑 Step 3: Get Connection Details

1. **Find Connection String**
   - After project creation, you'll see the **"Connection Details"** panel
   - You'll see a connection string that looks like:
     ```
     postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

2. **Copy Connection String**
   - Click the **"Copy"** button next to the connection string
   - **IMPORTANT**: Save this securely - you'll need it!

3. **Alternative: Get Individual Details**
   - If you need individual components:
     - **Host**: `ep-xxxx-xxxx.us-east-2.aws.neon.tech`
     - **Database**: `neondb` (default)
     - **User**: (shown in connection string)
     - **Password**: (shown in connection string - copy it!)
     - **Port**: `5432` (default, or shown in connection string)

---

## 🔒 Step 4: Configure Database Access

1. **Check IP Restrictions** (if any)
   - Neon allows connections from anywhere by default
   - If you need to restrict access:
     - Go to **Project Settings** > **IP Allowlist**
     - Add your server IP: `167.99.147.118`

2. **Note Connection Pooling**
   - Neon provides two connection modes:
     - **Direct connection**: `ep-xxxx-xxxx.us-east-2.aws.neon.tech`
     - **Pooled connection**: `ep-xxxx-xxxx-pooler.us-east-2.aws.neon.tech`
   - **For this application, use the pooled connection** (better for serverless/server apps)
   - The connection string should include `-pooler` in the hostname

---

## ⚙️ Step 5: Update Server Configuration

### 1. SSH to Your Server
```bash
ssh root@167.99.147.118
# Password: Seahub123@
```

### 2. Navigate to Server Directory
```bash
cd /root/dat-loadboard/Server
```

### 3. Backup Current .env (Safety First!)
```bash
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### 4. Edit .env File
```bash
nano .env
```

### 5. Update DATABASE_URL
Find this line:
```env
DATABASE_URL=postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-adfzrwq3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Replace it with your NEW Neon connection string:
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@ep-xxxx-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Important Notes:**
- Use the **pooled connection** (with `-pooler` in hostname)
- Keep `?sslmode=require` at the end
- You can remove `&channel_binding=require` (not needed for Neon)

**Example:**
```env
DATABASE_URL=postgresql://myuser:mypassword@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 6. Save and Exit
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## 🚀 Step 6: Test Database Connection

### 1. Test Connection
```bash
cd /root/dat-loadboard/Server
npm run db:migrate
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-xxxx-xxxx-pooler.us-east-2.aws.neon.tech"

X migrations found in prisma/migrations

Applying migration `20251014225428_init`
Migration applied successfully
```

### 2. If Connection Fails
- Check connection string format
- Verify password is correct (no extra spaces)
- Ensure you're using pooled connection (`-pooler`)
- Check if SSL mode is correct

---

## 📊 Step 7: Run Database Migrations

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Run Migrations
```bash
npm run db:migrate
```

This will create all necessary tables:
- `User`
- `Proxy`
- `Domain`
- `DatSession`
- `DatSessionLog`
- `AuditLog`
- `LoginHistory`
- `SessionActivity`
- `SecurityAlert`

### 3. Verify Tables Created
You can check in Neon dashboard:
- Go to your project
- Click **"Tables"** tab
- You should see all the tables listed

---

## 🔄 Step 8: Restart Server

### 1. Restart PM2 Process
```bash
pm2 restart dat-loadboard-server --update-env
```

### 2. Check Logs
```bash
pm2 logs dat-loadboard-server --lines 50
```

**Look for:**
```
Database connection established
DAT Loadboard backend listening on port 3000
```

### 3. Verify Server is Running
```bash
pm2 status
curl http://localhost:3000/api/v1/healthz
```

---

## ✅ Step 9: Verify Everything Works

### 1. Test Health Endpoint
```bash
curl http://167.99.147.118:3000/api/v1/healthz
```

Should return:
```json
{"status":"ok","timestamp":"2026-02-03T...","uptime":...,"api":"v1"}
```

### 2. Test Database Connection
The server should automatically create the super admin user on startup. Check logs:
```bash
pm2 logs dat-loadboard-server | grep -i "super admin\|bootstrap"
```

### 3. Access Admin Panel
- Open browser: http://167.99.147.118:3000
- Login with:
  - Email: `superadmin@digitalstorming.com`
  - Password: `ChangeMeSuperSecure123!`

---

## 🔐 Step 10: Security Best Practices

### 1. Change Default Password
After first login, change the super admin password immediately!

### 2. Database Password Security
- Your Neon password is shown only once during creation
- If you lose it, you can reset it in Neon dashboard:
  - Go to **Project Settings** > **Reset Password**

### 3. Connection String Security
- Never commit `.env` file to git
- Keep connection string secure
- Use environment variables in production

### 4. Enable Database Backups
- Neon automatically backs up your database
- Check backup settings in **Project Settings** > **Backups**

---

## 📝 Connection String Format

Your Neon connection string should follow this format:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**With Pooling:**
```
postgresql://USERNAME:PASSWORD@ep-xxxx-xxxx-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require
```

**Example:**
```
postgresql://myuser:mypassword@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🆘 Troubleshooting

### Issue: "Connection timeout"
**Solution:**
- Check if you're using the pooled connection (`-pooler`)
- Verify the region matches your server location
- Check firewall/network settings

### Issue: "Authentication failed"
**Solution:**
- Verify username and password are correct
- Check for extra spaces in connection string
- Reset password in Neon dashboard if needed

### Issue: "Database does not exist"
**Solution:**
- Default database name is `neondb`
- Check database name in connection string
- Create database in Neon dashboard if needed

### Issue: "SSL connection required"
**Solution:**
- Ensure `?sslmode=require` is at the end of connection string
- Neon requires SSL connections

### Issue: Migration fails
**Solution:**
```bash
# Check Prisma connection
npm run db:generate

# Check migration status
npx prisma migrate status

# Reset if needed (WARNING: deletes all data!)
npx prisma migrate reset
```

---

## 💡 Neon-Specific Tips

1. **Free Tier Limits**
   - 0.5 GB storage
   - 0.5 vCPU
   - Good for development/testing
   - Upgrade to paid plan for production

2. **Connection Pooling**
   - Always use pooled connection for server applications
   - Better performance and connection management
   - Hostname includes `-pooler`

3. **Automatic Backups**
   - Neon automatically backs up your database
   - Point-in-time recovery available
   - Check backup settings in dashboard

4. **Branching Feature**
   - Neon supports database branching (like git)
   - Create branches for testing/staging
   - Useful for development workflows

5. **Monitoring**
   - Check database usage in Neon dashboard
   - Monitor connection count
   - Watch storage usage

---

## 📊 Quick Reference

### Neon Dashboard
- **URL**: https://console.neon.tech
- **Connection String**: Found in project dashboard
- **Settings**: Project Settings > Connection Details

### Server Commands
```bash
# Test connection
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Check migration status
npx prisma migrate status

# View database in Prisma Studio (optional)
npx prisma studio
```

### Important Files
- **.env**: Contains DATABASE_URL
- **prisma/schema.prisma**: Database schema
- **prisma/migrations/**: Migration files

---

## ✅ Checklist

- [ ] Created Neon account
- [ ] Created new project
- [ ] Copied connection string
- [ ] Updated `.env` file with new DATABASE_URL
- [ ] Tested connection (`npm run db:migrate`)
- [ ] Ran migrations successfully
- [ ] Restarted server (`pm2 restart dat-loadboard-server`)
- [ ] Verified server is running
- [ ] Tested health endpoint
- [ ] Changed default super admin password

---

## 🎉 You're Done!

Your server is now connected to a fresh Neon PostgreSQL database. The old production database is untouched and safe.

**Next Steps:**
1. Set up new object storage (see `SETUP_NEW_DATABASE_AND_STORAGE.md`)
2. Test the application thoroughly
3. Change default passwords
4. Set up monitoring

Need help? Check server logs: `pm2 logs dat-loadboard-server`

