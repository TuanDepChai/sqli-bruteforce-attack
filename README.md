# SQLi BruteForce Attack Detection Web

⚠️ **WARNING: This application is INTENTIONALLY VULNERABLE for educational purposes only!**

## Overview

Professional security training application featuring:
- **SQL Injection attacks** - Multiple techniques and payloads
- **Brute force attacks** - Dictionary, parallel, and credential stuffing
- **Attack detection** - Real-time monitoring and analysis
- **Comprehensive logging** - All attacks logged for AI/ML analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.x or higher
- **npm/pnpm**: Latest version

### Installation
```bash
# 1. Clone repository
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack

# 2. Install dependencies
npm install

# 3. Start application
npm run dev
```

### Access Application
- **Web Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Help Documentation**: http://localhost:3000/help

## 🎯 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | System Administrator |
| `user` | `password` | Sales Representative |
| `john` | `john2024` | Software Engineer |
| `sarah` | `sarah!pass` | Marketing Manager |
| `mike` | `mike123` | Financial Analyst |
| `emma` | `emma2024` | HR Manager |

## 🧪 Testing Attacks

### SQL Injection Examples
```bash
# Authentication bypass
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'

# Comment bypass
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":""}'
```

### Brute Force Testing
```bash
# Test multiple credentials
for user in admin user john; do
  for pass in password 123456 admin123; do
    curl -X POST http://localhost:3000/api/login \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$user\",\"password\":\"$pass\"}"
    sleep 0.5
  done
done
```

## 📊 Log Monitoring

### Real-time Log Monitoring
```bash
# Watch all attacks
tail -f logs/attacks.log

# Watch SQL injection only
tail -f logs/sql_injection.log

# Watch brute force only
tail -f logs/brute_force.log
```

### Log Analysis
```bash
# Count attacks by type
grep "ATTACK TYPE" logs/attacks.log | sort | uniq -c

# Count successful attacks
grep -c "SUCCESS.*: YES" logs/attacks.log

# Get attack statistics
echo "Total attacks: $(grep -c 'ATTACK_ATTEMPT' logs/attacks.log)"
echo "SQL Injection: $(grep -c 'sql_injection' logs/attacks.log)"
echo "Brute Force: $(grep -c 'brute_force' logs/attacks.log)"
```

## 🛡️ Wazuh Integration (Production)

### Ubuntu Server Deployment
```bash
# One-command deployment
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/web-server-deployment.sh | bash
```

### Features
- **Automated Setup**: Node.js, dependencies, systemd service
- **Wazuh Agent**: Configuration template for log monitoring
- **Log Collection**: All attack logs ready for Wazuh collection
- **AI/ML Ready**: Logs formatted for unsupervised learning

## 📁 Log Format

Each attack generates a single-line log for AI/ML analysis:
```
2025-10-03 11:09:42.177 +07:00 192.168.205.100 POST /api/login?username=admin'%20OR%201=1--&password=anything 500 "Mozilla/5.0..." "SQL syntax error - Database processing failed" "SELECTs to the left and right of UNION do not have the same number of result columns" "SESS_1234567890_abc123" "sql_injection" "SELECT * FROM users WHERE username = 'admin' OR 1=1--' AND password = 'anything'" "http://localhost:3000/" "5ms" "78bytes" "{"content-type":"application/json"}"
```

## 🎨 Features

### UI/UX
- ✨ **Animated Background** with particle effects
- 🎭 **Glass Morphism** with backdrop blur
- 🎯 **Micro-interactions** on all elements
- 📊 **Animated Statistics** with counting effects
- 🔄 **Loading States** with shimmer animations

### Security Detection
- 🛡️ **SQL Injection Detection** - Pattern recognition
- 🔨 **Brute Force Detection** - Behavioral analysis
- 📊 **Real-time Monitoring** - Instant alerts
- 🎯 **Attack Classification** - Automatic categorization

### Logging System
- 📝 **Multi-file Logging** - Organized by attack type
- 🔄 **Automatic Rotation** - File management
- 🕐 **Vietnam Timezone** - UTC+7 timestamps
- 📊 **Complete Data** - 15+ fields per log

## 🔧 Development

### Commands
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Custom port
PORT=3001 npm run dev
```

### Database Operations
```bash
# Reset database
rm vulnerable.db
npm run dev  # Will recreate

# Check database
sqlite3 vulnerable.db "SELECT COUNT(*) FROM attack_logs;"
```

## 🚨 Troubleshooting

### Common Issues
```bash
# Database locked
rm vulnerable.db && npm run dev

# Port in use
lsof -i :3000 && kill -9 <PID>
# or
PORT=3001 npm run dev

# Dependencies issues
rm -rf node_modules && npm install
npm rebuild better-sqlite3
```

## ⚠️ Important Notes

- 🎓 **Educational Purpose Only** - Do not deploy to production
- 🔒 **Intentionally Vulnerable** - For security training
- 🛡️ **Use Responsibly** - Follow ethical guidelines
- 📝 **Comprehensive Logging** - All activities monitored

## 📚 Documentation

- **Ubuntu Deployment**: [UBUNTU-WEBSERVER-DEPLOYMENT.md](UBUNTU-WEBSERVER-DEPLOYMENT.md)
- **Attack Examples**: [scripts/attack-examples.ts](scripts/attack-examples.ts)

## License

MIT License - Educational use only

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000! 🚀**