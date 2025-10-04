# 🔑 HƯỚNG DẪN ĐIỀN ENVIRONMENT KEYS

## 📋 **Tổng quan**
Hướng dẫn chi tiết về các environment variables và cách điền chúng đúng cách.

## 🎯 **PHÂN LOẠI CÁC KEY**

### **1. 🔴 BẮT BUỘC PHẢI ĐIỀN (Required)**

```env
# Database - BẮT BUỘC
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security - BẮT BUỘC (phải thay đổi cho bảo mật)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-must-be-32-chars-minimum
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application - BẮT BUỘC
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### **2. 🟡 TÙY CHỌN NHƯNG KHUYẾN NGHỊ (Optional but Recommended)**

```env
# Security Headers - TÙY CHỌN
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000

# Monitoring - TÙY CHỌN
MONITORING_ENABLED=true
LOG_LEVEL=info
```

### **3. 🟢 TÙY CHỌN (Optional)**

```env
# Email - TÙY CHỌN (có thể bỏ trống)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# AI/ML - TÙY CHỌN
AI_MODEL_PATH=/opt/ai-detection
WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json
```

## 🔧 **CÁCH ĐIỀN CHI TIẾT**

### **Bước 1: Tạo file .env.local**
```bash
# Copy từ template
cp env.example .env.local

# Hoặc tạo mới
touch .env.local
```

### **Bước 2: Generate các key bảo mật**
```bash
# Chạy script tự động
node generate-env-keys.js

# Hoặc tạo thủ công
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Bước 3: Điền từng loại key**

#### **🔴 Database Configuration (BẮT BUỘC):**
```env
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app
```
- **Giải thích**: Kết nối đến MongoDB local
- **Thay đổi**: Chỉ khi MongoDB chạy trên port khác

#### **🔴 Security Configuration (BẮT BUỘC):**
```env
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz5678901234567890
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```
- **JWT_SECRET**: Key để mã hóa JWT tokens (32+ ký tự)
- **JWT_EXPIRES_IN**: Thời gian hết hạn token (24h, 7d, 30d)
- **BCRYPT_ROUNDS**: Số rounds mã hóa password (8-15)

#### **🔴 Application Configuration (BẮT BUỘC):**
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YWJjMTIzZGVmNDU2Z2hpNzg5amtsMDEybW5vMzQ1cHFyNjc4c3R1OTAxdnd4MjM0eXo1Njc4OTAxMjM0NTY3ODkw
```
- **NODE_ENV**: Môi trường (development, production)
- **NEXTAUTH_URL**: URL của ứng dụng
- **NEXTAUTH_SECRET**: Secret cho NextAuth (32+ ký tự)

#### **🟡 Security Headers (TÙY CHỌN):**
```env
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000
```
- **SECURITY_HEADERS**: Enable security headers
- **RATE_LIMITING**: Enable rate limiting
- **CORS_ORIGIN**: CORS origin cho API

#### **🟢 Email Configuration (TÙY CHỌN):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tinyly90891@gmail.com
SMTP_PASS=wixp lhfy lspu awsl
SMTP_FROM=noreply@yourdomain.com
```
- **Có thể bỏ trống** nếu không cần gửi email
- **SMTP_USER/PASS**: Thông tin Gmail app password

#### **🟢 AI/ML Configuration (TÙY CHỌN):**
```env
AI_MODEL_PATH=/opt/ai-detection
WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json
```
- **AI_MODEL_PATH**: Đường dẫn đến AI models
- **WAZUH_LOG_PATH**: Đường dẫn đến Wazuh logs

## 🚀 **QUICK SETUP**

### **Option 1: Tự động (Khuyến nghị)**
```bash
# Generate keys tự động
node generate-env-keys.js

# Copy output và paste vào .env.local
```

### **Option 2: Thủ công**
```bash
# Tạo JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Tạo NextAuth secret
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

## 📝 **FILE .ENV.LOCAL HOÀN CHỈNH**

```env
# Database Configuration - BẮT BUỘC
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Configuration - BẮT BUỘC (THAY ĐỔI CHO BẢO MẬT)
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz5678901234567890
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application Configuration - BẮT BUỘC
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YWJjMTIzZGVmNDU2Z2hpNzg5amtsMDEybW5vMzQ1cHFyNjc4c3R1OTAxdnd4MjM0eXo1Njc4OTAxMjM0NTY3ODkw

# Security Headers - TÙY CHỌN
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000

# AI/ML Configuration - TÙY CHỌN
AI_MODEL_PATH=/opt/ai-detection
WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json

# Email Configuration - TÙY CHỌN (BỎ TRỐNG NẾU KHÔNG CẦN)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tinyly90891@gmail.com
SMTP_PASS=wixp lhfy lspu awsl
SMTP_FROM=noreply@yourdomain.com

# Monitoring - TÙY CHỌN
MONITORING_ENABLED=true
LOG_LEVEL=info
```

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **🔒 Bảo mật:**
1. **KHÔNG** commit file `.env.local` vào Git
2. **THAY ĐỔI** JWT_SECRET và NEXTAUTH_SECRET trong production
3. **KHÔNG** chia sẻ các key này với ai
4. **BACKUP** các key ở nơi an toàn

### **🔧 Development vs Production:**
```env
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/secure-app

# Production
NODE_ENV=production
MONGODB_URI=mongodb://username:password@host:27017/secure-app?authSource=admin
```

### **📧 Email Configuration:**
- **Có thể bỏ trống** nếu không cần gửi email
- **SMTP_PASS** là Gmail App Password, không phải password thường
- **SMTP_FROM** phải match với SMTP_USER

## 🧪 **TEST CONFIGURATION**

### **Kiểm tra .env.local:**
```bash
# Test load environment
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI); console.log('JWT Secret length:', process.env.JWT_SECRET?.length);"
```

### **Kiểm tra kết nối:**
```bash
# Test MongoDB connection
npm run test-mongodb

# Test application
npm run dev
```

## 🆘 **TROUBLESHOOTING**

### **Lỗi thường gặp:**

#### **1. JWT_SECRET quá ngắn:**
```
Error: JWT_SECRET must be at least 32 characters
```
**Giải pháp**: Tạo JWT secret dài hơn 32 ký tự

#### **2. MongoDB connection failed:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp**: Khởi động MongoDB service

#### **3. Environment variables not loaded:**
```
Error: MONGODB_URI is not defined
```
**Giải pháp**: Kiểm tra file `.env.local` có tồn tại và đúng format

#### **4. Email sending failed:**
```
Error: Invalid login
```
**Giải pháp**: Kiểm tra Gmail App Password

## 🎯 **TÓM TẮT**

### **BẮT BUỘC phải điền:**
- ✅ MONGODB_URI, MONGODB_DB
- ✅ JWT_SECRET, NEXTAUTH_SECRET (generate mới)
- ✅ NODE_ENV, NEXTAUTH_URL

### **TÙY CHỌN nhưng khuyến nghị:**
- 🔶 SECURITY_HEADERS, RATE_LIMITING
- 🔶 MONITORING_ENABLED

### **CÓ THỂ BỎ TRỐNG:**
- 🔹 SMTP_* (nếu không cần email)
- 🔹 AI_MODEL_PATH, WAZUH_LOG_PATH

**🚀 Sau khi điền xong, chạy: `npm run dev`**
