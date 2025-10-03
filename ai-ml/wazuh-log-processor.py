#!/usr/bin/env python3
"""
📊 Wazuh Log Processor for AI Training
Xử lý logs từ Wazuh archives để chuẩn bị dữ liệu training cho AI model

Author: TuanDepChai
Purpose: Extract và preprocess logs từ Wazuh archives.json cho AI training
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import logging
from typing import Dict, List, Optional, Tuple
import re
import argparse

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WazuhLogProcessor:
    """
    📈 Wazuh Log Processor
    
    Chức năng:
    1. Đọc logs từ Wazuh archives
    2. Filter logs từ attacks.log
    3. Parse và clean data
    4. Chuẩn bị training dataset
    5. Export cho AI model
    """
    
    def __init__(self, wazuh_archives_path: str = "/var/ossec/logs/archives/archives.json"):
        self.wazuh_archives_path = Path(wazuh_archives_path)
        self.processed_logs = []
        self.stats = {
            'total_logs': 0,
            'attacks_logs': 0,
            'valid_logs': 0,
            'sql_injection_logs': 0,
            'brute_force_logs': 0,
            'normal_logs': 0
        }
        
    def load_wazuh_logs(self, limit: Optional[int] = None) -> List[Dict]:
        """
        📂 Load logs từ Wazuh archives
        
        Args:
            limit: Giới hạn số lượng logs để load (None = load tất cả)
            
        Returns:
            List of parsed log entries
        """
        logger.info(f"Loading Wazuh logs from {self.wazuh_archives_path}")
        
        if not self.wazuh_archives_path.exists():
            raise FileNotFoundError(f"Wazuh archives file not found: {self.wazuh_archives_path}")
        
        logs = []
        try:
            with open(self.wazuh_archives_path, 'r', encoding='utf-8') as f:
                line_count = 0
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        log_entry = json.loads(line)
                        logs.append(log_entry)
                        line_count += 1
                        
                        if limit and line_count >= limit:
                            break
                            
                        if line_count % 1000 == 0:
                            logger.info(f"Loaded {line_count} logs...")
                            
                    except json.JSONDecodeError as e:
                        logger.warning(f"Failed to parse JSON line {line_count}: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"Error loading Wazuh logs: {e}")
            raise
        
        logger.info(f"Successfully loaded {len(logs)} logs from Wazuh archives")
        self.stats['total_logs'] = len(logs)
        return logs
    
    def filter_attacks_logs(self, logs: List[Dict]) -> List[Dict]:
        """
        🎯 Filter logs từ attacks.log location
        
        Args:
            logs: List of Wazuh log entries
            
        Returns:
            Filtered logs from attacks.log
        """
        logger.info("Filtering logs from attacks.log location...")
        
        attacks_logs = []
        target_location = "/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log"
        
        for log_entry in logs:
            try:
                # Check if log is from attacks.log
                location = log_entry.get('location', '')
                if target_location in location:
                    attacks_logs.append(log_entry)
                    
            except Exception as e:
                logger.warning(f"Error processing log entry: {e}")
                continue
        
        logger.info(f"Found {len(attacks_logs)} logs from attacks.log")
        self.stats['attacks_logs'] = len(attacks_logs)
        return attacks_logs
    
    def parse_log_data(self, log_entry: Dict) -> Optional[Dict]:
        """
        🔍 Parse và extract data từ Wazuh log entry
        
        Args:
            log_entry: Wazuh log entry
            
        Returns:
            Parsed log data or None if invalid
        """
        try:
            # Extract main data
            data = log_entry.get('data', {})
            if not data:
                return None
            
            # Parse full_log if available
            full_log = log_entry.get('full_log', '')
            if full_log:
                try:
                    full_log_data = json.loads(full_log)
                    data.update(full_log_data)
                except json.JSONDecodeError:
                    pass
            
            # Extract metadata
            agent_info = log_entry.get('agent', {})
            manager_info = log_entry.get('manager', {})
            
            parsed_data = {
                # Timestamp
                'timestamp': data.get('timestamp'),
                'wazuh_timestamp': log_entry.get('timestamp'),
                
                # Request info
                'method': data.get('method', 'POST'),
                'url': data.get('url', ''),
                'status_code': data.get('status_code', '200'),
                
                # Authentication
                'username': data.get('username', ''),
                'password': data.get('password', ''),
                'success': data.get('success', False),
                
                # Network
                'ip': data.get('ip', ''),
                'user_agent': data.get('user_agent', ''),
                'referer': data.get('referer', ''),
                
                # SQL Query
                'query': data.get('query', ''),
                
                # Wazuh metadata
                'agent_id': agent_info.get('id', ''),
                'agent_name': agent_info.get('name', ''),
                'agent_ip': agent_info.get('ip', ''),
                'manager_name': manager_info.get('name', ''),
                
                # Raw data for reference
                'raw_data': data,
                'raw_log': log_entry
            }
            
            return parsed_data
            
        except Exception as e:
            logger.warning(f"Error parsing log entry: {e}")
            return None
    
    def classify_attack_type(self, log_data: Dict) -> str:
        """
        🏷️ Classify attack type dựa trên log data
        
        Args:
            log_data: Parsed log data
            
        Returns:
            Attack type classification
        """
        username = log_data.get('username', '').lower()
        password = log_data.get('password', '').lower()
        query = log_data.get('query', '').lower()
        url = log_data.get('url', '').lower()
        user_agent = log_data.get('user_agent', '').lower()
        
        # SQL Injection patterns
        sql_patterns = [
            r"'", r'"', r";", r"--", r"/\*", r"\*/",
            r"union", r"select", r"insert", r"update", r"delete",
            r"drop", r"alter", r"create", r"exec", r"execute",
            r"or\s+1\s*=\s*1", r"'\s*or\s*'1'\s*=\s*'1",
            r"admin'\s*--", r"'\s*or\s*1=1", r"'\s*or\s*'a'='a"
        ]
        
        # Check for SQL injection
        text_to_check = f"{username} {password} {query} {url}"
        for pattern in sql_patterns:
            if re.search(pattern, text_to_check, re.IGNORECASE):
                return 'sql_injection'
        
        # Brute Force patterns
        brute_force_indicators = [
            'pythonbruteforce', 'bruteforce', 'python', 'curl', 'wget',
            'bot', 'scanner', 'automated'
        ]
        
        for indicator in brute_force_indicators:
            if indicator in user_agent:
                return 'brute_force'
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'admin', 'admin123', 'root', 'toor', 'pass', 'test',
            'guest', 'user', 'administrator', 'football', 'starwars'
        ]
        
        if password in weak_passwords:
            return 'brute_force'
        
        # Check for failed attempts
        success = log_data.get('success', False)
        if isinstance(success, str):
            success = success.lower() in ['true', 'yes', '1']
        
        if not success:
            return 'failed_login'
        
        return 'normal_login'
    
    def process_logs(self, logs: List[Dict]) -> List[Dict]:
        """
        🔄 Process tất cả logs và classify
        
        Args:
            logs: List of Wazuh log entries
            
        Returns:
            List of processed and classified logs
        """
        logger.info(f"Processing {len(logs)} logs...")
        
        processed_logs = []
        
        for i, log_entry in enumerate(logs):
            try:
                # Parse log data
                parsed_data = self.parse_log_data(log_entry)
                if not parsed_data:
                    continue
                
                # Classify attack type
                attack_type = self.classify_attack_type(parsed_data)
                parsed_data['attack_type'] = attack_type
                
                # Add processing metadata
                parsed_data['processed_at'] = datetime.now().isoformat()
                parsed_data['log_index'] = i
                
                processed_logs.append(parsed_data)
                
                # Update statistics
                self.stats['valid_logs'] += 1
                if attack_type == 'sql_injection':
                    self.stats['sql_injection_logs'] += 1
                elif attack_type == 'brute_force':
                    self.stats['brute_force_logs'] += 1
                elif attack_type == 'normal_login':
                    self.stats['normal_logs'] += 1
                
                if (i + 1) % 100 == 0:
                    logger.info(f"Processed {i + 1}/{len(logs)} logs...")
                    
            except Exception as e:
                logger.warning(f"Error processing log {i}: {e}")
                continue
        
        logger.info(f"Successfully processed {len(processed_logs)} logs")
        self.processed_logs = processed_logs
        return processed_logs
    
    def export_to_dataframe(self) -> pd.DataFrame:
        """
        📊 Export processed logs to DataFrame
        
        Returns:
            DataFrame with processed log data
        """
        if not self.processed_logs:
            raise ValueError("No processed logs available. Run process_logs() first.")
        
        logger.info("Exporting processed logs to DataFrame...")
        
        df = pd.DataFrame(self.processed_logs)
        
        # Convert timestamp columns
        timestamp_columns = ['timestamp', 'wazuh_timestamp', 'processed_at']
        for col in timestamp_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Convert boolean columns
        if 'success' in df.columns:
            df['success'] = df['success'].apply(
                lambda x: str(x).lower() in ['true', 'yes', '1'] if isinstance(x, str) else bool(x)
            )
        
        # Convert numeric columns
        numeric_columns = ['status_code']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        logger.info(f"DataFrame created with shape: {df.shape}")
        return df
    
    def export_to_json(self, output_path: str) -> str:
        """
        💾 Export processed logs to JSON file
        
        Args:
            output_path: Output file path
            
        Returns:
            Path to exported file
        """
        if not self.processed_logs:
            raise ValueError("No processed logs available. Run process_logs() first.")
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Exporting processed logs to {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            for log_data in self.processed_logs:
                json.dump(log_data, f, ensure_ascii=False, default=str)
                f.write('\n')
        
        logger.info(f"Successfully exported {len(self.processed_logs)} logs to {output_path}")
        return str(output_path)
    
    def export_to_csv(self, output_path: str) -> str:
        """
        📄 Export processed logs to CSV file
        
        Args:
            output_path: Output file path
            
        Returns:
            Path to exported file
        """
        df = self.export_to_dataframe()
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Exporting DataFrame to {output_path}")
        
        df.to_csv(output_path, index=False, encoding='utf-8')
        
        logger.info(f"Successfully exported DataFrame to {output_path}")
        return str(output_path)
    
    def get_statistics(self) -> Dict:
        """
        📈 Get processing statistics
        
        Returns:
            Dictionary with processing statistics
        """
        stats = self.stats.copy()
        
        if self.processed_logs:
            # Calculate percentages
            total_valid = stats['valid_logs']
            if total_valid > 0:
                stats['sql_injection_percentage'] = (stats['sql_injection_logs'] / total_valid) * 100
                stats['brute_force_percentage'] = (stats['brute_force_logs'] / total_valid) * 100
                stats['normal_login_percentage'] = (stats['normal_logs'] / total_valid) * 100
            
            # Add attack type distribution
            attack_types = [log['attack_type'] for log in self.processed_logs]
            attack_type_counts = pd.Series(attack_types).value_counts().to_dict()
            stats['attack_type_distribution'] = attack_type_counts
        
        return stats
    
    def generate_report(self) -> str:
        """
        📋 Generate processing report
        
        Returns:
            Formatted report string
        """
        stats = self.get_statistics()
        
        report = f"""
🛡️ Wazuh Log Processing Report
{'=' * 50}

📊 Processing Statistics:
  Total logs loaded: {stats['total_logs']:,}
  Attacks.log logs: {stats['attacks_logs']:,}
  Valid logs processed: {stats['valid_logs']:,}
  
🎯 Attack Type Distribution:
  SQL Injection: {stats['sql_injection_logs']:,} ({stats.get('sql_injection_percentage', 0):.1f}%)
  Brute Force: {stats['brute_force_logs']:,} ({stats.get('brute_force_percentage', 0):.1f}%)
  Normal Login: {stats['normal_logs']:,} ({stats.get('normal_login_percentage', 0):.1f}%)
  
📈 Detailed Distribution:
"""
        
        if 'attack_type_distribution' in stats:
            for attack_type, count in stats['attack_type_distribution'].items():
                percentage = (count / stats['valid_logs']) * 100
                report += f"  {attack_type}: {count:,} ({percentage:.1f}%)\n"
        
        report += f"""
✅ Processing completed successfully!
Ready for AI model training with {stats['valid_logs']:,} samples.
"""
        
        return report
    
    def filter_by_time_range(self, start_time: datetime, end_time: datetime) -> List[Dict]:
        """
        ⏰ Filter logs by time range
        
        Args:
            start_time: Start time
            end_time: End time
            
        Returns:
            Filtered logs within time range
        """
        if not self.processed_logs:
            raise ValueError("No processed logs available. Run process_logs() first.")
        
        filtered_logs = []
        
        for log_data in self.processed_logs:
            try:
                timestamp_str = log_data.get('timestamp')
                if not timestamp_str:
                    continue
                
                # Parse timestamp
                log_time = datetime.fromisoformat(timestamp_str.replace('+0700', '+07:00'))
                
                if start_time <= log_time <= end_time:
                    filtered_logs.append(log_data)
                    
            except Exception as e:
                logger.warning(f"Error parsing timestamp for filtering: {e}")
                continue
        
        logger.info(f"Filtered {len(filtered_logs)} logs within time range")
        return filtered_logs
    
    def filter_by_attack_type(self, attack_types: List[str]) -> List[Dict]:
        """
        🎯 Filter logs by attack type
        
        Args:
            attack_types: List of attack types to filter
            
        Returns:
            Filtered logs by attack type
        """
        if not self.processed_logs:
            raise ValueError("No processed logs available. Run process_logs() first.")
        
        filtered_logs = [
            log_data for log_data in self.processed_logs
            if log_data.get('attack_type') in attack_types
        ]
        
        logger.info(f"Filtered {len(filtered_logs)} logs by attack types: {attack_types}")
        return filtered_logs


def main():
    """Demo function to test the log processor"""
    parser = argparse.ArgumentParser(description='Process Wazuh logs for AI training')
    parser.add_argument('--archives-path', default='/var/ossec/logs/archives/archives.json',
                       help='Path to Wazuh archives.json file')
    parser.add_argument('--limit', type=int, default=1000,
                       help='Limit number of logs to process')
    parser.add_argument('--output-dir', default='ai-ml/data',
                       help='Output directory for processed data')
    
    args = parser.parse_args()
    
    print("📊 Wazuh Log Processor for AI Training")
    print("=" * 50)
    
    try:
        # Initialize processor
        processor = WazuhLogProcessor(args.archives_path)
        
        # Load logs
        print(f"📂 Loading logs from {args.archives_path}...")
        logs = processor.load_wazuh_logs(limit=args.limit)
        
        # Filter attacks.log logs
        print("🎯 Filtering logs from attacks.log...")
        attacks_logs = processor.filter_attacks_logs(logs)
        
        # Process logs
        print("🔄 Processing and classifying logs...")
        processed_logs = processor.process_logs(attacks_logs)
        
        # Generate report
        report = processor.generate_report()
        print(report)
        
        # Export data
        output_dir = Path(args.output_dir)
        output_dir.mkdir(exist_ok=True)
        
        # Export to JSON
        json_path = output_dir / "processed_logs.json"
        processor.export_to_json(str(json_path))
        print(f"💾 Exported to JSON: {json_path}")
        
        # Export to CSV
        csv_path = output_dir / "processed_logs.csv"
        processor.export_to_csv(str(csv_path))
        print(f"📄 Exported to CSV: {csv_path}")
        
        # Export DataFrame
        df = processor.export_to_dataframe()
        print(f"📊 DataFrame shape: {df.shape}")
        print(f"📊 DataFrame columns: {list(df.columns)}")
        
        # Show sample data
        print("\n🔍 Sample processed logs:")
        for i, log_data in enumerate(processed_logs[:3]):
            print(f"\n  Log {i+1}:")
            print(f"    Timestamp: {log_data.get('timestamp')}")
            print(f"    IP: {log_data.get('ip')}")
            print(f"    Username: {log_data.get('username')}")
            print(f"    Attack Type: {log_data.get('attack_type')}")
            print(f"    Success: {log_data.get('success')}")
        
        print("\n✅ Processing completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in main: {e}")
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
