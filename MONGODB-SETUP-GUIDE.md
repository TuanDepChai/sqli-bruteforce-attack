# 🚀 HƯỚNG DẪN KẾT NỐI MONGODB - CHI TIẾT

## 📋 **Tổng quan**
Hướng dẫn từng bước để kết nối MongoDB với web application bảo mật.

## 🔧 **Bước 1: Cài đặt MongoDB**

### **Windows:**

#### **Option 1: Download trực tiếp**
1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn **Windows** và **MSI**
3. Download và cài đặt
4. Chọn **"Install MongoDB as a Service"**
5. Chọn **"Run service as Network Service user"**

#### **Option 2: Sử dụng Chocolatey**
```powershell
# Cài đặt Chocolatey (nếu chưa có)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Cài đặt MongoDB
choco install mongodb
```

#### **Option 3: Sử dụng winget**
```powershell
winget install MongoDB.Server
```

### **Ubuntu/Linux:**
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update và cài đặt
sudo apt-get update
sudo apt-get install -y mongodb-org

# Khởi động service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔧 **Bước 2: Kiểm tra MongoDB**

### **Windows:**
```cmd
# Kiểm tra service
sc query MongoDB

# Khởi động nếu chưa chạy
net start MongoDB

# Test connection
mongosh
```

### **Linux:**
```bash
# Kiểm tra status
sudo systemctl status mongod

# Khởi động nếu cần
sudo systemctl start mongod

# Test connection
mongosh
```

## 🔧 **Bước 3: Cấu hình Environment**

### **Tạo file .env.local:**
```bash
# Copy từ template
copy env.example .env.local
```

### **Chỉnh sửa .env.local:**
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
```

## 🔧 **Bước 4: Setup Database**

### **Cài đặt dependencies:**
```bash
npm install
npm install mongodb bcryptjs
```

### **Chạy setup script:**
```bash
node setup-mongodb-windows.js
```

### **Hoặc sử dụng npm script:**
```bash
npm run setup-db
```

## 🔧 **Bước 5: Kiểm tra kết nối**

### **Test MongoDB connection:**
```bash
# Chạy test script
node -e "
const { MongoClient } = require('mongodb');
async function test() {
  try {
    const client = new MongoClient('mongodb://localhost:27017/secure-app');
    await client.connect();
    console.log('✅ MongoDB connected successfully!');
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}
test();
"
```

## 🔧 **Bước 6: Chạy ứng dụng**

### **Development:**
```bash
npm run dev
```

### **Production:**
```bash
npm run build
npm start
```

## 🔧 **Bước 7: Truy cập ứng dụng**

### **URLs:**
- **Main App**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

### **Default Users:**
- **Admin**: `admin` / `Admin123!@#`
- **Security**: `security` / `Security123!@#`

## 🔧 **Troubleshooting**

### **Lỗi thường gặp:**

#### **1. MongoDB không khởi động:**
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

#### **2. Connection refused:**
```bash
# Kiểm tra port 27017
netstat -an | findstr 27017

# Kiểm tra MongoDB config
# Windows: C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg
# Linux: /etc/mongod.conf
```

#### **3. Permission denied:**
```bash
# Windows: Chạy Command Prompt as Administrator
# Linux: Sử dụng sudo
```

#### **4. Database not found:**
```bash
# Tạo database thủ công
mongosh
use secure-app
db.test.insertOne({test: "data"})
```

## 🔧 **MongoDB Management**

### **MongoDB Compass (GUI):**
1. Download: https://www.mongodb.com/products/compass
2. Connect: `mongodb://localhost:27017`
3. Browse collections và data

### **MongoDB Shell Commands:**
```javascript
// Kết nối
mongosh

// List databases
show dbs

// Use database
use secure-app

// List collections
show collections

// Find documents
db.users.find()
db.securityevents.find().limit(10)

// Count documents
db.users.countDocuments()
db.securityevents.countDocuments({severity: "critical"})
```

## 🔧 **Production Setup**

### **Security Configuration:**
```env
# Production environment
NODE_ENV=production
MONGODB_URI=mongodb://username:password@localhost:27017/secure-app?authSource=admin
JWT_SECRET=your-very-secure-jwt-secret-key-32-characters-minimum
```

### **MongoDB Authentication:**
```bash
# Tạo admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Enable authentication
# Edit mongod.cfg:
security:
  authorization: enabled
```

## 🔧 **Monitoring & Maintenance**

### **Check MongoDB Status:**
```bash
# Windows
sc query MongoDB

# Linux
sudo systemctl status mongod
```

### **View Logs:**
```bash
# Windows: Event Viewer -> Applications and Services -> MongoDB
# Linux: /var/log/mongodb/mongod.log
```

### **Backup Database:**
```bash
mongodump --db secure-app --out backup/
```

### **Restore Database:**
```bash
mongorestore --db secure-app backup/secure-app/
```

## 🎉 **Kết quả mong đợi**

Sau khi setup thành công, bạn sẽ có:

✅ **MongoDB** chạy trên port 27017  
✅ **Database** `secure-app` với các collections  
✅ **Default users** để đăng nhập  
✅ **Security indexes** cho performance  
✅ **Web application** kết nối thành công  

## 📞 **Hỗ trợ**

Nếu gặp vấn đề:
1. Kiểm tra MongoDB service đang chạy
2. Verify connection string trong .env.local
3. Check firewall settings (port 27017)
4. Review MongoDB logs

**🚀 Chúc bạn setup thành công!**
