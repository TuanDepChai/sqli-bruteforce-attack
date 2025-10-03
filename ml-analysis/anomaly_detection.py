#!/usr/bin/env python3
"""
Unsupervised Machine Learning for SQLi BruteForce Attack Detection
Research Topic: Detecting brute-force and SQL injection attacks without labeled data
"""

import pandas as pd
import numpy as np
import json
import re
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
import matplotlib.pyplot as plt
import seaborn as sns

class AttackDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def parse_log_entry(self, log_line):
        """Parse single log entry into structured data"""
        # Regex pattern for our log format
        pattern = r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [+-]\d{2}:\d{2}) (\S+) (\w+) (\S+) (\S+) (\d{3}) "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)"'
        
        match = re.match(pattern, log_line.strip())
        if match:
            return {
                'timestamp': match.group(1),
                'ip': match.group(2),
                'method': match.group(3),
                'uri': match.group(4),
                'query_string': match.group(5),
                'status_code': int(match.group(6)),
                'user_agent': match.group(7),
                'message': match.group(8),
                'error': match.group(9),
                'session_token': match.group(10),
                'attack_type': match.group(11),
                'sql_query': match.group(12),
                'referer': match.group(13),
                'response_time': match.group(14),
                'payload_size': match.group(15),
                'headers': match.group(16)
            }
        return None

    def extract_features(self, df):
        """Extract features for ML analysis"""
        features = {}
        
        # 1. Temporal Features
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        features['hour'] = df['timestamp'].dt.hour
        features['minute'] = df['timestamp'].dt.minute
        features['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # 2. IP-based Features
        ip_counts = df['ip'].value_counts()
        features['ip_frequency'] = df['ip'].map(ip_counts)
        features['unique_ips'] = len(df['ip'].unique())
        
        # 3. Request Features
        features['status_code'] = df['status_code']
        features['is_failed_login'] = (df['status_code'] == 401).astype(int)
        features['is_sql_error'] = (df['status_code'] == 500).astype(int)
        
        # 4. Payload Analysis
        features['query_length'] = df['query_string'].str.len()
        features['has_sql_keywords'] = df['query_string'].str.contains(
            r'(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|OR\s+1=1)', 
            case=False, regex=True
        ).astype(int)
        
        # 5. User Agent Analysis
        features['is_bot'] = df['user_agent'].str.contains(
            r'(bot|crawler|spider|scraper)', 
            case=False, regex=True
        ).astype(int)
        
        # 6. Attack Type Encoding
        attack_type_map = {'normal_login': 0, 'brute_force': 1, 'sql_injection': 2}
        features['attack_type_encoded'] = df['attack_type'].map(attack_type_map)
        
        # 7. Response Time Analysis
        features['response_time_ms'] = df['response_time'].str.extract(r'(\d+)').astype(float)
        
        # 8. Payload Size Analysis
        features['payload_size_bytes'] = df['payload_size'].str.extract(r'(\d+)').astype(float)
        
        # 9. Text Features for SQL Injection Detection
        sql_text = df['sql_query'].fillna('') + ' ' + df['query_string'].fillna('')
        sql_features = self.vectorizer.fit_transform(sql_text)
        
        # Convert to DataFrame
        feature_df = pd.DataFrame(features)
        
        # Add SQL text features
        sql_df = pd.DataFrame(sql_features.toarray(), 
                             columns=[f'sql_feature_{i}' for i in range(sql_features.shape[1])])
        
        return pd.concat([feature_df, sql_df], axis=1).fillna(0)

    def detect_anomalies(self, features):
        """Detect anomalies using Isolation Forest"""
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Fit isolation forest
        anomaly_scores = self.isolation_forest.fit_predict(scaled_features)
        anomaly_probabilities = self.isolation_forest.score_samples(scaled_features)
        
        return anomaly_scores, anomaly_probabilities

    def cluster_attacks(self, features):
        """Cluster similar attacks using DBSCAN"""
        scaled_features = self.scaler.fit_transform(features)
        clusters = self.dbscan.fit_predict(scaled_features)
        return clusters

    def analyze_attack_patterns(self, df, anomaly_scores, clusters):
        """Analyze attack patterns and generate insights"""
        results = {
            'total_requests': len(df),
            'anomalies_detected': np.sum(anomaly_scores == -1),
            'anomaly_rate': np.sum(anomaly_scores == -1) / len(df),
            'unique_clusters': len(set(clusters)) - (1 if -1 in clusters else 0),
            'attack_types': df['attack_type'].value_counts().to_dict(),
            'status_codes': df['status_code'].value_counts().to_dict(),
            'top_ips': df['ip'].value_counts().head(10).to_dict(),
            'time_patterns': df.groupby(df['timestamp'].dt.hour).size().to_dict()
        }
        
        # Identify potential attack sequences
        attack_sequences = self.identify_attack_sequences(df, anomaly_scores)
        results['attack_sequences'] = attack_sequences
        
        return results

    def identify_attack_sequences(self, df, anomaly_scores):
        """Identify sequences of attacks from same IP"""
        sequences = []
        df['is_anomaly'] = anomaly_scores == -1
        
        for ip in df['ip'].unique():
            ip_data = df[df['ip'] == ip].sort_values('timestamp')
            if len(ip_data) > 1:
                # Check for rapid successive attempts
                time_diffs = ip_data['timestamp'].diff().dt.total_seconds()
                rapid_attempts = time_diffs < 60  # Within 1 minute
                
                if rapid_attempts.any():
                    sequences.append({
                        'ip': ip,
                        'attempts': len(ip_data),
                        'rapid_attempts': rapid_attempts.sum(),
                        'attack_types': ip_data['attack_type'].unique().tolist(),
                        'anomaly_count': ip_data['is_anomaly'].sum(),
                        'timeframe': f"{ip_data['timestamp'].min()} to {ip_data['timestamp'].max()}"
                    })
        
        return sequences

    def generate_report(self, results):
        """Generate detailed analysis report"""
        report = f"""
# SQLi BruteForce Attack Detection Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- Total Requests: {results['total_requests']}
- Anomalies Detected: {results['anomalies_detected']}
- Anomaly Rate: {results['anomaly_rate']:.2%}
- Unique Attack Clusters: {results['unique_clusters']}

## Attack Types Distribution
"""
        for attack_type, count in results['attack_types'].items():
            report += f"- {attack_type}: {count} ({count/results['total_requests']:.1%})\n"
        
        report += "\n## Status Code Distribution\n"
        for status, count in results['status_codes'].items():
            report += f"- {status}: {count} ({count/results['total_requests']:.1%})\n"
        
        report += "\n## Top Source IPs\n"
        for ip, count in results['top_ips'].items():
            report += f"- {ip}: {count} requests\n"
        
        report += "\n## Attack Sequences Detected\n"
        if results['attack_sequences']:
            for seq in results['attack_sequences'][:5]:  # Top 5
                report += f"- IP {seq['ip']}: {seq['attempts']} attempts, {seq['anomaly_count']} anomalies\n"
        else:
            report += "- No significant attack sequences detected\n"
        
        return report

    def run_analysis(self, log_file_path):
        """Main analysis function"""
        print("🔍 Starting unsupervised ML analysis...")
        
        # Read and parse logs
        print("📖 Reading log files...")
        with open(log_file_path, 'r') as f:
            log_lines = f.readlines()
        
        # Parse logs
        parsed_logs = []
        for line in log_lines:
            parsed = self.parse_log_entry(line)
            if parsed:
                parsed_logs.append(parsed)
        
        if not parsed_logs:
            print("❌ No valid log entries found!")
            return
        
        df = pd.DataFrame(parsed_logs)
        print(f"✅ Parsed {len(df)} log entries")
        
        # Extract features
        print("🔧 Extracting features...")
        features = self.extract_features(df)
        
        # Detect anomalies
        print("🤖 Running anomaly detection...")
        anomaly_scores, anomaly_probabilities = self.detect_anomalies(features)
        
        # Cluster attacks
        print("📊 Clustering similar attacks...")
        clusters = self.cluster_attacks(features)
        
        # Analyze patterns
        print("📈 Analyzing attack patterns...")
        results = self.analyze_attack_patterns(df, anomaly_scores, clusters)
        
        # Generate report
        report = self.generate_report(results)
        print(report)
        
        # Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        with open(f'/opt/ml-results/analysis_{timestamp}.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        with open(f'/opt/ml-results/report_{timestamp}.md', 'w') as f:
            f.write(report)
        
        print(f"💾 Results saved to /opt/ml-results/")
        
        return results

if __name__ == "__main__":
    detector = AttackDetector()
    
    # Run analysis on log file
    log_file = "/opt/sqli-bruteforce-attack/logs/attacks.log"
    results = detector.run_analysis(log_file)
