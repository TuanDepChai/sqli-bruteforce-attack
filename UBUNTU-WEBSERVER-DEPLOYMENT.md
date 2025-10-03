# Ubuntu Web Server Deployment Guide (192.168.205.100)

## 🎯 Overview
Deploy SQLi BruteForce Attack Detection Web Application on Ubuntu server with OSSEC integration.

## 🏗️ System Requirements
- **OS**: Ubuntu 20.04 LTS or later
- **RAM**: Minimum 2GB
- **Storage**: 10GB free space
- **Network**: Static IP 192.168.205.100
- **Ports**: 3000 (Web App), 1514 (OSSEC)

## 📋 Prerequisites Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Set Static IP (if needed)
```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

Add configuration:
```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.205.100/24
      gateway4: 192.168.205.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes:
```bash
sudo netplan apply
```

## 🚀 Automated Deployment

### Option 1: One-Command Deployment
```bash
# Download and run deployment script
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/ossecc-integration.sh | bash
```

### Option 2: Manual Deployment
```bash
# 1. Clone repository
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER /opt/sqli-bruteforce-attack
cd /opt/sqli-bruteforce-attack

# 2. Run deployment script
chmod +x scripts/ossecc-integration.sh
./scripts/ossecc-integration.sh
```

## 🔧 Manual Installation Steps

### 1. Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3
```

### 2. Install pnpm
```bash
npm install -g pnpm
```

### 3. Clone Project
```bash
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER /opt/sqli-bruteforce-attack
cd /opt/sqli-bruteforce-attack
```

### 4. Install Dependencies
```bash
pnpm install
npm rebuild better-sqlite3
```

### 5. Build Application
```bash
pnpm build
```

### 6. Create Systemd Service
```bash
sudo tee /etc/systemd/system/sqli-bruteforce.service << EOF
[Unit]
Description=SQLi BruteForce Attack Detection Web
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sqli-bruteforce-attack
ExecStart=/usr/bin/node /opt/sqli-bruteforce-attack/node_modules/.bin/next start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF
```

### 7. Setup Log Directories
```bash
sudo mkdir -p /var/log/sqli-bruteforce
sudo chown -R www-data:www-data /opt/sqli-bruteforce-attack/logs/
sudo chown -R www-data:www-data /var/log/sqli-bruteforce
sudo chmod -R 755 /opt/sqli-bruteforce-attack/logs/
```

### 8. Configure Log Rotation
```bash
sudo tee /etc/logrotate.d/sqli-bruteforce << EOF
/opt/sqli-bruteforce-attack/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    copytruncate
}
EOF
```

### 9. Configure Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 1514/tcp
sudo ufw --force enable
```

### 10. Start Application
```bash
sudo systemctl daemon-reload
sudo systemctl enable sqli-bruteforce
sudo systemctl start sqli-bruteforce
```

## 🛡️ OSSEC Agent Installation

### 1. Download and Install OSSEC
```bash
cd /tmp
wget https://github.com/ossec/ossec-hids/archive/refs/tags/3.7.0.tar.gz
tar -xzf 3.7.0.tar.gz
cd ossec-hids-3.7.0
```

### 2. Install OSSEC Agent
```bash
sudo ./install.sh
# Select: agent
# Enter OSSEC server IP: [YOUR_OSSEC_SERVER_IP]
# Select: y for all options
```

### 3. Configure Log Monitoring
```bash
sudo tee -a /var/ossec/etc/ossec.conf << EOF

<!-- SQLi BruteForce Attack Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/sql_injection.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/brute_force.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/critical-attacks.log</location>
</localfile>
EOF
```

### 4. Install Custom Rules
```bash
sudo cp /opt/sqli-bruteforce-attack/ossec-rules.xml /var/ossec/etc/rules/
sudo cp /opt/sqli-bruteforce-attack/ossec-decoder.xml /var/ossec/etc/decoders/
```

### 5. Start OSSEC Agent
```bash
sudo /var/ossec/bin/ossec-control start
```

## 🧪 Testing

### 1. Check Application Status
```bash
sudo systemctl status sqli-bruteforce
sudo netstat -tlnp | grep :3000
```

### 2. Run Attack Tests
```bash
cd /opt/sqli-bruteforce-attack
./test-attacks.sh
```

### 3. Check Logs
```bash
# Application logs
tail -f /opt/sqli-bruteforce-attack/logs/attacks.log

# OSSEC alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log
```

### 4. Test Web Interface
```bash
curl http://192.168.205.100:3000
```

## 📊 Log Format

The system generates logs in this format:
```
2025-10-03 11:09:42.177 +07:00 192.168.205.100 POST /api/login?username=admin&password=123 401 "Mozilla/5.0..." "Authentication failed - Invalid credentials" "-" "SESS_1234567890_abc123" "brute_force" "SELECT * FROM users WHERE username = 'admin' AND password = '123'" "http://localhost:3000/" "12ms" "58bytes" "{"content-type":"application/json"}"
```

## 🔍 Monitoring Commands

### Application Monitoring
```bash
# Check service status
sudo systemctl status sqli-bruteforce

# View application logs
sudo journalctl -u sqli-bruteforce -f

# Check port status
sudo netstat -tlnp | grep :3000
```

### OSSEC Monitoring
```bash
# Check OSSEC status
sudo /var/ossec/bin/ossec-control status

# View OSSEC alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log

# Check OSSEC agent info
sudo /var/ossec/bin/agent_control -l
```

### Log Analysis
```bash
# Count attack types
grep -o '"brute_force"\|"sql_injection"' /opt/sqli-bruteforce-attack/logs/attacks.log | sort | uniq -c

# Count status codes
grep -o '[0-9]\{3\}' /opt/sqli-bruteforce-attack/logs/attacks.log | sort | uniq -c

# Top source IPs
grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} [0-9]\{2\}:[0-9]\{2\}:[0-9]\{2\}\.[0-9]\{3\} [+-][0-9]\{2\}:[0-9]\{2\} \S\+' /opt/sqli-bruteforce-attack/logs/attacks.log | awk '{print $2}' | sort | uniq -c | sort -nr | head -10
```

## 🔧 Troubleshooting

### Application Issues
```bash
# Check application logs
sudo journalctl -u sqli-bruteforce -n 50

# Restart application
sudo systemctl restart sqli-bruteforce

# Check port conflicts
sudo lsof -i :3000
```

### OSSEC Issues
```bash
# Check OSSEC logs
sudo tail -f /var/ossec/logs/ossec.log

# Restart OSSEC
sudo /var/ossec/bin/ossec-control restart

# Check agent connection
sudo /var/ossec/bin/agent_control -l
```

### Database Issues
```bash
# Check database file
ls -la /opt/sqli-bruteforce-attack/vulnerable.db

# Rebuild database
cd /opt/sqli-bruteforce-attack
rm vulnerable.db
node -e "require('./lib/db').getDatabase()"
```

## 📈 Performance Tuning

### Application Optimization
```bash
# Increase Node.js memory limit
sudo nano /etc/systemd/system/sqli-bruteforce.service
# Add: Environment=NODE_OPTIONS="--max-old-space-size=2048"

# Enable log compression
sudo nano /etc/logrotate.d/sqli-bruteforce
# Ensure compress is enabled
```

### OSSEC Optimization
```bash
# Increase OSSEC memory
sudo nano /var/ossec/etc/internal_options.conf
# Add: memory_size=1024
```

## 🎯 Next Steps

1. **Configure OSSEC Server**: Set up OSSEC server to accept agent connections
2. **Test Attack Detection**: Run various attack scenarios
3. **Monitor Alerts**: Check OSSEC alerts for attack detection
4. **Fine-tune Rules**: Adjust OSSEC rules based on detection needs
5. **Setup SIEM Dashboard**: Configure OSSEC dashboard for visualization

## 📞 Support

- **Application Logs**: `/opt/sqli-bruteforce-attack/logs/`
- **OSSEC Logs**: `/var/ossec/logs/`
- **System Logs**: `sudo journalctl -u sqli-bruteforce`
- **Network Status**: `sudo netstat -tlnp | grep :3000`
