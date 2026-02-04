#!/bin/bash
set -e

echo "=========================================="
echo "DAT Loadboard Complete Deployment"
echo "=========================================="

# Wait for apt to finish
echo "Waiting for apt processes to finish..."
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
    echo "  Waiting for apt lock..."
    sleep 5
done
echo "✓ Apt lock released"

# Install Node.js 18.x if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
    echo "✓ Node.js installed: $(node --version)"
else
    echo "✓ Node.js already installed: $(node --version)"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
    echo "✓ PM2 installed"
else
    echo "✓ PM2 already installed"
fi

# Install PostgreSQL client if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL client..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-client
    echo "✓ PostgreSQL client installed"
else
    echo "✓ PostgreSQL client already installed"
fi

# Install build tools if not installed
if ! command -v make &> /dev/null; then
    echo "Installing build tools..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential
    echo "✓ Build tools installed"
else
    echo "✓ Build tools already installed"
fi

# Navigate to Server directory
cd /root/dat-loadboard/Server

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    if [ -f production.env ]; then
        cp production.env .env
        echo "✓ .env created from production.env"
        echo "⚠️  IMPORTANT: Edit .env file with your actual credentials!"
    else
        cp env.example .env
        echo "✓ .env created from env.example"
        echo "⚠️  IMPORTANT: Edit .env file with your actual credentials!"
    fi
else
    echo "✓ .env file already exists"
fi

# Install dependencies
echo "Installing Node.js dependencies..."
npm install
echo "✓ Dependencies installed"

# Generate Prisma client
echo "Generating Prisma client..."
npm run db:generate
echo "✓ Prisma client generated"

# Run database migrations
echo "Running database migrations..."
npm run db:migrate || echo "⚠️  Migration failed - database may not be configured yet"
echo "✓ Migrations completed"

# Build TypeScript
echo "Building TypeScript..."
npm run build
echo "✓ TypeScript build completed"

# Configure firewall
echo "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp || true
    ufw allow 22/tcp || true
    echo "✓ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall configuration"
fi

# Stop existing PM2 process if running
echo "Stopping existing PM2 process..."
pm2 stop dat-loadboard-server || true
pm2 delete dat-loadboard-server || true

# Start with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup || true

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Server URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "Admin Panel: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "⚠️  IMPORTANT: Edit /root/dat-loadboard/Server/.env with your actual credentials!"
echo "   Then restart: pm2 restart dat-loadboard-server"
echo ""


