#!/usr/bin/env python3
"""
🧪 TEST AI với log mẫu từ user
Xử lý log thực tế từ Wazuh archives.json
"""

import json
import numpy as np
from demo_unsupervised_ai import RealTimeUnsupervisedAI

def create_sample_logs():
    """Tạo log mẫu dựa trên log thực tế từ user"""
    sample_logs = [
        # Log 1: Brute Force với PythonBruteForce
        {
            "timestamp": "2025-10-04T13:50:57.310+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "id": "1759560657.30197",
            "full_log": '{"timestamp":"2025-10-04T13:50:55.756+0700","method":"POST","url":"/api/login?username=administrator&password=Football","username":"administrator","password":"Football","ip":"192.168.205.138","success":false,"user_agent":"PythonBruteForce/1.0","referer":"direct","status_code":200,"query":"SELECT * FROM users WHERE username = \'administrator\' AND password = \'Football\'"}',
            "decoder": {"name": "json"},
            "data": {
                "url": "/api/login?username=administrator&password=Football",
                "timestamp": "2025-10-04T13:50:55.756+0700",
                "method": "POST",
                "username": "administrator",
                "password": "Football",
                "ip": "192.168.205.138",
                "success": "false",
                "user_agent": "PythonBruteForce/1.0",
                "referer": "direct",
                "status_code": "200",
                "query": "SELECT * FROM users WHERE username = 'administrator' AND password = 'Football'"
            },
            "location": "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"
        },
        
        # Log 2: SQL Injection phức tạp
        {
            "timestamp": "2025-10-04T13:50:57.310+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "id": "1759560657.30197",
            "full_log": '{"timestamp":"2025-10-04T13:50:55.756+0700","method":"POST","url":"/api/login?username=man\'%22%7D%20%7B%22timestamp%22%3A%222025-10-04T00%3A10%3A39.846%2B0700%22%2C%22method%22%3A%22POST%22%2C%22url%22%3A%22%2Fapi%2Flogin%3Fusername%3Dadministrator%26password%3Dzaq1zaq1%22%2C%22username%22%3A%22administrator%22%2C%22password%22%3A%22zaq1zaq1%22%2C%22ip%22%3A%22192.168.205.138%22%2C%22success%22%3Afalse%2C%22user_agent%22%3A%22PythonBruteForce%2F1.0%22%2C%22referer%22%3A%22direct%22%2C%22status_code%22%3A200%2C%22query%22%3A%22SELECT%20*%20FROM%20users%20WHERE%20username%20%3D%20\'administrator\'%20AND%20password%20%3D%20\'zaq1zaq1\'%22%7D&password=1","username":"man\'\\"\\"} {\\"timestamp\\":\\"2025-10-04T00:10:39.846+0700\\",\\"method\\":\\"POST\\",\\"url\\":\\"/api/login?username=administrator&password=zaq1zaq1\\",\\"username\\":\\"administrator\\",\\"password\\":\\"zaq1zaq1\\",\\"ip\\":\\"192.168.205.138\\",\\"success\\":false,\\"user_agent\\":\\"PythonBruteForce/1.0\\",\\"referer\\":\\"direct\\",\\"status_code\\":200,\\"query\\":\\"SELECT * FROM users WHERE username = \'administrator\' AND password = \'zaq1zaq1\'\\"}","password":"1","ip":"192.168.205.1","success":"false","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36","referer":"http://192.168.205.100:3000/","status_code":"200","query":"SELECT * FROM users WHERE username = \'man\'\\"\\"} {\\"timestamp\\":\\"2025-10-04T00:10:39.846+0700\\",\\"method\\":\\"POST\\",\\"url\\":\\"/api/login?username=administrator&password=zaq1zaq1\\",\\"username\\":\\"administrator\\",\\"password\\":\\"zaq1zaq1\\",\\"ip\\":\\"192.168.205.138\\",\\"success\\":false,\\"user_agent\\":\\"PythonBruteForce/1.0\\",\\"referer\\":\\"direct\\",\\"status_code\\":200,\\"query\\":\\"SELECT * FROM users WHERE username = \'administrator\' AND password = \'zaq1zaq1\'\\"\' AND password = \'1\'"}',
            "decoder": {"name": "json"},
            "data": {
                "url": "/api/login?username=man'%22%7D%20%7B%22timestamp%22%3A%222025-10-04T00%3A10%3A39.846%2B0700%22%2C%22method%22%3A%22POST%22%2C%22url%22%3A%22%2Fapi%2Flogin%3Fusername%3Dadministrator%26password%3Dzaq1zaq1%22%2C%22username%22%3A%22administrator%22%2C%22password%22%3A%22zaq1zaq1%22%2C%22ip%22%3A%22192.168.205.138%22%2C%22success%22%3Afalse%2C%22user_agent%22%3A%22PythonBruteForce%2F1.0%22%2C%22referer%22%3A%22direct%22%2C%22status_code%22%3A200%2C%22query%22%3A%22SELECT%20*%20FROM%20users%20WHERE%20username%20%3D%20'administrator'%20AND%20password%20%3D%20'zaq1zaq1'%22%7D%20%7B%22timestamp%22%3A%222025-10-04T00%3A10%3A39.865%2B0700%22%2C%22method%22%3A%22POST%22%2C%22url%22%3A%22%2Fapi%2Flogin%3Fusername%3Dadministrator%26password%3Dzaq1zaq1%22%2C%22username%22%3A%22administrator%22%2C%22password%22%3A%22zaq1zaq1%22%2C%22ip%22%3A%22192.168.205.138%22%2C%22success%22%3Afalse%2C%22user_agent%22%3A%22PythonBruteForce%2F1.0%22%2C%22referer%22%3A%22direct%22%2C%22status_code%22%3A200%2C%22query%22%3A%22SELECT%20*%20FROM%20users%20WHERE%20username%20%3D%20'administrator'%20AND%20password%20%3D%20'zaq1zaq1'%22%7D&password=1",
                "timestamp": "2025-10-04T13:50:55.756+0700",
                "method": "POST",
                "username": "man'\"} {\"timestamp\":\"2025-10-04T00:10:39.846+0700\",\"method\":\"POST\",\"url\":\"/api/login?username=administrator&password=zaq1zaq1\",\"username\":\"administrator\",\"password\":\"zaq1zaq1\",\"ip\":\"192.168.205.138\",\"success\":false,\"user_agent\":\"PythonBruteForce/1.0\",\"referer\":\"direct\",\"status_code\":200,\"query\":\"SELECT * FROM users WHERE username = 'administrator' AND password = 'zaq1zaq1'\"}",
                "password": "1",
                "ip": "192.168.205.1",
                "success": "false",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                "referer": "http://192.168.205.100:3000/",
                "status_code": "200",
                "query": "SELECT * FROM users WHERE username = 'man'\"} {\"timestamp\":\"2025-10-04T00:10:39.846+0700\",\"method\":\"POST\",\"url\":\"/api/login?username=administrator&password=zaq1zaq1\",\"username\":\"administrator\",\"password\":\"zaq1zaq1\",\"ip\":\"192.168.205.138\",\"success\":false,\"user_agent\":\"PythonBruteForce/1.0\",\"referer\":\"direct\",\"status_code\":200,\"query\":\"SELECT * FROM users WHERE username = 'administrator' AND password = 'zaq1zaq1'\"' AND password = '1'"
            },
            "location": "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"
        },
        
        # Log 3: Brute Force với multiple attempts
        {
            "timestamp": "2025-10-04T13:50:57.310+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "id": "1759560657.30197",
            "full_log": '{"timestamp":"2025-10-04T13:50:55.756+0700","method":"POST","url":"/api/login?username=administrator&password=starwars","username":"administrator","password":"starwars","ip":"192.168.205.138","success":false,"user_agent":"PythonBruteForce/1.0","referer":"direct","status_code":200,"query":"SELECT * FROM users WHERE username = \'administrator\' AND password = \'starwars\'"}',
            "decoder": {"name": "json"},
            "data": {
                "url": "/api/login?username=administrator&password=starwars",
                "timestamp": "2025-10-04T13:50:55.756+0700",
                "method": "POST",
                "username": "administrator",
                "password": "starwars",
                "ip": "192.168.205.138",
                "success": "false",
                "user_agent": "PythonBruteForce/1.0",
                "referer": "direct",
                "status_code": "200",
                "query": "SELECT * FROM users WHERE username = 'administrator' AND password = 'starwars'"
            },
            "location": "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"
        },
        
        # Log 4: Normal traffic (Mozilla browser)
        {
            "timestamp": "2025-10-04T13:50:57.310+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "id": "1759560657.30197",
            "full_log": '{"timestamp":"2025-10-04T13:50:55.756+0700","method":"POST","url":"/api/login?username=admin&password=password123","username":"admin","password":"password123","ip":"192.168.205.1","success":true,"user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36","referer":"http://192.168.205.100:3000/","status_code":200,"query":"SELECT * FROM users WHERE username = \'admin\' AND password = \'password123\'"}',
            "decoder": {"name": "json"},
            "data": {
                "url": "/api/login?username=admin&password=password123",
                "timestamp": "2025-10-04T13:50:55.756+0700",
                "method": "POST",
                "username": "admin",
                "password": "password123",
                "ip": "192.168.205.1",
                "success": "true",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                "referer": "http://192.168.205.100:3000/",
                "status_code": "200",
                "query": "SELECT * FROM users WHERE username = 'admin' AND password = 'password123'"
            },
            "location": "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"
        }
    ]
    
    return sample_logs

def test_ai_with_samples():
    """Test AI với log mẫu"""
    print("🧪 TEST AI VỚI LOG MẪU THỰC TẾ")
    print("=" * 50)
    
    # Khởi tạo AI
    ai = RealTimeUnsupervisedAI()
    
    # Tạo log mẫu
    sample_logs = create_sample_logs()
    
    # Tạo file archives.json giả lập
    with open("sample-archives.json", "w", encoding="utf-8") as f:
        for log in sample_logs:
            f.write(json.dumps(log, ensure_ascii=False) + "\n")
    
    print(f"📝 Đã tạo {len(sample_logs)} log mẫu")
    
    # Huấn luyện AI
    print("\n🤖 HUẤN LUYỆN AI...")
    print("-" * 30)
    
    if ai.train_from_archives("sample-archives.json"):
        print("\n🔍 PHÂN TÍCH TỪNG LOG...")
        print("-" * 30)
        
        for i, log in enumerate(sample_logs, 1):
            print(f"\n📋 Log {i}:")
            data = log.get('data', {})
            
            print(f"   Username: {data.get('username', 'N/A')}")
            print(f"   Password: {data.get('password', 'N/A')}")
            print(f"   User Agent: {data.get('user_agent', 'N/A')}")
            print(f"   Success: {data.get('success', 'N/A')}")
            
            # Phát hiện bất thường
            result, error = ai.detect_anomalies(data)
            
            if error:
                print(f"   ❌ Lỗi: {error}")
            else:
                print(f"   🔍 Loại tấn công: {result['attack_type']}")
                print(f"   🚨 Bất thường: {'CÓ' if result['is_anomaly'] else 'KHÔNG'}")
                print(f"   📊 Anomaly Score: {result['anomaly_score']:.3f}")
                print(f"   🎯 Confidence: {result['confidence']:.3f}")
                
                # Hiển thị đặc trưng quan trọng
                features = result['features']
                print(f"   📈 Đặc trưng nổi bật:")
                for name, value in features.items():
                    if value > 0.3:  # Chỉ hiển thị đặc trưng có giá trị cao
                        print(f"      {name}: {value:.3f}")
        
        print("\n📊 TỔNG KẾT TEST:")
        print("=" * 30)
        
        # Phân tích tổng thể
        anomaly_count = 0
        attack_types = {}
        
        for log in sample_logs:
            data = log.get('data', {})
            result, error = ai.detect_anomalies(data)
            
            if not error and result['is_anomaly']:
                anomaly_count += 1
                attack_type = result['attack_type']
                attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
        
        print(f"🚨 Tổng số bất thường: {anomaly_count}/{len(sample_logs)}")
        print(f"📈 Tỷ lệ phát hiện: {anomaly_count/len(sample_logs)*100:.1f}%")
        
        print("\n🎯 Phân loại tấn công:")
        for attack_type, count in attack_types.items():
            print(f"   {attack_type}: {count} cases")
        
        # Lưu kết quả
        results = []
        for log in sample_logs:
            data = log.get('data', {})
            result, error = ai.detect_anomalies(data)
            
            if not error:
                analysis = {
                    'timestamp': data.get('timestamp', ''),
                    'ip': data.get('ip', ''),
                    'username': data.get('username', ''),
                    'url': data.get('url', ''),
                    'attack_type': result['attack_type'],
                    'is_anomaly': result['is_anomaly'],
                    'anomaly_score': result['anomaly_score'],
                    'confidence': result['confidence']
                }
                results.append(analysis)
        
        with open("test-results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Kết quả đã lưu vào: test-results.json")
        
    else:
        print("❌ Không thể huấn luyện AI")

if __name__ == "__main__":
    test_ai_with_samples()
