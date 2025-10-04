# 🚀 QUICK MONGODB SETUP - HƯỚNG DẪN NHANH

## ⚡ **Setup trong 5 phút**

### **Bước 1: Cài đặt MongoDB**
```bash
# Windows - Sử dụng Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install mongodb

# Hoặc download từ: https://www.mongodb.com/try/download/community
```

### **Bước 2: Khởi động MongoDB**
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### **Bước 3: Cài đặt dependencies**
```bash
npm install
```

### **Bước 4: Test kết nối**
```bash
npm run test-mongodb
```

### **Bước 5: Setup database**
```bash
npm run setup-db-windows
```

### **Bước 6: Chạy ứng dụng**
```bash
npm run dev
```

## 🎯 **Truy cập ứng dụng**
- **URL**: http://localhost:3000
- **Login**: admin / Admin123!@#

## 🔧 **Nếu gặp lỗi:**

### **MongoDB không khởi động:**
```bash
# Windows
sc query MongoDB
net start MongoDB

# Linux
sudo systemctl status mongod
sudo systemctl start mongod
```

### **Connection refused:**
```bash
# Kiểm tra port
netstat -an | findstr 27017
```

### **Permission denied:**
```bash
# Chạy Command Prompt as Administrator
```

## 📞 **Cần giúp đỡ?**
Xem file `MONGODB-SETUP-GUIDE.md` để có hướng dẫn chi tiết hơn.

**🚀 Chúc bạn thành công!**
