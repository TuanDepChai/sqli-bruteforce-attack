# 🚀 Quick Start Guide - SQLi BruteForce Attack Detection

## ⚡ **One-Command Setup (Ubuntu)**

```bash
# Clone and run automated setup
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/ossecc-integration.sh | bash
```

## 🖥️ **Local Development (Windows/macOS)**

### Prerequisites
- Node.js 18+ 
- npm/pnpm

### Installation
```bash
# Clone repository
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

### Access Application
- **Web Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Help/Documentation**: http://localhost:3000/help

## 🎯 **Default Credentials**

```
admin / admin123      (System Administrator)
user / password       (Sales Representative)  
john / john2024       (Software Engineer)
sarah / sarah!pass    (Marketing Manager)
mike / mike123        (Financial Analyst)
emma / emma2024       (HR Manager)
```

## 🧪 **Quick Test Attacks**

### 1. SQL Injection - Authentication Bypass
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

### 2. SQL Injection - Comment Bypass
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":""}'
```

### 3. Brute Force Test
```bash
# Run Python brute force script
python3 scripts/brute-force-test.py
```

## 📊 **View Results**

### Real-time Log Monitoring
```bash
# Watch all attacks
tail -f logs/attacks.log

# Watch SQL injection only
tail -f logs/sql_injection.log

# Watch brute force only  
tail -f logs/brute_force.log
```

### Admin Dashboard
1. Go to http://localhost:3000/admin
2. View animated statistics
3. Use advanced filters
4. Export logs to JSON

## 🛡️ **OSSEC Integration (Production)**

### Web Server Setup (192.168.205.100)
```bash
# Automated deployment
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/ossecc-integration.sh | bash

# Manual setup
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack
chmod +x scripts/ossecc-integration.sh
./scripts/ossecc-integration.sh
```

### OSSEC Configuration
- **Agent Installation**: Automatic via script
- **Log Monitoring**: All attack logs monitored
- **Custom Rules**: SQL injection & brute force detection
- **Alert Levels**: 5-13 based on attack severity

## 📁 **Key Files & Directories**

```
sqli-bruteforce-attack/
├── app/                    # Next.js application
│   ├── page.tsx           # Main login page
│   ├── admin/             # Admin dashboard
│   ├── help/              # Documentation
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── *.tsx              # Custom animated components
├── lib/                   # Core libraries
│   ├── db.ts              # Database management
│   ├── logger.ts          # Attack logging
│   └── file-logger.ts     # File logging
├── logs/                  # Attack logs (auto-created)
├── scripts/               # Attack examples & deployment
├── ossec-*.xml           # OSSEC configuration
└── vulnerable.db         # SQLite database (auto-created)
```

## 🔍 **Log Format**

Each attack generates a single-line log:
```
2025-10-03 11:09:42.177 +07:00 192.168.205.100 POST /api/login?username=admin'%20OR%201=1--&password=anything 500 "Mozilla/5.0..." "SQL syntax error - Database processing failed" "SELECTs to the left and right of UNION do not have the same number of result columns" "SESS_1234567890_abc123" "sql_injection" "SELECT * FROM users WHERE username = 'admin' OR 1=1--' AND password = 'anything'" "http://localhost:3000/" "5ms" "78bytes" "{"content-type":"application/json"}"
```

## 🎨 **Features**

### UI/UX
- ✨ **Particle Background** with connected nodes
- 🎭 **Animated Gradients** with smooth transitions  
- 🪟 **Glass Morphism** effects with backdrop blur
- 🎯 **Micro-interactions** on all elements
- 📊 **Animated Statistics** with counting effects
- 🔄 **Loading States** with shimmer animations

### Security Detection
- 🛡️ **SQL Injection Detection** (Level 10-13)
- 🔨 **Brute Force Detection** (Level 8-9)
- 📊 **Behavioral Analysis** with frequency tracking
- 🎯 **Pattern Recognition** for attack types
- ⚡ **Real-time Monitoring** with instant alerts

### Logging System
- 📝 **Multi-file Logging** (attacks, SQLi, brute force, critical)
- 🔄 **Automatic Rotation** at 10MB
- 🕐 **Vietnam Timezone** (UTC+7) timestamps
- 📊 **Complete Field Data** (15+ fields per log)
- 🎯 **OSSEC Compatible** format

## 🚨 **Troubleshooting**

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

### Check Status
```bash
# Application status
curl http://localhost:3000

# Database status
ls -la vulnerable.db

# Logs status
ls -la logs/
```

## 📚 **Documentation**

- **Full Documentation**: [README.md](README.md)
- **Ubuntu Deployment**: [UBUNTU-WEBSERVER-DEPLOYMENT.md](UBUNTU-WEBSERVER-DEPLOYMENT.md)
- **Research Project**: [RESEARCH-DOCUMENTATION.md](RESEARCH-DOCUMENTATION.md)
- **Attack Examples**: [scripts/attack-examples.ts](scripts/attack-examples.ts)

## ⚠️ **Important Notes**

- 🎓 **Educational Purpose Only** - Do not deploy to production
- 🔒 **Intentionally Vulnerable** - For security training
- 🛡️ **Use Responsibly** - Follow ethical guidelines
- 📝 **Comprehensive Logging** - All activities monitored

## 🎯 **Next Steps**

1. **Test Attacks**: Try different SQL injection payloads
2. **Monitor Logs**: Watch real-time attack detection
3. **Admin Dashboard**: Explore filtering and export features
4. **OSSEC Setup**: Configure for production monitoring
5. **AI Integration**: Prepare for unsupervised ML analysis

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000! 🚀**
