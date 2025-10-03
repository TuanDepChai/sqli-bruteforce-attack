#!/usr/bin/env python3
"""
🛡️ AI-Powered Anomaly Detection System for SQLi & Brute Force Attacks
Sử dụng Isolation Forest để học từ traffic sạch và phát hiện anomalies

Author: TuanDepChai
Framework: Unsupervised Machine Learning với scikit-learn
Target: Phát hiện SQLi và Brute Force attacks từ Wazuh logs
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re
import hashlib
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import logging
from pathlib import Path

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CyberSecurityAnomalyDetector:
    """
    🎯 AI Anomaly Detector sử dụng Isolation Forest
    
    Phương pháp:
    1. Học từ traffic sạch (normal behavior)
    2. Phát hiện anomalies dựa trên deviations
    3. Phân loại SQLi và Brute Force patterns
    """
    
    def __init__(self, contamination=0.1, random_state=42):
        self.contamination = contamination
        self.random_state = random_state
        
        # Models
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=200,
            max_samples='auto',
            max_features=1.0
        )
        
        # Preprocessing
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words=None,
            ngram_range=(1, 2),
            min_df=2
        )
        
        # Feature names for interpretability
        self.feature_names = []
        
        # Training data storage
        self.training_data = None
        self.is_trained = False
        
        # Model persistence
        self.model_path = Path("ai-ml/models")
        self.model_path.mkdir(exist_ok=True)
        
    def extract_features(self, log_data: Dict) -> np.ndarray:
        """
        🔍 Feature Engineering cho Security Logs
        
        Features được thiết kế để capture:
        1. SQL Injection patterns
        2. Brute Force behaviors  
        3. Normal vs Anomalous traffic patterns
        """
        features = []
        
        # 1. 📊 Basic Request Features
        features.extend([
            self._extract_request_frequency(log_data),
            self._extract_payload_size_score(log_data),
            self._extract_response_time_score(log_data),
            self._extract_status_code_score(log_data)
        ])
        
        # 2. 🔐 Authentication Features
        features.extend([
            self._extract_auth_pattern_score(log_data),
            self._extract_credential_entropy(log_data),
            self._extract_login_success_rate(log_data),
            self._extract_session_pattern_score(log_data)
        ])
        
        # 3. 🚨 SQL Injection Features
        features.extend([
            self._extract_sql_injection_score(log_data),
            self._extract_query_complexity_score(log_data),
            self._extract_sql_pattern_diversity(log_data),
            self._extract_parameter_manipulation_score(log_data)
        ])
        
        # 4. 💥 Brute Force Features
        features.extend([
            self._extract_brute_force_score(log_data),
            self._extract_attack_velocity(log_data),
            self._extract_password_dictionary_score(log_data),
            self._extract_user_enumeration_score(log_data)
        ])
        
        # 5. 🌐 Network & Behavioral Features
        features.extend([
            self._extract_ip_reputation_score(log_data),
            self._extract_user_agent_score(log_data),
            self._extract_referer_pattern_score(log_data),
            self._extract_temporal_pattern_score(log_data)
        ])
        
        # 6. 📈 Statistical Features
        features.extend([
            self._extract_statistical_anomaly_score(log_data),
            self._extract_pattern_deviation_score(log_data),
            self._extract_entropy_score(log_data),
            self._extract_frequency_deviation_score(log_data)
        ])
        
        return np.array(features, dtype=np.float32)
    
    def _extract_request_frequency(self, data: Dict) -> float:
        """Tần suất request trong time window"""
        # Simulate frequency based on timestamp patterns
        timestamp = data.get('timestamp', '')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                # Higher frequency during business hours = normal
                hour = dt.hour
                if 8 <= hour <= 18:
                    return 0.3  # Normal business hours
                else:
                    return 0.8  # After hours = potentially suspicious
            except:
                pass
        return 0.5  # Default moderate frequency
    
    def _extract_payload_size_score(self, data: Dict) -> float:
        """Đánh giá kích thước payload"""
        url = data.get('url', '')
        if url:
            # Larger payloads often indicate injection attempts
            size = len(url)
            if size > 200:
                return 0.8  # Suspicious large payload
            elif size > 100:
                return 0.4  # Moderate size
            else:
                return 0.1  # Normal size
        return 0.2
    
    def _extract_response_time_score(self, data: Dict) -> float:
        """Thời gian phản hồi - SQLi thường có response time khác biệt"""
        # Simulate response time analysis
        query = data.get('query', '')
        if query and ('OR' in query.upper() or 'UNION' in query.upper()):
            return 0.7  # Complex queries take longer
        return 0.2  # Normal response time
    
    def _extract_status_code_score(self, data: Dict) -> float:
        """Phân tích status code patterns"""
        status_code = data.get('status_code', '200')
        success = data.get('success', False)
        
        if str(status_code) == '500':
            return 0.9  # Server error = potential SQLi
        elif str(status_code) == '401' and not success:
            return 0.6  # Auth failure = potential brute force
        elif str(status_code) == '200' and success:
            return 0.1  # Normal successful request
        else:
            return 0.3  # Other codes
    
    def _extract_auth_pattern_score(self, data: Dict) -> float:
        """Phân tích patterns trong authentication"""
        username = data.get('username', '')
        password = data.get('password', '')
        
        # Check for common patterns
        if len(username) > 50 or len(password) > 50:
            return 0.8  # Unusually long credentials
        
        # Check for injection patterns in username
        if any(char in username for char in ["'", '"', ';', '--', '/*']):
            return 0.9  # SQL injection attempt
        
        return 0.2  # Normal auth pattern
    
    def _extract_credential_entropy(self, data: Dict) -> float:
        """Entropy của credentials - brute force thường dùng weak passwords"""
        password = data.get('password', '')
        if not password:
            return 0.5
        
        # Calculate entropy
        entropy = 0
        for char in set(password):
            p = password.count(char) / len(password)
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize entropy (0-1 scale)
        max_entropy = np.log2(len(set(password)))
        if max_entropy > 0:
            normalized_entropy = entropy / max_entropy
            return 1 - normalized_entropy  # Lower entropy = more suspicious
        return 0.5
    
    def _extract_login_success_rate(self, data: Dict) -> float:
        """Tỷ lệ thành công của login attempts"""
        success = data.get('success', False)
        return 0.8 if not success else 0.2  # Failed attempts more suspicious
    
    def _extract_session_pattern_score(self, data: Dict) -> float:
        """Phân tích session patterns"""
        # Simulate session analysis
        user_agent = data.get('user_agent', '')
        if 'PythonBruteForce' in user_agent or 'bot' in user_agent.lower():
            return 0.9  # Automated tools
        return 0.2  # Normal browser
    
    def _extract_sql_injection_score(self, data: Dict) -> float:
        """Phát hiện SQL Injection patterns"""
        username = data.get('username', '')
        password = data.get('password', '')
        query = data.get('query', '')
        
        sql_patterns = [
            r"'", r'"', r";", r"--", r"/\*", r"\*/",
            r"union", r"select", r"insert", r"update", r"delete",
            r"drop", r"alter", r"create", r"exec", r"execute",
            r"or\s+1\s*=\s*1", r"'\s*or\s*'1'\s*=\s*'1",
            r"admin'\s*--", r"'\s*or\s*1=1", r"'\s*or\s*'a'='a"
        ]
        
        text_to_check = f"{username} {password} {query}".lower()
        
        score = 0
        for pattern in sql_patterns:
            if re.search(pattern, text_to_check, re.IGNORECASE):
                score += 0.1
        
        return min(score, 1.0)
    
    def _extract_query_complexity_score(self, data: Dict) -> float:
        """Độ phức tạp của SQL query"""
        query = data.get('query', '')
        if not query:
            return 0.2
        
        # Count SQL keywords and operators
        sql_keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'JOIN']
        operators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN']
        
        complexity = 0
        query_upper = query.upper()
        
        for keyword in sql_keywords:
            complexity += query_upper.count(keyword) * 0.1
        
        for operator in operators:
            complexity += query_upper.count(operator) * 0.05
        
        return min(complexity, 1.0)
    
    def _extract_sql_pattern_diversity(self, data: Dict) -> float:
        """Đa dạng của SQL injection patterns"""
        username = data.get('username', '')
        password = data.get('password', '')
        
        # Count unique suspicious characters
        suspicious_chars = set("'\"();--/*")
        found_chars = set()
        
        for char in username + password:
            if char in suspicious_chars:
                found_chars.add(char)
        
        return len(found_chars) / len(suspicious_chars)
    
    def _extract_parameter_manipulation_score(self, data: Dict) -> float:
        """Phân tích parameter manipulation"""
        url = data.get('url', '')
        if '?' in url:
            # URL encoding patterns
            if '%20' in url or '%27' in url or '%3D' in url:
                return 0.7  # URL encoded parameters
            return 0.3  # Normal parameters
        return 0.1  # No parameters
    
    def _extract_brute_force_score(self, data: Dict) -> float:
        """Phát hiện Brute Force patterns"""
        user_agent = data.get('user_agent', '')
        success = data.get('success', False)
        
        # Automated tools indicators
        automated_indicators = [
            'python', 'curl', 'wget', 'bot', 'scanner', 'bruteforce'
        ]
        
        for indicator in automated_indicators:
            if indicator in user_agent.lower():
                return 0.8
        
        # Failed attempts
        if not success:
            return 0.6
        
        return 0.2  # Normal login
    
    def _extract_attack_velocity(self, data: Dict) -> float:
        """Tốc độ tấn công - brute force thường có high velocity"""
        # Simulate velocity based on timestamp and IP
        ip = data.get('ip', '')
        timestamp = data.get('timestamp', '')
        
        # Higher velocity for certain IP ranges or time patterns
        if ip.startswith('192.168.205.1'):  # Known attacker IP
            return 0.8
        
        return 0.3  # Normal velocity
    
    def _extract_password_dictionary_score(self, data: Dict) -> float:
        """Đánh giá password dictionary attacks"""
        password = data.get('password', '').lower()
        
        # Common weak passwords
        weak_passwords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'admin', 'admin123', 'root', 'toor', 'pass', 'test',
            'guest', 'user', 'administrator'
        ]
        
        if password in weak_passwords:
            return 0.8  # Dictionary password
        
        # Check for simple patterns
        if len(password) <= 6 or password.isdigit():
            return 0.6  # Weak password
        
        return 0.2  # Strong password
    
    def _extract_user_enumeration_score(self, data: Dict) -> float:
        """Phát hiện user enumeration attempts"""
        username = data.get('username', '')
        success = data.get('success', False)
        
        # Common usernames
        common_usernames = ['admin', 'administrator', 'root', 'user', 'test', 'guest']
        
        if username.lower() in common_usernames and not success:
            return 0.7  # Trying common usernames
        
        return 0.2  # Normal username
    
    def _extract_ip_reputation_score(self, data: Dict) -> float:
        """IP reputation analysis"""
        ip = data.get('ip', '')
        
        # Simulate IP reputation check
        if ip.startswith('192.168.205.1'):  # Known attacker
            return 0.9
        elif ip.startswith('192.168.205.138'):  # Another known attacker
            return 0.8
        elif ip.startswith('::1') or ip.startswith('127.0.0.1'):  # Localhost
            return 0.1
        else:
            return 0.3  # Unknown IP
    
    def _extract_user_agent_score(self, data: Dict) -> float:
        """User Agent analysis"""
        user_agent = data.get('user_agent', '')
        
        # Suspicious user agents
        suspicious_agents = [
            'python', 'curl', 'wget', 'bot', 'scanner', 'bruteforce',
            'automated', 'script', 'tool'
        ]
        
        for suspicious in suspicious_agents:
            if suspicious in user_agent.lower():
                return 0.8
        
        # Normal browsers
        normal_browsers = ['mozilla', 'chrome', 'safari', 'firefox', 'edge']
        for browser in normal_browsers:
            if browser in user_agent.lower():
                return 0.1
        
        return 0.5  # Unknown user agent
    
    def _extract_referer_pattern_score(self, data: Dict) -> float:
        """Referer pattern analysis"""
        referer = data.get('referer', '')
        
        if not referer or referer == 'direct':
            return 0.6  # Direct access = potentially suspicious
        
        if 'localhost' in referer or '192.168.205.100' in referer:
            return 0.2  # Normal internal referer
        
        return 0.4  # External referer
    
    def _extract_temporal_pattern_score(self, data: Dict) -> float:
        """Temporal pattern analysis"""
        timestamp = data.get('timestamp', '')
        
        try:
            dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
            hour = dt.hour
            
            # Night time attacks are more suspicious
            if 22 <= hour or hour <= 6:
                return 0.7
            elif 18 <= hour <= 22:  # Evening
                return 0.5
            else:  # Business hours
                return 0.2
        except:
            return 0.4
    
    def _extract_statistical_anomaly_score(self, data: Dict) -> float:
        """Statistical anomaly detection"""
        # Combine multiple features for statistical analysis
        features = [
            self._extract_payload_size_score(data),
            self._extract_sql_injection_score(data),
            self._extract_brute_force_score(data),
            self._extract_auth_pattern_score(data)
        ]
        
        # Calculate variance - high variance indicates anomaly
        variance = np.var(features)
        return min(variance * 2, 1.0)
    
    def _extract_pattern_deviation_score(self, data: Dict) -> float:
        """Pattern deviation from normal behavior"""
        # Simulate pattern analysis
        query = data.get('query', '')
        
        if query and len(query) > 100:
            return 0.7  # Unusually long query
        elif query and ('OR' in query.upper() or 'UNION' in query.upper()):
            return 0.8  # Complex query patterns
        
        return 0.2  # Normal pattern
    
    def _extract_entropy_score(self, data: Dict) -> float:
        """Information entropy analysis"""
        username = data.get('username', '')
        password = data.get('password', '')
        
        combined = username + password
        
        if len(combined) == 0:
            return 0.5
        
        # Calculate character entropy
        char_counts = {}
        for char in combined:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        entropy = 0
        for count in char_counts.values():
            p = count / len(combined)
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize
        max_entropy = np.log2(len(set(combined)))
        if max_entropy > 0:
            return 1 - (entropy / max_entropy)
        
        return 0.5
    
    def _extract_frequency_deviation_score(self, data: Dict) -> float:
        """Frequency deviation from normal patterns"""
        # Simulate frequency analysis
        timestamp = data.get('timestamp', '')
        
        try:
            dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
            minute = dt.minute
            
            # Certain minutes are more suspicious (simulating burst attacks)
            if minute % 5 == 0:  # Every 5 minutes = potentially automated
                return 0.6
            
            return 0.2
        except:
            return 0.4

    def prepare_training_data(self, logs: List[Dict]) -> pd.DataFrame:
        """
        📚 Chuẩn bị training data từ Wazuh logs
        
        Args:
            logs: List of log entries from Wazuh archives
            
        Returns:
            DataFrame with extracted features
        """
        logger.info(f"Preparing training data from {len(logs)} log entries...")
        
        features_list = []
        metadata_list = []
        
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
                
                # Extract features
                features = self.extract_features(data)
                features_list.append(features)
                
                # Store metadata for analysis
                metadata = {
                    'timestamp': data.get('timestamp'),
                    'ip': data.get('ip'),
                    'username': data.get('username'),
                    'success': data.get('success'),
                    'original_log': log_data
                }
                metadata_list.append(metadata)
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(logs)} logs...")
                    
            except Exception as e:
                logger.warning(f"Error processing log {i}: {e}")
                continue
        
        if not features_list:
            raise ValueError("No valid logs found for training")
        
        # Create DataFrame
        feature_names = [
            'request_frequency', 'payload_size', 'response_time', 'status_code',
            'auth_pattern', 'credential_entropy', 'login_success', 'session_pattern',
            'sql_injection', 'query_complexity', 'sql_pattern_diversity', 'parameter_manipulation',
            'brute_force', 'attack_velocity', 'password_dictionary', 'user_enumeration',
            'ip_reputation', 'user_agent', 'referer_pattern', 'temporal_pattern',
            'statistical_anomaly', 'pattern_deviation', 'entropy', 'frequency_deviation'
        ]
        
        df = pd.DataFrame(features_list, columns=feature_names)
        self.feature_names = feature_names
        
        # Add metadata
        metadata_df = pd.DataFrame(metadata_list)
        df = pd.concat([df, metadata_df], axis=1)
        
        logger.info(f"Training data prepared: {df.shape}")
        return df
    
    def train(self, logs: List[Dict]) -> Dict:
        """
        🎓 Training Isolation Forest model
        
        Args:
            logs: List of log entries for training
            
        Returns:
            Training results and model metrics
        """
        logger.info("Starting model training...")
        
        # Prepare training data
        df = self.prepare_training_data(logs)
        
        # Separate features from metadata
        feature_columns = self.feature_names
        X = df[feature_columns].values
        
        # Handle NaN values
        X = np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Isolation Forest
        logger.info("Training Isolation Forest model...")
        self.isolation_forest.fit(X_scaled)
        
        # Predict anomalies on training data
        predictions = self.isolation_forest.predict(X_scaled)
        anomaly_scores = self.isolation_forest.decision_function(X_scaled)
        
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
        
        # Training results
        results = {
            'total_samples': len(logs),
            'processed_samples': len(df),
            'anomalies_detected': int(n_anomalies),
            'normal_samples': int(n_normal),
            'anomaly_rate': float(anomaly_rate),
            'expected_contamination': self.contamination,
            'feature_importance': self._calculate_feature_importance(X_scaled, predictions),
            'model_metrics': {
                'mean_anomaly_score': float(np.mean(anomaly_scores)),
                'std_anomaly_score': float(np.std(anomaly_scores)),
                'min_anomaly_score': float(np.min(anomaly_scores)),
                'max_anomaly_score': float(np.max(anomaly_scores))
            }
        }
        
        logger.info(f"Training completed: {n_anomalies} anomalies detected ({anomaly_rate:.2%})")
        return results
    
    def _calculate_feature_importance(self, X: np.ndarray, predictions: np.ndarray) -> Dict:
        """Calculate feature importance based on anomaly detection"""
        feature_importance = {}
        
        for i, feature_name in enumerate(self.feature_names):
            # Calculate correlation between feature values and anomaly scores
            feature_values = X[:, i]
            anomaly_mask = predictions == -1
            
            if len(feature_values) > 1:
                # Calculate mean difference between normal and anomalous samples
                normal_mean = np.mean(feature_values[~anomaly_mask])
                anomaly_mean = np.mean(feature_values[anomaly_mask])
                
                importance = abs(anomaly_mean - normal_mean)
                feature_importance[feature_name] = float(importance)
            else:
                feature_importance[feature_name] = 0.0
        
        # Normalize importance scores
        total_importance = sum(feature_importance.values())
        if total_importance > 0:
            for feature in feature_importance:
                feature_importance[feature] /= total_importance
        
        return feature_importance
    
    def predict(self, log_data: Dict) -> Dict:
        """
        🔍 Predict anomaly for single log entry
        
        Args:
            log_data: Single log entry
            
        Returns:
            Prediction results with anomaly score and explanation
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Extract features
        features = self.extract_features(log_data)
        features = np.nan_to_num(features, nan=0.0, posinf=1.0, neginf=0.0)
        
        # Scale features
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        
        # Predict
        prediction = self.isolation_forest.predict(features_scaled)[0]
        anomaly_score = self.isolation_forest.decision_function(features_scaled)[0]
        
        # Determine attack type based on feature analysis
        attack_type = self._classify_attack_type(log_data, features)
        
        # Generate explanation
        explanation = self._generate_explanation(log_data, features, anomaly_score)
        
        return {
            'is_anomaly': prediction == -1,
            'anomaly_score': float(anomaly_score),
            'attack_type': attack_type,
            'confidence': float(abs(anomaly_score)),
            'explanation': explanation,
            'feature_scores': dict(zip(self.feature_names, features.tolist())),
            'timestamp': datetime.now().isoformat()
        }
    
    def _classify_attack_type(self, log_data: Dict, features: np.ndarray) -> str:
        """Classify the type of attack based on feature analysis"""
        feature_dict = dict(zip(self.feature_names, features.tolist()))
        
        sql_injection_score = feature_dict.get('sql_injection', 0)
        brute_force_score = feature_dict.get('brute_force', 0)
        auth_pattern_score = feature_dict.get('auth_pattern', 0)
        
        # Classification logic
        if sql_injection_score > 0.6:
            return 'SQL Injection'
        elif brute_force_score > 0.6:
            return 'Brute Force'
        elif auth_pattern_score > 0.6:
            return 'Credential Stuffing'
        elif feature_dict.get('password_dictionary', 0) > 0.6:
            return 'Dictionary Attack'
        else:
            return 'Normal Traffic'
    
    def _generate_explanation(self, log_data: Dict, features: np.ndarray, anomaly_score: float) -> str:
        """Generate human-readable explanation for the prediction"""
        feature_dict = dict(zip(self.feature_names, features.tolist()))
        
        # Find top contributing features
        sorted_features = sorted(feature_dict.items(), key=lambda x: abs(x[1]), reverse=True)
        top_features = sorted_features[:5]
        
        explanation_parts = []
        
        if abs(anomaly_score) > 0.5:
            explanation_parts.append("High anomaly score detected.")
        
        for feature_name, score in top_features:
            if score > 0.5:
                explanation_parts.append(f"High {feature_name.replace('_', ' ')} score: {score:.2f}")
        
        # Add specific attack indicators
        if feature_dict.get('sql_injection', 0) > 0.5:
            explanation_parts.append("SQL injection patterns detected in request.")
        
        if feature_dict.get('brute_force', 0) > 0.5:
            explanation_parts.append("Brute force attack indicators present.")
        
        if feature_dict.get('password_dictionary', 0) > 0.5:
            explanation_parts.append("Weak password detected - possible dictionary attack.")
        
        if not explanation_parts:
            explanation_parts.append("Normal traffic patterns observed.")
        
        return " | ".join(explanation_parts)
    
    def batch_predict(self, logs: List[Dict]) -> List[Dict]:
        """Predict anomalies for multiple log entries"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        logger.info(f"Processing {len(logs)} logs for batch prediction...")
        
        results = []
        for i, log_entry in enumerate(logs):
            try:
                if isinstance(log_entry, str):
                    log_data = json.loads(log_entry)
                else:
                    log_data = log_entry
                
                data = log_data.get('data', {})
                if not data:
                    continue
                
                prediction = self.predict(data)
                results.append({
                    'log_index': i,
                    'prediction': prediction,
                    'original_log': log_data
                })
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(logs)} logs...")
                    
            except Exception as e:
                logger.warning(f"Error processing log {i}: {e}")
                continue
        
        return results
    
    def save_model(self, filepath: str = None):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        if filepath is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = self.model_path / f"anomaly_detector_{timestamp}.joblib"
        
        model_data = {
            'isolation_forest': self.isolation_forest,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'contamination': self.contamination,
            'random_state': self.random_state,
            'training_data': self.training_data,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
        
        return filepath
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        model_data = joblib.load(filepath)
        
        self.isolation_forest = model_data['isolation_forest']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.contamination = model_data['contamination']
        self.random_state = model_data['random_state']
        self.training_data = model_data['training_data']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")
    
    def get_model_info(self) -> Dict:
        """Get information about the trained model"""
        if not self.is_trained:
            return {'status': 'not_trained'}
        
        return {
            'status': 'trained',
            'contamination': self.contamination,
            'random_state': self.random_state,
            'n_features': len(self.feature_names),
            'feature_names': self.feature_names,
            'training_samples': len(self.training_data) if self.training_data is not None else 0
        }


def main():
    """Demo function to test the anomaly detector"""
    print("🛡️ AI-Powered Anomaly Detection System")
    print("=" * 50)
    
    # Initialize detector
    detector = CyberSecurityAnomalyDetector(contamination=0.1)
    
    # Sample log data for testing
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
                "success": "false",
                "user_agent": "PythonBruteForce/1.0",
                "referer": "direct",
                "status_code": "200",
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
                "success": "true",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "referer": "http://192.168.205.100:3000/",
                "status_code": "200",
                "query": "SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '11111'"
            }
        }
    ]
    
    print(f"📊 Training model with {len(sample_logs)} sample logs...")
    
    # Train model
    training_results = detector.train(sample_logs)
    
    print("\n🎓 Training Results:")
    print(f"  Total samples: {training_results['total_samples']}")
    print(f"  Anomalies detected: {training_results['anomalies_detected']}")
    print(f"  Anomaly rate: {training_results['anomaly_rate']:.2%}")
    
    print("\n🔍 Feature Importance:")
    for feature, importance in sorted(training_results['feature_importance'].items(), 
                                    key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {feature}: {importance:.3f}")
    
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
    
    print("\n✅ Demo completed successfully!")


if __name__ == "__main__":
    main()
