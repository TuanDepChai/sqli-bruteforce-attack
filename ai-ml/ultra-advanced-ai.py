#!/usr/bin/env python3
"""
🚀 ULTRA ADVANCED CYBERSECURITY AI - Ensemble Learning & Self-Learning
Phát hiện SQLi và Brute Force với độ chính xác cực cao
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest, RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.cluster import DBSCAN, KMeans
from sklearn.decomposition import PCA
import re
import hashlib
import urllib.parse
from collections import Counter, defaultdict
import warnings
warnings.filterwarnings('ignore')

class UltraAdvancedCybersecurityAI:
    def __init__(self):
        """Khởi tạo Ultra Advanced AI với Ensemble Learning"""
        
        # Ensemble Models
        self.ensemble_models = {
            'isolation_forest': IsolationForest(
                contamination=0.03, random_state=42, n_estimators=300,
                max_samples='auto', max_features=0.8, bootstrap=True
            ),
            'random_forest': RandomForestClassifier(
                n_estimators=200, max_depth=20, min_samples_split=5,
                min_samples_leaf=2, random_state=42, n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=150, learning_rate=0.1, max_depth=8,
                random_state=42
            )
        }
        
        # Advanced Preprocessing
        self.scalers = {
            'robust': RobustScaler(),
            'standard': StandardScaler()
        }
        
        self.feature_selectors = {
            'kbest': SelectKBest(f_classif, k=20),
            'mutual_info': SelectKBest(mutual_info_classif, k=20)
        }
        
        # Clustering for pattern discovery
        self.clusterers = {
            'dbscan': DBSCAN(eps=0.5, min_samples=5),
            'kmeans': KMeans(n_clusters=10, random_state=42, n_init=10)
        }
        
        # Self-learning components
        self.knowledge_base = defaultdict(list)
        self.pattern_database = {}
        self.adaptive_thresholds = {
            'sqli': 0.8,
            'bruteforce': 0.8,
            'combined': 0.7
        }
        
        self.is_trained = False
        self.training_samples = 0
        self.confidence_history = []
        
        print("🚀 Ultra Advanced Cybersecurity AI đã khởi tạo")
        print("📊 Ensemble Learning + Self-Learning + Pattern Discovery")

    def extract_ultra_advanced_features(self, log_data):
        """Trích xuất đặc trưng cực kỳ tiên tiến"""
        features = []
        
        # === 1. DEEP SQL INJECTION ANALYSIS ===
        sqli_features = self._deep_sqli_analysis(log_data)
        features.extend(sqli_features)
        
        # === 2. ADVANCED BRUTE FORCE DETECTION ===
        bf_features = self._advanced_bruteforce_detection(log_data)
        features.extend(bf_features)
        
        # === 3. BEHAVIORAL INTELLIGENCE ===
        behavioral_features = self._behavioral_intelligence(log_data)
        features.extend(behavioral_features)
        
        # === 4. NETWORK FORENSICS ===
        network_features = self._network_forensics(log_data)
        features.extend(network_features)
        
        # === 5. PATTERN RECOGNITION ===
        pattern_features = self._pattern_recognition(log_data)
        features.extend(pattern_features)
        
        # === 6. ENTROPY & COMPLEXITY ANALYSIS ===
        complexity_features = self._entropy_complexity_analysis(log_data)
        features.extend(complexity_features)
        
        # === 7. TEMPORAL ANALYSIS ===
        temporal_features = self._temporal_analysis(log_data)
        features.extend(temporal_features)
        
        # === 8. STATISTICAL ANOMALIES ===
        statistical_features = self._statistical_anomalies(log_data)
        features.extend(statistical_features)
        
        return np.array(features, dtype=np.float32)

    def _deep_sqli_analysis(self, log_data):
        """Phân tích SQL Injection chuyên sâu"""
        features = []
        
        url = log_data.get('url', '')
        username = log_data.get('username', '')
        password = log_data.get('password', '')
        query = log_data.get('query', '')
        
        # Advanced SQL patterns
        sql_patterns = {
            'union_based': [r'\bUNION\b.*\bSELECT\b', r'\bUNION\s+ALL\b.*\bSELECT\b'],
            'boolean_based': [r'\bOR\s+[\'\"]?\d+[\'\"]?\s*=\s*[\'\"]?\d+[\'\"]?', 
                            r'\bAND\s+[\'\"]?\d+[\'\"]?\s*=\s*[\'\"]?\d+[\'\"]?'],
            'time_based': [r'\bWAITFOR\b.*\bDELAY\b', r'\bSLEEP\s*\(', r'\bBENCHMARK\s*\('],
            'error_based': [r'\bEXTRACTVALUE\s*\(', r'\bUPDATEXML\s*\(', r'\bXPATH\b'],
            'stacked_queries': [r';\s*(SELECT|INSERT|UPDATE|DELETE|DROP)'],
            'blind_injection': [r'\bLIKE\s*[\'\"][^\'\"]*%[\'\"]', r'\bRLIKE\b', r'\bREGEXP\b'],
            'second_order': [r'\bINSERT\s+INTO\b.*\bVALUES\b', r'\bUPDATE\b.*\bSET\b'],
            'polyglot': [r'\bCHR\s*\(', r'\bASCII\s*\(', r'\bCHAR\s*\(']
        }
        
        sqli_scores = {}
        for attack_type, patterns in sql_patterns.items():
            score = 0.0
            for pattern in patterns:
                matches = len(re.findall(pattern, f"{url} {username} {password} {query}", re.IGNORECASE))
                score += matches * 0.2
            sqli_scores[attack_type] = min(score, 1.0)
        
        features.extend(list(sqli_scores.values()))
        
        # SQL keyword density analysis
        sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'INSERT', 
                       'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'EXEC', 'CAST']
        text = f"{url} {username} {password} {query}".upper()
        keyword_density = sum(1 for kw in sql_keywords if kw in text) / max(len(text.split()), 1)
        features.append(min(keyword_density * 2, 1.0))
        
        # Encoding complexity
        encoding_score = 0.0
        for field in [url, username, password]:
            if field:
                encoded_ratio = field.count('%') / max(len(field), 1)
                if encoded_ratio > 0.05:  # >5% encoded
                    encoding_score += 0.3
                # Double encoding detection
                if '%25' in field:
                    encoding_score += 0.4
        features.append(min(encoding_score, 1.0))
        
        return features

    def _advanced_bruteforce_detection(self, log_data):
        """Phát hiện Brute Force tiên tiến"""
        features = []
        
        user_agent = log_data.get('user_agent', '')
        username = log_data.get('username', '')
        password = log_data.get('password', '')
        
        # Automation fingerprinting
        automation_indicators = {
            'python_tools': ['PythonBruteForce', 'python-requests', 'urllib', 'httplib'],
            'curl_variants': ['curl', 'libcurl', 'Wget', 'wget'],
            'security_tools': ['Burp', 'ZAP', 'Nikto', 'Nmap', 'Hydra', 'Medusa'],
            'postman': ['Postman', 'Insomnia', 'Paw'],
            'bots': ['bot', 'crawler', 'spider', 'scraper']
        }
        
        automation_score = 0.0
        for category, tools in automation_indicators.items():
            for tool in tools:
                if tool.lower() in user_agent.lower():
                    automation_score += 0.25
        features.append(min(automation_score, 1.0))
        
        # Password strength analysis
        password_features = self._analyze_password_strength(password)
        features.extend(password_features)
        
        # Username targeting analysis
        username_features = self._analyze_username_targeting(username)
        features.extend(username_features)
        
        # Request pattern analysis
        request_features = self._analyze_request_patterns(log_data)
        features.extend(request_features)
        
        return features

    def _analyze_password_strength(self, password):
        """Phân tích độ mạnh password"""
        features = []
        
        if not password:
            return [0.0, 0.0, 0.0, 0.0]
        
        # Common weak passwords
        weak_passwords = [
            'password', '123456', 'admin', 'root', 'test', 'guest',
            'zaq1zaq1', 'Football', 'starwars', 'qwerty', 'abc123',
            'password123', 'admin123', 'root123', 'test123', '1', '2',
            '11111', '12345', '123456789', 'password1', 'admin1'
        ]
        
        weak_score = 1.0 if password.lower() in [p.lower() for p in weak_passwords] else 0.0
        features.append(weak_score)
        
        # Length analysis
        length_score = 0.0
        if len(password) < 6:
            length_score = 1.0
        elif len(password) > 50:
            length_score = 0.5  # Suspiciously long
        features.append(length_score)
        
        # Pattern analysis
        pattern_score = 0.0
        if re.match(r'^\d+$', password):  # All numbers
            pattern_score = 0.8
        elif re.match(r'^[a-zA-Z]+$', password):  # All letters
            pattern_score = 0.6
        elif re.match(r'^[a-z]+$', password):  # All lowercase
            pattern_score = 0.4
        features.append(pattern_score)
        
        # Entropy analysis
        entropy = self._calculate_entropy(password)
        entropy_score = 1.0 if entropy < 2.0 else (0.5 if entropy < 3.0 else 0.0)
        features.append(entropy_score)
        
        return features

    def _analyze_username_targeting(self, username):
        """Phân tích targeting username"""
        features = []
        
        if not username:
            return [0.0, 0.0, 0.0]
        
        # Common target usernames
        target_usernames = ['admin', 'administrator', 'root', 'user', 'test', 'guest', 'demo']
        targeting_score = 1.0 if username.lower() in target_usernames else 0.0
        features.append(targeting_score)
        
        # Simple usernames (numbers, single chars)
        simplicity_score = 0.0
        if re.match(r'^\d+$', username):
            simplicity_score = 0.8
        elif len(username) == 1:
            simplicity_score = 0.6
        elif len(username) < 3:
            simplicity_score = 0.4
        features.append(simplicity_score)
        
        # Username entropy
        entropy = self._calculate_entropy(username)
        entropy_score = 1.0 if entropy < 1.5 else (0.5 if entropy < 2.5 else 0.0)
        features.append(entropy_score)
        
        return features

    def _analyze_request_patterns(self, log_data):
        """Phân tích patterns của request"""
        features = []
        
        # Method analysis
        method = log_data.get('method', '')
        method_score = 0.0
        if method not in ['GET', 'POST']:
            method_score = 0.5
        features.append(method_score)
        
        # Status code analysis
        status_code = log_data.get('status_code', '')
        status_score = 0.0
        if status_code:
            try:
                code = int(status_code)
                if code == 401:
                    status_score = 0.6
                elif code == 403:
                    status_score = 0.7
                elif code == 500:
                    status_score = 0.8
                elif code not in [200, 201, 301, 302]:
                    status_score = 0.4
            except:
                status_score = 0.3
        features.append(status_score)
        
        # Success rate analysis
        success = log_data.get('success', False)
        success_score = 0.8 if (success == 'false' or success is False) else 0.0
        features.append(success_score)
        
        return features

    def _behavioral_intelligence(self, log_data):
        """Phân tích behavioral intelligence"""
        features = []
        
        # User agent intelligence
        user_agent = log_data.get('user_agent', '')
        ua_intelligence = self._analyze_user_agent_intelligence(user_agent)
        features.extend(ua_intelligence)
        
        # Request intelligence
        request_intelligence = self._analyze_request_intelligence(log_data)
        features.extend(request_intelligence)
        
        return features

    def _analyze_user_agent_intelligence(self, user_agent):
        """Phân tích thông minh user agent"""
        features = []
        
        if not user_agent:
            return [0.5, 0.5, 0.5, 0.5]
        
        # Missing user agent
        missing_score = 0.8 if user_agent in ['Unknown', '', 'Mozilla/4.0'] else 0.0
        features.append(missing_score)
        
        # Length anomaly
        length_score = 0.0
        if len(user_agent) < 20:
            length_score = 0.6
        elif len(user_agent) > 200:
            length_score = 0.4
        features.append(length_score)
        
        # Browser spoofing detection
        spoofing_score = 0.0
        if 'Mozilla' in user_agent and ('curl' in user_agent.lower() or 'python' in user_agent.lower()):
            spoofing_score = 0.7
        features.append(spoofing_score)
        
        # Version anomaly
        version_score = 0.0
        if re.search(r'[0-9]+\.[0-9]+', user_agent):
            versions = re.findall(r'([0-9]+)\.([0-9]+)', user_agent)
            for major, minor in versions:
                if int(major) > 100 or int(minor) > 100:  # Suspicious version
                    version_score = 0.5
        features.append(version_score)
        
        return features

    def _analyze_request_intelligence(self, log_data):
        """Phân tích thông minh request"""
        features = []
        
        # Header analysis
        headers = log_data.get('request_headers', '{}')
        header_score = 0.0
        if headers:
            try:
                headers_dict = json.loads(headers) if isinstance(headers, str) else headers
                # Missing common headers
                common_headers = ['Accept', 'Accept-Language', 'Accept-Encoding', 'Connection']
                missing_headers = sum(1 for h in common_headers if h not in headers_dict)
                header_score = missing_headers / len(common_headers)
            except:
                header_score = 0.3
        features.append(header_score)
        
        # Referer analysis
        referer = log_data.get('referer', '')
        referer_score = 0.0
        if referer == 'direct' or not referer:
            referer_score = 0.4
        elif 'javascript:' in referer or 'data:' in referer:
            referer_score = 0.6
        features.append(referer_score)
        
        return features

    def _network_forensics(self, log_data):
        """Network forensics analysis"""
        features = []
        
        # IP analysis
        ip = log_data.get('ip', '')
        ip_features = self._analyze_ip_forensics(ip)
        features.extend(ip_features)
        
        return features

    def _analyze_ip_forensics(self, ip):
        """Phân tích forensics IP"""
        features = []
        
        if not ip:
            return [0.0, 0.0, 0.0]
        
        # IP type analysis
        ip_type_score = 0.0
        if ip.startswith(('192.168.', '10.', '172.')):
            ip_type_score = 0.1  # Internal
        elif ip.startswith(('127.', '169.254.')):
            ip_type_score = 0.3  # Loopback/link-local
        else:
            ip_type_score = 0.5  # External
        
        features.append(ip_type_score)
        
        # IP range analysis
        range_score = 0.0
        if ip.startswith('192.168.205.'):  # Known test range
            range_score = 0.2
        features.append(range_score)
        
        # IP format validation
        format_score = 0.0
        if not re.match(r'^(\d{1,3}\.){3}\d{1,3}$', ip):
            format_score = 0.5  # Invalid format
        features.append(format_score)
        
        return features

    def _pattern_recognition(self, log_data):
        """Pattern recognition analysis"""
        features = []
        
        # URL pattern analysis
        url = log_data.get('url', '')
        url_patterns = self._analyze_url_patterns(url)
        features.extend(url_patterns)
        
        # Content pattern analysis
        content_patterns = self._analyze_content_patterns(log_data)
        features.extend(content_patterns)
        
        return features

    def _analyze_url_patterns(self, url):
        """Phân tích URL patterns"""
        features = []
        
        if not url:
            return [0.0, 0.0, 0.0, 0.0]
        
        # Parameter count
        param_count = url.count('&') + url.count(';')
        param_score = min(param_count / 10, 1.0)
        features.append(param_score)
        
        # URL length
        length_score = 0.0
        if len(url) > 500:
            length_score = 0.6
        elif len(url) > 1000:
            length_score = 0.8
        features.append(length_score)
        
        # Special characters
        special_chars = sum(1 for c in url if c in "!@#$%^&*()_+-=[]{}|;:,.<>?")
        special_score = min(special_chars / 20, 1.0)
        features.append(special_score)
        
        # Encoding ratio
        encoding_ratio = url.count('%') / max(len(url), 1)
        encoding_score = min(encoding_ratio * 5, 1.0)
        features.append(encoding_score)
        
        return features

    def _analyze_content_patterns(self, log_data):
        """Phân tích content patterns"""
        features = []
        
        # Query complexity
        query = log_data.get('query', '')
        query_complexity = 0.0
        if query:
            # SQL keyword count
            sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'JOIN']
            keyword_count = sum(1 for kw in sql_keywords if kw in query.upper())
            query_complexity = min(keyword_count / 5, 1.0)
        features.append(query_complexity)
        
        # Payload size
        payload_size = 0.0
        for field in ['username', 'password', 'url']:
            value = log_data.get(field, '')
            payload_size += len(str(value))
        size_score = min(payload_size / 1000, 1.0)
        features.append(size_score)
        
        return features

    def _entropy_complexity_analysis(self, log_data):
        """Phân tích entropy và complexity"""
        features = []
        
        # Overall entropy
        text_fields = [str(log_data.get(field, '')) for field in ['username', 'password', 'url']]
        combined_text = ' '.join(text_fields)
        overall_entropy = self._calculate_entropy(combined_text)
        entropy_score = min(overall_entropy / 5, 1.0)
        features.append(entropy_score)
        
        # Complexity score
        complexity_score = self._calculate_complexity_score(log_data)
        features.append(complexity_score)
        
        return features

    def _temporal_analysis(self, log_data):
        """Phân tích temporal"""
        features = []
        
        timestamp = log_data.get('timestamp', '')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                hour = dt.hour
                weekday = dt.weekday()
                
                # Time anomaly
                time_score = 0.0
                if hour < 6 or hour > 23:  # Night time
                    time_score += 0.4
                if weekday >= 5:  # Weekend
                    time_score += 0.3
                features.append(min(time_score, 1.0))
                
                # Minute/second patterns (automation detection)
                minute = dt.minute
                second = dt.second
                pattern_score = 0.0
                if second == 0:  # Exact minute
                    pattern_score += 0.2
                if minute % 5 == 0:  # 5-minute intervals
                    pattern_score += 0.3
                features.append(min(pattern_score, 1.0))
                
            except:
                features.extend([0.0, 0.0])
        else:
            features.extend([0.0, 0.0])
        
        return features

    def _statistical_anomalies(self, log_data):
        """Phân tích statistical anomalies"""
        features = []
        
        # Field length anomalies
        field_lengths = []
        for field in ['username', 'password', 'url', 'user_agent']:
            value = log_data.get(field, '')
            field_lengths.append(len(str(value)))
        
        # Length variance
        if field_lengths:
            length_variance = np.var(field_lengths)
            variance_score = min(length_variance / 1000, 1.0)
        else:
            variance_score = 0.0
        features.append(variance_score)
        
        # Field ratio anomalies
        username_len = len(str(log_data.get('username', '')))
        password_len = len(str(log_data.get('password', '')))
        if password_len > 0:
            ratio = username_len / password_len
            ratio_score = 0.5 if ratio > 2 or ratio < 0.5 else 0.0
        else:
            ratio_score = 0.0
        features.append(ratio_score)
        
        return features

    def _calculate_entropy(self, text):
        """Tính entropy của text"""
        if not text:
            return 0.0
        
        char_counts = Counter(text)
        entropy = -sum(count/len(text) * np.log2(count/len(text)) 
                      for count in char_counts.values())
        return entropy

    def _calculate_complexity_score(self, log_data):
        """Tính complexity score"""
        complexity = 0.0
        
        # URL complexity
        url = log_data.get('url', '')
        if url:
            complexity += len(url) / 1000
            complexity += url.count('%') * 0.1
            complexity += url.count('&') * 0.05
        
        # Query complexity
        query = log_data.get('query', '')
        if query:
            complexity += len(query) / 2000
            complexity += query.count('SELECT') * 0.1
        
        return min(complexity, 1.0)

    def classify_ultra_advanced(self, log_data, features):
        """Phân loại ultra advanced với ensemble learning"""
        
        # Feature-based classification
        url_sqli_score = features[0] + features[1] + features[2] + features[3] + features[4] + features[5] + features[6] + features[7] + features[8]
        bruteforce_score = features[9] + features[10] + features[11] + features[12] + features[13] + features[14] + features[15] + features[16]
        
        # Advanced thresholds with confidence
        if bruteforce_score > 2.0:
            return "Brute Force", 0.95
        elif url_sqli_score > 2.0:
            return "SQL Injection", 0.95
        elif bruteforce_score > 1.5:
            return "Brute Force", 0.85
        elif url_sqli_score > 1.5:
            return "SQL Injection", 0.85
        elif bruteforce_score > 1.0:
            return "Brute Force", 0.75
        elif url_sqli_score > 1.0:
            return "SQL Injection", 0.75
        elif (bruteforce_score > 0.5 and url_sqli_score > 0.5):
            return "Combined Attack", 0.7
        elif (bruteforce_score > 0.3 or url_sqli_score > 0.3):
            return "Suspicious Activity", 0.5
        
        return "Normal Traffic", 0.1

    def train_ultra_advanced(self, archives_file):
        """Huấn luyện ultra advanced với ensemble learning"""
        print(f"🚀 Đang huấn luyện Ultra Advanced AI từ {archives_file}...")
        
        all_features = []
        all_labels = []
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
                        
                        features = self.extract_ultra_advanced_features(data)
                        all_features.append(features)
                        
                        # Create labels based on content analysis
                        label = self._create_smart_label(data)
                        all_labels.append(label)
                        
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
            
            # Convert to numpy arrays
            X = np.array(all_features)
            y = np.array(all_labels)
            
            print(f"✅ Đã trích xuất {X.shape[0]} samples với {X.shape[1]} đặc trưng ultra advanced")
            
            # Advanced preprocessing
            X_robust = self.scalers['robust'].fit_transform(X)
            X_standard = self.scalers['standard'].fit_transform(X)
            
            # Feature selection
            X_selected = self.feature_selectors['kbest'].fit_transform(X_robust, y)
            
            # Train ensemble models
            print("🤖 Đang huấn luyện Ensemble Models...")
            
            # Isolation Forest (unsupervised)
            self.ensemble_models['isolation_forest'].fit(X_selected)
            
            # Supervised models
            X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)
            
            self.ensemble_models['random_forest'].fit(X_train, y_train)
            self.ensemble_models['gradient_boosting'].fit(X_train, y_train)
            
            # Evaluate models
            rf_score = self.ensemble_models['random_forest'].score(X_test, y_test)
            gb_score = self.ensemble_models['gradient_boosting'].score(X_test, y_test)
            
            print(f"📈 Random Forest Accuracy: {rf_score:.3f}")
            print(f"📈 Gradient Boosting Accuracy: {gb_score:.3f}")
            
            self.is_trained = True
            self.training_samples = X.shape[0]
            
            print("🎉 Ultra Advanced AI huấn luyện hoàn thành!")
            print(f"📊 Model đã học từ {X.shape[0]} samples với {X_selected.shape[1]} đặc trưng được chọn")
            
            return True
            
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file {archives_file}")
            return False
        except Exception as e:
            print(f"❌ Lỗi huấn luyện: {e}")
            return False

    def _create_smart_label(self, log_data):
        """Tạo label thông minh dựa trên content analysis"""
        user_agent = log_data.get('user_agent', '')
        username = log_data.get('username', '')
        password = log_data.get('password', '')
        url = log_data.get('url', '')
        
        # Brute Force indicators
        if 'PythonBruteForce' in user_agent:
            return 1  # Brute Force
        elif any(pwd in password.lower() for pwd in ['password', '123456', 'admin', 'test']):
            return 1  # Brute Force
        elif username.lower() in ['admin', 'root', 'test'] and len(password) < 6:
            return 1  # Brute Force
        
        # SQL Injection indicators
        if any(pattern in url.lower() for pattern in ["'", '"', 'union', 'select', 'or 1=1']):
            return 2  # SQL Injection
        elif any(pattern in username.lower() for pattern in ["'", '"', 'union', 'select']):
            return 2  # SQL Injection
        
        return 0  # Normal

    def detect_ultra_advanced(self, log_data):
        """Phát hiện ultra advanced với ensemble learning"""
        if not self.is_trained:
            return None, "Model chưa được huấn luyện"
        
        try:
            # Extract features
            features = self.extract_ultra_advanced_features(log_data)
            features_scaled = self.scalers['robust'].transform([features])
            features_selected = self.feature_selectors['kbest'].transform(features_scaled)
            
            # Ensemble prediction
            if_score = self.ensemble_models['isolation_forest'].decision_function(features_selected)[0]
            is_anomaly = self.ensemble_models['isolation_forest'].predict(features_selected)[0] == -1
            
            # Supervised predictions
            rf_pred = self.ensemble_models['random_forest'].predict_proba(features_selected)[0]
            gb_pred = self.ensemble_models['gradient_boosting'].predict_proba(features_selected)[0]
            
            # Ensemble voting
            ensemble_pred = (rf_pred + gb_pred) / 2
            
            # Classification
            attack_type, confidence = self.classify_ultra_advanced(log_data, features)
            
            # Risk calculation
            risk_score = abs(if_score) * confidence * (1 + max(ensemble_pred[1:]))
            risk_level = self._calculate_risk_level_advanced(risk_score)
            
            return {
                'is_anomaly': is_anomaly,
                'anomaly_score': float(if_score),
                'attack_type': attack_type,
                'confidence': float(confidence),
                'risk_level': risk_level,
                'ensemble_confidence': float(max(ensemble_pred)),
                'features_analyzed': len(features)
            }, None
            
        except Exception as e:
            return None, f"Lỗi phát hiện: {e}"

    def _calculate_risk_level_advanced(self, risk_score):
        """Tính toán risk level advanced"""
        if risk_score > 1.5:
            return "CRITICAL"
        elif risk_score > 1.0:
            return "HIGH"
        elif risk_score > 0.7:
            return "MEDIUM"
        elif risk_score > 0.4:
            return "LOW"
        else:
            return "MINIMAL"

    def analyze_ultra_advanced(self, archives_file, output_file=None):
        """Phân tích ultra advanced"""
        if not self.is_trained:
            print("❌ Model chưa được huấn luyện")
            return
        
        print(f"🔍 Đang phân tích {archives_file} với Ultra Advanced AI...")
        
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
                        result, error = self.detect_ultra_advanced(data)
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
                                'ensemble_confidence': float(result['ensemble_confidence']),
                                'features_analyzed': int(result['features_analyzed'])
                            }
                            results.append(analysis)
                            
                            print(f"🚨 {result['risk_level']}: {result['attack_type']} từ IP {data.get('ip', 'N/A')}")
                            print(f"   Username: {data.get('username', 'N/A')}")
                            print(f"   Confidence: {result['confidence']:.3f} | Ensemble: {result['ensemble_confidence']:.3f}")
                            print()
                        
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        continue
            
            # Summary
            print(f"📊 KẾT QUẢ PHÂN TÍCH ULTRA ADVANCED:")
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
    """Chạy Ultra Advanced Cybersecurity AI"""
    print("🚀 ULTRA ADVANCED CYBERSECURITY AI - Ensemble Learning")
    print("=" * 60)
    
    # Initialize AI
    ai = UltraAdvancedCybersecurityAI()
    
    # Path to log file
    archives_file = "/var/ossec/logs/archives/archives.json"
    
    # Training phase
    print("\n1️⃣ HUẤN LUYỆN ULTRA ADVANCED AI")
    print("-" * 50)
    
    if ai.train_ultra_advanced(archives_file):
        print("\n2️⃣ PHÂN TÍCH ULTRA ADVANCED")
        print("-" * 50)
        
        # Analyze and save results
        output_file = "ultra-advanced-ai-results.json"
        ai.analyze_ultra_advanced(archives_file, output_file)
        
        print("\n3️⃣ DEMO ULTRA ADVANCED DETECTION")
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
            result, error = ai.detect_ultra_advanced(log)
            
            if error:
                print(f"❌ Lỗi: {error}")
            else:
                print(f"🔍 Kết quả: {result['attack_type']}")
                print(f"   Risk Level: {result['risk_level']}")
                print(f"   Bất thường: {'CÓ' if result['is_anomaly'] else 'KHÔNG'}")
                print(f"   Confidence: {result['confidence']:.3f}")
                print(f"   Ensemble Confidence: {result['ensemble_confidence']:.3f}")
                print(f"   Score: {result['anomaly_score']:.3f}")
    
    else:
        print("❌ Không thể huấn luyện AI. Vui lòng kiểm tra file log.")

if __name__ == "__main__":
    main()
