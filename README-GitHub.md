# 🚀 SQLi BruteForce WEB - GitHub Setup Guide

Hướng dẫn chi tiết để push code lên GitHub và clone về Ubuntu.

## 📋 Yêu cầu

- GitHub account
- Git đã cài đặt trên Windows
- Ubuntu server/machine

## 🔧 Bước 1: Tạo GitHub Repository

### 1.1. Tạo repository mới
1. Truy cập https://github.com
2. Click **"New repository"**
3. Repository name: `sqli-bruteforce-attack`
4. Description: `SQLi BruteForce WEB - Educational vulnerable web application with behavioral attack detection`
5. Chọn **Public**
6. **KHÔNG** tick "Add a README file"
7. Click **"Create repository"**

### 1.2. Lưu repository URL
```
https://github.com/your-username/sqli-bruteforce-attack.git
```

## 💻 Bước 2: Push từ Windows

### 2.1. Khởi tạo Git repository
```powershell
# Trong thư mục project
git init

# Cấu hình user (nếu chưa có)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Thêm remote repository
git remote add origin https://github.com/your-username/sqli-bruteforce-attack.git
```

### 2.2. Add và commit files
```powershell
# Add tất cả files
git add .

# Commit với message mô tả
git commit -m "Initial commit: SQLi BruteForce WEB with behavioral attack detection

Features:
- Intentional SQL injection vulnerabilities for educational purposes
- Behavioral brute force detection based on attack patterns
- Real-time attack logging and monitoring
- Admin dashboard with attack statistics
- Vietnam timezone timestamp support
- SQLite database with comprehensive logging
- Modern UI with Tailwind CSS and Framer Motion animations"

# Push lên GitHub
git push -u origin main
```

## 🐧 Bước 3: Clone về Ubuntu

### 3.1. Cài đặt Git trên Ubuntu
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

### 3.2. Clone repository
```bash
git clone https://github.com/your-username/sqli-bruteforce-attack.git
cd sqli-bruteforce-attack
```

### 3.3. Chạy setup script tự động
```bash
# Cấp quyền thực thi
chmod +x setup-ubuntu.sh

# Chạy setup
./setup-ubuntu.sh
```

### 3.4. Hoặc cài đặt thủ công
```bash
# Cài đặt Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt pnpm
npm install -g pnpm

# Cài đặt build tools
sudo apt-get install -y build-essential python3

# Cài đặt dependencies
pnpm install

# Rebuild better-sqlite3
npm rebuild better-sqlite3

# Chạy ứng dụng
npm run dev
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công:

- **Main Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Help/Documentation**: http://localhost:3000/help

### Truy cập từ máy khác
```bash
# Mở firewall
sudo ufw allow 3000
sudo ufw --force enable

# Truy cập từ máy khác
http://your-ubuntu-ip:3000
```

## 📊 Production Deployment

### Sử dụng PM2
```bash
# Cài đặt PM2
npm install -g pm2

# Chạy với PM2
pm2 start npm --name "sqli-bruteforce" -- run dev

# Các lệnh hữu ích
pm2 logs sqli-bruteforce    # Xem logs
pm2 restart sqli-bruteforce # Restart
pm2 stop sqli-bruteforce    # Dừng
pm2 status                  # Kiểm tra trạng thái
```

## 🗄️ Database và Logs

### Database
- File: `vulnerable.db` (SQLite)
- Tự động tạo khi chạy lần đầu
- Chứa users và attack logs

### Logs
- Thư mục: `logs/`
- Files:
  - `attacks.log` - Tất cả attacks
  - `brute_force.log` - Brute force attacks
  - `sql_injection.log` - SQL injection attacks
  - `critical-attacks.log` - Successful attacks

### Xem logs
```bash
# Xem logs real-time
tail -f logs/attacks.log

# Xem logs brute force
tail -f logs/brute_force.log
```

## 🧪 Testing

### Test API endpoints
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test logs endpoint
curl http://localhost:3000/api/logs
```

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. "better-sqlite3" build error
```bash
sudo apt-get install -y build-essential python3
npm rebuild better-sqlite3
```

#### 2. Permission denied
```bash
sudo chown -R $USER:$USER ~/sqli-bruteforce-attack
chmod +x *.sh
```

#### 3. Port 3000 already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

## 🔐 Security Notes

⚠️ **Cảnh báo**: Đây là ứng dụng intentionally vulnerable cho mục đích giáo dục.

- Không deploy trên production
- Chỉ sử dụng trong môi trường lab/test
- Không expose ra internet
- Backup database thường xuyên

## 📱 Features

### ✅ Đã implement
- [x] Intentional SQL injection vulnerabilities
- [x] Behavioral brute force detection
- [x] Real-time attack logging
- [x] Admin dashboard with statistics
- [x] Vietnam timezone support
- [x] Modern UI with animations
- [x] Comprehensive logging system

### 🔍 Attack Detection
- **SQL Injection**: Pattern-based detection
- **Brute Force**: Behavioral analysis
  - Rapid requests (>10 in 5 minutes)
  - Multiple usernames/passwords
  - High failure rate
  - Dictionary attacks
  - Common patterns

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `tail -f logs/attacks.log`
2. Kiểm tra Git status: `git status`
3. Restart server: `pm2 restart sqli-bruteforce`
4. Rebuild dependencies: `npm rebuild better-sqlite3`

---

🎉 **Chúc bạn thành công với SQLi BruteForce WEB!**

📝 **Lưu ý**: Timestamps được set theo timezone Việt Nam (UTC+7)
