# 🚀 JSON Log Format Setup Guide

## 🎯 Overview

The application now generates logs in **JSON format** for easy integration with Wazuh dashboard and AI/ML training. No complex parsing required!

## 📊 JSON Log Structure

Each log entry is a complete JSON object with structured fields:

```json
{
  "timestamp": "2025-10-03 14:41:47.849 +07:00",
  "ip_address": "192.168.205.1",
  "method": "POST",
  "uri": "/api/login",
  "full_uri": "/api/login?username=admin&password=wrongpass",
  "status_code": 401,
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "username_attempt": "admin",
  "password_attempt": "wrongpass",
  "login_result": "Authentication failed - Invalid credentials",
  "error_message": null,
  "session_token": "SESS_1759477307850_n2p8gy5s8",
  "attack_type": "normal_login",
  "sql_query": "SELECT * FROM users WHERE username = 'admin' AND password = 'wrongpass'",
  "referer": null,
  "response_time_ms": 45,
  "payload_size_bytes": 42,
  "request_headers": null,
  "success": false,
  "geo_location": null,
  "device_fingerprint": null,
  "additional_data": null,
  "attack_severity": "low",
  "risk_score": 20,
  "timestamp_unix": 1759477307851,
  "log_type": "attack_detection"
}
```

## 🛡️ Wazuh Setup for JSON

### Step 1: Copy Configuration Files

```bash
# Navigate to project directory
cd /opt/sqli-bruteforce-attack

# Copy JSON decoder
sudo cp wazuh-decoder.xml /var/ossec/etc/decoders/local_decoder.xml
sudo chown root:ossec /var/ossec/etc/decoders/local_decoder.xml
sudo chmod 640 /var/ossec/etc/decoders/local_decoder.xml

# Copy JSON rules
sudo cp wazuh-rules.xml /var/ossec/etc/rules/local_rules.xml
sudo chown root:ossec /var/ossec/etc/rules/local_rules.xml
sudo chmod 640 /var/ossec/etc/rules/local_rules.xml
```

### Step 2: Configure Log Monitoring

```bash
# Edit Wazuh configuration
sudo nano /var/ossec/etc/ossec.conf
```

Add this section before `</ossec_config>`:

```xml
<!-- SQLi BruteForce Attack Detection JSON Logs -->
<localfile>
  <log_format>json</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>
</localfile>
```

### Step 3: Test and Restart

```bash
# Test configuration
sudo /var/ossec/bin/wazuh-analysisd -t

# Restart Wazuh agent
sudo systemctl restart wazuh-agent

# Check status
sudo systemctl status wazuh-agent
```

## 📈 Field Mapping for AI/ML

| Field | Type | Description | AI/ML Use |
|-------|------|-------------|-----------|
| `attack_type` | string | Attack classification | Target variable for classification |
| `attack_severity` | string | Severity level (low/medium/high/critical) | Risk assessment |
| `risk_score` | number | Calculated risk score (0-100) | Feature for anomaly detection |
| `success` | boolean | Attack success status | Binary classification |
| `response_time_ms` | number | Response time in milliseconds | Performance analysis |
| `payload_size_bytes` | number | Request payload size | Size-based anomaly detection |
| `ip_address` | string | Source IP address | IP-based clustering |
| `user_agent` | string | Browser/client information | User agent fingerprinting |
| `sql_query` | string | SQL query executed | Text analysis for SQL injection |
| `username_attempt` | string | Username attempted | Credential analysis |
| `password_attempt` | string | Password attempted | Password strength analysis |
| `timestamp_unix` | number | Unix timestamp | Time-series analysis |

## 🤖 AI/ML Training Ready

### Direct JSON Parsing

```python
import json
import pandas as pd

# Read JSON logs directly
logs = []
with open('/opt/sqli-bruteforce-attack/logs/attacks.log', 'r') as f:
    for line in f:
        if line.strip():
            logs.append(json.loads(line.strip()))

# Convert to DataFrame for ML
df = pd.DataFrame(logs)

# Ready for training!
X = df[['risk_score', 'response_time_ms', 'payload_size_bytes']]
y = df['attack_type']
```

### Feature Engineering

```python
# Extract features for ML
features = {
    'risk_score': df['risk_score'],
    'response_time_ms': df['response_time_ms'],
    'payload_size_bytes': df['payload_size_bytes'],
    'is_successful': df['success'].astype(int),
    'has_sql_pattern': df['sql_query'].str.contains('OR|UNION|--', na=False).astype(int),
    'suspicious_ua': df['user_agent'].str.contains('curl|wget|bot', na=False).astype(int),
    'hour_of_day': pd.to_datetime(df['timestamp_unix'], unit='ms').dt.hour,
    'day_of_week': pd.to_datetime(df['timestamp_unix'], unit='ms').dt.dayofweek
}
```

## 🚨 Wazuh Alert Rules

| Rule ID | Level | Condition | Description |
|---------|-------|-----------|-------------|
| 100001 | 12 | `attack_type = "sql_injection"` | SQL Injection detected |
| 100002 | 10 | `attack_type = "brute_force"` | Brute Force detected |
| 100003 | 11 | `attack_type = "credential_stuffing"` | Credential Stuffing detected |
| 100004 | 5 | `status_code = 401` | Failed login attempt |
| 100005 | 3 | `success = true` | Successful authentication |
| 100006 | 8 | `risk_score > 80` | High risk attack |
| 100007 | 15 | `attack_severity = "critical"` | Critical severity attack |
| 100008 | 8 | SQL patterns in `sql_query` | Suspicious SQL patterns |
| 100009 | 7 | `response_time_ms > 5000` | High response time |
| 100010 | 7 | `payload_size_bytes > 1000` | Large payload |
| 100011 | 6 | Suspicious patterns in `user_agent` | Unusual user agent |

## 🧪 Testing

### Generate Test Data

```bash
# Normal login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# SQL injection
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'

# Brute force
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}'
```

### Check Logs

```bash
# View JSON logs
tail -f /opt/sqli-bruteforce-attack/logs/attacks.log

# Parse with jq (if installed)
tail -f /opt/sqli-bruteforce-attack/logs/attacks.log | jq '.attack_type, .risk_score, .success'

# Check Wazuh alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log | grep "sqli-bruteforce"
```

## 🎯 Benefits

### For Wazuh Dashboard:
- ✅ **Direct JSON parsing** - No regex required
- ✅ **Structured fields** - Easy visualization
- ✅ **Built-in risk scoring** - Immediate threat assessment
- ✅ **Severity classification** - Priority-based alerts

### For AI/ML Training:
- ✅ **Structured data** - Ready for pandas DataFrame
- ✅ **Feature engineering** - Built-in risk scores and patterns
- ✅ **Time series** - Unix timestamps for temporal analysis
- ✅ **Text analysis** - SQL queries and user agents
- ✅ **Binary classification** - Success/failure flags
- ✅ **Multi-class classification** - Attack type labels

### For Development:
- ✅ **Easy debugging** - Human-readable JSON
- ✅ **No parsing errors** - Valid JSON format
- ✅ **Extensible** - Add fields without breaking changes
- ✅ **Standard format** - Compatible with all tools

## 🚀 Quick Start

1. **Deploy application** with JSON logging
2. **Configure Wazuh** with JSON decoder
3. **Generate test data** with various attacks
4. **Export logs** for AI/ML training
5. **Train models** on structured JSON data
6. **Deploy detection** in production

Ready for production AI/ML deployment! 🎉🤖
