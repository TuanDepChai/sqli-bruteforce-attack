# 🚀 Simple Setup Guide - JSON Logs Only

## 🎯 Overview

Simplified setup without Wazuh decoder/rules. Just configure log monitoring and read directly from Wazuh archives.

## 📊 JSON Log Format

The application generates structured JSON logs:

```json
{
  "timestamp": "2025-10-03 14:41:47.849 +07:00",
  "ip_address": "192.168.205.1",
  "method": "POST",
  "uri": "/api/login",
  "full_uri": "/api/login?username=admin&password=wrongpass",
  "status_code": 401,
  "user_agent": "Mozilla/5.0...",
  "username_attempt": "admin",
  "password_attempt": "wrongpass",
  "login_result": "Authentication failed - Invalid credentials",
  "attack_type": "normal_login",
  "sql_query": "SELECT * FROM users WHERE username = 'admin' AND password = 'wrongpass'",
  "response_time_ms": 45,
  "payload_size_bytes": 42,
  "success": false,
  "attack_severity": "low",
  "risk_score": 20,
  "timestamp_unix": 1759477307851,
  "log_type": "attack_detection"
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
sudo tail -f /var/ossec/logs/archives/archives.json | grep "attacks.log" | jq '.attack_type, .risk_score, .success'
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

# Ready for ML training!
X = df[['risk_score', 'response_time_ms', 'payload_size_bytes', 'success']]
y = df['attack_type']
```

### Feature Engineering

```python
# Extract ML features
features = {
    'risk_score': df['risk_score'],
    'response_time_ms': df['response_time_ms'],
    'payload_size_bytes': df['payload_size_bytes'],
    'is_successful': df['success'].astype(int),
    'has_sql_pattern': df['sql_query'].str.contains('OR|UNION|--', na=False).astype(int),
    'suspicious_ua': df['user_agent'].str.contains('curl|wget|bot', na=False).astype(int),
    'hour_of_day': pd.to_datetime(df['timestamp_unix'], unit='ms').dt.hour,
    'attack_severity_score': df['attack_severity'].map({'low': 1, 'medium': 2, 'high': 3, 'critical': 4})
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
- ✅ **Structured JSON** - Direct pandas DataFrame conversion
- ✅ **Built-in features** - Risk scores, severity levels
- ✅ **Time series data** - Unix timestamps
- ✅ **Text analysis** - SQL queries, user agents

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
