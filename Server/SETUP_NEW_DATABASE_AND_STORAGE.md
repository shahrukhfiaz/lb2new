# Setup Guide: New Database and Object Storage

This guide will help you set up a **NEW** database and object storage for this server deployment, without affecting your existing production resources.

---

## 📊 Part 1: Setting Up a New Database

### Option A: DigitalOcean Managed PostgreSQL (Recommended)

1. **Create a Database Cluster**
   - Go to: https://cloud.digitalocean.com/databases
   - Click "Create Database Cluster"
   - Choose:
     - **Engine**: PostgreSQL
     - **Version**: 15 or 16 (latest stable)
     - **Datacenter Region**: Choose closest to your server (e.g., NYC3)
     - **Plan**: Basic ($15/month) or Production plan
   - Click "Create Database Cluster"

2. **Get Connection Details**
   - Wait for cluster creation (2-3 minutes)
   - Click on your database cluster
   - Go to "Connection Details" tab
   - You'll see:
     - **Host**: `your-db-name.db.ondigitalocean.com`
     - **Port**: `25060` (default)
     - **Database**: `defaultdb`
     - **User**: `doadmin`
     - **Password**: (shown once - copy it!)
     - **SSL Mode**: `require`

3. **Create Connection String**
   ```
   postgresql://doadmin:YOUR_PASSWORD@your-db-name.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```

4. **Configure Firewall** (Important!)
   - In database settings, go to "Trusted Sources"
   - Add your server IP: `167.99.147.118`
   - This allows your server to connect

---

### Option B: Local PostgreSQL on Server

If you prefer to install PostgreSQL directly on your server:

```bash
# SSH to server
ssh root@167.99.147.118

# Install PostgreSQL
apt update
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE dat_loadboard;
CREATE USER dat_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE dat_loadboard TO dat_user;
ALTER USER dat_user CREATEDB;
\q
EOF

# Connection string will be:
# postgresql://dat_user:YOUR_STRONG_PASSWORD_HERE@localhost:5432/dat_loadboard
```

---

### Option C: Other Cloud Providers

**Neon PostgreSQL** (Free tier available):
1. Go to: https://neon.tech
2. Sign up / Login
3. Create a new project
4. Copy the connection string

**Supabase** (Free tier available):
1. Go to: https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

**AWS RDS**:
1. Go to AWS Console > RDS
2. Create PostgreSQL instance
3. Configure security groups
4. Get connection details

---

## 💾 Part 2: Setting Up New Object Storage

### Option A: DigitalOcean Spaces (Recommended)

1. **Create a Space**
   - Go to: https://cloud.digitalocean.com/spaces
   - Click "Create a Space"
   - Choose:
     - **Name**: `dat-loadboard-new` (must be globally unique)
     - **Datacenter Region**: Same as your server (NYC3 recommended)
     - **File Listing**: Private (recommended for security)
   - Click "Create a Space"

2. **Get Access Keys**
   - Go to: https://cloud.digitalocean.com/account/api/spaces
   - Click "Generate New Key"
   - **Name**: `dat-loadboard-spaces-key`
   - Click "Generate Key"
   - **IMPORTANT**: Copy both keys immediately (you won't see them again!)
     - **Access Key**: `DO...` (starts with DO)
     - **Secret Key**: `...` (long string)

3. **Get Endpoint URL**
   - Go back to your Space
   - The endpoint will be: `https://nyc3.digitaloceanspaces.com` (or your region)
   - Your Space URL: `https://dat-loadboard-new.nyc3.digitaloceanspaces.com`

4. **Configure CORS** (if needed for direct browser uploads)
   - In Space settings > Settings tab
   - Add CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

---

### Option B: AWS S3

1. **Create S3 Bucket**
   - Go to AWS Console > S3
   - Click "Create bucket"
   - Name: `dat-loadboard-new` (globally unique)
   - Region: Choose closest to your server
   - Uncheck "Block all public access" if you need public access
   - Click "Create bucket"

2. **Create IAM User for Access**
   - Go to IAM > Users
   - Click "Add users"
   - Username: `dat-loadboard-s3-user`
   - Select "Programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

3. **Connection Details**
   - **Endpoint**: `https://s3.amazonaws.com` (or region-specific)
   - **Bucket**: `dat-loadboard-new`
   - **Region**: `us-east-1` (or your chosen region)
   - **Access Key**: (from IAM user)
   - **Secret Key**: (from IAM user)

---

### Option C: Other Object Storage

**Backblaze B2**:
1. Create account at https://www.backblaze.com/b2/cloud-storage.html
2. Create bucket
3. Create application key
4. Get endpoint and credentials

**Cloudflare R2**:
1. Go to Cloudflare Dashboard > R2
2. Create bucket
3. Create API token
4. Get credentials

---

## ⚙️ Part 3: Update Server Configuration

Once you have your new database and storage credentials:

### 1. SSH to Server
```bash
ssh root@167.99.147.118
```

### 2. Edit .env File
```bash
cd /root/dat-loadboard/Server
nano .env
```

### 3. Update Database Configuration
Replace the `DATABASE_URL` line with your new connection string:
```env
# OLD (DON'T USE):
# DATABASE_URL=postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-adfzrwq3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NEW (YOUR NEW DATABASE):
DATABASE_URL=postgresql://doadmin:YOUR_NEW_PASSWORD@your-new-db.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

### 4. Update Object Storage Configuration
Replace the object storage settings:
```env
# OLD (DON'T USE):
# OBJECT_STORAGE_ENDPOINT=https://nyc3.digitaloceanspaces.com
# OBJECT_STORAGE_BUCKET=dat-commercial
# OBJECT_STORAGE_ACCESS_KEY=DO801ZAVMPFDHNG9XDTU
# OBJECT_STORAGE_SECRET_KEY=NapH40U0SsSOOsmHVY5CsIUJr7JVsqDKTB8TzUAeLeE

# NEW (YOUR NEW STORAGE):
OBJECT_STORAGE_ENDPOINT=https://nyc3.digitaloceanspaces.com
OBJECT_STORAGE_BUCKET=dat-loadboard-new
OBJECT_STORAGE_ACCESS_KEY=YOUR_NEW_ACCESS_KEY
OBJECT_STORAGE_SECRET_KEY=YOUR_NEW_SECRET_KEY
OBJECT_STORAGE_REGION=nyc3
```

### 5. Save and Exit
- Press `Ctrl+X`
- Press `Y` to confirm
- Press `Enter` to save

### 6. Run Database Migrations
```bash
cd /root/dat-loadboard/Server
npm run db:migrate
```

This will create all the necessary tables in your new database.

### 7. Restart the Server
```bash
pm2 restart dat-loadboard-server
pm2 logs dat-loadboard-server
```

---

## ✅ Verification Steps

### Test Database Connection
```bash
cd /root/dat-loadboard/Server
npm run db:migrate
# Should show: "All migrations have been applied"
```

### Test Object Storage
```bash
cd /root/dat-loadboard/Server
node test-s3-from-app.js
# Should show success messages
```

### Check Server Logs
```bash
pm2 logs dat-loadboard-server --lines 50
# Should show: "Database connection established"
```

---

## 🔐 Security Checklist

- [ ] Database password is strong (16+ characters, mixed case, numbers, symbols)
- [ ] Object storage keys are securely stored
- [ ] Database firewall is configured (only allow your server IP)
- [ ] Object storage bucket is set to private (unless public access needed)
- [ ] `.env` file has correct permissions (640, owned by root)
- [ ] Old credentials are removed from `.env`
- [ ] Database backups are enabled (if using managed service)

---

## 📝 Quick Reference

### Database Connection String Format
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### Object Storage Configuration Template
```env
OBJECT_STORAGE_ENDPOINT=https://REGION.digitaloceanspaces.com
OBJECT_STORAGE_BUCKET=your-bucket-name
OBJECT_STORAGE_ACCESS_KEY=your-access-key
OBJECT_STORAGE_SECRET_KEY=your-secret-key
OBJECT_STORAGE_REGION=your-region
```

---

## 🆘 Troubleshooting

### Database Connection Issues
- Check firewall rules (server IP must be allowed)
- Verify connection string format
- Test connection: `psql "your-connection-string"`
- Check SSL mode requirements

### Object Storage Issues
- Verify endpoint URL format
- Check bucket name spelling
- Verify access keys are correct
- Test with: `aws s3 ls s3://your-bucket --endpoint-url=https://your-endpoint`

### Migration Issues
- Ensure database user has CREATE privileges
- Check if database exists
- Verify connection string is correct
- Check Prisma logs: `npm run db:migrate -- --verbose`

---

## 💡 Recommendations

1. **Use Managed Services**: DigitalOcean Managed PostgreSQL is easier than self-hosting
2. **Same Region**: Keep database and storage in the same region as your server for better performance
3. **Backup Strategy**: Enable automated backups for your database
4. **Monitoring**: Set up monitoring alerts for database and storage usage
5. **Cost Optimization**: Start with smaller plans and scale up as needed

---

Need help? Check the server logs: `pm2 logs dat-loadboard-server`

