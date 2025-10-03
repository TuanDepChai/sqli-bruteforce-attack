# 🛡️ Wazuh Configuration for SQLi BruteForce Attack Detection

## 📋 Overview
Hướng dẫn cấu hình Wazuh để phân tích log từ SQLi BruteForce Attack Detection application.

## 🔧 Step 1: Copy Decoder File

```bash
# Copy decoder to Wazuh local decoders directory
sudo cp wazuh-decoder.xml /var/ossec/etc/decoders/local_decoder.xml

# Set proper permissions
sudo chown root:ossec /var/ossec/etc/decoders/local_decoder.xml
sudo chmod 640 /var/ossec/etc/decoders/local_decoder.xml
```

## 🛡️ Step 2: Copy Rules File

```bash
# Copy rules to Wazuh local rules directory
sudo cp wazuh-rules.xml /var/ossec/etc/rules/local_rules.xml

# Set proper permissions
sudo chown root:ossec /var/ossec/etc/rules/local_rules.xml
sudo chmod 640 /var/ossec/etc/rules/local_rules.xml
```

## 📁 Step 3: Configure Log File Monitoring

```bash
# Edit Wazuh configuration
sudo nano /var/ossec/etc/ossec.conf
```

Thêm vào phần `<ossec_config>`:

```xml
<!-- SQLi BruteForce Attack Detection Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>
</localfile>
```

## 🧪 Step 4: Test Configuration

```bash
# Test Wazuh configuration
sudo /var/ossec/bin/wazuh-analysisd -t

# If successful, restart Wazuh agent
sudo systemctl restart wazuh-agent
```

## 📊 Step 5: Verify Configuration

```bash
# Check Wazuh agent status
sudo systemctl status wazuh-agent

# Check logs for any errors
sudo tail -f /var/ossec/logs/ossec.log
```

## 🧪 Step 6: Generate Test Logs

```bash
# Go to project directory
cd /opt/sqli-bruteforce-attack

# Run test attacks
./test-attacks.sh

# Check if logs are generated
tail -f logs/attacks.log
```

## 🔍 Step 7: Check Wazuh Alerts

```bash
# Check alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log

# Filter for SQLi attacks
sudo grep "sql_injection" /var/ossec/logs/alerts/alerts.log

# Filter for brute force attacks
sudo grep "brute_force" /var/ossec/logs/alerts/alerts.log
```

## 📋 Log Format Parsed by Wazuh

Wazuh sẽ phân tích log với format:
```
2025-10-03 12:47:38.319 +07:00 ::ffff:192.168.205.1 POST /api/login?username=tuan22222221123123321321&password=hehe 200 "Mozilla/5.0..." "Authentication successful" "N/A" "SESS_1759470458319_14gncp9gk" "brute_force" "SELECT * FROM users WHERE username = 'tuan22222221123123321321' AND password = 'hehe'" "http://192.168.205.100:3000/" "1ms" "57bytes" "{...}"
```

### Fields được extract:
- `timestamp`: 2025-10-03 12:47:38.319 +07:00
- `srcip`: 192.168.205.1
- `method`: POST
- `uri`: /api/login?username=...&password=...
- `status_code`: 200
- `user_agent`: Mozilla/5.0...
- `login_message`: Authentication successful
- `error_message`: N/A
- `session_token`: SESS_1759470458319_14gncp9gk
- `attack_type`: brute_force
- `sql_query`: SELECT * FROM users WHERE...
- `referer`: http://192.168.205.100:3000/
- `response_time`: 1ms
- `payload_size`: 57bytes
- `request_headers`: {...}

## 🚨 Alert Levels

| Rule ID | Level | Attack Type | Description |
|---------|-------|-------------|-------------|
| 100001 | 12 | SQL Injection | SQL injection attack detected |
| 100002 | 10 | Brute Force | Brute force attack detected |
| 100003 | 11 | Credential Stuffing | Credential stuffing attack detected |
| 100004 | 5 | Failed Login | Failed login attempt |
| 100005 | 3 | Successful Login | Successful authentication |

## 🔍 Useful Commands

```bash
# Test specific log entry
echo "2025-10-03 12:47:38.319 +07:00 ::ffff:192.168.205.1 POST /api/login 200 \"test\" \"test\" \"N/A\" \"N/A\" \"brute_force\" \"SELECT * FROM users\" \"http://test/\" \"1ms\" \"57bytes\" \"{}\"" | sudo /var/ossec/bin/wazuh-logtest

# Check decoder working
sudo /var/ossec/bin/wazuh-logtest -t

# View real-time alerts
sudo tail -f /var/ossec/logs/alerts/alerts.log | grep "sqli-bruteforce"

# Check agent connectivity
sudo /var/ossec/bin/agent_control -l
```

## 🎯 Expected Results

Sau khi cấu hình đúng, bạn sẽ thấy:

1. **Alerts được tạo** trong `/var/ossec/logs/alerts/alerts.log`
2. **Fields được parse** đúng format
3. **Attack types** được phân loại chính xác
4. **IP addresses** và **timestamps** được extract
5. **SQL queries** và **user agents** được capture

## 🚀 Ready for AI/ML Analysis

Với cấu hình này, Wazuh sẽ:
- ✅ Parse logs thành structured data
- ✅ Detect các loại attacks khác nhau
- ✅ Extract metadata quan trọng
- ✅ Tạo alerts với proper fields
- ✅ Sẵn sàng cho AI/ML analysis

## 🔧 Troubleshooting

### Lỗi XML Parser:
```bash
# Check XML syntax
sudo /var/ossec/bin/wazuh-analysisd -t
```

### Log không được monitor:
```bash
# Check ossec.conf
sudo cat /var/ossec/etc/ossec.conf | grep -A5 -B5 "sqli-bruteforce"
```

### Alerts không được tạo:
```bash
# Check decoder working
sudo /var/ossec/bin/wazuh-logtest -t

# Check rules
sudo grep "100001" /var/ossec/logs/ossec.log
```