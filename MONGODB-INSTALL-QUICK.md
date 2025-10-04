# 🚀 CÀI ĐẶT MONGODB TRÊN UBUNTU - NHANH NHẤT

## ⚡ **CÁCH NHANH NHẤT (5 phút)**

### **Option 1: Sử dụng script tự động**
```bash
# Download và chạy script
curl -fsSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/install-mongodb-ubuntu.sh | bash

# Hoặc nếu đã có script trong project
chmod +x install-mongodb-ubuntu.sh
./install-mongodb-ubuntu.sh
```

### **Option 2: Cài đặt thủ công**
```bash
# Bước 1: Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Bước 2: Cài đặt dependencies
sudo apt install -y wget curl gnupg2 software-properties-common

# Bước 3: Thêm MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Bước 4: Cài đặt MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Bước 5: Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Bước 6: Kiểm tra
sudo systemctl status mongod
```

## 🧪 **KIỂM TRA MONGODB**

### **Test cơ bản:**
```bash
# Kiểm tra service
sudo systemctl status mongod

# Kiểm tra version
mongod --version

# Test kết nối
mongosh --eval "db.adminCommand('ping')"

# Kiểm tra port
sudo netstat -tlnp | grep 27017
```

### **Test trong MongoDB shell:**
```bash
# Kết nối MongoDB
mongosh

# Trong MongoDB shell:
db.adminCommand("ping")
show dbs
use secure-app
db.test.insertOne({message: "MongoDB is working!"})
db.test.find()
exit
```

## 🔧 **CÁC LỆNH QUẢN LÝ MONGODB**

### **Quản lý service:**
```bash
# Khởi động
sudo systemctl start mongod

# Dừng
sudo systemctl stop mongod

# Khởi động lại
sudo systemctl restart mongod

# Kiểm tra status
sudo systemctl status mongod

# Enable auto-start
sudo systemctl enable mongod
```

### **Logs và monitoring:**
```bash
# Xem logs real-time
sudo tail -f /var/log/mongodb/mongod.log

# Xem logs gần đây
sudo journalctl -u mongod -f

# Kiểm tra disk usage
sudo du -sh /var/lib/mongodb
```

## 🛠️ **TROUBLESHOOTING**

### **Lỗi thường gặp:**

#### **1. MongoDB không khởi động:**
```bash
# Kiểm tra logs
sudo journalctl -u mongod -n 50

# Kiểm tra config
sudo nano /etc/mongod.conf

# Fix permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
```

#### **2. Port 27017 đã được sử dụng:**
```bash
# Tìm process sử dụng port
sudo lsof -i :27017

# Kill process nếu cần
sudo kill -9 <PID>
```

#### **3. Permission denied:**
```bash
# Fix permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Restart service
sudo systemctl restart mongod
```

#### **4. Repository không tìm thấy:**
```bash
# Update package list
sudo apt update

# Re-add repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
```

## 📊 **KIỂM TRA SAU KHI CÀI ĐẶT**

### **Test script:**
```bash
# Tạo file test
cat > test-mongodb.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing MongoDB installation..."

# Test service
if sudo systemctl is-active --quiet mongod; then
    echo "✅ MongoDB service is running"
else
    echo "❌ MongoDB service is not running"
    exit 1
fi

# Test connection
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ MongoDB connection failed"
    exit 1
fi

# Test database creation
mongosh --eval "
use secure-app;
db.test.insertOne({message: 'Test successful', timestamp: new Date()});
print('✅ Test database created successfully');
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database operations working"
else
    echo "❌ Database operations failed"
    exit 1
fi

echo "🎉 All tests passed! MongoDB is ready to use."
EOF

# Chạy test
chmod +x test-mongodb.sh
./test-mongodb.sh
```

## 🎯 **KẾT QUẢ MONG ĐỢI**

Sau khi cài đặt thành công:

✅ **MongoDB service** chạy trên port 27017  
✅ **Database** có thể tạo và thao tác  
✅ **Connection** hoạt động bình thường  
✅ **Auto-start** khi khởi động hệ thống  
✅ **Logs** được ghi vào /var/log/mongodb/  

## 🚀 **BƯỚC TIẾP THEO**

Sau khi MongoDB đã cài đặt thành công:

### **1. Generate environment keys:**
```bash
npm run generate-keys
```

### **2. Tạo file .env.local:**
```bash
cp env.example .env.local
# Chỉnh sửa .env.local với keys đã generate
```

### **3. Setup database:**
```bash
npm run setup-db-windows
```

### **4. Chạy ứng dụng:**
```bash
npm run dev
```

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề:
1. Kiểm tra logs: `sudo journalctl -u mongod -f`
2. Kiểm tra status: `sudo systemctl status mongod`
3. Kiểm tra port: `sudo netstat -tlnp | grep 27017`
4. Test connection: `mongosh --eval "db.adminCommand('ping')"`

**🚀 MongoDB là bước cuối cùng để hoàn thành setup!**
