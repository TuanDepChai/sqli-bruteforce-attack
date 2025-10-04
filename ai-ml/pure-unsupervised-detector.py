#!/usr/bin/env python3
"""
🧠 Pure Unsupervised AI Detector - True Unsupervised Learning
Hệ thống AI hoàn toàn không giám sát - chỉ dựa trên đặc trưng tự nhiên

Author: TuanDepChai
Philosophy: 
- KHÔNG sử dụng event_type hoặc bất kỳ label nào
- CHỈ dựa trên đặc trưng tự nhiên từ logs
- Học patterns từ traffic bình thường
- Phát hiện deviations dựa trên statistical và behavioral anomalies
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
from sklearn.neighbors import LocalOutlierFactor
import joblib
import logging
from pathlib import Path

# Import our advanced feature extractor
from advanced_feature_extractor import AdvancedFeatureExtractor

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PureUnsupervisedDetector:
    """
    🎯 Pure Unsupervised Anomaly Detector
    
    Nguyên tắc cốt lõi:
    1. KHÔNG sử dụng event_type, attack_type, hoặc bất kỳ label nào
    2. CHỈ dựa trên đặc trưng tự nhiên từ logs (timestamp, fields, query, payload...)
    3. Học patterns từ traffic bình thường
    4. Phát hiện deviations dựa trên statistical và behavioral anomalies
    5. Dựa trên đặc trưng chuyên sâu của SQLi và Brute Force attacks
    """
    
    def __init__(self, contamination=0.1, random_state=42):
        self.contamination = contamination
        self.random_state = random_state
        
        # Advanced Feature Extractor
        self.feature_extractor = AdvancedFeatureExtractor()
        
        # Multiple Unsupervised Models
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=300,
            max_samples='auto',
            max_features=1.0
        )
        
        self.local_outlier_factor = LocalOutlierFactor(
            n_neighbors=20,
            contamination=contamination,
            novelty=True
        )
        
        # Preprocessing
        self.scaler = RobustScaler()  # Robust to outliers
        self.text_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words=None,
            ngram_range=(1, 3),
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
        self.behavioral_baselines = {}
        
        # Model state
        self.is_trained = False
        self.training_data = None
        
        # Model persistence
        self.model_path = Path("ai-ml/models")
        self.model_path.mkdir(exist_ok=True)
        
    def extract_raw_log_data(self, log_entry: Dict) -> Dict:
        """
        🔍 Extract ONLY raw log data - NO labels
        
        Chỉ lấy các field tự nhiên từ logs:
        - timestamp, method, url, username, password, query, ip, user_agent, status_code, success, referer
        """
        # Extract from Wazuh log format
        if isinstance(log_entry, str):
            log_data = json.loads(log_entry)
        else:
            log_data = log_entry
        
        # Get the actual log data
        data = log_data.get('data', {})
        if not data:
            # Try to parse full_log if available
            full_log = log_entry.get('full_log', '')
            if full_log:
                try:
                    data = json.loads(full_log)
                except:
                    pass
        
        # Extract ONLY natural fields - NO labels
        raw_data = {
            'timestamp': data.get('timestamp', ''),
            'method': data.get('method', ''),
            'url': data.get('url', ''),
            'username': data.get('username', ''),
            'password': data.get('password', ''),
            'query': data.get('query', ''),
            'ip': data.get('ip', ''),
            'user_agent': data.get('user_agent', ''),
            'status_code': data.get('status_code', ''),
            'success': data.get('success', False),
            'referer': data.get('referer', '')
        }
        
        return raw_data
    
    def extract_comprehensive_features(self, raw_data: Dict) -> np.ndarray:
        """
        🌿 Extract comprehensive features from raw log data
        
        Sử dụng AdvancedFeatureExtractor để extract features dựa trên:
        1. SQL Injection characteristics
        2. Brute Force characteristics  
        3. Behavioral patterns
        4. Statistical patterns
        5. Temporal patterns
        """
        # Use advanced feature extractor
        feature_dict = self.feature_extractor.extract_comprehensive_features(raw_data)
        
        # Flatten features to array
        features = self.feature_extractor.flatten_features(feature_dict)
        
        # Convert to numpy array
        feature_array = np.array(features, dtype=np.float32)
        
        # Handle NaN values
        feature_array = np.nan_to_num(feature_array, nan=0.0, posinf=1.0, neginf=0.0)
        
        return feature_array
    
    def prepare_training_data(self, logs: List[Dict]) -> pd.DataFrame:
        """
        📚 Prepare training data - PURE unsupervised
        
        Chỉ sử dụng raw log data, KHÔNG sử dụng labels
        """
        logger.info(f"Preparing PURE unsupervised training data from {len(logs)} logs...")
        
        processed_logs = []
        
        for i, log_entry in enumerate(logs):
            try:
                # Extract ONLY raw log data (no labels)
                raw_data = self.extract_raw_log_data(log_entry)
                
                # Skip if no valid data
                if not any(raw_data.values()):
                    continue
                
                # Extract comprehensive features
                features = self.extract_comprehensive_features(raw_data)
                
                # Store processed data
                processed_logs.append({
                    'features': features,
                    'raw_data': raw_data,
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
        🎓 Train pure unsupervised model
        
        Học từ traffic patterns mà KHÔNG cần labels
        """
        logger.info("Starting PURE unsupervised model training...")
        
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
        
        # Train Local Outlier Factor
        logger.info("Training Local Outlier Factor model...")
        self.local_outlier_factor.fit(X_pca)
        
        # Predict anomalies
        if_predictions = self.isolation_forest.predict(X_pca)
        if_scores = self.isolation_forest.decision_function(X_pca)
        
        lof_scores = self.local_outlier_factor.decision_function(X_pca)
        
        # Combine predictions (ensemble approach)
        combined_scores = (if_scores + lof_scores) / 2
        combined_predictions = np.where(combined_scores < -0.1, -1, 1)
        
        # Add predictions to dataframe
        df['isolation_forest_prediction'] = if_predictions == -1
        df['isolation_forest_score'] = if_scores
        df['lof_score'] = lof_scores
        df['combined_score'] = combined_scores
        df['is_anomaly'] = combined_predictions == -1
        
        # Calculate training metrics
        n_anomalies = np.sum(combined_predictions == -1)
        n_normal = np.sum(combined_predictions == 1)
        anomaly_rate = n_anomalies / len(combined_predictions)
        
        # Store training data
        self.training_data = df
        self.is_trained = True
        
        # Calculate statistical baselines for normal behavior
        normal_data = X_scaled[combined_predictions == 1]
        if len(normal_data) > 0:
            self.statistical_baselines = {
                'mean': np.mean(normal_data, axis=0),
                'std': np.std(normal_data, axis=0),
                'percentiles': np.percentile(normal_data, [5, 25, 75, 95], axis=0),
                'iqr': np.percentile(normal_data, 75, axis=0) - np.percentile(normal_data, 25, axis=0)
            }
        
        # Calculate behavioral baselines
        self.behavioral_baselines = self._calculate_behavioral_baselines(df[combined_predictions == 1])
        
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
                'mean_if_score': float(np.mean(if_scores)),
                'std_if_score': float(np.std(if_scores)),
                'mean_lof_score': float(np.mean(lof_scores)),
                'std_lof_score': float(np.std(lof_scores)),
                'mean_combined_score': float(np.mean(combined_scores)),
                'std_combined_score': float(np.std(combined_scores))
            }
        }
        
        logger.info(f"PURE unsupervised training completed: {n_anomalies} anomalies detected ({anomaly_rate:.2%})")
        return results
    
    def _calculate_behavioral_baselines(self, normal_data: pd.DataFrame) -> Dict:
        """Calculate behavioral baselines from normal traffic"""
        baselines = {}
        
        if len(normal_data) == 0:
            return baselines
        
        # Analyze normal traffic patterns
        feature_columns = [col for col in normal_data.columns if col.startswith('feature_')]
        
        for col in feature_columns:
            values = normal_data[col].values
            baselines[col] = {
                'mean': np.mean(values),
                'std': np.std(values),
                'min': np.min(values),
                'max': np.max(values),
                'percentiles': np.percentile(values, [5, 25, 75, 95])
            }
        
        return baselines
    
    def predict(self, log_data: Dict) -> Dict:
        """
        🔍 Predict anomaly for single log entry
        
        Dựa trên features tự nhiên, KHÔNG dùng labels
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Extract raw data (no labels)
        raw_data = self.extract_raw_log_data(log_data)
        
        # Extract comprehensive features
        features = self.extract_comprehensive_features(raw_data)
        
        # Scale and transform
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        features_pca = self.pca.transform(features_scaled)
        
        # Predict with both models
        if_prediction = self.isolation_forest.predict(features_pca)[0]
        if_score = self.isolation_forest.decision_function(features_pca)[0]
        
        lof_score = self.local_outlier_factor.decision_function(features_pca)[0]
        
        # Combine predictions
        combined_score = (if_score + lof_score) / 2
        is_anomaly = combined_score < -0.1
        
        # Determine attack type based on natural patterns
        attack_type = self._classify_attack_type_natural(raw_data, features)
        
        # Generate explanation based on features
        explanation = self._generate_natural_explanation(raw_data, features, combined_score)
        
        # Calculate confidence based on score magnitude
        confidence = min(abs(combined_score) * 2, 1.0)
        
        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(combined_score),
            'isolation_forest_score': float(if_score),
            'lof_score': float(lof_score),
            'attack_type': attack_type,
            'confidence': float(confidence),
            'explanation': explanation,
            'feature_scores': dict(zip(self.feature_names, features.tolist())),
            'timestamp': datetime.now().isoformat()
        }
    
    def _classify_attack_type_natural(self, raw_data: Dict, features: np.ndarray) -> str:
        """
        Classify attack type based on natural patterns ONLY
        
        Dựa trên đặc trưng chuyên sâu của SQLi và Brute Force
        """
        # Extract key data
        url = raw_data.get('url', '')
        username = raw_data.get('username', '')
        password = raw_data.get('password', '')
        query = raw_data.get('query', '')
        user_agent = raw_data.get('user_agent', '').lower()
        
        # SQL Injection indicators (based on natural patterns)
        sqli_score = 0.0
        
        # 1. Basic SQL characters
        all_text = f"{url} {username} {password} {query}"
        sqli_score += all_text.count("'") * 0.1
        sqli_score += all_text.count('"') * 0.1
        sqli_score += all_text.count(';') * 0.1
        sqli_score += all_text.count('--') * 0.2
        
        # 2. SQL keywords
        sql_keywords = ['UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP']
        for keyword in sql_keywords:
            sqli_score += all_text.upper().count(keyword) * 0.2
        
        # 3. Boolean-based injection
        boolean_patterns = ['OR 1=1', "OR '1'='1", "OR 1=1", "OR 'a'='a"]
        for pattern in boolean_patterns:
            sqli_score += all_text.upper().count(pattern) * 0.3
        
        # 4. Time-based injection
        time_patterns = ['SLEEP', 'WAITFOR', 'BENCHMARK']
        for pattern in time_patterns:
            sqli_score += all_text.upper().count(pattern) * 0.4
        
        # 5. Union-based injection
        if 'UNION' in all_text.upper() and 'SELECT' in all_text.upper():
            sqli_score += 0.5
        
        # 6. Query complexity
        if query:
            if len(query) > 200:
                sqli_score += 0.3
            if query.count('(') > 5 or query.count(')') > 5:
                sqli_score += 0.2
        
        # Brute Force indicators (based on natural patterns)
        bf_score = 0.0
        
        # 1. Automation tools
        automation_keywords = ['python', 'curl', 'wget', 'bot', 'scanner', 'bruteforce', 'hydra', 'medusa']
        for keyword in automation_keywords:
            if keyword in user_agent:
                bf_score += 0.3
        
        # 2. Weak passwords
        weak_passwords = ['password', '123456', 'admin', 'root', 'test', 'guest', 'qwerty', 'abc123']
        if password.lower() in weak_passwords:
            bf_score += 0.4
        
        # 3. Common usernames
        common_usernames = ['admin', 'administrator', 'root', 'user', 'test', 'guest']
        if username.lower() in common_usernames:
            bf_score += 0.3
        
        # 4. Sequential patterns
        if re.search(r'\d{4,}', password):
            bf_score += 0.2
        if re.search(r'[a-z]{3,}\d{2,}', password):
            bf_score += 0.2
        
        # 5. Credential stuffing patterns
        if len(username) > 20 and len(password) > 20:
            bf_score += 0.3
        
        # 6. Password spraying patterns
        spray_passwords = ['password123', 'welcome123', 'spring2024', 'summer2024']
        if password.lower() in spray_passwords:
            bf_score += 0.4
        
        # Classification based on scores
        if sqli_score > 0.8:
            return 'SQL Injection (High Confidence)'
        elif sqli_score > 0.5:
            return 'Potential SQL Injection'
        elif bf_score > 0.8:
            return 'Brute Force Attack (High Confidence)'
        elif bf_score > 0.5:
            return 'Potential Brute Force Attack'
        elif sqli_score > 0.3 or bf_score > 0.3:
            return 'Suspicious Activity'
        else:
            return 'Normal Traffic'
    
    def _generate_natural_explanation(self, raw_data: Dict, features: np.ndarray, anomaly_score: float) -> str:
        """Generate explanation based on natural patterns"""
        explanations = []
        
        # Statistical deviation
        if abs(anomaly_score) > 0.5:
            explanations.append("High statistical deviation from normal traffic patterns.")
        elif abs(anomaly_score) > 0.3:
            explanations.append("Moderate deviation from normal traffic patterns.")
        
        # Analyze specific patterns
        url = raw_data.get('url', '')
        query = raw_data.get('query', '')
        user_agent = raw_data.get('user_agent', '')
        username = raw_data.get('username', '')
        password = raw_data.get('password', '')
        
        # SQL injection patterns
        if query and ("'" in query or '"' in query or 'UNION' in query.upper()):
            explanations.append("SQL-like patterns detected in query.")
        
        if username and ("'" in username or '"' in username):
            explanations.append("SQL injection patterns in username field.")
        
        # Brute force patterns
        if user_agent and any(keyword in user_agent.lower() for keyword in ['python', 'curl', 'bot', 'scanner']):
            explanations.append("Automated tool indicators present.")
        
        if password and password.lower() in ['password', '123456', 'admin', 'test']:
            explanations.append("Weak password detected.")
        
        if username and username.lower() in ['admin', 'root', 'test', 'guest']:
            explanations.append("Common username pattern detected.")
        
        # Request anomalies
        if url and len(url) > 500:
            explanations.append("Unusually large request payload.")
        
        if url and url.count('=') > 20:
            explanations.append("Excessive parameter manipulation.")
        
        # Temporal anomalies
        timestamp = raw_data.get('timestamp', '')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                if dt.hour < 6 or dt.hour > 22:
                    explanations.append("Unusual timing pattern detected.")
            except:
                pass
        
        if not explanations:
            explanations.append("Normal traffic patterns observed.")
        
        return " | ".join(explanations)
    
    def batch_predict(self, logs: List[Dict]) -> List[Dict]:
        """Predict anomalies for multiple log entries"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        logger.info(f"Processing {len(logs)} logs for batch prediction...")
        
        results = []
        for i, log_entry in enumerate(logs):
            try:
                prediction = self.predict(log_entry)
                results.append({
                    'log_index': i,
                    'prediction': prediction,
                    'original_log': log_entry
                })
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(logs)} logs...")
                    
            except Exception as e:
                logger.warning(f"Error processing log {i}: {e}")
                continue
        
        return results
    
    def save_model(self, filepath: str = None):
        """Save trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        if filepath is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = self.model_path / f"pure_unsupervised_detector_{timestamp}.joblib"
        
        model_data = {
            'isolation_forest': self.isolation_forest,
            'local_outlier_factor': self.local_outlier_factor,
            'scaler': self.scaler,
            'pca': self.pca,
            'feature_names': self.feature_names,
            'statistical_baselines': self.statistical_baselines,
            'behavioral_baselines': self.behavioral_baselines,
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
        self.local_outlier_factor = model_data['local_outlier_factor']
        self.scaler = model_data['scaler']
        self.pca = model_data['pca']
        self.feature_names = model_data['feature_names']
        self.statistical_baselines = model_data['statistical_baselines']
        self.behavioral_baselines = model_data['behavioral_baselines']
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
            'statistical_baselines': bool(self.statistical_baselines),
            'behavioral_baselines': bool(self.behavioral_baselines),
            'models': ['IsolationForest', 'LocalOutlierFactor']
        }


def main():
    """Demo function"""
    print("🧠 Pure Unsupervised Anomaly Detection System")
    print("=" * 60)
    
    # Initialize detector
    detector = PureUnsupervisedDetector(contamination=0.1)
    
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
        },
        {
            "timestamp": "2025-10-03T22:19:15.123+0700",
            "agent": {"id": "001", "name": "modsec-virtual-machine", "ip": "192.168.205.100"},
            "manager": {"name": "web-virtual-machine"},
            "data": {
                "url": "/api/login?username=john&password=password123",
                "timestamp": "2025-10-03T22:19:15.123+0700",
                "method": "POST",
                "username": "john",
                "password": "password123",
                "ip": "192.168.205.50",
                "success": True,
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "referer": "http://192.168.205.100:3000/login",
                "status_code": 200,
                "query": "SELECT * FROM users WHERE username = 'john' AND password = 'password123'"
            }
        }
    ]
    
    print(f"📊 Training PURE unsupervised model with {len(sample_logs)} sample logs...")
    print("🔍 NO labels used - only natural features from logs")
    
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
        prediction = detector.predict(log_entry)
        
        print(f"\n  Log {i+1}:")
        print(f"    Attack Type: {prediction['attack_type']}")
        print(f"    Is Anomaly: {prediction['is_anomaly']}")
        print(f"    Combined Score: {prediction['anomaly_score']:.3f}")
        print(f"    IF Score: {prediction['isolation_forest_score']:.3f}")
        print(f"    LOF Score: {prediction['lof_score']:.3f}")
        print(f"    Confidence: {prediction['confidence']:.3f}")
        print(f"    Explanation: {prediction['explanation']}")
    
    # Save model
    model_path = detector.save_model()
    print(f"\n💾 Model saved to: {model_path}")
    
    # Model info
    model_info = detector.get_model_info()
    print(f"\n📋 Model Info:")
    print(f"  Status: {model_info['status']}")
    print(f"  Features: {model_info['n_features']}")
    print(f"  Models: {', '.join(model_info['models'])}")
    print(f"  Baselines: Statistical={model_info['statistical_baselines']}, Behavioral={model_info['behavioral_baselines']}")
    
    print("\n✅ Pure unsupervised detection demo completed!")
    print("🎯 Key Achievement: NO labels used - only natural log features!")


if __name__ == "__main__":
    main()
