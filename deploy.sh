#!/bin/bash

# Configuration
SERVER_USER="ubuntu"
# Replace with your server IP or set via argument: ./deploy.sh 1.2.3.4
SERVER_IP="$1" 
SSH_KEY_PATH="$2" # Optional: ./deploy.sh 1.2.3.4 /path/to/key.pem

if [ -z "$SERVER_IP" ]; then
  echo "Usage: ./deploy.sh <SERVER_IP> [SSH_KEY_PATH]"
  exit 1
fi

SSH_CMD="ssh"
if [ ! -z "$SSH_KEY_PATH" ]; then
  SSH_CMD="ssh -i $SSH_KEY_PATH"
fi

echo "🚀 Deploying to $SERVER_IP..."

# 1. Archive project
echo "📦 Archiving project..."
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='dist-worker' --exclude='dist' -czf deploy_package.tar.gz .

# 2. Upload
echo "CcUploading package..."
if [ ! -z "$SSH_KEY_PATH" ]; then
    scp -i "$SSH_KEY_PATH" deploy_package.tar.gz "$SERVER_USER@$SERVER_IP:~/"
else
    scp deploy_package.tar.gz "$SERVER_USER@$SERVER_IP:~/"
fi

# 3. Remote Setup & Launch
echo "🛠️ Configuring remote server..."
$SSH_CMD "$SERVER_USER@$SERVER_IP" << 'EOF'
    # Setup directory
    mkdir -p aircaps-deploy
    mv deploy_package.tar.gz aircaps-deploy/
    cd aircaps-deploy
    tar -xzf deploy_package.tar.gz
    rm deploy_package.tar.gz

    # Install Docker if missing
    if ! command -v docker &> /dev/null; then
        echo "Docker not found. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
    fi

    # Prune to ensure space (optional)
    # docker system prune -a -f --volumes

    # Start
    echo "Starting services..."
    # Note: We assume .env is handled manually or already exists. 
    # If starting fresh, you might need to copy .env separately.
    
    # Try using sudo if user permissions aren't fully active in this session
    sudo docker compose down
    sudo docker compose up --build -d
EOF

# Cleanup local
rm deploy_package.tar.gz

echo "✅ Deployment trigger complete! Check logs on server."
