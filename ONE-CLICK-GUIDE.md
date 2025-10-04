# 🚀 ONE-CLICK SETUP GUIDE

## 🎯 **CHỈ CẦN 1 LỆNH LÀ XONG TẤT CẢ!**

### **📋 TRÊN UBUNTU:**

```bash
npm run one-click-start
```

**HOẶC:**

```bash
npm run auto-setup-ubuntu
```

---

## 🎉 **KẾT QUẢ MONG ĐỢI:**

### **✅ TỰ ĐỘNG LÀM TẤT CẢ:**
1. ✅ Cài đặt MongoDB
2. ✅ Cài đặt Node.js
3. ✅ Cài đặt dependencies
4. ✅ Generate environment keys
5. ✅ Setup database với **10 users**
6. ✅ Khởi động web server

### **👥 10 USERS ĐƯỢC TẠO:**

#### **🔑 ADMIN USERS:**
- **admin** / Admin123!@# (System Administrator)
- **security** / Security123!@# (Security Analyst)

#### **👥 REGULAR USERS:**
- **john** / John123!@# (Regular User)
- **sarah** / Sarah123!@# (Regular User)
- **mike** / Mike123!@# (Regular User)
- **emma** / Emma123!@# (Regular User)
- **alex** / Alex123!@# (Regular User)
- **lisa** / Lisa123!@# (Regular User)
- **david** / David123!@# (Regular User)
- **test** / Test123!@# (Test User)

---

## 🌐 **TRUY CẬP:**

- **URL**: http://localhost:3000
- **Login**: Dùng bất kỳ user nào ở trên

---

## 🎯 **TÓM TẮT:**

1. **Chạy**: `npm run one-click-start`
2. **Chờ**: 5-10 phút
3. **Truy cập**: http://localhost:3000
4. **Login**: Dùng bất kỳ user nào

**🚀 HOÀN TOÀN TỰ ĐỘNG, KHÔNG CẦN LÀM GÌ THÊM!**

---

## 📝 **GHI CHÚ:**

- **Lần đầu**: Script sẽ setup tất cả
- **Lần sau**: Script chỉ start server
- **Dừng server**: Nhấn `Ctrl+C`
- **Thay đổi password**: Đăng nhập và đổi trong profile

---

## 🔧 **TROUBLESHOOTING:**

### **Lỗi MongoDB:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **Lỗi Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### **Lỗi Dependencies:**
```bash
npm install
```

### **Reset hoàn toàn:**
```bash
rm -rf node_modules .env.local
npm run one-click-start
```
