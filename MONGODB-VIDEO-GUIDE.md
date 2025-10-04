# 📹 MONGODB SETUP - VIDEO HƯỚNG DẪN

## 🎬 **Video 1: Cài đặt MongoDB trên Windows**

### **Phút 0-1: Giới thiệu**
- MongoDB là gì?
- Tại sao sử dụng MongoDB?
- Chuẩn bị môi trường

### **Phút 1-3: Download và cài đặt**
```bash
# Truy cập website
https://www.mongodb.com/try/download/community

# Chọn:
- Version: 6.0+
- Platform: Windows
- Package: MSI
```

### **Phút 3-5: Cài đặt**
1. Double-click file .msi
2. Chọn "Complete" installation
3. ✅ Check "Install MongoDB as a Service"
4. ✅ Check "Run service as Network Service user"
5. ✅ Check "Install MongoDB Compass"
6. Click "Install"

### **Phút 5-6: Kiểm tra**
```cmd
# Mở Command Prompt
net start MongoDB
mongosh
```

## 🎬 **Video 2: Cấu hình Environment**

### **Phút 0-1: Tạo file .env.local**
```bash
# Copy template
copy env.example .env.local
```

### **Phút 1-3: Chỉnh sửa cấu hình**
```env
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### **Phút 3-4: Cài đặt dependencies**
```bash
npm install
npm install mongodb bcryptjs
```

## 🎬 **Video 3: Test kết nối MongoDB**

### **Phút 0-1: Chạy test script**
```bash
npm run test-mongodb
```

### **Phút 1-2: Kết quả mong đợi**
```
✅ Connected to MongoDB successfully!
✅ Database ping successful!
✅ Found 3 collections:
   - users
   - securityevents
   - sessions
✅ All tests passed!
```

### **Phút 2-3: Troubleshooting**
- Nếu lỗi ECONNREFUSED → MongoDB chưa khởi động
- Nếu lỗi authentication → Kiểm tra username/password
- Nếu lỗi timeout → Kiểm tra firewall

## 🎬 **Video 4: Setup Database**

### **Phút 0-1: Chạy setup script**
```bash
npm run setup-db-windows
```

### **Phút 1-3: Quá trình setup**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully!
📊 Creating collections...
✅ Users collection created
✅ Security events collection created
✅ Sessions collection created
📈 Creating indexes...
✅ Users indexes created
✅ Security events indexes created
✅ Sessions indexes created
```

### **Phút 3-4: Tạo default users**
```
👤 Creating default admin user...
✅ Default admin user created
   Username: admin
   Password: Admin123!@#

🔍 Creating security analyst user...
✅ Security analyst user created
   Username: security
   Password: Security123!@#
```

### **Phút 4-5: Test data**
```
🧪 Testing data insertion...
✅ Test data inserted successfully
🎉 MongoDB setup completed successfully!
```

## 🎬 **Video 5: Chạy ứng dụng**

### **Phút 0-1: Start development server**
```bash
npm run dev
```

### **Phút 1-2: Truy cập ứng dụng**
- Mở browser: http://localhost:3000
- Click "Login"
- Nhập: admin / Admin123!@#

### **Phút 2-3: Test các tính năng**
- ✅ Login thành công
- ✅ Dashboard hiển thị
- ✅ Security events tracking
- ✅ Real-time monitoring

### **Phút 3-4: MongoDB Compass**
1. Mở MongoDB Compass
2. Connect: mongodb://localhost:27017
3. Browse database: secure-app
4. View collections và documents

## 🎬 **Video 6: Troubleshooting**

### **Lỗi thường gặp:**

#### **MongoDB service không khởi động:**
```cmd
# Kiểm tra service
sc query MongoDB

# Khởi động manual
net start MongoDB

# Nếu vẫn lỗi, restart service
net stop MongoDB
net start MongoDB
```

#### **Port 27017 bị block:**
```cmd
# Kiểm tra port
netstat -an | findstr 27017

# Kiểm tra firewall
# Windows Firewall → Allow an app → MongoDB
```

#### **Permission denied:**
```cmd
# Chạy Command Prompt as Administrator
# Hoặc set quyền cho MongoDB service
```

#### **Database not found:**
```javascript
// Tạo database thủ công
mongosh
use secure-app
db.test.insertOne({test: "data"})
```

## 🎬 **Video 7: Production Setup**

### **Bước 1: Environment variables**
```env
NODE_ENV=production
MONGODB_URI=mongodb://username:password@localhost:27017/secure-app?authSource=admin
JWT_SECRET=very-secure-jwt-secret-key-32-characters-minimum
```

### **Bước 2: MongoDB authentication**
```javascript
// Tạo admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### **Bước 3: Enable authentication**
```yaml
# Edit mongod.cfg
security:
  authorization: enabled
```

### **Bước 4: SSL/TLS**
```yaml
# Add to mongod.cfg
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /path/to/server.pem
```

## 🎬 **Video 8: Monitoring & Maintenance**

### **Check MongoDB status:**
```cmd
# Windows
sc query MongoDB

# Linux
sudo systemctl status mongod
```

### **View logs:**
```bash
# Windows: Event Viewer
# Linux: tail -f /var/log/mongodb/mongod.log
```

### **Backup database:**
```bash
mongodump --db secure-app --out backup/
```

### **Restore database:**
```bash
mongorestore --db secure-app backup/secure-app/
```

### **Performance monitoring:**
```javascript
// MongoDB shell
db.runCommand({serverStatus: 1})
db.stats()
db.users.stats()
```

## 🎯 **Tổng kết**

Sau khi hoàn thành tất cả video:

✅ **MongoDB** cài đặt và chạy thành công  
✅ **Database** setup với collections và indexes  
✅ **Default users** để đăng nhập  
✅ **Web application** kết nối MongoDB  
✅ **Security features** hoạt động  
✅ **Production ready** configuration  

**🚀 Bạn đã sẵn sàng sử dụng web application bảo mật với MongoDB!**
