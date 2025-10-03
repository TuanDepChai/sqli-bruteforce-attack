# Ubuntu Web Server Deployment Guide (192.168.205.100)

## 🎯 Overview
Deploy SQLi BruteForce Attack Detection Web Application on Ubuntu server with Wazuh log collection.

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
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/web-server-deployment.sh | bash
```

### Option 2: Manual Deployment
```bash
# 1. Clone repository
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER /opt/sqli-bruteforce-attack
cd /opt/sqli-bruteforce-attack

# 2. Run deployment script
chmod +x scripts/web-server-deployment.sh
./scripts/web-server-deployment.sh
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

## 🛡️ Wazuh Agent Configuration

### Prerequisites
- Wazuh agent is already installed on the system

### 1. Configure Log Monitoring
Add the following configuration to your Wazuh agent configuration file:

```bash
# Edit Wazuh agent configuration
sudo nano /var/ossec/etc/ossec.conf

# Add these lines:
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

<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/security-events.log</location>
</localfile>
```

### 2. Restart Wazuh Agent
```bash
sudo systemctl restart wazuh-agent
```

### 3. Verify Configuration
```bash
# Check Wazuh agent status
sudo systemctl status wazuh-agent

# Check Wazuh agent configuration
sudo /var/ossec/bin/agent_control -l
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

### Wazuh Monitoring
```bash
# Check Wazuh agent status
sudo systemctl status wazuh-agent

# View Wazuh agent logs
sudo tail -f /var/ossec/logs/ossec.log

# Check Wazuh agent info
sudo /var/ossec/bin/agent_control -l

# Check Wazuh manager dashboard
# Access via web browser to Wazuh manager IP
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

### Wazuh Issues
```bash
# Check Wazuh agent logs
sudo tail -f /var/ossec/logs/ossec.log

# Restart Wazuh agent
sudo systemctl restart wazuh-agent

# Check agent connection
sudo /var/ossec/bin/agent_control -l

# Check Wazuh agent configuration
sudo /var/ossec/bin/verify-agent-conf
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

1. **Configure Wazuh Manager**: Set up Wazuh manager to receive logs from agent
2. **Test Attack Detection**: Run various attack scenarios
3. **Monitor Logs**: Check Wazuh manager dashboard for incoming logs
4. **Setup AI/ML Analysis**: Configure unsupervised learning for log analysis
5. **Fine-tune Detection**: Adjust detection rules based on AI analysis

## 📞 Support

- **Application Logs**: `/opt/sqli-bruteforce-attack/logs/`
- **Wazuh Logs**: `/var/ossec/logs/`
- **System Logs**: `sudo journalctl -u sqli-bruteforce`
- **Network Status**: `sudo netstat -tlnp | grep :3000`
