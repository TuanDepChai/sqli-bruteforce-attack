# 🏠 Local Deployment Guide

## 🎯 Overview
Deploy SQLi BruteForce Attack Detection locally for Wazuh log collection.

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack
npm install
```

### 2. Start Application
```bash
npm run dev
```

### 3. Generate Attack Logs
```bash
# Generate comprehensive attack logs
./scripts/generate-logs.sh

# Or use npm script
npm run generate-logs
```

### 4. Configure Wazuh Agent
```bash
# Configure Wazuh agent to monitor logs
./scripts/config-wazuh-agent.sh
```

## 🛡️ Wazuh Agent Configuration

### Manual Configuration
Edit Wazuh agent configuration file:
```bash
sudo nano /var/ossec/etc/ossec.conf
```

Add this configuration inside `<ossec_config>` section:
```xml
<!-- SQLi BruteForce Attack Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>/path/to/your/project/logs/attacks.log</location>
</localfile>
```

Replace `/path/to/your/project/` with your actual project path.

### Restart Wazuh Agent
```bash
sudo systemctl restart wazuh-agent
sudo systemctl status wazuh-agent
```

## 📊 Log Monitoring

### Real-time Log Monitoring
```bash
# Monitor attack logs
npm run logs

# Or directly
tail -f logs/attacks.log

# Check log statistics
npm run stats
```

### Log File Structure
```
logs/
├── attacks.log           # MAIN FILE - All attacks (Wazuh monitors this)
├── sql_injection.log     # SQL injection only
├── brute_force.log       # Brute force only
├── critical-attacks.log  # Successful attacks
└── security-events.log   # Security events
```

## 🧪 Testing

### Generate Different Attack Types
```bash
# Run comprehensive test
./scripts/generate-logs.sh

# Manual testing
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# SQL injection test
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

## 📝 Log Format

Each attack generates a single-line log:
```
2025-10-03 11:09:42.177 +07:00 192.168.205.100 POST /api/login?username=admin'%20OR%201=1--&password=anything 500 "Mozilla/5.0..." "SQL syntax error - Database processing failed" "SELECTs to the left and right of UNION do not have the same number of result columns" "SESS_1234567890_abc123" "sql_injection" "SELECT * FROM users WHERE username = 'admin' OR 1=1--' AND password = 'anything'" "http://localhost:3000/" "5ms" "78bytes" "{"content-type":"application/json"}"
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Generate logs for AI analysis
npm run generate-logs

# Monitor logs in real-time
npm run logs

# Check log statistics
npm run stats

# Reset database and logs
npm run reset

# Clean everything
npm run clean
```

## 🚨 Troubleshooting

### Application Issues
```bash
# Check if server is running
curl http://localhost:3000

# Check port usage
lsof -i :3000

# Restart if needed
npm run dev
```

### Wazuh Agent Issues
```bash
# Check Wazuh agent status
sudo systemctl status wazuh-agent

# Check Wazuh agent logs
sudo tail -f /var/ossec/logs/ossec.log

# Restart Wazuh agent
sudo systemctl restart wazuh-agent

# Verify configuration
sudo /var/ossec/bin/verify-agent-conf
```

### Log Issues
```bash
# Check if logs directory exists
ls -la logs/

# Check log file permissions
ls -la logs/attacks.log

# Create logs directory if missing
mkdir -p logs
chmod 755 logs
```

## 📊 Wazuh Manager Integration

### Check Wazuh Manager
1. Access Wazuh manager dashboard
2. Go to **Logs** section
3. Look for logs from your agent
4. Filter by source: `logs/attacks.log`

### Log Analysis
- **Total Attacks**: Count all log entries
- **SQL Injections**: Filter by `sql_injection`
- **Brute Force**: Filter by `brute_force`
- **Successful Attacks**: Filter by status `200`
- **Failed Attacks**: Filter by status `401`, `500`

## 🎯 Next Steps

1. ✅ **Deploy locally** - Run web application
2. ✅ **Generate logs** - Create attack data
3. ✅ **Configure Wazuh** - Monitor log files
4. ✅ **Check Wazuh Manager** - Verify log collection
5. ✅ **AI Analysis** - Use logs for machine learning

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000! 🚀**
