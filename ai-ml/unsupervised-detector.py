#!/usr/bin/env python3
"""
🧠 True Unsupervised AI Anomaly Detection System
Hệ thống AI hoàn toàn không giám sát - chỉ dựa trên đặc trưng tự nhiên từ logs

Author: TuanDepChai
Philosophy: Pure unsupervised learning - NO labels, NO event_type usage
Focus: Learn from natural traffic patterns to detect anomalies
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re
import hashlib
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
import joblib
import logging
from pathlib import Path

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TrueUnsupervisedDetector:
    """
    🎯 True Unsupervised Anomaly Detector
    
    Nguyên tắc:
    1. KHÔNG sử dụng event_type hoặc bất kỳ label nào
    2. CHỈ dựa trên đặc trưng tự nhiên từ logs
    3. Học patterns từ traffic bình thường
    4. Phát hiện deviations từ normal behavior
    5. Dựa trên statistical và behavioral anomalies
    """
    
    def __init__(self, contamination=0.1, random_state=42):
        self.contamination = contamination
        self.random_state = random_state
        
        # Core Models
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=300,
            max_samples='auto',
            max_features=1.0
        )
        
        # Preprocessing
        self.scaler = RobustScaler()  # Robust to outliers
        self.text_vectorizer = TfidfVectorizer(
            max_features=50,
            stop_words=None,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )
        
        # Dimensionality reduction
        self.pca = PCA(n_components=0.95, random_state=random_state)
        
        # Clustering for pattern discovery
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)
        
        # Feature engineering
        self.feature_names = []
        self.normal_patterns = {}
        self.statistical_baselines = {}
        
        # Model state
        self.is_trained = False
        self.training_data = None
        
        # Model persistence
        self.model_path = Path("ai-ml/models")
        self.model_path.mkdir(exist_ok=True)
        
    def extract_raw_features(self, log_data: Dict) -> Dict:
        """
        🔍 Extract raw features from logs - NO labels used
        
        Chỉ lấy các field tự nhiên từ logs:
        - timestamp, method, url, username, password, query, ip, user_agent, status_code, success
        """
        # Extract only natural fields from logs
        raw_features = {
            'timestamp': log_data.get('timestamp', ''),
            'method': log_data.get('method', ''),
            'url': log_data.get('url', ''),
            'username': log_data.get('username', ''),
            'password': log_data.get('password', ''),
            'query': log_data.get('query', ''),
            'ip': log_data.get('ip', ''),
            'user_agent': log_data.get('user_agent', ''),
            'status_code': log_data.get('status_code', ''),
            'success': log_data.get('success', False),
            'referer': log_data.get('referer', '')
        }
        
        return raw_features
    
    def extract_natural_features(self, raw_features: Dict) -> np.ndarray:
        """
        🌿 Extract natural features from raw log data
        
        Dựa trên đặc trưng tự nhiên mà không cần labels:
        1. Temporal patterns
        2. Text patterns  
        3. Statistical patterns
        4. Behavioral patterns
        5. Structural patterns
        """
        features = []
        
        # 1. 📅 Temporal Features
        features.extend(self._extract_temporal_features(raw_features))
        
        # 2. 📝 Text Pattern Features
        features.extend(self._extract_text_pattern_features(raw_features))
        
        # 3. 📊 Statistical Features
        features.extend(self._extract_statistical_features(raw_features))
        
        # 4. 🎭 Behavioral Features
        features.extend(self._extract_behavioral_features(raw_features))
        
        # 5. 🏗️ Structural Features
        features.extend(self._extract_structural_features(raw_features))
        
        # 6. 🔍 Pattern Complexity Features
        features.extend(self._extract_pattern_complexity_features(raw_features))
        
        return np.array(features, dtype=np.float32)
    
    def _extract_temporal_features(self, data: Dict) -> List[float]:
        """Extract temporal patterns from timestamp"""
        features = []
        
        timestamp = data.get('timestamp', '')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                
                # Hour of day (0-23)
                features.append(dt.hour / 23.0)
                
                # Day of week (0-6)
                features.append(dt.weekday() / 6.0)
                
                # Minute of hour (0-59)
                features.append(dt.minute / 59.0)
                
                # Second of minute (0-59)
                features.append(dt.second / 59.0)
                
                # Microsecond pattern (for precision timing)
                features.append((dt.microsecond % 1000) / 1000.0)
                
            except:
                # Default values if parsing fails
                features.extend([0.5, 0.5, 0.5, 0.5, 0.5])
        else:
            features.extend([0.5, 0.5, 0.5, 0.5, 0.5])
        
        return features
    
    def _extract_text_pattern_features(self, data: Dict) -> List[float]:
        """Extract text patterns from strings in logs"""
        features = []
        
        # Combine all text fields
        text_fields = [
            data.get('method', ''),
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', ''),
            data.get('user_agent', ''),
            data.get('referer', '')
        ]
        
        combined_text = ' '.join(text_fields)
        
        # 1. Length patterns
        features.append(len(combined_text) / 1000.0)  # Normalized length
        
        # 2. Character diversity
        unique_chars = len(set(combined_text))
        total_chars = len(combined_text)
        char_diversity = unique_chars / total_chars if total_chars > 0 else 0
        features.append(char_diversity)
        
        # 3. Special character patterns
        special_chars = sum(1 for c in combined_text if not c.isalnum() and c not in ' .-_')
        special_ratio = special_chars / total_chars if total_chars > 0 else 0
        features.append(special_ratio)
        
        # 4. Digit patterns
        digit_ratio = sum(1 for c in combined_text if c.isdigit()) / total_chars if total_chars > 0 else 0
        features.append(digit_ratio)
        
        # 5. Uppercase ratio
        upper_ratio = sum(1 for c in combined_text if c.isupper()) / total_chars if total_chars > 0 else 0
        features.append(upper_ratio)
        
        # 6. Whitespace patterns
        space_ratio = sum(1 for c in combined_text if c.isspace()) / total_chars if total_chars > 0 else 0
        features.append(space_ratio)
        
        # 7. URL encoding patterns
        encoded_ratio = combined_text.count('%') / total_chars if total_chars > 0 else 0
        features.append(encoded_ratio)
        
        # 8. Quote patterns (SQL injection indicator)
        quote_ratio = (combined_text.count("'") + combined_text.count('"')) / total_chars if total_chars > 0 else 0
        features.append(quote_ratio)
        
        # 9. SQL keyword density
        sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'INSERT', 'UPDATE', 'DELETE']
        sql_count = sum(combined_text.upper().count(keyword) for keyword in sql_keywords)
        sql_density = sql_count / total_chars if total_chars > 0 else 0
        features.append(sql_density)
        
        # 10. Parameter patterns
        param_count = combined_text.count('=') + combined_text.count('&')
        features.append(param_count / 10.0)  # Normalized
        
        return features
    
    def _extract_statistical_features(self, data: Dict) -> List[float]:
        """Extract statistical patterns from data"""
        features = []
        
        # 1. Success rate (boolean to float)
        success = data.get('success', False)
        if isinstance(success, str):
            success = success.lower() in ['true', 'yes', '1']
        features.append(float(success))
        
        # 2. Status code patterns
        status_code = data.get('status_code', '200')
        try:
            status_int = int(str(status_code))
            features.append(status_int / 1000.0)  # Normalized
        except:
            features.append(0.2)
        
        # 3. IP address patterns (extract numerical features)
        ip = data.get('ip', '')
        ip_features = self._analyze_ip_pattern(ip)
        features.extend(ip_features)
        
        # 4. User agent patterns
        user_agent = data.get('user_agent', '')
        ua_features = self._analyze_user_agent_pattern(user_agent)
        features.extend(ua_features)
        
        return features
    
    def _analyze_ip_pattern(self, ip: str) -> List[float]:
        """Analyze IP address patterns"""
        features = []
        
        if ip:
            # Remove IPv6 prefix if present
            if ip.startswith('::ffff:'):
                ip = ip[7:]
            
            # Extract octets
            octets = ip.split('.')
            if len(octets) == 4:
                try:
                    # Convert to numerical features
                    for octet in octets:
                        features.append(int(octet) / 255.0)
                    
                    # IP range analysis
                    first_octet = int(octets[0])
                    if 192 <= first_octet <= 223:
                        features.append(0.8)  # Private range
                    elif 10 <= first_octet <= 10:
                        features.append(0.9)  # Private range
                    elif 172 <= first_octet <= 172:
                        features.append(0.85)  # Private range
                    else:
                        features.append(0.3)  # Public range
                        
                except:
                    features.extend([0.0, 0.0, 0.0, 0.0, 0.5])
            else:
                features.extend([0.0, 0.0, 0.0, 0.0, 0.5])
        else:
            features.extend([0.0, 0.0, 0.0, 0.0, 0.5])
        
        return features
    
    def _analyze_user_agent_pattern(self, user_agent: str) -> List[float]:
        """Analyze user agent patterns"""
        features = []
        
        if user_agent:
            ua_lower = user_agent.lower()
            
            # 1. Length pattern
            features.append(len(user_agent) / 500.0)
            
            # 2. Browser detection
            browsers = ['chrome', 'firefox', 'safari', 'edge', 'opera']
            browser_count = sum(1 for browser in browsers if browser in ua_lower)
            features.append(browser_count / len(browsers))
            
            # 3. Automation detection
            automation_keywords = ['bot', 'crawler', 'spider', 'scraper', 'python', 'curl', 'wget']
            automation_count = sum(1 for keyword in automation_keywords if keyword in ua_lower)
            features.append(automation_count / len(automation_keywords))
            
            # 4. Mobile detection
            mobile_keywords = ['mobile', 'android', 'iphone', 'ipad']
            mobile_count = sum(1 for keyword in mobile_keywords if keyword in ua_lower)
            features.append(mobile_count / len(mobile_keywords))
            
            # 5. Version pattern
            version_pattern = re.search(r'(\d+\.\d+)', user_agent)
            if version_pattern:
                try:
                    version = float(version_pattern.group(1))
                    features.append(version / 100.0)
                except:
                    features.append(0.0)
            else:
                features.append(0.0)
                
        else:
            features.extend([0.0, 0.0, 0.0, 0.0, 0.0])
        
        return features
    
    def _extract_behavioral_features(self, data: Dict) -> List[float]:
        """Extract behavioral patterns"""
        features = []
        
        url = data.get('url', '')
        method = data.get('method', '')
        username = data.get('username', '')
        password = data.get('password', '')
        
        # 1. URL path analysis
        if url:
            path_features = self._analyze_url_path(url)
            features.extend(path_features)
        else:
            features.extend([0.0, 0.0, 0.0])
        
        # 2. Credential patterns
        cred_features = self._analyze_credential_patterns(username, password)
        features.extend(cred_features)
        
        # 3. Method patterns
        method_score = self._analyze_method_pattern(method)
        features.append(method_score)
        
        return features
    
    def _analyze_url_path(self, url: str) -> List[float]:
        """Analyze URL path patterns"""
        features = []
        
        # 1. Path depth
        path_depth = url.count('/') - 2  # Remove protocol slashes
        features.append(path_depth / 10.0)
        
        # 2. Parameter count
        param_count = url.count('=') + url.count('&')
        features.append(param_count / 20.0)
        
        # 3. Special endpoints
        sensitive_endpoints = ['admin', 'login', 'api', 'test', 'debug']
        endpoint_count = sum(1 for endpoint in sensitive_endpoints if endpoint in url.lower())
        features.append(endpoint_count / len(sensitive_endpoints))
        
        return features
    
    def _analyze_credential_patterns(self, username: str, password: str) -> List[float]:
        """Analyze credential patterns"""
        features = []
        
        # 1. Username length
        features.append(len(username) / 50.0 if username else 0.0)
        
        # 2. Password length
        features.append(len(password) / 50.0 if password else 0.0)
        
        # 3. Credential similarity
        if username and password:
            similarity = len(set(username) & set(password)) / max(len(username), len(password))
            features.append(similarity)
        else:
            features.append(0.0)
        
        # 4. Common credential patterns
        common_usernames = ['admin', 'user', 'test', 'guest', 'root']
        common_passwords = ['password', '123456', 'admin', 'test', 'guest']
        
        username_common = 1.0 if username.lower() in common_usernames else 0.0
        password_common = 1.0 if password.lower() in common_passwords else 0.0
        
        features.extend([username_common, password_common])
        
        return features
    
    def _analyze_method_pattern(self, method: str) -> float:
        """Analyze HTTP method patterns"""
        if method.upper() == 'GET':
            return 0.1
        elif method.upper() == 'POST':
            return 0.3
        elif method.upper() == 'PUT':
            return 0.7
        elif method.upper() == 'DELETE':
            return 0.9
        else:
            return 0.5
    
    def _extract_structural_features(self, data: Dict) -> List[float]:
        """Extract structural patterns from data"""
        features = []
        
        query = data.get('query', '')
        
        # 1. Query structure analysis
        if query:
            # Query length
            features.append(len(query) / 500.0)
            
            # Query complexity
            complexity_score = 0.0
            complexity_score += query.count('SELECT') * 0.1
            complexity_score += query.count('FROM') * 0.1
            complexity_score += query.count('WHERE') * 0.1
            complexity_score += query.count('AND') * 0.05
            complexity_score += query.count('OR') * 0.05
            complexity_score += query.count('UNION') * 0.2
            features.append(min(complexity_score, 1.0))
            
            # Query operators
            operator_count = query.count('=') + query.count('<') + query.count('>') + query.count('!')
            features.append(operator_count / 20.0)
            
            # Query functions
            function_count = query.count('(') + query.count(')')
            features.append(function_count / 20.0)
        else:
            features.extend([0.0, 0.0, 0.0, 0.0])
        
        return features
    
    def _extract_pattern_complexity_features(self, data: Dict) -> List[float]:
        """Extract pattern complexity features"""
        features = []
        
        # Combine all text data
        all_text = ' '.join([
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', ''),
            data.get('user_agent', '')
        ])
        
        # 1. Information entropy
        entropy = self._calculate_entropy(all_text)
        features.append(entropy)
        
        # 2. Pattern repetition
        repetition_score = self._calculate_repetition(all_text)
        features.append(repetition_score)
        
        # 3. Encoding complexity
        encoding_score = self._calculate_encoding_complexity(all_text)
        features.append(encoding_score)
        
        # 4. Injection pattern density
        injection_score = self._calculate_injection_patterns(all_text)
        features.append(injection_score)
        
        return features
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate information entropy"""
        if not text:
            return 0.0
        
        # Count character frequencies
        char_counts = {}
        for char in text:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0.0
        text_len = len(text)
        for count in char_counts.values():
            p = count / text_len
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize
        max_entropy = np.log2(len(char_counts)) if len(char_counts) > 1 else 1.0
        return entropy / max_entropy if max_entropy > 0 else 0.0
    
    def _calculate_repetition(self, text: str) -> float:
        """Calculate pattern repetition score"""
        if len(text) < 10:
            return 0.0
        
        # Look for repeated substrings
        repetition_score = 0.0
        for length in range(2, min(10, len(text) // 2)):
            for i in range(len(text) - length * 2 + 1):
                substring = text[i:i + length]
                count = text.count(substring)
                if count > 1:
                    repetition_score += (count - 1) * length / len(text)
        
        return min(repetition_score, 1.0)
    
    def _calculate_encoding_complexity(self, text: str) -> float:
        """Calculate encoding complexity score"""
        if not text:
            return 0.0
        
        complexity = 0.0
        
        # URL encoding
        complexity += text.count('%') * 0.3
        
        # Unicode patterns
        unicode_chars = sum(1 for c in text if ord(c) > 127)
        complexity += unicode_chars / len(text) * 0.5
        
        # Base64-like patterns
        base64_chars = sum(1 for c in text if c.isalnum() or c in '+/=')
        base64_ratio = base64_chars / len(text)
        if base64_ratio > 0.8:
            complexity += 0.4
        
        return min(complexity, 1.0)
    
    def _calculate_injection_patterns(self, text: str) -> float:
        """Calculate injection pattern density"""
        if not text:
            return 0.0
        
        # SQL injection patterns
        sql_patterns = [
            r"'", r'"', r";", r"--", r"/\*", r"\*/",
            r"union", r"select", r"insert", r"update", r"delete",
            r"or\s+1\s*=\s*1", r"'\s*or\s*'1'\s*=\s*'1"
        ]
        
        injection_count = 0
        for pattern in sql_patterns:
            matches = len(re.findall(pattern, text, re.IGNORECASE))
            injection_count += matches
        
        return min(injection_count / len(text) * 100, 1.0)
    
    def prepare_training_data(self, logs: List[Dict]) -> pd.DataFrame:
        """
        📚 Prepare training data - NO labels used
        
        Chỉ sử dụng raw log data để extract features
        """
        logger.info(f"Preparing unsupervised training data from {len(logs)} logs...")
        
        processed_logs = []
        
        for i, log_entry in enumerate(logs):
            try:
                # Extract data from Wazuh log format
                if isinstance(log_entry, str):
                    log_data = json.loads(log_entry)
                else:
                    log_data = log_entry
                
                # Get the actual log data
                data = log_data.get('data', {})
                if not data:
                    continue
                
                # Extract raw features (NO labels)
                raw_features = self.extract_raw_features(data)
                
                # Extract natural features
                features = self.extract_natural_features(raw_features)
                
                # Store processed data
                processed_logs.append({
                    'features': features,
                    'raw_data': raw_features,
                    'log_index': i
                })
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(logs)} logs...")
                    
            except Exception as e:
                logger.warning(f"Error processing log {i}: {e}")
                continue
        
        if not processed_logs:
            raise ValueError("No valid logs found for training")
        
        # Create DataFrame
        feature_arrays = [log['features'] for log in processed_logs]
        df = pd.DataFrame(feature_arrays)
        
        # Set feature names
        self.feature_names = [f"feature_{i}" for i in range(df.shape[1])]
        df.columns = self.feature_names
        
        logger.info(f"Training data prepared: {df.shape}")
        return df
    
    def train(self, logs: List[Dict]) -> Dict:
        """
        🎓 Train unsupervised model
        
        Học từ traffic patterns mà không cần labels
        """
        logger.info("Starting unsupervised model training...")
        
        # Prepare training data
        df = self.prepare_training_data(logs)
        
        # Get feature matrix
        X = df.values
        
        # Handle NaN values
        X = np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Apply PCA for dimensionality reduction
        X_pca = self.pca.fit_transform(X_scaled)
        
        # Train Isolation Forest
        logger.info("Training Isolation Forest model...")
        self.isolation_forest.fit(X_pca)
        
        # Predict anomalies
        predictions = self.isolation_forest.predict(X_pca)
        anomaly_scores = self.isolation_forest.decision_function(X_pca)
        
        # Add predictions to dataframe
        df['is_anomaly'] = predictions == -1
        df['anomaly_score'] = anomaly_scores
        
        # Calculate training metrics
        n_anomalies = np.sum(predictions == -1)
        n_normal = np.sum(predictions == 1)
        anomaly_rate = n_anomalies / len(predictions)
        
        # Store training data
        self.training_data = df
        self.is_trained = True
        
        # Calculate statistical baselines for normal behavior
        normal_data = X_scaled[predictions == 1]
        if len(normal_data) > 0:
            self.statistical_baselines = {
                'mean': np.mean(normal_data, axis=0),
                'std': np.std(normal_data, axis=0),
                'percentiles': np.percentile(normal_data, [5, 25, 75, 95], axis=0)
            }
        
        # Training results
        results = {
            'total_samples': len(logs),
            'processed_samples': len(df),
            'anomalies_detected': int(n_anomalies),
            'normal_samples': int(n_normal),
            'anomaly_rate': float(anomaly_rate),
            'expected_contamination': self.contamination,
            'feature_count': len(self.feature_names),
            'pca_components': self.pca.n_components_,
            'explained_variance': float(self.pca.explained_variance_ratio_.sum()),
            'model_metrics': {
                'mean_anomaly_score': float(np.mean(anomaly_scores)),
                'std_anomaly_score': float(np.std(anomaly_scores)),
                'min_anomaly_score': float(np.min(anomaly_scores)),
                'max_anomaly_score': float(np.max(anomaly_scores))
            }
        }
        
        logger.info(f"Unsupervised training completed: {n_anomalies} anomalies detected ({anomaly_rate:.2%})")
        return results
    
    def predict(self, log_data: Dict) -> Dict:
        """
        🔍 Predict anomaly for single log entry
        
        Dựa trên features tự nhiên, không dùng labels
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Extract raw features
        raw_features = self.extract_raw_features(log_data)
        
        # Extract natural features
        features = self.extract_natural_features(raw_features)
        features = np.nan_to_num(features, nan=0.0, posinf=1.0, neginf=0.0)
        
        # Scale and transform
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        features_pca = self.pca.transform(features_scaled)
        
        # Predict
        prediction = self.isolation_forest.predict(features_pca)[0]
        anomaly_score = self.isolation_forest.decision_function(features_pca)[0]
        
        # Determine attack type based on natural patterns
        attack_type = self._classify_attack_type_natural(raw_features, features)
        
        # Generate explanation based on features
        explanation = self._generate_natural_explanation(raw_features, features, anomaly_score)
        
        return {
            'is_anomaly': prediction == -1,
            'anomaly_score': float(anomaly_score),
            'attack_type': attack_type,
            'confidence': float(abs(anomaly_score)),
            'explanation': explanation,
            'feature_scores': dict(zip(self.feature_names, features.tolist())),
            'timestamp': datetime.now().isoformat()
        }
    
    def _classify_attack_type_natural(self, raw_features: Dict, features: np.ndarray) -> str:
        """Classify attack type based on natural patterns only"""
        url = raw_features.get('url', '')
        username = raw_features.get('username', '')
        password = raw_features.get('password', '')
        query = raw_features.get('query', '')
        
        # SQL Injection indicators (based on natural patterns)
        sqli_score = 0.0
        if query:
            sqli_score += query.count("'") * 0.1
            sqli_score += query.count('"') * 0.1
            sqli_score += query.upper().count('UNION') * 0.3
            sqli_score += query.upper().count('SELECT') * 0.2
            sqli_score += query.count('OR 1=1') * 0.5
        
        if username:
            sqli_score += username.count("'") * 0.2
            sqli_score += username.count('"') * 0.2
        
        # Brute Force indicators (based on natural patterns)
        bf_score = 0.0
        user_agent = raw_features.get('user_agent', '').lower()
        if 'python' in user_agent or 'curl' in user_agent or 'bot' in user_agent:
            bf_score += 0.4
        
        if password:
            weak_passwords = ['password', '123456', 'admin', 'test']
            if password.lower() in weak_passwords:
                bf_score += 0.3
        
        # Classification
        if sqli_score > 0.5:
            return 'SQL Injection'
        elif bf_score > 0.4:
            return 'Brute Force'
        elif sqli_score > 0.2:
            return 'Potential SQL Injection'
        elif bf_score > 0.2:
            return 'Potential Brute Force'
        else:
            return 'Normal Traffic'
    
    def _generate_natural_explanation(self, raw_features: Dict, features: np.ndarray, anomaly_score: float) -> str:
        """Generate explanation based on natural patterns"""
        explanations = []
        
        if abs(anomaly_score) > 0.5:
            explanations.append("High statistical deviation from normal patterns detected.")
        
        # Analyze specific patterns
        url = raw_features.get('url', '')
        query = raw_features.get('query', '')
        user_agent = raw_features.get('user_agent', '')
        
        if query and ("'" in query or '"' in query):
            explanations.append("SQL-like patterns detected in query.")
        
        if user_agent and ('python' in user_agent.lower() or 'bot' in user_agent.lower()):
            explanations.append("Automated tool indicators present.")
        
        if url and len(url) > 200:
            explanations.append("Unusually large request payload.")
        
        if not explanations:
            explanations.append("Normal traffic patterns observed.")
        
        return " | ".join(explanations)
    
    def save_model(self, filepath: str = None):
        """Save trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        if filepath is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = self.model_path / f"unsupervised_detector_{timestamp}.joblib"
        
        model_data = {
            'isolation_forest': self.isolation_forest,
            'scaler': self.scaler,
            'pca': self.pca,
            'feature_names': self.feature_names,
            'statistical_baselines': self.statistical_baselines,
            'contamination': self.contamination,
            'random_state': self.random_state,
            'training_data': self.training_data,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
        return filepath
    
    def load_model(self, filepath: str):
        """Load trained model"""
        model_data = joblib.load(filepath)
        
        self.isolation_forest = model_data['isolation_forest']
        self.scaler = model_data['scaler']
        self.pca = model_data['pca']
        self.feature_names = model_data['feature_names']
        self.statistical_baselines = model_data['statistical_baselines']
        self.contamination = model_data['contamination']
        self.random_state = model_data['random_state']
        self.training_data = model_data['training_data']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        if not self.is_trained:
            return {'status': 'not_trained'}
        
        return {
            'status': 'trained',
            'contamination': self.contamination,
            'random_state': self.random_state,
            'n_features': len(self.feature_names),
            'feature_names': self.feature_names,
            'pca_components': self.pca.n_components_ if hasattr(self.pca, 'n_components_') else 0,
            'training_samples': len(self.training_data) if self.training_data is not None else 0,
            'statistical_baselines': bool(self.statistical_baselines)
        }


def main():
    """Demo function"""
    print("🧠 True Unsupervised Anomaly Detection System")
    print("=" * 60)
    
    # Initialize detector
    detector = TrueUnsupervisedDetector(contamination=0.1)
    
    # Sample logs for testing
    sample_logs = [
        {
            "timestamp": "2025-10-03T22:17:18.356+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "data": {
                "url": "/api/login?username=administrator&password=Football",
                "timestamp": "2025-10-03T22:17:17.460+0700",
                "method": "POST",
                "username": "administrator",
                "password": "Football",
                "ip": "192.168.205.138",
                "success": False,
                "user_agent": "PythonBruteForce/1.0",
                "referer": "direct",
                "status_code": 200,
                "query": "SELECT * FROM users WHERE username = 'administrator' AND password = 'Football'"
            }
        },
        {
            "timestamp": "2025-10-03T22:18:52.572+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "data": {
                "url": "/api/login?username=admin'%20OR%20'1'%3D'1&password=11111",
                "timestamp": "2025-10-03T22:18:52.313+0700",
                "method": "POST",
                "username": "admin' OR '1'='1",
                "password": "11111",
                "ip": "192.168.205.1",
                "success": True,
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "referer": "http://192.168.205.100:3000/",
                "status_code": 200,
                "query": "SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '11111'"
            }
        }
    ]
    
    print(f"📊 Training unsupervised model with {len(sample_logs)} sample logs...")
    
    # Train model
    training_results = detector.train(sample_logs)
    
    print("\n🎓 Training Results:")
    print(f"  Total samples: {training_results['total_samples']}")
    print(f"  Anomalies detected: {training_results['anomalies_detected']}")
    print(f"  Anomaly rate: {training_results['anomaly_rate']:.2%}")
    print(f"  Features extracted: {training_results['feature_count']}")
    print(f"  PCA components: {training_results['pca_components']}")
    print(f"  Explained variance: {training_results['explained_variance']:.2%}")
    
    # Test predictions
    print("\n🔮 Testing predictions...")
    
    for i, log_entry in enumerate(sample_logs):
        data = log_entry['data']
        prediction = detector.predict(data)
        
        print(f"\n  Log {i+1}:")
        print(f"    Attack Type: {prediction['attack_type']}")
        print(f"    Is Anomaly: {prediction['is_anomaly']}")
        print(f"    Anomaly Score: {prediction['anomaly_score']:.3f}")
        print(f"    Confidence: {prediction['confidence']:.3f}")
        print(f"    Explanation: {prediction['explanation']}")
    
    # Save model
    model_path = detector.save_model()
    print(f"\n💾 Model saved to: {model_path}")
    
    print("\n✅ True unsupervised detection demo completed!")


if __name__ == "__main__":
    main()
