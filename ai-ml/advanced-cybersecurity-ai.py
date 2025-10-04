#!/usr/bin/env python3
"""
🛡️ ADVANCED CYBERSECURITY AI - Unsupervised Learning
Phát hiện SQLi và Brute Force với logic chuẩn chỉnh và đặc trưng tối ưu
"""

import json
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.feature_selection import SelectKBest, f_classif
import re
import hashlib
import urllib.parse
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

class AdvancedCybersecurityAI:
    def __init__(self):
        """Khởi tạo AI bảo mật nâng cao"""
        self.model = IsolationForest(
            contamination=0.05,  # 5% traffic bất thường (tối ưu hơn)
            random_state=42,
            n_estimators=200,    # Tăng số trees để độ chính xác cao hơn
            max_samples='auto',
            max_features=1.0,
            bootstrap=False,
            n_jobs=-1
        )
        
        # Sử dụng RobustScaler để xử lý outliers tốt hơn
        self.scaler = RobustScaler()
        self.feature_selector = None
        self.is_trained = False
        
        # Cache để tối ưu performance
        self.pattern_cache = {}
        self.feature_cache = {}
        
        # Thresholds được tối ưu
        self.thresholds = {
            'sqli_confidence': 0.7,
            'bruteforce_confidence': 0.8,
            'combined_confidence': 0.6
        }
        
        print("🛡️ Advanced Cybersecurity AI đã khởi tạo")
        print("📊 Sử dụng logic chuẩn chỉnh và đặc trưng tối ưu")

    def extract_optimized_features(self, log_data):
        """Trích xuất đặc trưng tối ưu với logic chuẩn chỉnh"""
        features = []
        
        # === 1. SQL INJECTION DETECTION FEATURES ===
        sqli_features = self._extract_sqli_features(log_data)
        features.extend(sqli_features)
        
        # === 2. BRUTE FORCE DETECTION FEATURES ===
        bruteforce_features = self._extract_bruteforce_features(log_data)
        features.extend(bruteforce_features)
        
        # === 3. BEHAVIORAL ANALYSIS FEATURES ===
        behavioral_features = self._extract_behavioral_features(log_data)
        features.extend(behavioral_features)
        
        # === 4. NETWORK & INFRASTRUCTURE FEATURES ===
        network_features = self._extract_network_features(log_data)
        features.extend(network_features)
        
        # === 5. ADVANCED PATTERN ANALYSIS ===
        pattern_features = self._extract_pattern_features(log_data)
        features.extend(pattern_features)
        
        return np.array(features, dtype=np.float32)

    def _extract_sqli_features(self, log_data):
        """Trích xuất đặc trưng SQL Injection chuyên sâu"""
        features = []
        
        # 1.1 URL Payload Analysis
        url = log_data.get('url', '')
        url_sqli_score = 0.0
        
        if url:
            # SQL keywords và operators
            sql_patterns = [
                r'\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE)\b',
                r'\b(OR|AND)\s+\d+\s*=\s*\d+',  # OR 1=1, AND 1=1
                r"'[^']*'\s*(OR|AND)\s*'[^']*'",  # 'x' OR 'y'
                r"(--|\#|\/\*|\*\/)",  # Comments
                r"\b(CHAR|ASCII|SUBSTRING|LEN|COUNT|MAX|MIN|SUM|AVG)\s*\(",
                r"\b(CONVERT|CAST|ISNULL|COALESCE)\s*\(",
                r"\b(WAITFOR|DELAY|SLEEP)\b",  # Time-based attacks
                r"\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b"
            ]
            
            for pattern in sql_patterns:
                matches = len(re.findall(pattern, url, re.IGNORECASE))
                url_sqli_score += matches * 0.15
            
            # URL encoding analysis
            encoded_ratio = url.count('%') / max(len(url), 1)
            if encoded_ratio > 0.1:  # >10% encoded
                url_sqli_score += 0.3
            
            # Parameter pollution
            param_count = url.count('&') + url.count(';')
            if param_count > 3:
                url_sqli_score += 0.2
        
        features.append(min(url_sqli_score, 1.0))
        
        # 1.2 Username SQL Injection Analysis
        username = log_data.get('username', '')
        username_sqli_score = 0.0
        
        if username:
            # Direct SQL injection patterns
            sqli_chars = sum(1 for c in username if c in "'\"();--/*")
            if sqli_chars > 0:
                username_sqli_score += 0.6
            
            # Advanced SQL patterns
            if re.search(r"'\s*(OR|AND)\s*'", username, re.IGNORECASE):
                username_sqli_score += 0.8
            
            # Length anomaly (very long usernames)
            if len(username) > 100:
                username_sqli_score += 0.4
            
            # Multiple quotes or semicolons
            quote_count = username.count("'") + username.count('"')
            if quote_count > 2:
                username_sqli_score += 0.3
        
        features.append(min(username_sqli_score, 1.0))
        
        # 1.3 Query Analysis
        query = log_data.get('query', '')
        query_sqli_score = 0.0
        
        if query:
            # Query complexity analysis
            sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'JOIN', 'ORDER', 'GROUP']
            keyword_density = sum(1 for kw in sql_keywords if kw in query.upper()) / max(len(query.split()), 1)
            
            if keyword_density > 0.3:  # High SQL keyword density
                query_sqli_score += 0.5
            
            # Injection indicators
            if "'" in query or '"' in query:
                query_sqli_score += 0.4
            
            # Query length anomaly
            if len(query) > 200:
                query_sqli_score += 0.3
        
        features.append(min(query_sqli_score, 1.0))
        
        return features

    def _extract_bruteforce_features(self, log_data):
        """Trích xuất đặc trưng Brute Force chuyên sâu"""
        features = []
        
        # 2.1 User Agent Analysis
        user_agent = log_data.get('user_agent', '')
        ua_automation_score = 0.0
        
        if user_agent:
            # Known automation tools
            automation_patterns = [
                'PythonBruteForce', 'curl', 'wget', 'python-requests',
                'Postman', 'Burp', 'ZAP', 'Nikto', 'Nmap', 'Hydra'
            ]
            
            for pattern in automation_patterns:
                if pattern.lower() in user_agent.lower():
                    ua_automation_score += 0.3
            
            # Missing or suspicious user agents
            if user_agent in ['Unknown', '', 'Mozilla/4.0']:
                ua_automation_score += 0.4
            
            # Very short user agents (likely automated)
            if len(user_agent) < 20:
                ua_automation_score += 0.3
        
        features.append(min(ua_automation_score, 1.0))
        
        # 2.2 Password Analysis
        password = log_data.get('password', '')
        password_weakness_score = 0.0
        
        if password:
            # Common weak passwords
            weak_passwords = [
                'password', '123456', 'admin', 'root', 'test', 'guest',
                'zaq1zaq1', 'Football', 'starwars', 'qwerty', 'abc123',
                'password123', 'admin123', 'root123', 'test123'
            ]
            
            if password.lower() in [p.lower() for p in weak_passwords]:
                password_weakness_score += 0.7
            
            # Password length analysis
            if len(password) < 6:
                password_weakness_score += 0.5
            elif len(password) > 50:  # Suspiciously long
                password_weakness_score += 0.3
            
            # Pattern-based weak passwords
            if re.match(r'^\d+$', password):  # All numbers
                password_weakness_score += 0.6
            elif re.match(r'^[a-zA-Z]+$', password):  # All letters
                password_weakness_score += 0.4
        
        features.append(min(password_weakness_score, 1.0))
        
        # 2.3 Username Analysis for Brute Force
        username = log_data.get('username', '')
        username_bruteforce_score = 0.0
        
        if username:
            # Common admin/usernames targeted in brute force
            common_targets = ['admin', 'administrator', 'root', 'user', 'test', 'guest']
            if username.lower() in common_targets:
                username_bruteforce_score += 0.4
            
            # Simple usernames (numbers, single chars)
            if re.match(r'^\d+$', username) or len(username) == 1:
                username_bruteforce_score += 0.6
        
        features.append(min(username_bruteforce_score, 1.0))
        
        return features

    def _extract_behavioral_features(self, log_data):
        """Trích xuất đặc trưng behavioral analysis"""
        features = []
        
        # 3.1 Success/Failure Pattern
        success = log_data.get('success', False)
        success_anomaly_score = 0.0
        
        if success == 'false' or success is False:
            success_anomaly_score += 0.5  # Failed login
        
        features.append(success_anomaly_score)
        
        # 3.2 Request Method Analysis
        method = log_data.get('method', '')
        method_anomaly_score = 0.0
        
        if method not in ['GET', 'POST']:
            method_anomaly_score += 0.3
        
        features.append(method_anomaly_score)
        
        # 3.3 Status Code Analysis
        status_code = log_data.get('status_code', '')
        status_anomaly_score = 0.0
        
        if status_code:
            try:
                code = int(status_code)
                if code == 401:  # Unauthorized
                    status_anomaly_score += 0.4
                elif code == 403:  # Forbidden
                    status_anomaly_score += 0.5
                elif code == 500:  # Server error
                    status_anomaly_score += 0.6
                elif code not in [200, 201, 301, 302]:  # Unusual codes
                    status_anomaly_score += 0.3
            except:
                status_anomaly_score += 0.2
        
        features.append(status_anomaly_score)
        
        return features

    def _extract_network_features(self, log_data):
        """Trích xuất đặc trưng network và infrastructure"""
        features = []
        
        # 4.1 IP Address Analysis
        ip = log_data.get('ip', '')
        ip_anomaly_score = 0.0
        
        if ip:
            # Internal vs external IP analysis
            if ip.startswith(('192.168.', '10.', '172.')):
                ip_anomaly_score += 0.1  # Internal IP
            elif ip.startswith(('127.', '169.254.')):
                ip_anomaly_score += 0.2  # Loopback or link-local
            else:
                ip_anomaly_score += 0.3  # External IP
        
        features.append(ip_anomaly_score)
        
        # 4.2 Timestamp Analysis
        timestamp = log_data.get('timestamp', '')
        time_anomaly_score = 0.0
        
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                hour = dt.hour
                
                # Unusual hours (night time attacks)
                if hour < 6 or hour > 23:
                    time_anomaly_score += 0.3
                
                # Weekend attacks
                if dt.weekday() >= 5:
                    time_anomaly_score += 0.2
                    
            except:
                time_anomaly_score += 0.1
        
        features.append(time_anomaly_score)
        
        return features

    def _extract_pattern_features(self, log_data):
        """Trích xuất đặc trưng pattern analysis nâng cao"""
        features = []
        
        # 5.1 URL Complexity
        url = log_data.get('url', '')
        url_complexity_score = 0.0
        
        if url:
            # Parameter count
            param_count = url.count('&') + url.count(';')
            if param_count > 5:
                url_complexity_score += 0.3
            
            # URL length
            if len(url) > 200:
                url_complexity_score += 0.2
            
            # Special characters density
            special_chars = sum(1 for c in url if c in "!@#$%^&*()_+-=[]{}|;:,.<>?")
            if special_chars > 10:
                url_complexity_score += 0.3
        
        features.append(min(url_complexity_score, 1.0))
        
        # 5.2 Entropy Analysis
        username = log_data.get('username', '')
        password = log_data.get('password', '')
        
        entropy_score = 0.0
        for field in [username, password]:
            if field and len(field) > 0:
                # Calculate character entropy
                char_counts = Counter(field)
                entropy = -sum(count/len(field) * np.log2(count/len(field)) 
                             for count in char_counts.values())
                
                # Low entropy indicates patterns (suspicious)
                if entropy < 2.0:
                    entropy_score += 0.4
                elif entropy > 4.0:  # Very high entropy (random-like)
                    entropy_score += 0.2
        
        features.append(min(entropy_score, 1.0))
        
        return features

    def classify_attack_type_advanced(self, log_data, features):
        """Phân loại tấn công với logic chuẩn chỉnh"""
        # Unpack features
        url_sqli_score = features[0]
        username_sqli_score = features[1]
        query_sqli_score = features[2]
        ua_automation_score = features[3]
        password_weakness_score = features[4]
        username_bruteforce_score = features[5]
        
        # Advanced classification logic
        
        # 1. BRUTE FORCE DETECTION (Priority 1)
        if ua_automation_score > 0.6:  # Clear automation tool
            return "Brute Force", 0.9
        elif (password_weakness_score > 0.5 and username_bruteforce_score > 0.3):
            return "Brute Force", 0.8
        elif (password_weakness_score > 0.7 or username_bruteforce_score > 0.6):
            return "Brute Force", 0.7
        
        # 2. SQL INJECTION DETECTION (Priority 2)
        if url_sqli_score > 0.7 or username_sqli_score > 0.7:
            return "SQL Injection", 0.9
        elif query_sqli_score > 0.6:
            return "SQL Injection", 0.8
        elif (url_sqli_score > 0.4 and username_sqli_score > 0.4):
            return "SQL Injection", 0.7
        
        # 3. COMBINED ATTACK DETECTION
        if ((url_sqli_score > 0.3 or username_sqli_score > 0.3) and 
            (ua_automation_score > 0.3 or password_weakness_score > 0.3)):
            return "Combined Attack", 0.6
        
        # 4. SUSPICIOUS ACTIVITY
        if (url_sqli_score > 0.2 or ua_automation_score > 0.2 or 
            password_weakness_score > 0.2):
            return "Suspicious Activity", 0.4
        
        return "Normal Traffic", 0.1

    def train_from_archives(self, archives_file):
        """Huấn luyện AI với logic tối ưu"""
        print(f"📚 Đang đọc và phân tích log từ {archives_file}...")
        
        all_features = []
        log_count = 0
        
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
                        
                        features = self.extract_optimized_features(data)
                        all_features.append(features)
                        
                        log_count += 1
                        if log_count % 100 == 0:
                            print(f"📊 Đã xử lý {log_count} logs...")
                            
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        continue
            
            if not all_features:
                print("❌ Không tìm thấy log nào từ attacks.log")
                return False
            
            # Convert to numpy array
            X = np.array(all_features)
            print(f"✅ Đã trích xuất {X.shape[0]} samples với {X.shape[1]} đặc trưng tối ưu")
            
            # Feature selection (chọn top features)
            if X.shape[1] > 10:
                self.feature_selector = SelectKBest(f_classif, k=min(15, X.shape[1]))
                X_selected = self.feature_selector.fit_transform(X, np.zeros(X.shape[0]))
            else:
                X_selected = X
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X_selected)
            
            # Train model
            print("🤖 Đang huấn luyện Advanced Isolation Forest...")
            self.model.fit(X_scaled)
            
            self.is_trained = True
            print("🎉 Huấn luyện hoàn thành!")
            print(f"📈 Model đã học từ {X.shape[0]} samples với {X_scaled.shape[1]} đặc trưng được chọn")
            
            return True
            
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file {archives_file}")
            return False
        except Exception as e:
            print(f"❌ Lỗi huấn luyện: {e}")
            return False

    def detect_anomalies_advanced(self, log_data):
        """Phát hiện bất thường với logic chuẩn chỉnh"""
        if not self.is_trained:
            return None, "Model chưa được huấn luyện"
        
        try:
            # Extract features
            features = self.extract_optimized_features(log_data)
            
            # Apply feature selection if available
            if self.feature_selector is not None:
                features = self.feature_selector.transform([features])
            else:
                features = [features]
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict
            anomaly_score = self.model.decision_function(features_scaled)[0]
            is_anomaly = self.model.predict(features_scaled)[0] == -1
            
            # Advanced classification
            attack_type, confidence = self.classify_attack_type_advanced(log_data, features[0])
            
            return {
                'is_anomaly': is_anomaly,
                'anomaly_score': float(anomaly_score),
                'attack_type': attack_type,
                'confidence': float(confidence),
                'risk_level': self._calculate_risk_level(anomaly_score, confidence),
                'features_used': len(features[0])
            }, None
            
        except Exception as e:
            return None, f"Lỗi phát hiện: {e}"

    def _calculate_risk_level(self, anomaly_score, confidence):
        """Tính toán mức độ rủi ro"""
        risk_score = abs(anomaly_score) * confidence
        
        if risk_score > 0.8:
            return "CRITICAL"
        elif risk_score > 0.6:
            return "HIGH"
        elif risk_score > 0.4:
            return "MEDIUM"
        elif risk_score > 0.2:
            return "LOW"
        else:
            return "MINIMAL"

    def analyze_log_file_advanced(self, archives_file, output_file=None):
        """Phân tích log với logic chuẩn chỉnh"""
        if not self.is_trained:
            print("❌ Model chưa được huấn luyện")
            return
        
        print(f"🔍 Đang phân tích {archives_file} với logic chuẩn chỉnh...")
        
        results = []
        anomaly_count = 0
        total_count = 0
        attack_types = Counter()
        risk_levels = Counter()
        
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
                        
                        # Detect anomalies
                        result, error = self.detect_anomalies_advanced(data)
                        if error:
                            continue
                        
                        total_count += 1
                        
                        if result['is_anomaly']:
                            anomaly_count += 1
                            attack_types[result['attack_type']] += 1
                            risk_levels[result['risk_level']] += 1
                            
                            analysis = {
                                'timestamp': str(data.get('timestamp', '')),
                                'ip': str(data.get('ip', '')),
                                'username': str(data.get('username', '')),
                                'url': str(data.get('url', ''))[:100] + '...' if len(str(data.get('url', ''))) > 100 else str(data.get('url', '')),
                                'user_agent': str(data.get('user_agent', ''))[:50] + '...' if len(str(data.get('user_agent', ''))) > 50 else str(data.get('user_agent', '')),
                                'attack_type': str(result['attack_type']),
                                'risk_level': str(result['risk_level']),
                                'anomaly_score': float(result['anomaly_score']),
                                'confidence': float(result['confidence']),
                                'features_analyzed': int(result['features_used'])
                            }
                            results.append(analysis)
                            
                            print(f"🚨 {result['risk_level']}: {result['attack_type']} từ IP {data.get('ip', 'N/A')}")
                            print(f"   Username: {data.get('username', 'N/A')}")
                            print(f"   Confidence: {result['confidence']:.3f} | Score: {result['anomaly_score']:.3f}")
                            print()
                        
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        continue
            
            # Summary statistics
            print(f"📊 KẾT QUẢ PHÂN TÍCH CHUẨN CHỈNH:")
            print(f"   Tổng số logs: {total_count}")
            print(f"   Bất thường phát hiện: {anomaly_count}")
            print(f"   Tỷ lệ bất thường: {anomaly_count/total_count*100:.2f}%")
            print()
            
            print("🎯 PHÂN LOẠI TẤN CÔNG:")
            for attack_type, count in attack_types.most_common():
                print(f"   {attack_type}: {count} cases")
            print()
            
            print("⚠️ MỨC ĐỘ RỦI RO:")
            for risk_level, count in risk_levels.most_common():
                print(f"   {risk_level}: {count} cases")
            
            # Save results
            if output_file and results:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Kết quả đã lưu vào {output_file}")
            
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file {archives_file}")
        except Exception as e:
            print(f"❌ Lỗi phân tích: {e}")

def main():
    """Chạy Advanced Cybersecurity AI"""
    print("🛡️ ADVANCED CYBERSECURITY AI - Logic Chuẩn Chỉnh")
    print("=" * 60)
    
    # Initialize AI
    ai = AdvancedCybersecurityAI()
    
    # Path to log file
    archives_file = "/var/ossec/logs/archives/archives.json"
    
    # Training phase
    print("\n1️⃣ HUẤN LUYỆN AI VỚI LOGIC CHUẨN CHỈNH")
    print("-" * 50)
    
    if ai.train_from_archives(archives_file):
        print("\n2️⃣ PHÂN TÍCH VỚI LOGIC CHUẨN CHỈNH")
        print("-" * 50)
        
        # Analyze and save results
        output_file = "advanced-ai-detection-results.json"
        ai.analyze_log_file_advanced(archives_file, output_file)
        
        print("\n3️⃣ DEMO REAL-TIME DETECTION")
        print("-" * 50)
        
        # Demo with sample logs
        sample_logs = [
            {
                'url': '/api/login?username=admin&password=123456',
                'username': 'admin',
                'password': '123456',
                'ip': '192.168.1.100',
                'user_agent': 'PythonBruteForce/1.0',
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
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'success': True,
                'query': 'SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\' AND password = \'anything\'',
                'timestamp': '2025-10-04T15:31:00.000+0700',
                'method': 'POST',
                'status_code': '200'
            }
        ]
        
        for i, log in enumerate(sample_logs, 1):
            print(f"\n📝 Sample {i}:")
            result, error = ai.detect_anomalies_advanced(log)
            
            if error:
                print(f"❌ Lỗi: {error}")
            else:
                print(f"🔍 Kết quả: {result['attack_type']}")
                print(f"   Risk Level: {result['risk_level']}")
                print(f"   Bất thường: {'CÓ' if result['is_anomaly'] else 'KHÔNG'}")
                print(f"   Confidence: {result['confidence']:.3f}")
                print(f"   Score: {result['anomaly_score']:.3f}")
    
    else:
        print("❌ Không thể huấn luyện AI. Vui lòng kiểm tra file log.")

if __name__ == "__main__":
    main()
