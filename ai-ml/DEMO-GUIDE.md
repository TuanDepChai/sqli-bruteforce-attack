# 🚀 HƯỚNG DẪN DEMO AI KHÔNG GIÁM SÁT

## 📋 Tổng quan

Demo này sử dụng AI không giám sát (Unsupervised Learning) với Isolation Forest để:
- **Học từ traffic sạch** trong Wazuh archives.json
- **Phát hiện bất thường** dựa trên đặc trưng SQLi và Brute Force
- **Không sử dụng event_type** - hoàn toàn unsupervised

## 🎯 Đặc trưng được phân tích

### 1. **SQL Injection Detection**
- URL payload complexity (SQL keywords, special chars)
- Username/password manipulation
- Query structure analysis
- Encoding patterns

### 2. **Brute Force Detection**
- User Agent analysis (PythonBruteForce, curl, etc.)
- Password patterns (weak passwords, dictionary attacks)
- Success/failure patterns
- Timing analysis

### 3. **Behavioral Analysis**
- Request patterns
- IP analysis
- Temporal anomalies
- Status code patterns

## 🛠️ Cài đặt và chạy

### Bước 1: Copy files lên Ubuntu Wazuh Manager

```bash
# SSH vào Wazuh Manager (192.168.205.128)
ssh web@192.168.205.128

# Copy files từ Windows
scp -r ai-ml/ web@192.168.205.128:/home/web/Desktop/sqli-bruteforce-attack/
```

### Bước 2: Chạy Demo với log thực tế

```bash
# Chạy demo với archives.json thực tế
sudo /home/web/Desktop/sqli-bruteforce-attack/ai-ml/run-ubuntu-demo.sh
```

**Kết quả mong đợi:**
- 📚 Đọc và xử lý log từ `/var/ossec/logs/archives/archives.json`
- 🤖 Huấn luyện Isolation Forest từ traffic sạch
- 🔍 Phát hiện bất thường trong log mới
- 💾 Xuất file `ai-detection-results.json`

## 📊 Log mẫu được test

### 1. **Brute Force Attack**
```json
{
  "username": "administrator",
  "password": "Football",
  "user_agent": "PythonBruteForce/1.0",
  "success": false
}
```
**Expected:** Phát hiện Brute Force

### 2. **SQL Injection Attack**
```json
{
  "username": "man'\"} {\"timestamp\":\"2025-10-04T00:10:39.846+0700\"...",
  "password": "1",
  "user_agent": "Mozilla/5.0...",
  "success": false
}
```
**Expected:** Phát hiện SQL Injection

### 3. **Normal Traffic**
```json
{
  "username": "admin",
  "password": "password123",
  "user_agent": "Mozilla/5.0...",
  "success": true
}
```
**Expected:** Phân loại Normal Traffic

## 🔍 Phân tích kết quả

### File `ai-detection-results.json`
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

### Metrics quan trọng:
- **Anomaly Score:** Giá trị âm = bất thường
- **Confidence:** Độ tin cậy của phát hiện
- **Attack Type:** Loại tấn công được phân loại

## 🚨 Xử lý lỗi thường gặp

### 1. **Không tìm thấy archives.json**
```bash
# Kiểm tra Wazuh đang chạy
sudo systemctl status wazuh-manager

# Kiểm tra file log
ls -la /var/ossec/logs/archives/
```

### 2. **Không có log từ attacks.log**
```bash
# Chạy tấn công trên web app trước
# Hoặc kiểm tra log hiện có
sudo tail -f /var/ossec/logs/archives/archives.json | grep attacks.log
```

### 3. **Lỗi Python dependencies**
```bash
# Cài đặt lại dependencies
pip3 install --upgrade scikit-learn numpy pandas
```

## 📈 Tùy chỉnh AI Model

### Thay đổi contamination rate
```python
# Trong demo-unsupervised-ai.py
self.model = IsolationForest(
    contamination=0.1,  # 10% traffic bất thường
    random_state=42,
    n_estimators=100
)
```

### Thêm đặc trưng mới
```python
# Trong extract_advanced_features()
# Thêm logic phân tích mới
```

## 🎯 Kết quả mong đợi

### Demo với log thực tế:
- **Huấn luyện thành công** từ traffic sạch
- **Phát hiện bất thường** trong log mới
- **Xuất kết quả** chi tiết cho Wazuh integration

## 🔧 Tích hợp với Wazuh

### Tạo custom rule
```xml
<rule id="100001" level="12">
  <decoded_as>json</decoded_as>
  <field name="attack_type">SQL Injection</field>
  <description>AI Detected SQL Injection Attack</description>
</rule>
```

### Tạo alert
```bash
# Tích hợp với Wazuh API
curl -X POST "https://wazuh-manager:55000/events" \
  -H "Authorization: Bearer $TOKEN" \
  -d @ai-detection-results.json
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log: `tail -f /var/ossec/logs/ossec.log`
2. Xem kết quả: `cat ai-detection-results.json`
3. Chạy debug: `python3 -u demo-unsupervised-ai.py`

---

**🎉 Demo này chứng minh AI không giám sát có thể học từ traffic sạch và phát hiện chính xác SQLi/Brute Force attacks!**