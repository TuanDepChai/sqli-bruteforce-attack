# 🐧 Ubuntu Setup Guide

## Quick Installation

### One-Command Setup
```bash
curl -fsSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/setup.sh | bash
```

### Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Start application
npm run dev
```

## What the Setup Script Does

### 📦 Installs Required Packages
- **Node.js** (LTS version)
- **MongoDB** (7.0)
- **Git**
- **Build tools** (gcc, make, etc.)

### 🔧 Configures System
- Creates MongoDB database
- Sets up environment variables
- Creates logs directory
- Configures systemd service

### 🚀 Starts Services
- MongoDB service
- Application service
- Real-time logging

## Server Deployment

### Production Server Setup
```bash
chmod +x ubuntu-server-setup.sh
./ubuntu-server-setup.sh
```

### What Server Setup Includes
- **Nginx** reverse proxy
- **SSL/TLS** configuration
- **Firewall** setup (UFW)
- **Systemd** service
- **Auto-start** on boot

## Access Information

### Local Development
- **URL**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Help**: http://localhost:3000/help

### Server Deployment
- **URL**: http://YOUR_SERVER_IP
- **Admin**: http://YOUR_SERVER_IP/admin

### Default Credentials
- **Username**: `admin`
- **Password**: `Admin123!@#`

## Service Management

### Check Status
```bash
sudo systemctl status sqli-bruteforce
sudo systemctl status mongod
sudo systemctl status nginx
```

### Start/Stop Services
```bash
# Start
sudo systemctl start sqli-bruteforce
sudo systemctl start mongod

# Stop
sudo systemctl stop sqli-bruteforce
sudo systemctl stop mongod

# Restart
sudo systemctl restart sqli-bruteforce
```

### View Logs
```bash
# Application logs
sudo journalctl -u sqli-bruteforce -f

# Attack logs
tail -f logs/attacks.log

# MongoDB logs
sudo journalctl -u mongod -f
```

## Troubleshooting

### MongoDB Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

### Application Issues
```bash
# Check application status
sudo systemctl status sqli-bruteforce

# View application logs
sudo journalctl -u sqli-bruteforce -f

# Restart application
sudo systemctl restart sqli-bruteforce
```

### Port Issues
```bash
# Check if ports are in use
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :27017

# Kill processes using ports
sudo fuser -k 3000/tcp
sudo fuser -k 27017/tcp
```

### Permission Issues
```bash
# Fix log directory permissions
sudo chown -R $USER:$USER logs/
chmod 755 logs/
```

## Security Notes

⚠️ **Important**: This application is intentionally vulnerable for educational purposes only!

- Do not deploy to production with real data
- Use only in isolated training environments
- Monitor all network traffic
- Keep the system updated

## Support

If you encounter any issues:

1. Check the logs: `sudo journalctl -u sqli-bruteforce -f`
2. Verify all services are running: `sudo systemctl status sqli-bruteforce mongod`
3. Check MongoDB connection: `npm run setup-db`
4. Restart services: `sudo systemctl restart sqli-bruteforce mongod`

## Features

### Real-time Monitoring
- Live attack detection
- Real-time statistics
- Advanced analytics
- AI-powered insights

### Attack Types
- SQL Injection
- Brute Force
- Credential Stuffing
- Dictionary Attacks

### Logging
- All attacks logged to `logs/attacks.log`
- Real-time file monitoring
- JSON format for easy parsing
- Vietnam timezone timestamps
