#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔑 GENERATING SECURE ENVIRONMENT KEYS');
console.log('=====================================');
console.log('');

// Generate JWT Secret (32 bytes = 64 hex characters)
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Generate NextAuth Secret (32 bytes = 44 base64 characters)
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Generate random password for admin user
const adminPassword = crypto.randomBytes(16).toString('hex');

console.log('✅ Generated secure keys:');
console.log('');
console.log('JWT_SECRET=' + jwtSecret);
console.log('NEXTAUTH_SECRET=' + nextAuthSecret);
console.log('');
console.log('📋 Copy these values to your .env.local file');
console.log('');
console.log('🔒 Complete .env.local configuration:');
console.log('');
console.log('# Database Configuration - BẮT BUỘC');
console.log('MONGODB_URI=mongodb://localhost:27017/secure-app');
console.log('MONGODB_DB=secure-app');
console.log('');
console.log('# Security Configuration - BẮT BUỘC (THAY ĐỔI CHO BẢO MẬT)');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_EXPIRES_IN=24h');
console.log('BCRYPT_ROUNDS=12');
console.log('');
console.log('# Application Configuration - BẮT BUỘC');
console.log('NODE_ENV=development');
console.log('NEXTAUTH_URL=http://localhost:3000');
console.log('NEXTAUTH_SECRET=' + nextAuthSecret);
console.log('');
console.log('# Security Headers - TÙY CHỌN');
console.log('SECURITY_HEADERS=true');
console.log('RATE_LIMITING=true');
console.log('CORS_ORIGIN=http://localhost:3000');
console.log('');
console.log('# AI/ML Configuration - TÙY CHỌN');
console.log('AI_MODEL_PATH=/opt/ai-detection');
console.log('WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json');
console.log('');
console.log('# Email Configuration - TÙY CHỌN (BỎ TRỐNG NẾU KHÔNG CẦN)');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=');
console.log('SMTP_PASS=');
console.log('SMTP_FROM=noreply@yourdomain.com');
console.log('');
console.log('# Monitoring - TÙY CHỌN');
console.log('MONITORING_ENABLED=true');
console.log('LOG_LEVEL=info');
console.log('');
console.log('⚠️  LƯU Ý QUAN TRỌNG:');
console.log('1. KHÔNG chia sẻ các key này với ai');
console.log('2. Thay đổi JWT_SECRET và NEXTAUTH_SECRET trong production');
console.log('3. Email config có thể bỏ trống nếu không cần gửi email');
console.log('4. Lưu backup các key này ở nơi an toàn');
console.log('');
console.log('🚀 Sau khi tạo .env.local, chạy: npm run dev');
