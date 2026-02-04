# Server Credentials

## 🔐 All Server Credentials

### 1. **Proxy Server (Squid) Credentials**
- **Server IP**: 167.99.147.118
- **Port**: 3128
- **Username**: `loadboard_proxy`
- **Password**: `DS!Pr0xy#2025$Secur3`

**Usage in Electron Client:**
```
Proxy Server: 167.99.147.118:3128
Username: loadboard_proxy
Password: DS!Pr0xy#2025$Secur3
```

---

### 2. **Backend Server / Admin Panel Credentials**

#### Super Admin Account
Based on the server code (`src/server.ts`), the super admin is bootstrapped with:
- **Email**: `superadmin@digitalstorming.com`
- **Password**: `ChangeMeSuperSecure123!`

**Note**: The `.env` file shows different values, but the server code uses hardcoded values for bootstrap.

#### Admin Panel Access
- **URL**: http://167.99.147.118:3000
- **API Base URL**: http://167.99.147.118:3000/api/v1
- **Health Check**: http://167.99.147.118:3000/api/v1/healthz

---

### 3. **Server SSH Access**
- **IP**: 167.99.147.118
- **Username**: `root`
- **Password**: `Seahub123@`

---

### 4. **Database Credentials**
From `.env` file:
- **Database URL**: `postgresql://neondb_owner:npg_qHPECT6yZgd7@ep-tiny-bush-adfzrwq3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Database**: Neon PostgreSQL (managed service)

---

### 5. **Object Storage (DigitalOcean Spaces)**
- **Endpoint**: `https://nyc3.digitaloceanspaces.com`
- **Bucket**: `dat-commercial`
- **Region**: `nyc3`
- **Access Key**: `DO801ZAVMPFDHNG9XDTU`
- **Secret Key**: `NapH40U0SsSOOsmHVY5CsIUJr7JVsqDKTB8TzUAeLeE`

---

## 📝 Important Notes

1. **Super Admin Password**: The default password `ChangeMeSuperSecure123!` should be changed immediately after first login for security.

2. **Proxy Password**: Contains special characters (`!`, `#`, `$`). When using in scripts or URLs, ensure proper escaping.

3. **JWT Secrets**: Stored in `.env` file - these are automatically generated and should not be shared.

4. **Session Bundle Encryption Key**: Base64 encoded key stored in `.env` file.

---

## 🔄 How to Change Super Admin Password

1. Login to admin panel: http://167.99.147.118:3000
2. Use credentials: `superadmin@digitalstorming.com` / `ChangeMeSuperSecure123!`
3. Navigate to user management and change password

Or via API:
```bash
curl -X POST http://167.99.147.118:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@digitalstorming.com","password":"ChangeMeSuperSecure123!"}'
```

---

## 🛡️ Security Recommendations

1. ✅ Change default super admin password immediately
2. ✅ Use strong passwords for all accounts
3. ✅ Keep JWT secrets secure and rotate periodically
4. ✅ Monitor access logs regularly
5. ✅ Use HTTPS in production (currently HTTP)

