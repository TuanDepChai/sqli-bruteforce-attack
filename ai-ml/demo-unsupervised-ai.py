#!/usr/bin/env python3
"""
🚀 DEMO AI KHÔNG GIÁM SÁT - Xử lý log thực tế từ Wazuh archives.json
Học từ traffic sạch dựa trên đặc trưng SQLi và Brute Force
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import re
import hashlib
import warnings
warnings.filterwarnings('ignore')

class RealTimeUnsupervisedAI:
    def __init__(self):
        """Khởi tạo AI không giám sát"""
        self.model = IsolationForest(
            contamination=0.1,  # 10% traffic bất thường
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []
        self.normal_patterns = {}
        
        print("🤖 AI Không Giám Sát đã khởi tạo")
        print("📊 Sẽ học từ traffic sạch và phát hiện bất thường")

    def extract_advanced_features(self, log_data):
        """Trích xuất đặc trưng nâng cao từ log thực tế"""
        features = []
        
        # 1. URL Payload Analysis
        url = log_data.get('url', '')
        url_complexity = 0.0
        
        if url:
            # SQL Injection patterns trong URL
            sqli_patterns = [
                r"'", r'"', r";", r"--", r"\/\*", r"\/\*.*\*\/",
                r"UNION", r"SELECT", r"OR\s+1\s*=\s*1", r"AND\s+1\s*=\s*1",
                r"ORDER\s+BY", r"GROUP\s+BY", r"HAVING", r"WHERE",
                r"INSERT", r"UPDATE", r"DELETE", r"DROP", r"ALTER",
                r"EXEC", r"EXECUTE", r"CAST", r"CONVERT", r"CHAR",
                r"ASCII", r"SUBSTRING", r"LEN", r"COUNT", r"MAX", r"MIN"
            ]
            
            for pattern in sqli_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    url_complexity += 0.1
            
            # URL encoding complexity
            encoded_chars = url.count('%')
            if encoded_chars > 10:
                url_complexity += 0.3
            
            # Parameter count
            param_count = url.count('&') + 1
            if param_count > 5:
                url_complexity += 0.2
        
        features.append(min(url_complexity, 1.0))
        
        # 2. Username Analysis
        username = log_data.get('username', '')
        username_score = 0.0
        
        if username:
            # SQL Injection trong username
            if any(char in username for char in ["'", '"', ";", "--", "/*"]):
                username_score += 0.8
            
            # Username length anomaly
            if len(username) > 50:
                username_score += 0.3
            
            # Common admin usernames
            admin_users = ['admin', 'administrator', 'root', 'user', 'test', 'guest']
            if username.lower() in admin_users:
                username_score += 0.2
        
        features.append(min(username_score, 1.0))
        
        # 3. Password Analysis
        password = log_data.get('password', '')
        password_score = 0.0
        
        if password:
            # Weak passwords
            weak_passwords = [
                'password', '123456', 'admin', 'root', 'test', 'guest',
                'zaq1zaq1', 'Football', 'starwars', '1', '11111'
            ]
            if password in weak_passwords:
                password_score += 0.6
            
            # Password length
            if len(password) < 6:
                password_score += 0.3
            
            # SQL Injection trong password
            if any(char in password for char in ["'", '"', ";", "--"]):
                password_score += 0.8
        
        features.append(min(password_score, 1.0))
        
        # 4. User Agent Analysis
        user_agent = log_data.get('user_agent', '')
        ua_score = 0.0
        
        if user_agent:
            # Automated tools
            if 'PythonBruteForce' in user_agent:
                ua_score += 0.9
            elif 'curl' in user_agent.lower():
                ua_score += 0.7
            elif 'wget' in user_agent.lower():
                ua_score += 0.7
            elif 'python' in user_agent.lower():
                ua_score += 0.6
            
            # Missing user agent
            if user_agent == 'Unknown' or not user_agent:
                ua_score += 0.5
        
        features.append(min(ua_score, 1.0))
        
        # 5. IP Address Analysis
        ip = log_data.get('ip', '')
        ip_score = 0.0
        
        if ip:
            # Internal vs external IPs
            if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.'):
                ip_score += 0.1  # Internal IP
            else:
                ip_score += 0.3  # External IP
        
        features.append(min(ip_score, 1.0))
        
        # 6. Success Rate Analysis
        success = log_data.get('success', False)
        success_score = 0.0
        
        if success == 'false' or success is False:
            success_score += 0.4  # Failed login
        
        features.append(success_score)
        
        # 7. Query Analysis
        query = log_data.get('query', '')
        query_score = 0.0
        
        if query:
            # SQL complexity
            sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'JOIN']
            keyword_count = sum(1 for keyword in sql_keywords if keyword in query.upper())
            if keyword_count > 3:
                query_score += 0.4
            
            # SQL Injection patterns
            if "'" in query or '"' in query:
                query_score += 0.6
            
            # Query length
            if len(query) > 100:
                query_score += 0.3
        
        features.append(min(query_score, 1.0))
        
        # 8. Timestamp Analysis
        timestamp = log_data.get('timestamp', '')
        time_score = 0.0
        
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                hour = dt.hour
                
                # Unusual hours (night time attacks)
                if hour < 6 or hour > 22:
                    time_score += 0.3
                
                # Weekend attacks
                if dt.weekday() >= 5:  # Saturday, Sunday
                    time_score += 0.2
                    
            except:
                pass
        
        features.append(time_score)
        
        # 9. Request Method Analysis
        method = log_data.get('method', '')
        method_score = 0.0
        
        if method == 'POST':
            method_score += 0.2  # POST requests for login
        
        features.append(method_score)
        
        # 10. Status Code Analysis
        status_code = log_data.get('status_code', '')
        status_score = 0.0
        
        if status_code:
            try:
                code = int(status_code)
                if code == 401:
                    status_score += 0.6  # Unauthorized
                elif code == 403:
                    status_score += 0.7  # Forbidden
                elif code == 500:
                    status_score += 0.8  # Server error
                elif code == 200:
                    status_score += 0.1  # Success
            except:
                pass
        
        features.append(status_score)
        
        return np.array(features, dtype=np.float32)

    def train_from_archives(self, archives_file):
        """Huấn luyện AI từ Wazuh archives.json"""
        print(f"📚 Đang đọc log từ {archives_file}...")
        
        all_features = []
        log_count = 0
        
        try:
            with open(archives_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        # Parse JSON log
                        log_entry = json.loads(line)
                        
                        # Chỉ xử lý logs từ attacks.log
                        location = log_entry.get('location', '')
                        if 'attacks.log' not in location:
                            continue
                        
                        # Lấy data từ log
                        data = log_entry.get('data', {})
                        if not data:
                            continue
                        
                        # Trích xuất đặc trưng
                        features = self.extract_advanced_features(data)
                        all_features.append(features)
                        
                        log_count += 1
                        if log_count % 100 == 0:
                            print(f"📊 Đã xử lý {log_count} logs...")
                            
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        print(f"⚠️ Lỗi xử lý log: {e}")
                        continue
            
            if not all_features:
                print("❌ Không tìm thấy log nào từ attacks.log")
                return False
            
            # Chuyển đổi thành numpy array
            X = np.array(all_features)
            print(f"✅ Đã trích xuất {X.shape[0]} samples với {X.shape[1]} đặc trưng")
            
            # Chuẩn hóa dữ liệu
            X_scaled = self.scaler.fit_transform(X)
            
            # Huấn luyện Isolation Forest
            print("🤖 Đang huấn luyện Isolation Forest...")
            self.model.fit(X_scaled)
            
            self.is_trained = True
            self.feature_names = [
                'url_complexity', 'username_score', 'password_score', 'user_agent_score',
                'ip_score', 'success_score', 'query_score', 'time_score',
                'method_score', 'status_score'
            ]
            
            print("🎉 Huấn luyện hoàn thành!")
            print(f"📈 Model đã học từ {X.shape[0]} samples")
            
            return True
            
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file {archives_file}")
            return False
        except Exception as e:
            print(f"❌ Lỗi huấn luyện: {e}")
            return False

    def detect_anomalies(self, log_data):
        """Phát hiện bất thường trong log mới"""
        if not self.is_trained:
            return None, "Model chưa được huấn luyện"
        
        try:
            # Trích xuất đặc trưng
            features = self.extract_advanced_features(log_data)
            features_scaled = self.scaler.transform([features])
            
            # Dự đoán
            anomaly_score = self.model.decision_function(features_scaled)[0]
            is_anomaly = self.model.predict(features_scaled)[0] == -1
            
            # Phân loại loại tấn công
            attack_type = self.classify_attack_type(log_data, features)
            
            return {
                'is_anomaly': is_anomaly,
                'anomaly_score': anomaly_score,
                'attack_type': attack_type,
                'confidence': abs(anomaly_score),
                'features': dict(zip(self.feature_names, features))
            }, None
            
        except Exception as e:
            return None, f"Lỗi phát hiện: {e}"

    def classify_attack_type(self, log_data, features):
        """Phân loại loại tấn công dựa trên đặc trưng"""
        url_complexity = features[0]
        username_score = features[1]
        password_score = features[2]
        user_agent_score = features[3]
        query_score = features[6]
        
        # SQL Injection detection
        if url_complexity > 0.5 or username_score > 0.5 or query_score > 0.5:
            return "SQL Injection"
        
        # Brute Force detection
        if user_agent_score > 0.5 or password_score > 0.5:
            return "Brute Force"
        
        # Combined attack
        if (url_complexity > 0.3 and user_agent_score > 0.3) or \
           (username_score > 0.3 and password_score > 0.3):
            return "Combined Attack"
        
        return "Normal Traffic"

    def analyze_log_file(self, archives_file, output_file=None):
        """Phân tích toàn bộ file log và xuất kết quả"""
        if not self.is_trained:
            print("❌ Model chưa được huấn luyện")
            return
        
        print(f"🔍 Đang phân tích {archives_file}...")
        
        results = []
        anomaly_count = 0
        total_count = 0
        
        try:
            with open(archives_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        log_entry = json.loads(line)
                        location = log_entry.get('location', '')
                        
                        if 'attacks.log' not in location:
                            continue
                        
                        data = log_entry.get('data', {})
                        if not data:
                            continue
                        
                        # Phát hiện bất thường
                        result, error = self.detect_anomalies(data)
                        if error:
                            continue
                        
                        total_count += 1
                        
                        if result['is_anomaly']:
                            anomaly_count += 1
                            
                            analysis = {
                                'timestamp': data.get('timestamp', ''),
                                'ip': data.get('ip', ''),
                                'username': data.get('username', ''),
                                'url': data.get('url', ''),
                                'attack_type': result['attack_type'],
                                'anomaly_score': result['anomaly_score'],
                                'confidence': result['confidence'],
                                'features': result['features']
                            }
                            results.append(analysis)
                            
                            print(f"🚨 PHÁT HIỆN: {result['attack_type']} từ IP {data.get('ip', 'N/A')}")
                            print(f"   Username: {data.get('username', 'N/A')}")
                            print(f"   URL: {data.get('url', 'N/A')[:100]}...")
                            print(f"   Score: {result['anomaly_score']:.3f}")
                            print()
                        
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        continue
            
            print(f"📊 Kết quả phân tích:")
            print(f"   Tổng số logs: {total_count}")
            print(f"   Bất thường: {anomaly_count}")
            print(f"   Tỷ lệ bất thường: {anomaly_count/total_count*100:.2f}%")
            
            # Xuất kết quả
            if output_file and results:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)
                print(f"💾 Kết quả đã lưu vào {output_file}")
            
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file {archives_file}")
        except Exception as e:
            print(f"❌ Lỗi phân tích: {e}")

def main():
    """Demo chính"""
    print("🚀 DEMO AI KHÔNG GIÁM SÁT - Wazuh Integration")
    print("=" * 60)
    
    # Khởi tạo AI
    ai = RealTimeUnsupervisedAI()
    
    # Đường dẫn file log
    archives_file = "/var/ossec/logs/archives/archives.json"
    
    # Huấn luyện từ log hiện có
    print("\n1️⃣ HUẤN LUYỆN AI TỪ LOG HIỆN CÓ")
    print("-" * 40)
    
    if ai.train_from_archives(archives_file):
        print("\n2️⃣ PHÂN TÍCH LOG VÀ PHÁT HIỆN BẤT THƯỜNG")
        print("-" * 40)
        
        # Phân tích và xuất kết quả
        output_file = "ai-detection-results.json"
        ai.analyze_log_file(archives_file, output_file)
        
        print("\n3️⃣ DEMO PHÁT HIỆN REAL-TIME")
        print("-" * 40)
        
        # Demo với một số log mẫu
        sample_logs = [
            {
                'url': '/api/login?username=admin&password=123456',
                'username': 'admin',
                'password': '123456',
                'ip': '192.168.1.100',
                'user_agent': 'Mozilla/5.0...',
                'success': False,
                'query': 'SELECT * FROM users WHERE username = \'admin\' AND password = \'123456\'',
                'timestamp': '2025-10-04T15:30:00.000+0700',
                'method': 'POST',
                'status_code': '200'
            },
            {
                'url': '/api/login?username=admin\' OR \'1\'=\'1&password=anything',
                'username': 'admin\' OR \'1\'=\'1',
                'password': 'anything',
                'ip': '192.168.1.200',
                'user_agent': 'PythonBruteForce/1.0',
                'success': True,
                'query': 'SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\' AND password = \'anything\'',
                'timestamp': '2025-10-04T15:31:00.000+0700',
                'method': 'POST',
                'status_code': '200'
            }
        ]
        
        for i, log in enumerate(sample_logs, 1):
            print(f"\n📝 Sample {i}:")
            result, error = ai.detect_anomalies(log)
            
            if error:
                print(f"❌ Lỗi: {error}")
            else:
                print(f"🔍 Kết quả: {result['attack_type']}")
                print(f"   Bất thường: {'CÓ' if result['is_anomaly'] else 'KHÔNG'}")
                print(f"   Score: {result['anomaly_score']:.3f}")
                print(f"   Confidence: {result['confidence']:.3f}")
    
    else:
        print("❌ Không thể huấn luyện AI. Vui lòng kiểm tra file log.")

if __name__ == "__main__":
    main()
