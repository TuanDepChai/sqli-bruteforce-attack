#!/bin/bash

# Wazuh Integration Script for SQLi BruteForce Attack Detection
# Research: Unsupervised ML for cybersecurity threat detection

echo "🔧 Setting up Wazuh integration for SQLi BruteForce Attack Detection..."

# Configuration
WAZUH_MANAGER="192.168.205.128"
WEB_SERVER_IP="192.168.205.100"
PROJECT_PATH="/opt/sqli-bruteforce-attack"

# 1. Install Wazuh Agent
echo "📦 Installing Wazuh Agent..."
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && sudo chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee -a /etc/apt/sources.list.d/wazuh.list
sudo apt-get update
sudo WAZUH_MANAGER="$WAZUH_MANAGER" WAZUH_AGENT_GROUP="web-servers" WAZUH_AGENT_NAME="sql-bruteforce-web" apt-get install wazuh-agent -y

# 2. Configure Log Monitoring
echo "📝 Configuring log monitoring..."
sudo tee /var/ossec/etc/ossec.conf.local << EOF
<!-- SQLi BruteForce Attack Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/attacks.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/sql_injection.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/brute_force.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/critical-attacks.log</location>
</localfile>

<!-- Application Logs -->
<localfile>
  <log_format>syslog</log_format>
  <location>/var/log/sqli-bruteforce/app.log</location>
</localfile>
EOF

# 3. Copy Custom Rules and Decoders
echo "📋 Installing custom rules and decoders..."
sudo cp $PROJECT_PATH/wazuh-decoder.xml /var/ossec/etc/decoders/
sudo cp $PROJECT_PATH/wazuh-rules.xml /var/ossec/etc/rules/

# 4. Create Log Directory
sudo mkdir -p /var/log/sqli-bruteforce
sudo chown www-data:www-data /var/log/sqli-bruteforce

# 5. Configure Log Rotation
echo "🔄 Setting up log rotation..."
sudo tee /etc/logrotate.d/sqli-bruteforce << EOF
$PROJECT_PATH/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload wazuh-agent
    endscript
}
EOF

# 6. Set up File Permissions
echo "🔒 Setting up file permissions..."
sudo chown -R www-data:www-data $PROJECT_PATH/logs/
sudo chmod -R 644 $PROJECT_PATH/logs/*.log

# 7. Create ML Analysis Directory
sudo mkdir -p /opt/ml-results
sudo chown $USER:$USER /opt/ml-results

# 8. Set up Automated ML Analysis
echo "🤖 Setting up automated ML analysis..."
sudo tee /etc/cron.d/ml-analysis << EOF
# Run ML analysis every 5 minutes
*/5 * * * * $USER cd $PROJECT_PATH && python3 ml-analysis/anomaly_detection.py >> /opt/ml-results/analysis.log 2>&1
EOF

# 9. Create Wazuh Dashboard Integration Script
sudo tee /opt/wazuh-dashboard-integration.py << EOF
#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta

class WazuhDashboardIntegration:
    def __init__(self, dashboard_url="http://192.168.205.128:5601"):
        self.dashboard_url = dashboard_url
        self.api_url = f"{dashboard_url}/api"
        
    def get_alerts(self, hours=24):
        """Get alerts from Wazuh dashboard"""
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        query = {
            "query": {
                "bool": {
                    "filter": [
                        {"range": {"@timestamp": {"gte": start_time.isoformat(), "lte": end_time.isoformat()}}},
                        {"term": {"agent.name": "sql-bruteforce-web"}}
                    ]
                }
            }
        }
        
        try:
            response = requests.post(f"{self.api_url}/search", json=query)
            return response.json()
        except Exception as e:
            print(f"Error fetching alerts: {e}")
            return None
    
    def analyze_alerts(self, alerts):
        """Analyze alerts for ML features"""
        if not alerts or 'hits' not in alerts:
            return None
            
        features = []
        for hit in alerts['hits']['hits']:
            source = hit['_source']
            features.append({
                'timestamp': source.get('@timestamp'),
                'rule_id': source.get('rule.id'),
                'rule_level': source.get('rule.level'),
                'agent_ip': source.get('agent.ip'),
                'rule_description': source.get('rule.description'),
                'rule_group': source.get('rule.groups', [])
            })
        
        return features
    
    def generate_ml_features(self, alerts_data):
        """Generate features for ML analysis"""
        if not alerts_data:
            return None
            
        df = pd.DataFrame(alerts_data)
        
        # Feature engineering
        features = {
            'total_alerts': len(df),
            'unique_rules': df['rule_id'].nunique(),
            'avg_rule_level': df['rule_level'].mean(),
            'alerts_per_hour': len(df) / 24,
            'top_rules': df['rule_id'].value_counts().head(5).to_dict(),
            'rule_levels': df['rule_level'].value_counts().to_dict()
        }
        
        return features

if __name__ == "__main__":
    integration = WazuhDashboardIntegration()
    alerts = integration.get_alerts()
    features = integration.generate_ml_features(integration.analyze_alerts(alerts))
    
    if features:
        with open('/opt/ml-results/wazuh_features.json', 'w') as f:
            json.dump(features, f, indent=2)
        print("✅ Wazuh features extracted for ML analysis")
EOF

sudo chmod +x /opt/wazuh-dashboard-integration.py

# 10. Restart Services
echo "🔄 Restarting services..."
sudo systemctl restart wazuh-agent
sudo systemctl restart sqli-bruteforce

# 11. Verify Installation
echo "✅ Verifying installation..."
echo "Wazuh Agent Status:"
sudo systemctl status wazuh-agent --no-pager

echo "Application Status:"
sudo systemctl status sqli-bruteforce --no-pager

echo "Log Files:"
ls -la $PROJECT_PATH/logs/

echo "🎉 Wazuh integration completed!"
echo "📊 Dashboard: http://$WAZUH_MANAGER:5601"
echo "🌐 Web App: http://$WEB_SERVER_IP:3000"
echo "📝 Logs: $PROJECT_PATH/logs/"
echo "🤖 ML Results: /opt/ml-results/"
