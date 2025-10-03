#!/usr/bin/env python3
"""
🎓 AI Model Training Script
Script để train Isolation Forest model từ Wazuh logs

Author: TuanDepChai
Purpose: Train AI model để detect SQLi và Brute Force attacks
Usage: python train-model.py --logs-file processed_logs.json
"""

import json
import argparse
import logging
from pathlib import Path
from datetime import datetime
import sys

# Import our modules
from anomaly_detector import CyberSecurityAnomalyDetector
from wazuh_log_processor import WazuhLogProcessor

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_training_data(file_path: str) -> list:
    """
    📂 Load training data từ file
    
    Args:
        file_path: Path to training data file
        
    Returns:
        List of log entries for training
    """
    logger.info(f"Loading training data from {file_path}")
    
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"Training data file not found: {file_path}")
    
    logs = []
    
    try:
        if file_path.suffix == '.json':
            # Load from JSON file
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            log_entry = json.loads(line)
                            logs.append(log_entry)
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse JSON line: {e}")
                            continue
        
        elif file_path.suffix == '.jsonl':
            # Load from JSONL file
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line:
                        try:
                            log_entry = json.loads(line)
                            logs.append(log_entry)
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse JSON line {line_num}: {e}")
                            continue
        
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    except Exception as e:
        logger.error(f"Error loading training data: {e}")
        raise
    
    logger.info(f"Successfully loaded {len(logs)} log entries")
    return logs

def prepare_training_data_from_wazuh(wazuh_archives_path: str, limit: int = None) -> list:
    """
    📊 Prepare training data trực tiếp từ Wazuh archives
    
    Args:
        wazuh_archives_path: Path to Wazuh archives.json
        limit: Limit number of logs to process
        
    Returns:
        List of processed log entries
    """
    logger.info("Preparing training data from Wazuh archives...")
    
    try:
        # Initialize processor
        processor = WazuhLogProcessor(wazuh_archives_path)
        
        # Load and process logs
        logs = processor.load_wazuh_logs(limit=limit)
        attacks_logs = processor.filter_attacks_logs(logs)
        processed_logs = processor.process_logs(attacks_logs)
        
        # Generate report
        report = processor.generate_report()
        logger.info(f"Training data preparation report:\n{report}")
        
        return processed_logs
        
    except Exception as e:
        logger.error(f"Error preparing training data from Wazuh: {e}")
        raise

def train_model(logs: list, contamination: float = 0.1, model_output_path: str = None) -> dict:
    """
    🎓 Train AI model từ logs
    
    Args:
        logs: List of log entries for training
        contamination: Contamination parameter for Isolation Forest
        model_output_path: Path to save trained model
        
    Returns:
        Training results
    """
    logger.info(f"Starting model training with {len(logs)} logs...")
    
    try:
        # Initialize detector
        detector = CyberSecurityAnomalyDetector(contamination=contamination)
        
        # Train model
        training_results = detector.train(logs)
        
        # Save model
        if model_output_path:
            model_path = detector.save_model(model_output_path)
            logger.info(f"Model saved to: {model_path}")
        else:
            model_path = detector.save_model()
            logger.info(f"Model saved to: {model_path}")
        
        # Add model path to results
        training_results['model_path'] = str(model_path)
        
        return training_results
        
    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise

def evaluate_model(detector: CyberSecurityAnomalyDetector, test_logs: list) -> dict:
    """
    📊 Evaluate trained model trên test data
    
    Args:
        detector: Trained anomaly detector
        test_logs: List of test log entries
        
    Returns:
        Evaluation results
    """
    logger.info(f"Evaluating model on {len(test_logs)} test logs...")
    
    try:
        # Batch prediction
        predictions = detector.batch_predict(test_logs)
        
        # Analyze results
        total_predictions = len(predictions)
        anomaly_predictions = sum(1 for p in predictions if p['prediction']['is_anomaly'])
        normal_predictions = total_predictions - anomaly_predictions
        
        # Calculate statistics
        anomaly_rate = anomaly_predictions / total_predictions if total_predictions > 0 else 0
        
        # Analyze by attack type
        attack_type_stats = {}
        for pred in predictions:
            attack_type = pred['prediction']['attack_type']
            if attack_type not in attack_type_stats:
                attack_type_stats[attack_type] = {'count': 0, 'anomalies': 0}
            
            attack_type_stats[attack_type]['count'] += 1
            if pred['prediction']['is_anomaly']:
                attack_type_stats[attack_type]['anomalies'] += 1
        
        # Calculate detection rates
        for attack_type in attack_type_stats:
            stats = attack_type_stats[attack_type]
            stats['detection_rate'] = stats['anomalies'] / stats['count'] if stats['count'] > 0 else 0
        
        evaluation_results = {
            'total_predictions': total_predictions,
            'anomaly_predictions': anomaly_predictions,
            'normal_predictions': normal_predictions,
            'anomaly_rate': anomaly_rate,
            'attack_type_statistics': attack_type_stats,
            'predictions': predictions
        }
        
        logger.info(f"Evaluation completed: {anomaly_predictions}/{total_predictions} anomalies detected")
        return evaluation_results
        
    except Exception as e:
        logger.error(f"Error evaluating model: {e}")
        raise

def generate_training_report(training_results: dict, evaluation_results: dict = None) -> str:
    """
    📋 Generate training report
    
    Args:
        training_results: Results from model training
        evaluation_results: Results from model evaluation
        
    Returns:
        Formatted training report
    """
    report = f"""
🎓 AI Model Training Report
{'=' * 60}

📊 Training Statistics:
  Total Training Samples: {training_results['total_samples']:,}
  Processed Samples: {training_results['processed_samples']:,}
  Anomalies Detected: {training_results['anomalies_detected']:,}
  Normal Samples: {training_results['normal_samples']:,}
  Anomaly Rate: {training_results['anomaly_rate']:.2%}
  Expected Contamination: {training_results['expected_contamination']:.2%}

🧠 Model Configuration:
  Algorithm: Isolation Forest
  Contamination: {training_results['expected_contamination']:.2%}
  Random State: {training_results.get('random_state', 'N/A')}

📈 Feature Importance (Top 10):
"""
    
    # Add feature importance
    if 'feature_importance' in training_results:
        sorted_features = sorted(
            training_results['feature_importance'].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        for feature, importance in sorted_features:
            report += f"  {feature}: {importance:.3f}\n"
    
    # Add model metrics
    if 'model_metrics' in training_results:
        metrics = training_results['model_metrics']
        report += f"""
📊 Model Metrics:
  Mean Anomaly Score: {metrics['mean_anomaly_score']:.3f}
  Std Anomaly Score: {metrics['std_anomaly_score']:.3f}
  Min Anomaly Score: {metrics['min_anomaly_score']:.3f}
  Max Anomaly Score: {metrics['max_anomaly_score']:.3f}
"""
    
    # Add evaluation results if available
    if evaluation_results:
        report += f"""
📊 Evaluation Results:
  Total Predictions: {evaluation_results['total_predictions']:,}
  Anomalies Detected: {evaluation_results['anomaly_predictions']:,}
  Detection Rate: {evaluation_results['anomaly_rate']:.2%}
  
🎯 Attack Type Detection:
"""
        
        for attack_type, stats in evaluation_results['attack_type_statistics'].items():
            report += f"  {attack_type}: {stats['anomalies']}/{stats['count']} "
            report += f"({stats['detection_rate']:.1%})\n"
    
    # Add model info
    if 'model_path' in training_results:
        report += f"""
💾 Model Information:
  Saved to: {training_results['model_path']}
  Ready for deployment: ✅
"""
    
    report += f"""
✅ Training completed successfully!
🚀 Model is ready for real-time anomaly detection.
"""
    
    return report

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train AI Model for Anomaly Detection')
    
    # Input options
    parser.add_argument('--logs-file', type=str,
                       help='Path to processed logs file (JSON/JSONL)')
    parser.add_argument('--wazuh-archives', type=str,
                       default='/var/ossec/logs/archives/archives.json',
                       help='Path to Wazuh archives.json file')
    parser.add_argument('--use-wazuh', action='store_true',
                       help='Use Wazuh archives directly instead of logs file')
    
    # Training parameters
    parser.add_argument('--contamination', type=float, default=0.1,
                       help='Contamination parameter for Isolation Forest (0.01-0.5)')
    parser.add_argument('--limit', type=int,
                       help='Limit number of logs to process for training')
    
    # Output options
    parser.add_argument('--model-output', type=str,
                       help='Path to save trained model')
    parser.add_argument('--output-dir', type=str, default='ai-ml/models',
                       help='Output directory for models and reports')
    parser.add_argument('--evaluate', action='store_true',
                       help='Evaluate model on test data')
    
    args = parser.parse_args()
    
    print("🎓 AI Model Training for Cybersecurity Anomaly Detection")
    print("=" * 60)
    
    try:
        # Validate arguments
        if not args.logs_file and not args.use_wazuh:
            print("❌ Error: Must specify either --logs-file or --use-wazuh")
            return 1
        
        if args.logs_file and args.use_wazuh:
            print("❌ Error: Cannot specify both --logs-file and --use-wazuh")
            return 1
        
        # Prepare output directory
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load training data
        if args.use_wazuh:
            print(f"📂 Loading data from Wazuh archives: {args.wazuh_archives}")
            logs = prepare_training_data_from_wazuh(args.wazuh_archives, args.limit)
        else:
            print(f"📂 Loading data from file: {args.logs_file}")
            logs = load_training_data(args.logs_file)
        
        if not logs:
            print("❌ Error: No training data loaded")
            return 1
        
        print(f"✅ Loaded {len(logs)} log entries for training")
        
        # Split data for training and evaluation
        if args.evaluate and len(logs) > 100:
            # Use 80% for training, 20% for evaluation
            split_point = int(len(logs) * 0.8)
            training_logs = logs[:split_point]
            test_logs = logs[split_point:]
            print(f"📊 Split data: {len(training_logs)} training, {len(test_logs)} test")
        else:
            training_logs = logs
            test_logs = []
        
        # Train model
        print(f"🎓 Training model with contamination={args.contamination}...")
        training_results = train_model(
            logs=training_logs,
            contamination=args.contamination,
            model_output_path=args.model_output
        )
        
        print("✅ Model training completed successfully!")
        
        # Evaluate model if requested
        evaluation_results = None
        if args.evaluate and test_logs:
            print("📊 Evaluating model on test data...")
            
            # Load trained model for evaluation
            detector = CyberSecurityAnomalyDetector()
            detector.load_model(training_results['model_path'])
            
            evaluation_results = evaluate_model(detector, test_logs)
            print("✅ Model evaluation completed!")
        
        # Generate and save report
        report = generate_training_report(training_results, evaluation_results)
        
        # Save report to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = output_dir / f"training_report_{timestamp}.txt"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"📋 Training report saved to: {report_file}")
        
        # Print summary
        print("\n" + report)
        
        print(f"\n🚀 Next steps:")
        print(f"  1. Deploy model: python real-time-detector.py --model-path {training_results['model_path']}")
        print(f"  2. Monitor alerts: tail -f ai-ml/alerts/alerts_*.jsonl")
        print(f"  3. Check Wazuh integration: /var/ossec/logs/alerts/ai_alerts.log")
        
        return 0
        
    except Exception as e:
        logger.error(f"Error in main: {e}")
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
