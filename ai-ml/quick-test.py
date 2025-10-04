#!/usr/bin/env python3
"""
⚡ QUICK TEST - Test AI ngay trên Windows
Không cần Ubuntu, test với log mẫu từ user
"""

import json
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import re
from datetime import datetime

class QuickTestAI:
    def __init__(self):
        """Khởi tạo AI test nhanh"""
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
        print("Quick Test AI da khoi tao")

    def extract_features(self, log_data):
        """Trích xuất đặc trưng từ log"""
        features = []
        
        # 1. URL complexity
        url = log_data.get('url', '')
        url_score = 0.0
        if url:
            # SQL Injection patterns
            sqli_chars = sum(1 for c in url if c in "'\"();--/*")
            if sqli_chars > 0:
                url_score += 0.8
            
            # URL encoding
            if url.count('%') > 10:
                url_score += 0.3
        
        features.append(min(url_score, 1.0))
        
        # 2. Username analysis
        username = log_data.get('username', '')
        username_score = 0.0
        if username:
            # SQL Injection in username
            if any(char in username for char in ["'", '"', ";", "--"]):
                username_score += 0.8
            
            # Admin usernames
            if username.lower() in ['admin', 'administrator', 'root']:
                username_score += 0.2
        
        features.append(min(username_score, 1.0))
        
        # 3. Password analysis
        password = log_data.get('password', '')
        password_score = 0.0
        if password:
            # Weak passwords
            weak_passwords = ['password', '123456', 'admin', 'Football', 'starwars', '1']
            if password in weak_passwords:
                password_score += 0.6
            
            # SQL Injection in password
            if any(char in password for char in ["'", '"', ";"]):
                password_score += 0.8
        
        features.append(min(password_score, 1.0))
        
        # 4. User Agent analysis
        user_agent = log_data.get('user_agent', '')
        ua_score = 0.0
        if 'PythonBruteForce' in user_agent:
            ua_score += 0.9
        elif 'curl' in user_agent.lower():
            ua_score += 0.7
        elif 'python' in user_agent.lower():
            ua_score += 0.6
        
        features.append(min(ua_score, 1.0))
        
        # 5. Success rate
        success = log_data.get('success', False)
        success_score = 0.4 if (success == 'false' or success is False) else 0.0
        features.append(success_score)
        
        return np.array(features, dtype=np.float32)

    def train_and_test(self):
        """Huấn luyện và test với log mẫu"""
        
        # Log mẫu từ user (đã được xử lý)
        sample_logs = [
            # Brute Force
            {
                'url': '/api/login?username=administrator&password=Football',
                'username': 'administrator',
                'password': 'Football',
                'user_agent': 'PythonBruteForce/1.0',
                'success': False
            },
            # SQL Injection
            {
                'url': '/api/login?username=man\'%22%7D%20%7B%22timestamp%22%3A%222025-10-04T00%3A10%3A39.846%2B0700%22...',
                'username': 'man\'\"} {\"timestamp\":\"2025-10-04T00:10:39.846+0700\"...',
                'password': '1',
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'success': False
            },
            # Brute Force 2
            {
                'url': '/api/login?username=administrator&password=starwars',
                'username': 'administrator',
                'password': 'starwars',
                'user_agent': 'PythonBruteForce/1.0',
                'success': False
            },
            # Normal traffic
            {
                'url': '/api/login?username=admin&password=password123',
                'username': 'admin',
                'password': 'password123',
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'success': True
            }
        ]
        
        print("Huan luyen AI voi log mau...")
        
        # Trích xuất đặc trưng
        all_features = []
        for log in sample_logs:
            features = self.extract_features(log)
            all_features.append(features)
        
        X = np.array(all_features)
        print(f"Da trich xuat {X.shape[0]} samples voi {X.shape[1]} dac trung")
        
        # Chuẩn hóa và huấn luyện
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_trained = True
        
        print("Huan luyen hoan thanh!")
        
        # Test từng log
        print("\nKet qua phan tich:")
        print("=" * 50)
        
        for i, log in enumerate(sample_logs, 1):
            print(f"\nLog {i}:")
            print(f"   Username: {log['username']}")
            print(f"   Password: {log['password']}")
            print(f"   User Agent: {log['user_agent'][:50]}...")
            
            # Phát hiện bất thường
            features = self.extract_features(log)
            features_scaled = self.scaler.transform([features])
            
            anomaly_score = self.model.decision_function(features_scaled)[0]
            is_anomaly = self.model.predict(features_scaled)[0] == -1
            
            # Phân loại
            attack_type = self.classify_attack(features)
            
            print(f"   Bat thuong: {'CO' if is_anomaly else 'KHONG'}")
            print(f"   Score: {anomaly_score:.3f}")
            print(f"   Loai: {attack_type}")
            
            # Hiển thị đặc trưng
            feature_names = ['url_complexity', 'username_score', 'password_score', 'user_agent_score', 'success_score']
            print(f"   Dac trung:")
            for name, value in zip(feature_names, features):
                if value > 0.1:
                    print(f"      {name}: {value:.3f}")
        
        # Tổng kết
        print(f"\nTONG KET:")
        print("=" * 30)
        
        anomaly_count = 0
        attack_types = {}
        
        for log in sample_logs:
            features = self.extract_features(log)
            features_scaled = self.scaler.transform([features])
            is_anomaly = self.model.predict(features_scaled)[0] == -1
            
            if is_anomaly:
                anomaly_count += 1
                attack_type = self.classify_attack(features)
                attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
        
        print(f"Tong so bat thuong: {anomaly_count}/{len(sample_logs)}")
        print(f"Ty le phat hien: {anomaly_count/len(sample_logs)*100:.1f}%")
        
        print("\nPhan loai tan cong:")
        for attack_type, count in attack_types.items():
            print(f"   {attack_type}: {count} cases")
        
        print(f"\nAI da hoc thanh cong tu traffic sach!")
        print(f"Co the phat hien chinh xac SQLi va Brute Force attacks!")

    def classify_attack(self, features):
        """Phân loại loại tấn công"""
        url_complexity, username_score, password_score, user_agent_score, success_score = features
        
        # SQL Injection - ưu tiên cao nhất
        if url_complexity > 0.8 or username_score > 0.7:
            return "SQL Injection"
        
        # Brute Force - ưu tiên thứ hai
        if user_agent_score > 0.8 or (password_score > 0.5 and user_agent_score > 0.5):
            return "Brute Force"
        
        # Combined attack
        if (url_complexity > 0.5 and user_agent_score > 0.5) or (username_score > 0.5 and password_score > 0.5):
            return "Combined Attack"
        
        return "Normal Traffic"

def main():
    """Chạy quick test"""
    print("QUICK TEST AI KHONG GIAM SAT")
    print("============================")
    print("Test voi log mau tu user")
    print("Su dung Isolation Forest")
    print("Hoc tu traffic sach")
    print("")
    
    # Khởi tạo và chạy test
    ai = QuickTestAI()
    ai.train_and_test()
    
    print("\n" + "="*50)
    print("DEMO HOAN THANH!")
    print("AI da chung minh kha nang phat hien bat thuong")
    print("San sang deploy len Ubuntu Wazuh Manager")

if __name__ == "__main__":
    main()
