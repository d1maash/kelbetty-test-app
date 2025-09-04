#!/bin/bash

# Script for setting up VPS server for Kelbetty deployment
# Usage: ./scripts/setup-server.sh

set -e

echo "🚀 Setting up VPS server for Kelbetty..."

# Check if script is run as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root"
   exit 1
fi

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install necessary packages
echo "🔧 Installing necessary packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose (standalone)
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create deploy user (if needed)
echo "👤 Setting up user..."
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    echo "✅ Deploy user created"
else
    echo "✅ Deploy user already exists"
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /home/kelbetty-test-app
chown -R deploy:deploy /home/kelbetty-test-app

# Setup SSH keys for GitHub
echo "🔑 Setting up SSH for GitHub..."
if [[ ! -f /root/.ssh/id_rsa ]]; then
    echo "🔑 Generating SSH keys..."
    ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa -N ""
    echo "✅ SSH keys generated"
    echo ""
    echo "📋 Add this public key to GitHub:"
    echo "=========================================="
    cat /root/.ssh/id_rsa.pub
    echo "=========================================="
    echo ""
    echo "📋 And add this private key to GitHub Secrets as SERVER_SSH_KEY:"
    echo "=========================================="
    cat /root/.ssh/id_rsa
    echo "=========================================="
    echo ""
    read -p "Press Enter after adding keys to GitHub..."
else
    echo "✅ SSH keys already exist"
fi

# Setup SSH for GitHub
echo "🔧 Configuring SSH for GitHub..."
mkdir -p /root/.ssh
cat >> /root/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile /root/.ssh/id_rsa
    StrictHostKeyChecking no
EOF

# Clone repository
echo "📥 Cloning repository..."
cd /home/kelbetty-test-app
if [[ ! -d ".git" ]]; then
    echo "Enter your GitHub repository URL:"
    read -p "GitHub URL: " GITHUB_URL
    git clone $GITHUB_URL .
    echo "✅ Repository cloned"
else
    echo "✅ Repository already cloned"
fi

# Create environment files
echo "📝 Creating environment files..."
if [[ ! -f ".env.production" ]]; then
    cp env.production.example .env.production
    echo "✅ .env.production file created from example"
    echo "📝 Edit .env.production and add your real keys"
else
    echo "✅ .env.production file already exists"
fi

# Create directories for backups and logs
echo "📁 Creating directories..."
mkdir -p backups
mkdir -p logs
mkdir -p ssl

# Set up permissions
echo "🔐 Setting up permissions..."
chown -R deploy:deploy /home/kelbetty-test-app
chmod +x scripts/*.sh

# Setup firewall (optional)
echo "🔥 Setting up firewall..."
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    ufw --force enable
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not installed, configure firewall manually"
fi

# Create systemd service for auto-start (optional)
echo "⚙️ Creating systemd service..."
cat > /etc/systemd/system/kelbetty.service << EOF
[Unit]
Description=Kelbetty Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/kelbetty-test-app
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=deploy
Group=deploy

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kelbetty.service
echo "✅ Systemd service created and enabled"

# Create cron job for backups
echo "⏰ Setting up automatic backups..."
cat > /etc/cron.d/kelbetty-backup << EOF
# Automatic backup every day at 2:00 AM
0 2 * * * deploy cd /home/kelbetty-test-app && ./scripts/backup.sh production >> /var/log/kelbetty-backup.log 2>&1
EOF

echo "✅ Cron job for backups created"

# Final check
echo ""
echo "🎉 Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.production file with your keys"
echo "2. Add SERVER_IP to GitHub Secrets"
echo "3. Start application: docker-compose -f docker-compose.prod.yml up -d"
echo "4. Check operation: curl http://localhost/api/test"
echo ""
echo "🔧 Useful commands:"
echo "   systemctl start kelbetty    # Start application"
echo "   systemctl stop kelbetty     # Stop application"
echo "   systemctl status kelbetty   # Application status"
echo "   docker-compose logs -f      # View logs"
echo ""
echo "📊 Monitoring:"
echo "   docker stats                # Resource usage"
echo "   docker system df            # Disk usage"
echo "   tail -f /var/log/kelbetty-backup.log  # Backup logs"
echo ""
