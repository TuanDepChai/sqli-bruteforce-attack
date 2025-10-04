#!/usr/bin/env python3
"""
🔗 MongoDB Integration for Ultra Advanced Cybersecurity AI
Kết nối AI với MongoDB để lưu trữ và phân tích security events
"""

import pymongo
from pymongo import MongoClient, ASCENDING, DESCENDING
import json
import datetime
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBSecurityIntegration:
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", database_name: str = "secure-app"):
        """Initialize MongoDB connection for security integration"""
        self.connection_string = connection_string
        self.database_name = database_name
        self.client = None
        self.db = None
        self.security_events = None
        self.users = None
        self.sessions = None
        
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(
                self.connection_string,
                serverSelectionTimeoutMS=5000,
                socketTimeoutMS=45000,
                connectTimeoutMS=10000,
                maxPoolSize=10,
                retryWrites=True
            )
            
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[self.database_name]
            
            # Get collections
            self.security_events = self.db.securityevents
            self.users = self.db.users
            self.sessions = self.db.sessions
            
            logger.info(f"✅ Connected to MongoDB: {self.database_name}")
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("🔌 Disconnected from MongoDB")
    
    def log_security_event(self, event_data: Dict[str, Any]) -> bool:
        """Log security event to MongoDB"""
        try:
            # Add timestamp if not provided
            if 'timestamp' not in event_data:
                event_data['timestamp'] = datetime.datetime.utcnow()
            
            # Validate required fields
            required_fields = ['eventType', 'severity', 'ip', 'userAgent', 'endpoint', 'method']
            for field in required_fields:
                if field not in event_data:
                    logger.warning(f"Missing required field: {field}")
                    event_data[field] = 'unknown'
            
            # Insert event
            result = self.security_events.insert_one(event_data)
            
            if result.inserted_id:
                logger.info(f"📝 Security event logged: {event_data['eventType']} from {event_data['ip']}")
                return True
            else:
                logger.error("Failed to insert security event")
                return False
                
        except Exception as e:
            logger.error(f"Error logging security event: {e}")
            return False
    
    def get_recent_events(self, hours: int = 24, event_type: Optional[str] = None) -> List[Dict]:
        """Get recent security events"""
        try:
            since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
            
            query = {'timestamp': {'$gte': since}}
            if event_type:
                query['eventType'] = event_type
            
            events = list(self.security_events.find(query).sort('timestamp', DESCENDING).limit(1000))
            
            logger.info(f"📊 Retrieved {len(events)} recent events")
            return events
            
        except Exception as e:
            logger.error(f"Error getting recent events: {e}")
            return []
    
    def get_attack_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """Get attack statistics"""
        try:
            since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
            
            pipeline = [
                {'$match': {'timestamp': {'$gte': since}}},
                {
                    '$group': {
                        '_id': '$eventType',
                        'count': {'$sum': 1},
                        'avgRiskScore': {'$avg': '$riskScore'},
                        'criticalCount': {
                            '$sum': {
                                '$cond': [{'$eq': ['$severity', 'critical']}, 1, 0]
                            }
                        }
                    }
                },
                {'$sort': {'count': -1}}
            ]
            
            stats = list(self.security_events.aggregate(pipeline))
            
            # Get top attacking IPs
            ip_pipeline = [
                {'$match': {'timestamp': {'$gte': since}}},
                {
                    '$group': {
                        '_id': '$ip',
                        'count': {'$sum': 1},
                        'criticalCount': {
                            '$sum': {
                                '$cond': [{'$eq': ['$severity', 'critical']}, 1, 0]
                            }
                        },
                        'lastSeen': {'$max': '$timestamp'}
                    }
                },
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
            
            top_ips = list(self.security_events.aggregate(ip_pipeline))
            
            return {
                'event_types': stats,
                'top_attacking_ips': top_ips,
                'total_events': sum(stat['count'] for stat in stats),
                'critical_events': sum(stat['criticalCount'] for stat in stats)
            }
            
        except Exception as e:
            logger.error(f"Error getting attack statistics: {e}")
            return {}
    
    def get_user_security_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user security profile"""
        try:
            # Get user info
            user = self.users.find_one({'_id': user_id})
            if not user:
                return {}
            
            # Get user's security events
            user_events = list(self.security_events.find({
                'userId': user_id
            }).sort('timestamp', DESCENDING).limit(100))
            
            # Get user's active sessions
            active_sessions = list(self.sessions.find({
                'userId': user_id,
                'isActive': True,
                'expiresAt': {'$gt': datetime.datetime.utcnow()}
            }))
            
            # Calculate risk score
            risk_score = 0
            if user_events:
                avg_risk = sum(event.get('riskScore', 0) for event in user_events) / len(user_events)
                risk_score = min(avg_risk, 100)
            
            return {
                'user': {
                    'username': user.get('username'),
                    'email': user.get('email'),
                    'role': user.get('role'),
                    'isActive': user.get('isActive'),
                    'lastLogin': user.get('lastLogin'),
                    'loginAttempts': user.get('loginAttempts', 0)
                },
                'security_events': user_events,
                'active_sessions': active_sessions,
                'risk_score': risk_score,
                'event_count': len(user_events)
            }
            
        except Exception as e:
            logger.error(f"Error getting user security profile: {e}")
            return {}
    
    def update_user_risk_score(self, user_id: str, risk_score: float) -> bool:
        """Update user risk score"""
        try:
            result = self.users.update_one(
                {'_id': user_id},
                {
                    '$set': {
                        'riskScore': min(risk_score, 100),
                        'lastRiskUpdate': datetime.datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"📊 Updated risk score for user {user_id}: {risk_score}")
                return True
            else:
                logger.warning(f"No user found with ID: {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating user risk score: {e}")
            return False
    
    def block_ip(self, ip: str, reason: str, duration_hours: int = 24) -> bool:
        """Block IP address"""
        try:
            block_until = datetime.datetime.utcnow() + datetime.timedelta(hours=duration_hours)
            
            # Log blocking event
            block_event = {
                'eventType': 'unauthorized_access',
                'severity': 'critical',
                'ip': ip,
                'userAgent': 'System',
                'endpoint': '/api/security/block-ip',
                'method': 'POST',
                'statusCode': 403,
                'timestamp': datetime.datetime.utcnow(),
                'riskScore': 100,
                'isBlocked': True,
                'details': f'IP blocked: {reason}',
                'metadata': {
                    'blockDuration': duration_hours,
                    'blockedUntil': block_until,
                    'action': 'automatic_block'
                }
            }
            
            self.log_security_event(block_event)
            
            # Store in blocked IPs collection (create if doesn't exist)
            blocked_ips = self.db.blocked_ips
            blocked_ips.update_one(
                {'ip': ip},
                {
                    '$set': {
                        'ip': ip,
                        'reason': reason,
                        'blockedAt': datetime.datetime.utcnow(),
                        'blockedUntil': block_until,
                        'isActive': True
                    }
                },
                upsert=True
            )
            
            logger.warning(f"🚫 Blocked IP {ip}: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Error blocking IP {ip}: {e}")
            return False
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is blocked"""
        try:
            blocked_ip = self.db.blocked_ips.find_one({
                'ip': ip,
                'isActive': True,
                'blockedUntil': {'$gt': datetime.datetime.utcnow()}
            })
            
            return blocked_ip is not None
            
        except Exception as e:
            logger.error(f"Error checking IP block status: {e}")
            return False
    
    def get_security_dashboard_data(self) -> Dict[str, Any]:
        """Get data for security dashboard"""
        try:
            now = datetime.datetime.utcnow()
            one_day_ago = now - datetime.timedelta(days=1)
            one_week_ago = now - datetime.timedelta(weeks=1)
            
            # Get overall statistics
            total_events = self.security_events.count_documents({})
            recent_events = self.security_events.count_documents({'timestamp': {'$gte': one_day_ago}})
            critical_events = self.security_events.count_documents({
                'severity': 'critical',
                'timestamp': {'$gte': one_day_ago}
            })
            
            # Get events by type
            events_by_type = list(self.security_events.aggregate([
                {'$match': {'timestamp': {'$gte': one_week_ago}}},
                {'$group': {'_id': '$eventType', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]))
            
            # Get events by severity
            events_by_severity = list(self.security_events.aggregate([
                {'$match': {'timestamp': {'$gte': one_week_ago}}},
                {'$group': {'_id': '$severity', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]))
            
            # Get top attacking IPs
            top_ips = list(self.security_events.aggregate([
                {'$match': {'timestamp': {'$gte': one_week_ago}}},
                {
                    '$group': {
                        '_id': '$ip',
                        'count': {'$sum': 1},
                        'criticalCount': {
                            '$sum': {
                                '$cond': [{'$eq': ['$severity', 'critical']}, 1, 0]
                            }
                        }
                    }
                },
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]))
            
            # Get active sessions
            active_sessions = self.sessions.count_documents({
                'isActive': True,
                'expiresAt': {'$gt': now}
            })
            
            # Get total users
            total_users = self.users.count_documents({'isActive': True})
            
            # Calculate security health score
            security_health_score = max(0, min(100, 
                100 - (critical_events * 10) - (recent_events / 10)
            ))
            
            return {
                'overview': {
                    'totalEvents': total_events,
                    'recentEvents': recent_events,
                    'criticalEvents': critical_events,
                    'activeSessions': active_sessions,
                    'totalUsers': total_users,
                    'securityHealthScore': round(security_health_score, 1)
                },
                'eventsByType': events_by_type,
                'eventsBySeverity': events_by_severity,
                'topIPs': top_ips
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard data: {e}")
            return {}
    
    def cleanup_old_events(self, days: int = 90) -> int:
        """Clean up old security events"""
        try:
            cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
            
            result = self.security_events.delete_many({
                'timestamp': {'$lt': cutoff_date}
            })
            
            deleted_count = result.deleted_count
            logger.info(f"🧹 Cleaned up {deleted_count} old security events")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up old events: {e}")
            return 0

def main():
    """Test MongoDB integration"""
    print("🔗 Testing MongoDB Security Integration")
    print("=" * 50)
    
    # Initialize connection
    mongo_integration = MongoDBSecurityIntegration()
    
    try:
        # Test security event logging
        test_event = {
            'eventType': 'sql_injection',
            'severity': 'critical',
            'ip': '192.168.1.100',
            'userAgent': 'Mozilla/5.0 (Test Browser)',
            'endpoint': '/api/test',
            'method': 'POST',
            'statusCode': 200,
            'riskScore': 95,
            'isBlocked': True,
            'details': 'SQL injection attempt detected by AI',
            'metadata': {
                'aiDetection': True,
                'confidence': 0.95
            }
        }
        
        success = mongo_integration.log_security_event(test_event)
        print(f"📝 Test event logged: {'✅' if success else '❌'}")
        
        # Test statistics
        stats = mongo_integration.get_attack_statistics(hours=24)
        print(f"📊 Recent events: {stats.get('total_events', 0)}")
        print(f"🚨 Critical events: {stats.get('critical_events', 0)}")
        
        # Test dashboard data
        dashboard_data = mongo_integration.get_security_dashboard_data()
        print(f"🛡️ Security Health Score: {dashboard_data.get('overview', {}).get('securityHealthScore', 0)}")
        
        print("✅ MongoDB integration test completed")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        mongo_integration.disconnect()

if __name__ == "__main__":
    main()
