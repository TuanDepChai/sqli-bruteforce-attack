# 🛡️ Wazuh Setup Guide - Fixed Version

## 🎯 Quick Setup for Ubuntu

### Step 1: Copy Configuration Files

```bash
# Navigate to project directory
cd /opt/sqli-bruteforce-attack

# Copy decoder (fixed regex)
sudo cp wazuh-decoder.xml /var/ossec/etc/decoders/local_decoder.xml
sudo chown root:ossec /var/ossec/etc/decoders/local_decoder.xml
sudo chmod 640 /var/ossec/etc/decoders/local_decoder.xml

# Copy rules
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
<!-- SQLi BruteForce Attack Detection Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>
</localfile>
```

### Step 3: Test and Restart

```bash
# Test configuration
sudo /var/ossec/bin/wazuh-analysisd -t

# If successful, restart Wazuh agent
sudo systemctl restart wazuh-agent

# Check status
sudo systemctl status wazuh-agent
```

## 📊 Expected Log Format

The application now generates logs in this optimized format:

```
2025-10-03 14:16:58.025 +07:00 IP=192.168.205.1 METHOD=POST URI=/api/login?username=1&password=1 STATUS=200 USER_AGENT="Mozilla/5.0..." LOGIN_RESULT="Authentication failed - Brute force attempt" ERROR="N/A" SESSION="N/A" ATTACK_TYPE="brute_force" SQL_QUERY="SELECT * FROM users WHERE username = '1' AND password = '1'" REFERER="http://192.168.205.100:3000/" RESPONSE_TIME="123ms" PAYLOAD_SIZE="31bytes"
```

## 🔍 Wazuh Field Mapping

| Field | Wazuh Field | Description |
|-------|-------------|-------------|
| `IP=192.168.205.1` | `srcip` | Source IP address |
| `METHOD=POST` | `method` | HTTP method |
| `URI=/api/login?username=1&password=1` | `uri` | Request URI with payload |
| `STATUS=200` | `status_code` | HTTP status code |
| `USER_AGENT="..."` | `user_agent` | Browser user agent |
| `LOGIN_RESULT="..."` | `login_result` | Authentication result |
| `ERROR="..."` | `error_message` | Error message |
| `SESSION="..."` | `session_token` | Session identifier |
| `ATTACK_TYPE="brute_force"` | `attack_type` | Attack classification |
| `SQL_QUERY="..."` | `sql_query` | SQL query executed |
| `REFERER="..."` | `referer` | HTTP referer |
| `RESPONSE_TIME="123ms"` | `response_time` | Response time |
| `PAYLOAD_SIZE="31bytes"` | `payload_size` | Request payload size |

## 🚨 Alert Rules

| Rule ID | Level | Attack Type | Description |
|---------|-------|-------------|-------------|
| 100001 | 12 | SQL Injection | SQL injection attack detected |
| 100002 | 10 | Brute Force | Brute force attack detected |
| 100003 | 11 | Credential Stuffing | Credential stuffing attack detected |
| 100004 | 5 | Failed Login | Failed login attempt |
| 100005 | 3 | Successful Login | Successful authentication |

## 🧪 Testing

### Generate Test Logs

```bash
# Test normal login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test SQL injection
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'

# Test brute force
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}'
```

### Check Wazuh Alerts

```bash
# View real-time alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log

# Filter for SQLi attacks
sudo grep "sql_injection" /var/ossec/logs/alerts/alerts.log

# Filter for brute force attacks
sudo grep "brute_force" /var/ossec/logs/alerts/alerts.log

# Check decoder working
sudo grep "sqli-bruteforce" /var/ossec/logs/alerts/alerts.log
```

## 🔧 Troubleshooting

### Common Issues

1. **Configuration Error**:
   ```bash
   sudo /var/ossec/bin/wazuh-analysisd -t
   ```
   If error, check XML syntax in decoder/rules files.

2. **No Alerts Generated**:
   ```bash
   # Check if log file is being monitored
   sudo tail -f /var/ossec/logs/ossec.log | grep "sqli-bruteforce"
   
   # Check if logs are being generated
   tail -f /opt/sqli-bruteforce-attack/logs/attacks.log
   ```

3. **Regex Not Matching**:
   ```bash
   # Test decoder manually
   echo "2025-10-03 14:16:58.025 +07:00 IP=192.168.205.1 METHOD=POST URI=/api/login STATUS=200 USER_AGENT=\"test\" LOGIN_RESULT=\"test\" ERROR=\"test\" SESSION=\"test\" ATTACK_TYPE=\"test\" SQL_QUERY=\"test\" REFERER=\"test\" RESPONSE_TIME=\"test\" PAYLOAD_SIZE=\"test\"" | sudo /var/ossec/bin/wazuh-logtest
   ```

## 🎯 Verification Commands

```bash
# Check Wazuh agent status
sudo systemctl status wazuh-agent

# View recent alerts
sudo tail -20 /var/ossec/logs/alerts/alerts.log

# Check configuration
sudo /var/ossec/bin/wazuh-analysisd -t

# Monitor logs in real-time
sudo tail -f /var/ossec/logs/alerts/alerts.log | grep "sqli-bruteforce"
```

## 🚀 Ready for AI/ML Analysis

With this setup, Wazuh will:
- ✅ Parse logs with structured fields
- ✅ Generate alerts with proper classification
- ✅ Extract metadata for AI/ML analysis
- ✅ Provide clean data for unsupervised learning

The structured alerts from Wazuh can be easily consumed by AI/ML systems for:
- Anomaly detection
- Pattern recognition
- Attack classification
- Behavioral analysis
