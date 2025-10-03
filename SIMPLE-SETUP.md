# 🚀 Simple Setup Guide - JSON Logs Only

## 🎯 Overview

Simplified setup without Wazuh decoder/rules. Just configure log monitoring and read directly from Wazuh archives.

## 📊 JSON Log Format

The application generates simplified JSON logs with only essential fields:

```json
{
  "timestamp": "2025-10-03 15:48:20.513 +07:00",
  "method": "POST",
  "url": "/api/login?username=admin&password=wrongpass",
  "username": "admin",
  "password": "wrongpass",
  "ip": "192.168.205.1",
  "success": false,
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "referer": "http://192.168.205.100:3000/",
  "status_code": 401
}
```

## 🛡️ Wazuh Setup (Minimal)

### Step 1: Configure Log Monitoring

```bash
# Edit Wazuh configuration
sudo nano /var/ossec/etc/ossec.conf
```

Add this section before `</ossec_config>`:

```xml
<!-- SQLi BruteForce Attack Detection JSON Logs -->
<localfile>
  <log_format>json</log_format>
  <location>/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log</location>
</localfile>
```

### Step 2: Restart Wazuh

```bash
# Test configuration
sudo /var/ossec/bin/wazuh-analysisd -t

# Restart Wazuh agent
sudo systemctl restart wazuh-agent

# Check status
sudo systemctl status wazuh-agent
```

## 📖 Reading Logs from Wazuh Archives

### Read JSON Logs Directly

```bash
# Read from Wazuh archives (recommended)
sudo tail -f /var/ossec/logs/archives/archives.json | grep "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"

# Or read directly from application logs
tail -f /home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log
```

### Parse with jq (if installed)

```bash
# Pretty print JSON logs
sudo tail -f /var/ossec/logs/archives/archives.json | grep "attacks.log" | jq '.'

# Extract specific fields
sudo tail -f /var/ossec/logs/archives/archives.json | grep "attacks.log" | jq '.username, .success, .status_code'
```

## 🤖 AI/ML Training

### Direct JSON Processing

```python
import json
import pandas as pd

# Read JSON logs from Wazuh archives
logs = []
with open('/var/ossec/logs/archives/archives.json', 'r') as f:
    for line in f:
        if 'attacks.log' in line:
            try:
                log_data = json.loads(line.strip())
                # Extract the actual log content
                if 'data' in log_data and 'log' in log_data['data']:
                    actual_log = json.loads(log_data['data']['log'])
                    logs.append(actual_log)
            except:
                continue

# Convert to DataFrame
df = pd.DataFrame(logs)

# Ready for ML training with essential fields!
X = df[['method', 'status_code', 'success']]
y = df['success']  # Binary classification
```

### Feature Engineering

```python
# Extract ML features from simplified JSON
features = {
    'method_post': (df['method'] == 'POST').astype(int),
    'status_code': df['status_code'],
    'success': df['success'].astype(int),
    'has_sql_pattern': df['username'].str.contains('OR|UNION|--|\'|"', na=False).astype(int),
    'suspicious_ua': df['user_agent'].str.contains('curl|wget|bot', na=False).astype(int),
    'has_referer': df['referer'].notna().astype(int),
    'hour_of_day': pd.to_datetime(df['timestamp']).dt.hour
}
```

## 🧪 Testing

### Generate Test Data

```bash
# Start the application
cd /home/modsec/Desktop/sqli-bruteforce-attack
npm run dev

# Generate test attacks
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'

curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}'
```

### Monitor Logs

```bash
# Watch JSON logs in real-time
sudo tail -f /var/ossec/logs/archives/archives.json | grep "attacks.log" | jq '.data.log' | jq -r '.'
```

## 🎯 Benefits

### Simplified Setup:
- ✅ **No decoder/rules needed** - Direct JSON reading
- ✅ **Minimal configuration** - Just log monitoring
- ✅ **Easy troubleshooting** - Fewer moving parts

### AI/ML Ready:
- ✅ **Essential fields only** - Clean, minimal JSON structure
- ✅ **Binary classification** - Success/failure flags
- ✅ **Text analysis** - Usernames, passwords, user agents
- ✅ **Time series data** - Timestamps for temporal analysis

### Development:
- ✅ **Easy debugging** - Human-readable JSON
- ✅ **No parsing errors** - Valid JSON format
- ✅ **Extensible** - Add fields without breaking changes

## 🚀 Quick Start

1. **Configure Wazuh** with JSON log monitoring
2. **Start application** and generate test data
3. **Read logs** from `/var/ossec/logs/archives/archives.json`
4. **Train AI models** on structured JSON data
5. **Deploy detection** in production

Ready for AI/ML training! 🎉🤖
