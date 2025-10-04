# 🛡️ Secure Web Application - Enterprise Security

## Tổng quan
Web application với bảo mật tuyệt đối cao, sử dụng MongoDB và các tính năng bảo mật enterprise-grade.

## 🔒 Tính năng bảo mật

### 1. **Database Security**
- **MongoDB** với validation schemas
- **Indexes** tối ưu cho performance và security
- **Data encryption** với bcrypt (12 rounds)
- **Connection security** với SSL/TLS

### 2. **Authentication & Authorization**
- **JWT tokens** với refresh mechanism
- **Session management** với expiration
- **Role-based access control** (RBAC)
- **Account lockout** sau 5 lần thử sai
- **Password complexity** requirements

### 3. **Input Validation & Sanitization**
- **SQL Injection detection** và blocking
- **XSS protection** với input sanitization
- **CSRF protection** với tokens
- **Rate limiting** cho tất cả endpoints
- **Input validation** với Zod schemas

### 4. **Security Monitoring**
- **Real-time security event logging**
- **IP blacklisting** tự động
- **Risk scoring** cho mỗi request
- **Security dashboard** với thống kê
- **Anomaly detection** với AI/ML

### 5. **Security Headers**
- **HSTS** (HTTP Strict Transport Security)
- **CSP** (Content Security Policy)
- **X-Frame-Options**
- **X-Content-Type-Options**
- **X-XSS-Protection**

## 🚀 Cài đặt

### 1. **Prerequisites**
```bash
# Node.js 18+
node --version

# MongoDB 6.0+
mongod --version

# npm hoặc yarn
npm --version
```

### 2. **Clone và cài đặt**
```bash
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack
npm install
```

### 3. **Cấu hình Environment**
```bash
cp env.example .env.local
# Chỉnh sửa .env.local với thông tin của bạn
```

### 4. **Setup Database**
```bash
# Khởi động MongoDB
sudo systemctl start mongod

# Setup database với indexes và default users
npm run setup-db
```

### 5. **Chạy ứng dụng**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔧 Cấu hình bảo mật

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application
NODE_ENV=production
SECURITY_HEADERS=true
RATE_LIMITING=true
```

### Default Users
Sau khi setup database, có 2 users mặc định:

1. **Admin User**
   - Username: `admin`
   - Password: `Admin123!@#`
   - Role: `admin`

2. **Security Analyst**
   - Username: `security`
   - Password: `Security123!@#`
   - Role: `security_analyst`

⚠️ **QUAN TRỌNG**: Thay đổi passwords ngay sau khi deploy!

## 📊 Security Dashboard

### Truy cập Dashboard
```
http://localhost:3000/dashboard
```

### Tính năng Dashboard
- **Real-time security events**
- **Attack statistics** theo thời gian
- **Top attacking IPs**
- **Risk score monitoring**
- **Geographic attack distribution**
- **Security health score**

## 🔍 Security Monitoring

### Event Types
- `login_attempt` - Thử đăng nhập
- `sql_injection` - SQL Injection attacks
- `brute_force` - Brute force attacks
- `xss` - Cross-site scripting
- `csrf` - CSRF attacks
- `unauthorized_access` - Truy cập trái phép
- `suspicious_activity` - Hoạt động đáng ngờ

### Severity Levels
- `low` - Rủi ro thấp
- `medium` - Rủi ro trung bình
- `high` - Rủi ro cao
- `critical` - Rủi ro cực cao

### Risk Scoring
- **0-20**: Minimal risk
- **21-40**: Low risk
- **41-60**: Medium risk
- **61-80**: High risk
- **81-100**: Critical risk

## 🛡️ API Security

### Authentication
```javascript
// Login
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin123!@#"
}

// Response
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

### Authorization Headers
```javascript
// Required headers for protected endpoints
Authorization: Bearer <jwt-token>
X-CSRF-Token: <csrf-token>
```

### Rate Limiting
- **Login attempts**: 5 per 15 minutes per IP
- **API calls**: 100 per 15 minutes per IP
- **Registration**: 3 per hour per IP

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

2. **JWT Secret Error**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Permission Denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.js
```

### Logs
```bash
# View application logs
npm run logs

# View security events
tail -f logs/security-events.log
```

## 🚨 Security Best Practices

### 1. **Production Deployment**
- Sử dụng HTTPS với valid SSL certificate
- Set `NODE_ENV=production`
- Sử dụng strong JWT secret (32+ characters)
- Enable MongoDB authentication
- Setup firewall rules

### 2. **Database Security**
- Enable MongoDB authentication
- Use SSL/TLS connections
- Regular backups
- Monitor database logs

### 3. **Application Security**
- Regular security updates
- Monitor security events
- Review access logs
- Implement 2FA for admin users

### 4. **Network Security**
- Use reverse proxy (nginx)
- Enable rate limiting
- Block suspicious IPs
- Monitor network traffic

## 📈 Performance

### Database Optimization
- **Indexes** cho tất cả queries
- **Connection pooling** với MongoDB
- **TTL indexes** cho session cleanup
- **Compound indexes** cho complex queries

### Security Performance
- **Caching** cho rate limiting
- **Batch processing** cho logs
- **Async processing** cho security events
- **Connection reuse** cho database

## 🔄 Integration với AI/ML

### Ultra Advanced AI
```bash
# Deploy AI system
cd ai-ml
sudo ./deploy-ultra-advanced.sh
python3 ultra-advanced-ai.py
```

### Features
- **Real-time threat detection**
- **Anomaly detection**
- **Pattern recognition**
- **Risk assessment**
- **Automated response**

## 📞 Support

### Documentation
- [API Documentation](docs/api.md)
- [Security Guide](docs/security.md)
- [Deployment Guide](docs/deployment.md)

### Issues
- [GitHub Issues](https://github.com/TuanDepChai/sqli-bruteforce-attack/issues)
- [Security Issues](security@yourdomain.com)

---

## ⚠️ Disclaimer

Đây là ứng dụng demo với mục đích giáo dục và training security. Không sử dụng trong production environment thực tế mà không có review security đầy đủ.

**🛡️ Security First - Always!**
