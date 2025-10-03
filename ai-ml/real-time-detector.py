#!/usr/bin/env python3
"""
🚨 Real-time Anomaly Detection System
Hệ thống phát hiện anomaly real-time cho SQLi và Brute Force attacks

Author: TuanDepChai
Framework: Real-time processing với Isolation Forest model
Integration: Wazuh SIEM + AI Detection
"""

import json
import time
import threading
from datetime import datetime, timedelta
from pathlib import Path
import logging
import signal
import sys
from typing import Dict, List, Optional, Callable
import queue
import subprocess
import os

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RealTimeAnomalyDetector:
    """
    🚨 Real-time Anomaly Detection System
    
    Chức năng:
    1. Monitor Wazuh archives.json real-time
    2. Phát hiện anomalies sử dụng trained AI model
    3. Gửi alerts đến SIEM và external systems
    4. Tích hợp với existing security infrastructure
    """
    
    def __init__(self, 
                 model_path: str,
                 wazuh_archives_path: str = "/var/ossec/logs/archives/archives.json",
                 alert_callback: Optional[Callable] = None):
        
        self.model_path = Path(model_path)
        self.wazuh_archives_path = Path(wazuh_archives_path)
        self.alert_callback = alert_callback
        
        # AI Model
        self.anomaly_detector = None
        self.model_loaded = False
        
        # Real-time processing
        self.is_running = False
        self.log_queue = queue.Queue(maxsize=1000)
        self.processed_count = 0
        self.anomaly_count = 0
        
        # Monitoring
        self.last_position = 0
        self.last_processed_time = datetime.now()
        
        # Alert thresholds
        self.anomaly_threshold = 0.5  # Minimum anomaly score to alert
        self.rate_limit_window = 60  # seconds
        self.rate_limit_count = 10  # max alerts per window
        
        # Alert history for rate limiting
        self.alert_history = []
        
        # Statistics
        self.stats = {
            'total_processed': 0,
            'anomalies_detected': 0,
            'alerts_sent': 0,
            'start_time': None,
            'last_alert_time': None
        }
        
        # Load AI model
        self._load_model()
        
    def _load_model(self):
        """Load trained AI model"""
        try:
            from anomaly_detector import CyberSecurityAnomalyDetector
            
            self.anomaly_detector = CyberSecurityAnomalyDetector()
            self.anomaly_detector.load_model(str(self.model_path))
            
            if self.anomaly_detector.is_trained:
                self.model_loaded = True
                logger.info(f"✅ AI model loaded successfully from {self.model_path}")
            else:
                logger.error("❌ Model is not trained")
                self.model_loaded = False
                
        except Exception as e:
            logger.error(f"❌ Failed to load AI model: {e}")
            self.model_loaded = False
    
    def start_monitoring(self):
        """Start real-time monitoring"""
        if not self.model_loaded:
            logger.error("❌ Cannot start monitoring: AI model not loaded")
            return False
        
        if not self.wazuh_archives_path.exists():
            logger.error(f"❌ Wazuh archives file not found: {self.wazuh_archives_path}")
            return False
        
        logger.info("🚨 Starting real-time anomaly detection...")
        
        self.is_running = True
        self.stats['start_time'] = datetime.now()
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=self._monitor_logs, daemon=True)
        monitor_thread.start()
        
        # Start processing thread
        process_thread = threading.Thread(target=self._process_logs, daemon=True)
        process_thread.start()
        
        logger.info("✅ Real-time monitoring started successfully")
        return True
    
    def stop_monitoring(self):
        """Stop real-time monitoring"""
        logger.info("🛑 Stopping real-time monitoring...")
        self.is_running = False
        logger.info("✅ Real-time monitoring stopped")
    
    def _monitor_logs(self):
        """Monitor Wazuh archives file for new entries"""
        logger.info("📂 Starting log monitoring...")
        
        while self.is_running:
            try:
                # Check if file exists and is readable
                if not self.wazuh_archives_path.exists():
                    logger.warning(f"Wazuh archives file not found: {self.wazuh_archives_path}")
                    time.sleep(5)
                    continue
                
                # Read new lines from the file
                new_logs = self._read_new_logs()
                
                if new_logs:
                    logger.info(f"📥 Found {len(new_logs)} new log entries")
                    
                    # Add to processing queue
                    for log_entry in new_logs:
                        try:
                            self.log_queue.put(log_entry, timeout=1)
                        except queue.Full:
                            logger.warning("Log queue is full, dropping oldest entries")
                            try:
                                self.log_queue.get_nowait()  # Remove oldest
                                self.log_queue.put(log_entry, timeout=1)
                            except queue.Empty:
                                pass
                
                # Small delay to prevent excessive CPU usage
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in log monitoring: {e}")
                time.sleep(5)
    
    def _read_new_logs(self) -> List[str]:
        """Read new log entries from Wazuh archives file"""
        try:
            with open(self.wazuh_archives_path, 'r', encoding='utf-8') as f:
                # Seek to last known position
                f.seek(self.last_position)
                
                new_lines = []
                for line in f:
                    line = line.strip()
                    if line:
                        new_lines.append(line)
                
                # Update position
                self.last_position = f.tell()
                
                return new_lines
                
        except Exception as e:
            logger.error(f"Error reading new logs: {e}")
            return []
    
    def _process_logs(self):
        """Process logs from queue using AI model"""
        logger.info("🧠 Starting log processing with AI model...")
        
        while self.is_running:
            try:
                # Get log entry from queue
                log_line = self.log_queue.get(timeout=1)
                
                # Process the log
                self._process_single_log(log_line)
                
                self.processed_count += 1
                self.stats['total_processed'] = self.processed_count
                
                # Log progress periodically
                if self.processed_count % 100 == 0:
                    logger.info(f"📊 Processed {self.processed_count} logs, "
                              f"detected {self.anomaly_count} anomalies")
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing log: {e}")
                continue
    
    def _process_single_log(self, log_line: str):
        """Process a single log entry"""
        try:
            # Parse JSON log entry
            log_entry = json.loads(log_line)
            
            # Filter for attacks.log entries
            location = log_entry.get('location', '')
            if '/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log' not in location:
                return
            
            # Extract data
            data = log_entry.get('data', {})
            if not data:
                return
            
            # Parse full_log if available
            full_log = log_entry.get('full_log', '')
            if full_log:
                try:
                    full_log_data = json.loads(full_log)
                    data.update(full_log_data)
                except json.JSONDecodeError:
                    pass
            
            # Predict anomaly using AI model
            prediction = self.anomaly_detector.predict(data)
            
            # Check if anomaly detected
            if prediction['is_anomaly'] and prediction['anomaly_score'] < -self.anomaly_threshold:
                self.anomaly_count += 1
                self.stats['anomalies_detected'] = self.anomaly_count
                
                # Create alert
                alert = self._create_alert(log_entry, prediction)
                
                # Send alert (with rate limiting)
                if self._should_send_alert():
                    self._send_alert(alert)
                    self.stats['alerts_sent'] += 1
                    self.stats['last_alert_time'] = datetime.now()
                    
                    # Add to alert history for rate limiting
                    self.alert_history.append(datetime.now())
                    
                    logger.warning(f"🚨 ANOMALY DETECTED: {prediction['attack_type']} "
                                 f"(Score: {prediction['anomaly_score']:.3f})")
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON log entry")
        except Exception as e:
            logger.error(f"Error processing single log: {e}")
    
    def _create_alert(self, log_entry: Dict, prediction: Dict) -> Dict:
        """Create structured alert from detection"""
        data = log_entry.get('data', {})
        agent = log_entry.get('agent', {})
        manager = log_entry.get('manager', {})
        
        alert = {
            'alert_id': f"ai_anomaly_{int(time.time())}_{self.anomaly_count}",
            'timestamp': datetime.now().isoformat(),
            'severity': 'HIGH' if prediction['anomaly_score'] < -0.7 else 'MEDIUM',
            'attack_type': prediction['attack_type'],
            'anomaly_score': prediction['anomaly_score'],
            'confidence': prediction['confidence'],
            'explanation': prediction['explanation'],
            
            # Source information
            'source_ip': data.get('ip', 'unknown'),
            'username': data.get('username', 'unknown'),
            'user_agent': data.get('user_agent', 'unknown'),
            'url': data.get('url', 'unknown'),
            'success': data.get('success', False),
            'status_code': data.get('status_code', 'unknown'),
            
            # Wazuh metadata
            'agent_id': agent.get('id', 'unknown'),
            'agent_name': agent.get('name', 'unknown'),
            'manager_name': manager.get('name', 'unknown'),
            
            # AI model information
            'model_version': '1.0',
            'model_path': str(self.model_path),
            'detection_method': 'isolation_forest',
            
            # Raw data for investigation
            'raw_log': log_entry,
            'feature_scores': prediction['feature_scores']
        }
        
        return alert
    
    def _should_send_alert(self) -> bool:
        """Check if alert should be sent (rate limiting)"""
        now = datetime.now()
        
        # Remove old alerts from history
        cutoff_time = now - timedelta(seconds=self.rate_limit_window)
        self.alert_history = [alert_time for alert_time in self.alert_history 
                             if alert_time > cutoff_time]
        
        # Check rate limit
        if len(self.alert_history) >= self.rate_limit_count:
            logger.debug(f"Rate limit reached: {len(self.alert_history)} alerts in "
                        f"{self.rate_limit_window}s window")
            return False
        
        return True
    
    def _send_alert(self, alert: Dict):
        """Send alert to external systems"""
        try:
            # Log alert
            logger.warning(f"🚨 SECURITY ALERT: {alert['attack_type']} detected "
                          f"from {alert['source_ip']} (Score: {alert['anomaly_score']:.3f})")
            
            # Call custom alert callback if provided
            if self.alert_callback:
                try:
                    self.alert_callback(alert)
                except Exception as e:
                    logger.error(f"Error in alert callback: {e}")
            
            # Send to Wazuh (example integration)
            self._send_to_wazuh(alert)
            
            # Send to external SIEM (example)
            self._send_to_external_siem(alert)
            
            # Save alert to file
            self._save_alert_to_file(alert)
            
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def _send_to_wazuh(self, alert: Dict):
        """Send alert to Wazuh (example integration)"""
        try:
            # Create Wazuh-compatible alert format
            wazuh_alert = {
                'timestamp': alert['timestamp'],
                'rule_id': 100100,  # Custom rule ID for AI detections
                'level': 12 if alert['severity'] == 'HIGH' else 8,
                'description': f"AI Detected {alert['attack_type']}: {alert['explanation']}",
                'srcip': alert['source_ip'],
                'user': alert['username'],
                'url': alert['url'],
                'anomaly_score': alert['anomaly_score'],
                'confidence': alert['confidence'],
                'attack_type': alert['attack_type'],
                'agent_id': alert['agent_id'],
                'manager': alert['manager_name']
            }
            
            # Write to Wazuh alerts file (example)
            alerts_file = Path("/var/ossec/logs/alerts/ai_alerts.log")
            alerts_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(alerts_file, 'a') as f:
                json.dump(wazuh_alert, f)
                f.write('\n')
                
            logger.debug(f"Alert sent to Wazuh: {alert['alert_id']}")
            
        except Exception as e:
            logger.error(f"Error sending alert to Wazuh: {e}")
    
    def _send_to_external_siem(self, alert: Dict):
        """Send alert to external SIEM (example integration)"""
        try:
            # Example: Send to external SIEM via API
            siem_alert = {
                'timestamp': alert['timestamp'],
                'source': 'ai_anomaly_detector',
                'event_type': 'security_anomaly',
                'severity': alert['severity'],
                'attack_type': alert['attack_type'],
                'source_ip': alert['source_ip'],
                'anomaly_score': alert['anomaly_score'],
                'confidence': alert['confidence'],
                'description': alert['explanation']
            }
            
            # Example API call (uncomment and modify as needed)
            # import requests
            # response = requests.post('https://your-siem.com/api/alerts', json=siem_alert)
            # response.raise_for_status()
            
            logger.debug(f"Alert sent to external SIEM: {alert['alert_id']}")
            
        except Exception as e:
            logger.error(f"Error sending alert to external SIEM: {e}")
    
    def _save_alert_to_file(self, alert: Dict):
        """Save alert to local file"""
        try:
            alerts_dir = Path("ai-ml/alerts")
            alerts_dir.mkdir(exist_ok=True)
            
            # Save individual alert
            alert_file = alerts_dir / f"alert_{alert['alert_id']}.json"
            with open(alert_file, 'w') as f:
                json.dump(alert, f, indent=2, default=str)
            
            # Append to daily alerts log
            date_str = datetime.now().strftime("%Y-%m-%d")
            daily_log = alerts_dir / f"alerts_{date_str}.jsonl"
            
            with open(daily_log, 'a') as f:
                json.dump(alert, f, default=str)
                f.write('\n')
                
        except Exception as e:
            logger.error(f"Error saving alert to file: {e}")
    
    def get_statistics(self) -> Dict:
        """Get real-time statistics"""
        uptime = None
        if self.stats['start_time']:
            uptime = (datetime.now() - self.stats['start_time']).total_seconds()
        
        return {
            'is_running': self.is_running,
            'model_loaded': self.model_loaded,
            'uptime_seconds': uptime,
            'total_processed': self.stats['total_processed'],
            'anomalies_detected': self.stats['anomalies_detected'],
            'alerts_sent': self.stats['alerts_sent'],
            'queue_size': self.log_queue.qsize(),
            'last_alert_time': self.stats['last_alert_time'],
            'alert_rate': len(self.alert_history)
        }
    
    def get_status_report(self) -> str:
        """Get formatted status report"""
        stats = self.get_statistics()
        
        report = f"""
🚨 Real-time Anomaly Detection Status
{'=' * 50}

📊 System Status:
  Running: {'✅ Yes' if stats['is_running'] else '❌ No'}
  Model Loaded: {'✅ Yes' if stats['model_loaded'] else '❌ No'}
  Uptime: {stats['uptime_seconds']:.0f}s if stats['uptime_seconds'] else 'N/A'}

📈 Processing Statistics:
  Total Processed: {stats['total_processed']:,}
  Anomalies Detected: {stats['anomalies_detected']:,}
  Alerts Sent: {stats['alerts_sent']:,}
  Queue Size: {stats['queue_size']}
  Alert Rate: {stats['alert_rate']} alerts/min

🎯 Detection Rate:
  Anomaly Rate: {(stats['anomalies_detected']/stats['total_processed']*100):.2f}% if stats['total_processed'] > 0 else 'N/A'}

⏰ Last Alert: {stats['last_alert_time'] if stats['last_alert_time'] else 'None'}
"""
        
        return report


def custom_alert_callback(alert: Dict):
    """Custom alert callback function"""
    print(f"🚨 CUSTOM ALERT: {alert['attack_type']} detected!")
    print(f"   Source IP: {alert['source_ip']}")
    print(f"   Anomaly Score: {alert['anomaly_score']:.3f}")
    print(f"   Explanation: {alert['explanation']}")
    print("-" * 50)


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutdown signal received...")
    if 'detector' in globals():
        detector.stop_monitoring()
    sys.exit(0)


def main():
    """Main function for real-time detection"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Real-time Anomaly Detection')
    parser.add_argument('--model-path', required=True,
                       help='Path to trained AI model')
    parser.add_argument('--archives-path', 
                       default='/var/ossec/logs/archives/archives.json',
                       help='Path to Wazuh archives.json file')
    parser.add_argument('--anomaly-threshold', type=float, default=0.5,
                       help='Anomaly score threshold for alerts')
    parser.add_argument('--rate-limit', type=int, default=10,
                       help='Maximum alerts per minute')
    
    args = parser.parse_args()
    
    print("🚨 Real-time Anomaly Detection System")
    print("=" * 50)
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Initialize detector
        detector = RealTimeAnomalyDetector(
            model_path=args.model_path,
            wazuh_archives_path=args.archives_path,
            alert_callback=custom_alert_callback
        )
        
        # Set thresholds
        detector.anomaly_threshold = args.anomaly_threshold
        detector.rate_limit_count = args.rate_limit
        
        # Start monitoring
        if not detector.start_monitoring():
            print("❌ Failed to start monitoring")
            return 1
        
        print("✅ Real-time monitoring started successfully")
        print("Press Ctrl+C to stop...")
        
        # Main loop - print status periodically
        while True:
            time.sleep(30)  # Print status every 30 seconds
            
            stats = detector.get_statistics()
            if stats['is_running']:
                print(f"\n📊 Status: Processed {stats['total_processed']} logs, "
                      f"detected {stats['anomalies_detected']} anomalies, "
                      f"sent {stats['alerts_sent']} alerts")
            
    except KeyboardInterrupt:
        print("\n🛑 Shutdown requested by user")
    except Exception as e:
        logger.error(f"Error in main: {e}")
        print(f"❌ Error: {e}")
        return 1
    finally:
        if 'detector' in locals():
            detector.stop_monitoring()
            print("✅ Monitoring stopped")
    
    return 0


if __name__ == "__main__":
    exit(main())
