# Fix Server Directory Structure

## Issue
The deployment script expects: `/root/digital-storming-loadboard-v2/Server`
But your code is at: `/root/dat-commercial`

## Quick Fix

Run these commands on your server:

```bash
# 1. Create the expected directory structure
cd /root
mkdir -p digital-storming-loadboard-v2

# 2. Move the repository to the correct location
mv dat-commercial digital-storming-loadboard-v2/Server

# 3. Verify the structure
ls -la digital-storming-loadboard-v2/Server/

# 4. You should see:
# - src/
# - prisma/
# - public/
# - package.json
# - deploy-new-server.sh
# - etc.

# 5. Now copy your .env file
# (From your PC, run this in a NEW terminal):
scp "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client\Server\production.env" root@67.205.189.32:/root/digital-storming-loadboard-v2/Server/.env

# 6. Back on server - Run deployment again
cd /root/digital-storming-loadboard-v2/Server
chmod +x deploy-new-server.sh install-squid-proxy.sh
./deploy-new-server.sh
```

## Alternative: Use Current Location

If you prefer to keep it at `/root/dat-commercial`, just run deployment from there:

```bash
cd /root/dat-commercial

# Copy .env
# (From your PC):
scp "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client\Server\production.env" root@67.205.189.32:/root/dat-commercial/.env

# Run deployment
chmod +x deploy-new-server.sh install-squid-proxy.sh
./deploy-new-server.sh
```

The script will work from any location once you run it from the correct directory.

