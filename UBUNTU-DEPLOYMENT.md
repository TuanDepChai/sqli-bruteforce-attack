# Ubuntu Deployment Guide for SQLi BruteForce Attack Detection System

## 🎯 Research Overview
**Topic**: Unsupervised Machine Learning for detecting brute-force and SQL injection attacks  
**Goal**: Create an effective solution without pre-labeled data to protect systems from cybersecurity threats

## 🏗️ Architecture
- **Web Server**: Ubuntu 192.168.205.100 (Wazuh Agent)
- **SIEM Dashboard**: Ubuntu 192.168.205.128 (Wazuh Dashboard + AI Analysis)

## 📋 Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install build tools for better-sqlite3
sudo apt-get install -y build-essential python3

# Install git
sudo apt install -y git
```

## 🚀 Deployment Steps

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER /opt/sqli-bruteforce-attack
cd /opt/sqli-bruteforce-attack
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Rebuild Native Dependencies
```bash
npm rebuild better-sqlite3
```

### 4. Create Systemd Service
```bash
sudo nano /etc/systemd/system/sqli-bruteforce.service
```

Add this content:
```ini
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
```

### 5. Build and Start Application
```bash
# Build application
pnpm build

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable sqli-bruteforce
sudo systemctl start sqli-bruteforce

# Check status
sudo systemctl status sqli-bruteforce
```

### 6. Configure Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw enable
```

## 🔍 Wazuh Agent Installation (192.168.205.100)

### 1. Install Wazuh Agent
```bash
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && sudo chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee -a /etc/apt/sources.list.d/wazuh.list
sudo apt-get update
sudo WAZUH_MANAGER="192.168.205.128" WAZUH_AGENT_GROUP="default" WAZUH_AGENT_NAME="web-server" apt-get install wazuh-agent
```

### 2. Configure Log Monitoring
```bash
sudo nano /var/ossec/etc/ossec.conf
```

Add this configuration:
```xml
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
```

### 3. Copy Wazuh Rules
```bash
# Copy decoder
sudo cp /opt/sqli-bruteforce-attack/wazuh-decoder.xml /var/ossec/etc/decoders/

# Copy rules
sudo cp /opt/sqli-bruteforce-attack/wazuh-rules.xml /var/ossec/etc/rules/

# Restart Wazuh Agent
sudo systemctl restart wazuh-agent
```

## 📊 Wazuh Dashboard Setup (192.168.205.128)

### 1. Install Wazuh Dashboard
```bash
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && sudo chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee -a /etc/apt/sources.list.d/wazuh.list
sudo apt-get update
sudo apt-get install wazuh-dashboard
```

### 2. Configure Dashboard
```bash
sudo systemctl enable wazuh-dashboard
sudo systemctl start wazuh-dashboard
```

### 3. Access Dashboard
Open browser: `http://192.168.205.128:5601`

## 🤖 AI/ML Integration

### 1. Install Python Dependencies
```bash
sudo apt install -y python3-pip python3-venv
cd /opt
sudo python3 -m venv ml-env
sudo chown -R $USER:$USER ml-env
source ml-env/bin/activate
pip install pandas numpy scikit-learn matplotlib seaborn jupyter
```

### 2. Create ML Analysis Script
```python
# /opt/ml-analysis/anomaly_detection.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import json

def analyze_logs():
    # Read logs from Wazuh
    logs = pd.read_csv('/var/ossec/logs/alerts/alerts.json', lines=True)
    
    # Feature extraction
    features = extract_features(logs)
    
    # Unsupervised anomaly detection
    detector = IsolationForest(contamination=0.1)
    anomalies = detector.fit_predict(features)
    
    # Save results
    results = {
        'anomalies_detected': np.sum(anomalies == -1),
        'anomaly_indices': np.where(anomalies == -1)[0].tolist()
    }
    
    with open('/opt/ml-results/anomalies.json', 'w') as f:
        json.dump(results, f)

if __name__ == "__main__":
    analyze_logs()
```

## 🔧 Log Format for AI Analysis

The system generates logs in this format:
```
2025-10-03 11:09:42.177 +07:00 ::1 POST /api/login?username=admin&password=123 401 "Mozilla/5.0..." "Authentication failed - Invalid credentials" "-" "SESS_1234567890_abc123" "brute_force" "SELECT * FROM users WHERE username = 'admin' AND password = '123'" "http://localhost:3000/" "12ms" "58bytes" "{"content-type":"application/json"}"
```

## 📈 Features for ML Analysis

1. **Temporal Patterns**: Login attempt frequency
2. **IP Analysis**: Geographic and behavioral patterns
3. **Payload Analysis**: SQL injection patterns
4. **Response Codes**: Success/failure ratios
5. **User Agent**: Bot vs human detection
6. **Session Analysis**: Attack progression

## 🎯 Expected ML Outcomes

- **Brute Force Detection**: Identify rapid successive login attempts
- **SQL Injection Detection**: Detect malicious payloads
- **Anomaly Detection**: Find unusual patterns without labels
- **Behavioral Analysis**: Identify attack progression
- **False Positive Reduction**: Improve detection accuracy

## 📝 Research Data Collection

```bash
# Collect logs for analysis
sudo cp /opt/sqli-bruteforce-attack/logs/* /opt/research-data/
sudo chown -R $USER:$USER /opt/research-data/
```

## 🔍 Testing Commands

```bash
# Test web application
curl -X POST http://192.168.205.100:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}'

# Test SQL injection
curl -X POST http://192.168.205.100:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1--","password":"anything"}'

# Check logs
tail -f /opt/sqli-bruteforce-attack/logs/attacks.log
```

## 📊 Monitoring

```bash
# Check application status
sudo systemctl status sqli-bruteforce

# Check Wazuh agent status
sudo systemctl status wazuh-agent

# View logs
sudo journalctl -u sqli-bruteforce -f
```

## 🎓 Research Benefits

1. **Real-time Detection**: Immediate threat identification
2. **Unsupervised Learning**: No need for labeled attack data
3. **Scalable Solution**: Can be deployed across multiple systems
4. **Cost-effective**: Uses open-source tools
5. **Academic Value**: Contributes to cybersecurity research
