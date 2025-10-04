# 🐧 UBUNTU MONGODB SETUP - HƯỚNG DẪN CHI TIẾT

## 📋 **Tổng quan**
Hướng dẫn từng bước để cài đặt và kết nối MongoDB với web application trên Ubuntu.

## 🔧 **Bước 1: Cập nhật hệ thống**

```bash
# Cập nhật package list
sudo apt update

# Cập nhật hệ thống
sudo apt upgrade -y

# Cài đặt các tools cần thiết
sudo apt install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
```

## 🔧 **Bước 2: Cài đặt MongoDB**

### **Option 1: Cài đặt MongoDB Community Edition (Khuyến nghị)**

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Thêm MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Cập nhật package list
sudo apt update

# Cài đặt MongoDB
sudo apt install -y mongodb-org

# Khởi động MongoDB service
sudo systemctl start mongod

# Enable MongoDB auto-start
sudo systemctl enable mongod

# Kiểm tra status
sudo systemctl status mongod
```

### **Option 2: Cài đặt từ snap (Đơn giản hơn)**

```bash
# Cài đặt MongoDB từ snap
sudo snap install mongodb

# Khởi động MongoDB
sudo snap start mongodb
```

## 🔧 **Bước 3: Cấu hình MongoDB**

### **Kiểm tra cài đặt:**

```bash
# Kiểm tra version
mongod --version
mongo --version

# Kiểm tra service status
sudo systemctl status mongod

# Kiểm tra port
sudo netstat -tlnp | grep 27017
```

### **Cấu hình cơ bản:**

```bash
# Tạo thư mục log và data
sudo mkdir -p /var/log/mongodb
sudo mkdir -p /var/lib/mongodb

# Set quyền
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb

# Edit config file
sudo nano /etc/mongod.conf
```

### **Nội dung file /etc/mongod.conf:**

```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security (uncomment for production)
# security:
#   authorization: enabled
```

## 🔧 **Bước 4: Khởi động và test MongoDB**

```bash
# Restart MongoDB với config mới
sudo systemctl restart mongod

# Kiểm tra logs
sudo tail -f /var/log/mongodb/mongod.log

# Test kết nối
mongosh
```

### **Trong MongoDB shell:**

```javascript
// Test kết nối
db.adminCommand("ping")

// Hiển thị databases
show dbs

// Tạo database mới
use secure-app

// Test insert
db.test.insertOne({message: "MongoDB is working!"})

// Kiểm tra
db.test.find()

// Thoát
exit
```

## 🔧 **Bước 5: Cài đặt Node.js và dependencies**

### **Cài đặt Node.js:**

```bash
# Cài đặt Node.js 18+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### **Cài đặt project dependencies:**

```bash
# Clone project (nếu chưa có)
cd ~/
git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack

# Cài đặt dependencies
npm install

# Cài đặt MongoDB driver
npm install mongodb mongoose bcryptjs
```

## 🔧 **Bước 6: Cấu hình Environment**

### **Tạo file .env.local:**

```bash
# Copy template
cp env.example .env.local

# Chỉnh sửa
nano .env.local
```

### **Nội dung .env.local:**

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-must-be-32-chars-minimum
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Security Headers
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000

# AI/ML Configuration
AI_MODEL_PATH=/opt/ai-detection
WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tinyly90891@gmail.com
SMTP_PASS=wixp lhfy lspu awsl
SMTP_FROM=noreply@yourdomain.com

# Monitoring
MONITORING_ENABLED=true
LOG_LEVEL=info
```

## 🔧 **Bước 7: Test kết nối MongoDB**

### **Tạo script test:**

```bash
# Tạo file test
nano test-mongodb-ubuntu.js
```

### **Nội dung test-mongodb-ubuntu.js:**

```javascript
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/secure-app';

async function testConnection() {
  let client;
  try {
    console.log('🔌 Testing MongoDB connection on Ubuntu...');
    
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db('secure-app');
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
    
    // Test insert/delete
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Ubuntu MongoDB test'
    });
    console.log('✅ Insert test successful:', result.insertedId);
    
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Delete test successful');
    
    console.log('🎉 All tests passed! MongoDB is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection();
```

### **Chạy test:**

```bash
node test-mongodb-ubuntu.js
```

## 🔧 **Bước 8: Setup Database với collections**

### **Tạo script setup cho Ubuntu:**

```bash
nano setup-mongodb-ubuntu.js
```

### **Nội dung setup-mongodb-ubuntu.js:**

```javascript
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/secure-app';

async function setupDatabase() {
  let client;
  try {
    console.log('🚀 Setting up MongoDB on Ubuntu...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('secure-app');
    
    // Drop existing collections (optional)
    try {
      await db.collection('users').drop();
      await db.collection('securityevents').drop();
      await db.collection('sessions').drop();
      console.log('🧹 Cleaned existing collections');
    } catch (e) {
      // Collections don't exist, that's fine
    }
    
    // Create collections
    console.log('📊 Creating collections...');
    await db.createCollection('users');
    await db.createCollection('securityevents');
    await db.createCollection('sessions');
    await db.createCollection('blocked_ips');
    
    // Create indexes
    console.log('📈 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Security events indexes
    await db.collection('securityevents').createIndex({ timestamp: 1 });
    await db.collection('securityevents').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ eventType: 1, timestamp: 1 });
    
    // Sessions indexes
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    console.log('✅ Indexes created');
    
    // Create default admin user
    console.log('👤 Creating default users...');
    
    const adminPassword = await bcrypt.hash('Admin123!@#', 12);
    await db.collection('users').insertOne({
      username: 'admin',
      email: 'admin@secure-app.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const securityPassword = await bcrypt.hash('Security123!@#', 12);
    await db.collection('users').insertOne({
      username: 'security',
      email: 'security@secure-app.com',
      password: securityPassword,
      role: 'security_analyst',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Default users created:');
    console.log('   admin / Admin123!@#');
    console.log('   security / Security123!@#');
    
    // Test data
    console.log('🧪 Creating test data...');
    await db.collection('securityevents').insertOne({
      eventType: 'login_attempt',
      severity: 'low',
      ip: '127.0.0.1',
      userAgent: 'Ubuntu Setup Test',
      endpoint: '/api/test',
      method: 'POST',
      statusCode: 200,
      timestamp: new Date(),
      riskScore: 10,
      isBlocked: false,
      details: 'Ubuntu MongoDB setup test event'
    });
    
    console.log('✅ Test data created');
    console.log('🎉 MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

setupDatabase();
```

### **Chạy setup:**

```bash
node setup-mongodb-ubuntu.js
```

## 🔧 **Bước 9: Chạy Web Application**

### **Development mode:**

```bash
# Chạy development server
npm run dev

# Hoặc
npm start
```

### **Production mode:**

```bash
# Build application
npm run build

# Start production server
npm start
```

## 🔧 **Bước 10: Kiểm tra kết quả**

### **Truy cập ứng dụng:**

```bash
# Mở browser hoặc curl test
curl http://localhost:3000

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!@#"}'
```

### **Kiểm tra MongoDB:**

```bash
# Kết nối MongoDB shell
mongosh

# Chuyển sang database
use secure-app

# Kiểm tra collections
show collections

# Kiểm tra users
db.users.find().pretty()

# Kiểm tra security events
db.securityevents.find().limit(5).pretty()

# Thoát
exit
```

## 🔧 **Bước 11: Cấu hình Firewall (Optional)**

### **Cấu hình UFW:**

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP
sudo ufw allow 3000

# Allow MongoDB (chỉ local)
sudo ufw allow from 127.0.0.1 to any port 27017

# Check status
sudo ufw status
```

## 🔧 **Bước 12: Cấu hình Systemd Service (Production)**

### **Tạo service file:**

```bash
sudo nano /etc/systemd/system/secure-web-app.service
```

### **Nội dung service:**

```ini
[Unit]
Description=Secure Web Application
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/ubuntu/sqli-bruteforce-attack
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### **Enable và start service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable secure-web-app

# Start service
sudo systemctl start secure-web-app

# Check status
sudo systemctl status secure-web-app
```

## 🔧 **Troubleshooting Ubuntu**

### **MongoDB không khởi động:**

```bash
# Check logs
sudo journalctl -u mongod -f

# Check config
sudo nano /etc/mongod.conf

# Restart service
sudo systemctl restart mongod

# Check port
sudo netstat -tlnp | grep 27017
```

### **Permission denied:**

```bash
# Fix MongoDB permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Fix project permissions
sudo chown -R $USER:$USER ~/sqli-bruteforce-attack
```

### **Port already in use:**

```bash
# Find process using port 27017
sudo lsof -i :27017

# Kill process if needed
sudo kill -9 <PID>
```

### **Node.js không tìm thấy:**

```bash
# Reinstall Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Check PATH
echo $PATH
which node
```

## 🎉 **Kết quả mong đợi**

Sau khi hoàn thành, bạn sẽ có:

✅ **MongoDB** chạy trên Ubuntu port 27017  
✅ **Database** `secure-app` với collections  
✅ **Default users**: admin/Admin123!@#  
✅ **Web application** tại http://localhost:3000  
✅ **Security dashboard** với real-time monitoring  
✅ **AI integration** với MongoDB  
✅ **Production-ready** configuration  

## 📞 **Hỗ trợ Ubuntu**

### **Logs quan trọng:**
- MongoDB: `/var/log/mongodb/mongod.log`
- System: `sudo journalctl -u mongod`
- Application: `npm run dev` output

### **Commands hữu ích:**
```bash
# MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Check disk space
df -h

# Check memory
free -h

# Check processes
ps aux | grep mongod
```

**🚀 Chúc bạn setup MongoDB trên Ubuntu thành công!**
