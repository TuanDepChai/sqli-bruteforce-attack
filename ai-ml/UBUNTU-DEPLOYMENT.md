# 🚀 HƯỚNG DẪN DEPLOY AI TRÊN UBUNTU SIEM

## 📋 Tổng quan

Hướng dẫn này giúp bạn deploy AI không giám sát lên Ubuntu SIEM (192.168.205.128) một cách tự động.

## 🎯 Yêu cầu

- Ubuntu Server với quyền sudo
- Wazuh Manager đã cài đặt
- Kết nối internet để tải về từ GitHub

## 🚀 Cách 1: One-liner (Nhanh nhất)

```bash
# Chạy trực tiếp trên Ubuntu SIEM
curl -fsSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/ai-ml/ubuntu-deploy.sh | bash
```

## 🔧 Cách 2: Manual Deploy

### Bước 1: SSH vào Ubuntu SIEM
```bash
ssh root@192.168.205.128
# hoặc
ssh user@192.168.205.128
```

### Bước 2: Tải về script
```bash
# Tải về script deploy
wget https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/ai-ml/ubuntu-deploy.sh

# Cấp quyền thực thi
chmod +x ubuntu-deploy.sh

# Chạy script
sudo ./ubuntu-deploy.sh
```

### Bước 3: Kiểm tra kết quả
```bash
# Xem kết quả
cat /opt/ai-detection/ai-ml/ai-detection-results.json

# Xem hướng dẫn
cat /opt/ai-detection/ai-ml/DEMO-GUIDE.md
```

## 📁 Cấu trúc sau khi deploy

```
/opt/ai-detection/
├── sqli-bruteforce-attack/
│   ├── ai-ml/
│   │   ├── demo-unsupervised-ai.py
│   │   ├── ai-detection-results.json
│   │   ├── DEMO-GUIDE.md
│   │   └── ...
│   └── ...
```

## 🔍 Kiểm tra hoạt động

### 1. Kiểm tra Wazuh
```bash
sudo systemctl status wazuh-manager
```

### 2. Kiểm tra log files
```bash
ls -la /var/ossec/logs/archives/
tail -f /var/ossec/logs/archives/archives.json
```

### 3. Chạy demo thủ công
```bash
cd /opt/ai-detection/ai-ml
python3 demo-unsupervised-ai.py
```

## 🚨 Xử lý lỗi

### 1. Không tìm thấy archives.json
```bash
# Kiểm tra Wazuh
sudo systemctl restart wazuh-manager

# Kiểm tra log
sudo tail -f /var/ossec/logs/ossec.log
```

### 2. Không có log từ attacks.log
```bash
# Chạy tấn công trên web app trước
# Hoặc kiểm tra log hiện có
grep "attacks.log" /var/ossec/logs/archives/archives.json | wc -l
```

### 3. Lỗi Python dependencies
```bash
pip3 install --upgrade scikit-learn numpy pandas
```

## 🔄 Cập nhật AI

### Cập nhật code mới
```bash
cd /opt/ai-detection/sqli-bruteforce-attack
git pull origin main
cd ai-ml
python3 demo-unsupervised-ai.py
```

### Reset hoàn toàn
```bash
sudo rm -rf /opt/ai-detection
# Chạy lại script deploy
```

## 📊 Kết quả mong đợi

### Thành công:
- ✅ Cài đặt dependencies
- ✅ Tải về code từ GitHub
- ✅ Chạy demo AI
- ✅ Xuất file kết quả

### File kết quả:
```json
[
  {
    "timestamp": "2025-10-04T13:50:55.756+0700",
    "ip": "192.168.205.138",
    "username": "administrator",
    "attack_type": "Brute Force",
    "is_anomaly": true,
    "anomaly_score": -0.123,
    "confidence": 0.123
  }
]
```

## 🎯 Tích hợp với Wazuh

### Tạo custom rule
```bash
# Copy rule vào Wazuh
sudo cp /opt/ai-detection/ai-ml/wazuh-rules.xml /var/ossec/etc/rules/

# Restart Wazuh
sudo systemctl restart wazuh-manager
```

### Tạo alert
```bash
# Tích hợp với Wazuh API
curl -X POST "https://localhost:55000/events" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/opt/ai-detection/ai-ml/ai-detection-results.json
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log: `tail -f /var/ossec/logs/ossec.log`
2. Xem kết quả: `cat /opt/ai-detection/ai-ml/ai-detection-results.json`
3. Chạy debug: `python3 -u /opt/ai-detection/ai-ml/demo-unsupervised-ai.py`

---

**🎉 AI đã sẵn sàng phát hiện SQLi và Brute Force attacks trên Ubuntu SIEM!**
