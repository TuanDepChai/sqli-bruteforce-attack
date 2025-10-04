#!/usr/bin/env python3
"""
🔬 Advanced Feature Extractor for Unsupervised Learning
Trích xuất đặc trưng chuyên sâu dựa trên đặc trưng của SQLi và Brute Force

Author: TuanDepChai
Focus: Pure feature engineering based on attack characteristics
"""

import re
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime
import hashlib
from collections import Counter

class AdvancedFeatureExtractor:
    """
    🔬 Advanced Feature Extractor
    
    Dựa trên đặc trưng chuyên sâu của SQLi và Brute Force:
    1. SQL Injection patterns (In-band, Blind, Second-order)
    2. Brute Force patterns (Credential stuffing, Password spraying, Dictionary)
    3. Modern attack vectors (NoSQL, Low & slow, Polyglot)
    4. Behavioral anomalies
    5. Statistical deviations
    """
    
    def __init__(self):
        # SQL Injection patterns
        self.sql_patterns = {
            'basic': [r"'", r'"', r";", r"--", r"/\*", r"\*/"],
            'keywords': [r"union", r"select", r"insert", r"update", r"delete", r"drop", r"alter", r"create"],
            'boolean': [r"or\s+1\s*=\s*1", r"'\s*or\s*'1'\s*=\s*'1", r"admin'\s*--", r"'\s*or\s*1=1"],
            'time_based': [r"sleep\s*\(", r"waitfor\s+delay", r"benchmark\s*\("],
            'error_based': [r"extractvalue\s*\(", r"updatexml\s*\(", r"exp\s*\("],
            'union_based': [r"union\s+select", r"union\s+all\s+select"],
            'second_order': [r"@@version", r"@@datadir", r"information_schema"]
        }
        
        # Brute Force patterns
        self.bf_patterns = {
            'automation': ['python', 'curl', 'wget', 'bot', 'scanner', 'bruteforce', 'hydra', 'medusa'],
            'weak_passwords': ['password', '123456', 'admin', 'root', 'test', 'guest', 'user', 'qwerty'],
            'common_usernames': ['admin', 'administrator', 'root', 'user', 'test', 'guest', 'demo'],
            'sequential': [r'\d{4,}', r'[a-z]{3,}\d{2,}', r'\d{2,}[a-z]{3,}']
        }
        
        # NoSQL injection patterns
        self.nosql_patterns = {
            'mongo': [r'\$ne', r'\$regex', r'\$where', r'\$gt', r'\$lt', r'\$in', r'\$nin'],
            'elasticsearch': [r'"query"', r'"bool"', r'"must"', r'"should"', r'"filter"'],
            'graphql': [r'query\s*\{', r'mutation\s*\{', r'subscription\s*\{']
        }
        
        # Encoding patterns
        self.encoding_patterns = {
            'url': [r'%[0-9a-fA-F]{2}', r'\+'],
            'unicode': [r'\\u[0-9a-fA-F]{4}', r'\\x[0-9a-fA-F]{2}'],
            'base64': [r'[A-Za-z0-9+/]{4,}={0,2}'],
            'hex': [r'0x[0-9a-fA-F]+']
        }
    
    def extract_comprehensive_features(self, log_data: Dict) -> Dict:
        """
        🔍 Extract comprehensive features from log data
        
        Returns: Dictionary with feature categories
        """
        features = {}
        
        # 1. Basic Data Features
        features['basic'] = self._extract_basic_features(log_data)
        
        # 2. SQL Injection Features
        features['sqli'] = self._extract_sqli_features(log_data)
        
        # 3. Brute Force Features
        features['bruteforce'] = self._extract_bruteforce_features(log_data)
        
        # 4. NoSQL Features
        features['nosql'] = self._extract_nosql_features(log_data)
        
        # 5. Encoding Features
        features['encoding'] = self._extract_encoding_features(log_data)
        
        # 6. Behavioral Features
        features['behavioral'] = self._extract_behavioral_features(log_data)
        
        # 7. Statistical Features
        features['statistical'] = self._extract_statistical_features(log_data)
        
        # 8. Temporal Features
        features['temporal'] = self._extract_temporal_features(log_data)
        
        return features
    
    def _extract_basic_features(self, data: Dict) -> Dict:
        """Extract basic data features"""
        features = {}
        
        # String lengths
        features['url_length'] = len(data.get('url', ''))
        features['username_length'] = len(data.get('username', ''))
        features['password_length'] = len(data.get('password', ''))
        features['query_length'] = len(data.get('query', ''))
        features['user_agent_length'] = len(data.get('user_agent', ''))
        
        # Parameter counts
        url = data.get('url', '')
        features['param_count'] = url.count('&') + url.count('=') if url else 0
        features['path_depth'] = url.count('/') - 2 if url else 0  # Remove protocol slashes
        
        # Status code
        try:
            features['status_code'] = int(data.get('status_code', '200'))
        except:
            features['status_code'] = 200
        
        # Success flag
        success = data.get('success', False)
        if isinstance(success, str):
            success = success.lower() in ['true', 'yes', '1']
        features['success'] = float(success)
        
        return features
    
    def _extract_sqli_features(self, data: Dict) -> Dict:
        """Extract SQL injection specific features"""
        features = {}
        
        # Combine all text fields for analysis
        text_fields = [
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', '')
        ]
        combined_text = ' '.join(text_fields).lower()
        
        # 1. Basic SQL patterns
        features['basic_sql_chars'] = sum(
            len(re.findall(pattern, combined_text)) 
            for pattern in self.sql_patterns['basic']
        )
        
        # 2. SQL keywords
        features['sql_keywords'] = sum(
            len(re.findall(pattern, combined_text)) 
            for pattern in self.sql_patterns['keywords']
        )
        
        # 3. Boolean-based injection
        features['boolean_injection'] = sum(
            len(re.findall(pattern, combined_text, re.IGNORECASE)) 
            for pattern in self.sql_patterns['boolean']
        )
        
        # 4. Time-based injection
        features['time_based_injection'] = sum(
            len(re.findall(pattern, combined_text, re.IGNORECASE)) 
            for pattern in self.sql_patterns['time_based']
        )
        
        # 5. Error-based injection
        features['error_based_injection'] = sum(
            len(re.findall(pattern, combined_text, re.IGNORECASE)) 
            for pattern in self.sql_patterns['error_based']
        )
        
        # 6. Union-based injection
        features['union_injection'] = sum(
            len(re.findall(pattern, combined_text, re.IGNORECASE)) 
            for pattern in self.sql_patterns['union_based']
        )
        
        # 7. Second-order injection
        features['second_order_injection'] = sum(
            len(re.findall(pattern, combined_text, re.IGNORECASE)) 
            for pattern in self.sql_patterns['second_order']
        )
        
        # 8. Query complexity
        query = data.get('query', '')
        if query:
            features['query_complexity'] = self._calculate_query_complexity(query)
            features['query_nesting_depth'] = self._calculate_nesting_depth(query)
        else:
            features['query_complexity'] = 0.0
            features['query_nesting_depth'] = 0.0
        
        # 9. Parameter manipulation
        url = data.get('url', '')
        features['parameter_manipulation'] = self._detect_parameter_manipulation(url)
        
        # 10. SQL injection confidence score
        features['sqli_confidence'] = self._calculate_sqli_confidence(combined_text)
        
        return features
    
    def _extract_bruteforce_features(self, data: Dict) -> Dict:
        """Extract brute force specific features"""
        features = {}
        
        # 1. Automation detection
        user_agent = data.get('user_agent', '').lower()
        features['automation_score'] = sum(
            1 for pattern in self.bf_patterns['automation'] 
            if pattern in user_agent
        ) / len(self.bf_patterns['automation'])
        
        # 2. Weak password detection
        password = data.get('password', '').lower()
        features['weak_password'] = float(password in self.bf_patterns['weak_passwords'])
        
        # 3. Common username detection
        username = data.get('username', '').lower()
        features['common_username'] = float(username in self.bf_patterns['common_usernames'])
        
        # 4. Sequential pattern detection
        features['sequential_pattern'] = sum(
            len(re.findall(pattern, username + password)) 
            for pattern in self.bf_patterns['sequential']
        )
        
        # 5. Credential entropy
        features['credential_entropy'] = self._calculate_entropy(username + password)
        
        # 6. Password strength
        features['password_strength'] = self._calculate_password_strength(password)
        
        # 7. User enumeration indicators
        features['user_enumeration'] = self._detect_user_enumeration(data)
        
        # 8. Credential stuffing indicators
        features['credential_stuffing'] = self._detect_credential_stuffing(username, password)
        
        # 9. Password spraying indicators
        features['password_spraying'] = self._detect_password_spraying(data)
        
        # 10. Brute force confidence score
        features['bf_confidence'] = self._calculate_bf_confidence(data)
        
        return features
    
    def _extract_nosql_features(self, data: Dict) -> Dict:
        """Extract NoSQL injection features"""
        features = {}
        
        text_fields = [
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', '')
        ]
        combined_text = ' '.join(text_fields)
        
        # 1. MongoDB injection patterns
        features['mongo_injection'] = sum(
            len(re.findall(pattern, combined_text)) 
            for pattern in self.nosql_patterns['mongo']
        )
        
        # 2. Elasticsearch injection patterns
        features['elasticsearch_injection'] = sum(
            len(re.findall(pattern, combined_text)) 
            for pattern in self.nosql_patterns['elasticsearch']
        )
        
        # 3. GraphQL injection patterns
        features['graphql_injection'] = sum(
            len(re.findall(pattern, combined_text)) 
            for pattern in self.nosql_patterns['graphql']
        )
        
        # 4. JSON-like patterns
        features['json_patterns'] = combined_text.count('{') + combined_text.count('}')
        
        # 5. NoSQL confidence score
        features['nosql_confidence'] = self._calculate_nosql_confidence(combined_text)
        
        return features
    
    def _extract_encoding_features(self, data: Dict) -> Dict:
        """Extract encoding-related features"""
        features = {}
        
        text_fields = [
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', '')
        ]
        combined_text = ' '.join(text_fields)
        
        # 1. URL encoding
        features['url_encoding'] = len(re.findall(self.encoding_patterns['url'][0], combined_text))
        
        # 2. Unicode encoding
        features['unicode_encoding'] = len(re.findall(self.encoding_patterns['unicode'][0], combined_text))
        
        # 3. Base64-like patterns
        features['base64_patterns'] = len(re.findall(self.encoding_patterns['base64'][0], combined_text))
        
        # 4. Hex encoding
        features['hex_encoding'] = len(re.findall(self.encoding_patterns['hex'][0], combined_text))
        
        # 5. Encoding complexity
        features['encoding_complexity'] = self._calculate_encoding_complexity(combined_text)
        
        # 6. Double encoding
        features['double_encoding'] = self._detect_double_encoding(combined_text)
        
        return features
    
    def _extract_behavioral_features(self, data: Dict) -> Dict:
        """Extract behavioral features"""
        features = {}
        
        # 1. Request timing patterns
        timestamp = data.get('timestamp', '')
        features.update(self._analyze_timing_patterns(timestamp))
        
        # 2. IP address patterns
        ip = data.get('ip', '')
        features.update(self._analyze_ip_patterns(ip))
        
        # 3. User agent patterns
        user_agent = data.get('user_agent', '')
        features.update(self._analyze_user_agent_patterns(user_agent))
        
        # 4. Referer patterns
        referer = data.get('referer', '')
        features['referer_anomaly'] = self._analyze_referer_patterns(referer)
        
        # 5. Request sequence patterns
        features['request_sequence_anomaly'] = self._analyze_request_sequence(data)
        
        return features
    
    def _extract_statistical_features(self, data: Dict) -> Dict:
        """Extract statistical features"""
        features = {}
        
        # 1. Text statistics
        text_fields = [
            data.get('url', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('query', ''),
            data.get('user_agent', '')
        ]
        combined_text = ' '.join(text_fields)
        
        if combined_text:
            features['text_length'] = len(combined_text)
            features['char_diversity'] = len(set(combined_text)) / len(combined_text)
            features['digit_ratio'] = sum(1 for c in combined_text if c.isdigit()) / len(combined_text)
            features['alpha_ratio'] = sum(1 for c in combined_text if c.isalpha()) / len(combined_text)
            features['special_char_ratio'] = sum(1 for c in combined_text if not c.isalnum() and c not in ' .-_') / len(combined_text)
            features['uppercase_ratio'] = sum(1 for c in combined_text if c.isupper()) / len(combined_text)
            features['whitespace_ratio'] = sum(1 for c in combined_text if c.isspace()) / len(combined_text)
        else:
            features.update({
                'text_length': 0, 'char_diversity': 0, 'digit_ratio': 0,
                'alpha_ratio': 0, 'special_char_ratio': 0, 'uppercase_ratio': 0, 'whitespace_ratio': 0
            })
        
        # 2. Entropy-based features
        features['overall_entropy'] = self._calculate_entropy(combined_text)
        
        # 3. Pattern repetition
        features['pattern_repetition'] = self._calculate_pattern_repetition(combined_text)
        
        return features
    
    def _extract_temporal_features(self, data: Dict) -> Dict:
        """Extract temporal features"""
        features = {}
        
        timestamp = data.get('timestamp', '')
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                
                # Basic temporal features
                features['hour'] = dt.hour
                features['day_of_week'] = dt.weekday()
                features['minute'] = dt.minute
                features['second'] = dt.second
                features['microsecond'] = dt.microsecond
                
                # Derived temporal features
                features['is_business_hours'] = float(8 <= dt.hour <= 18)
                features['is_weekend'] = float(dt.weekday() >= 5)
                features['is_odd_hour'] = float(dt.hour % 2 == 1)
                features['is_odd_minute'] = float(dt.minute % 2 == 1)
                features['is_odd_second'] = float(dt.second % 2 == 1)
                
                # Suspicious timing patterns
                features['late_night'] = float(dt.hour < 6 or dt.hour > 22)
                features['exact_intervals'] = float(dt.second == 0 or dt.second % 10 == 0)
                features['burst_pattern'] = float(dt.minute % 5 == 0)
                
            except:
                # Default values if parsing fails
                features.update({
                    'hour': 12, 'day_of_week': 0, 'minute': 0, 'second': 0, 'microsecond': 0,
                    'is_business_hours': 0.5, 'is_weekend': 0.0, 'is_odd_hour': 0.0,
                    'is_odd_minute': 0.0, 'is_odd_second': 0.0, 'late_night': 0.0,
                    'exact_intervals': 0.0, 'burst_pattern': 0.0
                })
        else:
            features.update({
                'hour': 12, 'day_of_week': 0, 'minute': 0, 'second': 0, 'microsecond': 0,
                'is_business_hours': 0.5, 'is_weekend': 0.0, 'is_odd_hour': 0.0,
                'is_odd_minute': 0.0, 'is_odd_second': 0.0, 'late_night': 0.0,
                'exact_intervals': 0.0, 'burst_pattern': 0.0
            })
        
        return features
    
    # Helper methods
    def _calculate_query_complexity(self, query: str) -> float:
        """Calculate SQL query complexity"""
        if not query:
            return 0.0
        
        complexity = 0.0
        query_upper = query.upper()
        
        # Keywords
        keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'UNION', 'JOIN', 'GROUP BY', 'ORDER BY']
        complexity += sum(query_upper.count(keyword) for keyword in keywords) * 0.1
        
        # Operators
        operators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN', 'EXISTS']
        complexity += sum(query_upper.count(op) for op in operators) * 0.05
        
        # Functions
        functions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'SUBSTRING', 'CONCAT']
        complexity += sum(query_upper.count(func) for func in functions) * 0.1
        
        return min(complexity, 1.0)
    
    def _calculate_nesting_depth(self, query: str) -> float:
        """Calculate nesting depth in SQL query"""
        if not query:
            return 0.0
        
        max_depth = 0
        current_depth = 0
        
        for char in query:
            if char == '(':
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            elif char == ')':
                current_depth = max(0, current_depth - 1)
        
        return min(max_depth / 10.0, 1.0)
    
    def _detect_parameter_manipulation(self, url: str) -> float:
        """Detect parameter manipulation in URL"""
        if not url or '?' not in url:
            return 0.0
        
        params = url.split('?')[1]
        
        # Check for suspicious parameter patterns
        manipulation_score = 0.0
        
        # URL encoding
        if '%' in params:
            manipulation_score += 0.3
        
        # Special characters
        special_chars = sum(1 for c in params if c in "'\"();--/*")
        if special_chars > 0:
            manipulation_score += 0.5
        
        # Multiple parameters with same name (parameter pollution)
        param_names = [p.split('=')[0] for p in params.split('&') if '=' in p]
        if len(param_names) != len(set(param_names)):
            manipulation_score += 0.4
        
        return min(manipulation_score, 1.0)
    
    def _calculate_sqli_confidence(self, text: str) -> float:
        """Calculate SQL injection confidence score"""
        if not text:
            return 0.0
        
        confidence = 0.0
        
        # Basic SQL characters
        confidence += min(text.count("'") + text.count('"'), 5) * 0.1
        
        # SQL keywords
        sql_keywords = ['union', 'select', 'insert', 'update', 'delete', 'drop']
        confidence += sum(min(text.count(keyword), 3) for keyword in sql_keywords) * 0.1
        
        # Boolean patterns
        boolean_patterns = ['or 1=1', 'or 1=1', "or '1'='1"]
        confidence += sum(min(text.count(pattern), 2) for pattern in boolean_patterns) * 0.2
        
        return min(confidence, 1.0)
    
    def _calculate_password_strength(self, password: str) -> float:
        """Calculate password strength"""
        if not password:
            return 0.0
        
        strength = 0.0
        
        # Length
        if len(password) >= 8:
            strength += 0.3
        if len(password) >= 12:
            strength += 0.2
        
        # Character diversity
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(not c.isalnum() for c in password)
        
        strength += sum([has_lower, has_upper, has_digit, has_special]) * 0.125
        
        return min(strength, 1.0)
    
    def _detect_user_enumeration(self, data: Dict) -> float:
        """Detect user enumeration attempts"""
        username = data.get('username', '').lower()
        success = data.get('success', False)
        
        if isinstance(success, str):
            success = success.lower() in ['true', 'yes', '1']
        
        # Common enumeration patterns
        common_usernames = ['admin', 'administrator', 'root', 'user', 'test', 'guest']
        
        if username in common_usernames and not success:
            return 0.8
        
        return 0.0
    
    def _detect_credential_stuffing(self, username: str, password: str) -> float:
        """Detect credential stuffing patterns"""
        if not username or not password:
            return 0.0
        
        # Check for leaked credential patterns
        # This is a simplified version - in practice, you'd check against known breach data
        
        # Common leaked patterns
        if len(username) > 20 and len(password) > 20:
            return 0.7  # Long credentials often from breaches
        
        if '@' in username and len(password) > 15:
            return 0.6  # Email username with long password
        
        return 0.0
    
    def _detect_password_spraying(self, data: Dict) -> float:
        """Detect password spraying patterns"""
        password = data.get('password', '').lower()
        
        # Common passwords used in spraying
        spray_passwords = [
            'password', '123456', 'password123', 'admin', 'welcome',
            'spring2024', 'summer2024', 'winter2024', 'fall2024',
            'password1', 'qwerty', 'abc123', 'password!'
        ]
        
        return float(password in spray_passwords)
    
    def _calculate_bf_confidence(self, data: Dict) -> float:
        """Calculate brute force confidence score"""
        confidence = 0.0
        
        # User agent automation
        user_agent = data.get('user_agent', '').lower()
        automation_keywords = ['python', 'curl', 'wget', 'bot', 'scanner']
        confidence += sum(0.2 for keyword in automation_keywords if keyword in user_agent)
        
        # Weak credentials
        password = data.get('password', '').lower()
        weak_passwords = ['password', '123456', 'admin', 'test']
        if password in weak_passwords:
            confidence += 0.3
        
        username = data.get('username', '').lower()
        common_usernames = ['admin', 'user', 'test', 'guest']
        if username in common_usernames:
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _calculate_nosql_confidence(self, text: str) -> float:
        """Calculate NoSQL injection confidence"""
        if not text:
            return 0.0
        
        confidence = 0.0
        
        # MongoDB operators
        mongo_ops = ['$ne', '$regex', '$where', '$gt', '$lt']
        confidence += sum(min(text.count(op), 2) for op in mongo_ops) * 0.2
        
        # JSON-like patterns
        if '{' in text and '}' in text:
            confidence += 0.3
        
        return min(confidence, 1.0)
    
    def _calculate_encoding_complexity(self, text: str) -> float:
        """Calculate encoding complexity"""
        if not text:
            return 0.0
        
        complexity = 0.0
        
        # URL encoding
        complexity += text.count('%') * 0.1
        
        # Unicode
        unicode_count = sum(1 for c in text if ord(c) > 127)
        complexity += unicode_count / len(text) * 0.3
        
        # Base64-like
        base64_chars = sum(1 for c in text if c.isalnum() or c in '+/=')
        if base64_chars / len(text) > 0.8:
            complexity += 0.4
        
        return min(complexity, 1.0)
    
    def _detect_double_encoding(self, text: str) -> float:
        """Detect double encoding patterns"""
        if not text:
            return 0.0
        
        # Look for patterns like %2520 (double URL encoding)
        double_encoded = len(re.findall(r'%25[0-9a-fA-F]{2}', text))
        return min(double_encoded / 10.0, 1.0)
    
    def _analyze_timing_patterns(self, timestamp: str) -> Dict:
        """Analyze timing patterns"""
        features = {}
        
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('+0700', '+07:00'))
                
                # Precise timing analysis
                features['second_precision'] = dt.microsecond / 1000000.0
                features['minute_alignment'] = float(dt.second == 0)
                features['hour_alignment'] = float(dt.minute == 0 and dt.second == 0)
                
            except:
                features = {'second_precision': 0.0, 'minute_alignment': 0.0, 'hour_alignment': 0.0}
        else:
            features = {'second_precision': 0.0, 'minute_alignment': 0.0, 'hour_alignment': 0.0}
        
        return features
    
    def _analyze_ip_patterns(self, ip: str) -> Dict:
        """Analyze IP address patterns"""
        features = {}
        
        if ip:
            # Remove IPv6 prefix
            if ip.startswith('::ffff:'):
                ip = ip[7:]
            
            octets = ip.split('.')
            if len(octets) == 4:
                try:
                    # Convert to numerical features
                    for i, octet in enumerate(octets):
                        features[f'ip_octet_{i}'] = int(octet) / 255.0
                    
                    # IP characteristics
                    first_octet = int(octets[0])
                    features['is_private'] = float(192 <= first_octet <= 223 or first_octet == 10 or first_octet == 172)
                    features['is_localhost'] = float(ip == '127.0.0.1' or ip == '::1')
                    
                except:
                    features = {f'ip_octet_{i}': 0.0 for i in range(4)}
                    features.update({'is_private': 0.5, 'is_localhost': 0.0})
            else:
                features = {f'ip_octet_{i}': 0.0 for i in range(4)}
                features.update({'is_private': 0.5, 'is_localhost': 0.0})
        else:
            features = {f'ip_octet_{i}': 0.0 for i in range(4)}
            features.update({'is_private': 0.5, 'is_localhost': 0.0})
        
        return features
    
    def _analyze_user_agent_patterns(self, user_agent: str) -> Dict:
        """Analyze user agent patterns"""
        features = {}
        
        if user_agent:
            ua_lower = user_agent.lower()
            
            # Browser detection
            browsers = ['chrome', 'firefox', 'safari', 'edge', 'opera']
            features['browser_count'] = sum(1 for browser in browsers if browser in ua_lower)
            
            # Platform detection
            platforms = ['windows', 'mac', 'linux', 'android', 'ios']
            features['platform_count'] = sum(1 for platform in platforms if platform in ua_lower)
            
            # Version extraction
            version_match = re.search(r'(\d+\.\d+)', user_agent)
            features['version_number'] = float(version_match.group(1)) / 100.0 if version_match else 0.0
            
            # Suspicious patterns
            features['suspicious_ua'] = float(len(user_agent) < 20 or 'bot' in ua_lower)
            
        else:
            features = {
                'browser_count': 0, 'platform_count': 0, 
                'version_number': 0.0, 'suspicious_ua': 1.0
            }
        
        return features
    
    def _analyze_referer_patterns(self, referer: str) -> float:
        """Analyze referer patterns"""
        if not referer:
            return 0.5  # No referer is somewhat suspicious
        
        # Direct access (no referer) is suspicious
        if referer == 'direct' or referer == 'null':
            return 0.8
        
        # External referers are normal
        if referer.startswith('http'):
            return 0.1
        
        return 0.3
    
    def _analyze_request_sequence(self, data: Dict) -> float:
        """Analyze request sequence patterns"""
        # This would require historical data to implement properly
        # For now, return a placeholder
        return 0.0
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate information entropy"""
        if not text:
            return 0.0
        
        # Count character frequencies
        char_counts = Counter(text)
        text_len = len(text)
        
        # Calculate entropy
        entropy = 0.0
        for count in char_counts.values():
            p = count / text_len
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize
        max_entropy = np.log2(len(char_counts)) if len(char_counts) > 1 else 1.0
        return entropy / max_entropy if max_entropy > 0 else 0.0
    
    def _calculate_pattern_repetition(self, text: str) -> float:
        """Calculate pattern repetition score"""
        if len(text) < 10:
            return 0.0
        
        repetition_score = 0.0
        for length in range(2, min(10, len(text) // 2)):
            for i in range(len(text) - length * 2 + 1):
                substring = text[i:i + length]
                count = text.count(substring)
                if count > 1:
                    repetition_score += (count - 1) * length / len(text)
        
        return min(repetition_score, 1.0)
    
    def flatten_features(self, features: Dict) -> List[float]:
        """Flatten nested feature dictionary to list"""
        flattened = []
        
        for category, category_features in features.items():
            if isinstance(category_features, dict):
                for feature_name, feature_value in category_features.items():
                    if isinstance(feature_value, (int, float)):
                        flattened.append(float(feature_value))
                    elif isinstance(feature_value, bool):
                        flattened.append(float(feature_value))
            elif isinstance(category_features, (int, float)):
                flattened.append(float(category_features))
        
        return flattened


def main():
    """Demo function"""
    print("🔬 Advanced Feature Extractor Demo")
    print("=" * 50)
    
    # Initialize extractor
    extractor = AdvancedFeatureExtractor()
    
    # Sample log data
    sample_data = {
        'url': "/api/login?username=admin'%20OR%20'1'%3D'1&password=123456",
        'username': "admin' OR '1'='1",
        'password': "123456",
        'query': "SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '123456'",
        'user_agent': "PythonBruteForce/1.0",
        'ip': "192.168.205.1",
        'status_code': 200,
        'success': True,
        'timestamp': "2025-10-03T22:17:17.460+0700",
        'referer': "direct"
    }
    
    # Extract comprehensive features
    features = extractor.extract_comprehensive_features(sample_data)
    
    print("📊 Extracted Feature Categories:")
    for category, category_features in features.items():
        print(f"\n{category.upper()}:")
        if isinstance(category_features, dict):
            for feature_name, feature_value in category_features.items():
                print(f"  {feature_name}: {feature_value:.3f}")
        else:
            print(f"  {category}: {category_features:.3f}")
    
    # Flatten features
    flattened = extractor.flatten_features(features)
    print(f"\n🔢 Total Features Extracted: {len(flattened)}")
    print(f"📈 Feature Vector: {flattened[:10]}...")  # Show first 10 features
    
    print("\n✅ Advanced feature extraction completed!")


if __name__ == "__main__":
    main()
