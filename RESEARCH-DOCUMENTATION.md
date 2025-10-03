# Research Documentation: Unsupervised ML for SQLi BruteForce Attack Detection

## 🎯 Research Topic
**Development and Implementation of Unsupervised Machine Learning System for Analyzing Log Files and Automatically Detecting Brute-Force and SQL Injection (SQLI) Attacks**

### Research Objectives
- Create an effective solution without pre-labeled data
- Protect systems from common cybersecurity threats
- Implement unsupervised learning for attack detection
- Integrate with SIEM (Security Information and Event Management) systems

## 🏗️ System Architecture

### Network Topology
```
┌─────────────────────────────────────────────────────────────┐
│                    Research Environment                     │
├─────────────────────────────────────────────────────────────┤
│  Web Server (192.168.205.100)                              │
│  ├── SQLi BruteForce Web Application                       │
│  ├── Wazuh Agent                                           │
│  ├── Log Generation (Wazuh Compatible)                     │
│  └── ML Feature Extraction                                 │
├─────────────────────────────────────────────────────────────┤
│  SIEM Dashboard (192.168.205.128)                          │
│  ├── Wazuh Dashboard                                       │
│  ├── Log Aggregation                                       │
│  ├── Unsupervised ML Engine                                │
│  ├── Anomaly Detection                                     │
│  └── Attack Pattern Analysis                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔬 Research Methodology

### 1. Data Collection
- **Log Sources**: Web application, authentication attempts, SQL queries
- **Data Format**: Structured logs compatible with Wazuh SIEM
- **Fields Captured**:
  - Timestamp (Vietnam timezone +7)
  - Source IP address
  - HTTP method and URI
  - Request payload (including SQL injection attempts)
  - Response status codes
  - User agent information
  - Attack classification
  - SQL query executed
  - Session tokens
  - Response times and payload sizes

### 2. Feature Engineering
```python
# Temporal Features
- Hour of day, day of week patterns
- Request frequency analysis
- Time-based anomaly detection

# Network Features  
- IP address frequency
- Geographic patterns
- Source diversity analysis

# Payload Features
- SQL injection keyword detection
- Query complexity analysis
- Parameter manipulation patterns

# Behavioral Features
- User agent analysis
- Session progression
- Attack sequence identification
```

### 3. Unsupervised Learning Algorithms

#### Isolation Forest
- **Purpose**: Anomaly detection without labeled data
- **Implementation**: Detect unusual patterns in login attempts
- **Parameters**: contamination=0.1, random_state=42

#### DBSCAN Clustering
- **Purpose**: Group similar attack patterns
- **Implementation**: Identify attack families and variants
- **Parameters**: eps=0.5, min_samples=5

#### TF-IDF Vectorization
- **Purpose**: Text analysis for SQL injection detection
- **Implementation**: Analyze SQL query patterns
- **Features**: 1000 most frequent terms

### 4. Attack Detection Categories

#### Brute Force Attacks
- **Characteristics**: Rapid successive login attempts
- **Indicators**: 
  - Multiple failed attempts from same IP
  - Short time intervals between attempts
  - Common password patterns
  - High failure rate (>80%)

#### SQL Injection Attacks
- **Characteristics**: Malicious SQL payload injection
- **Indicators**:
  - UNION SELECT statements
  - OR 1=1 conditions
  - Comment-based bypasses (--)
  - Database error responses
  - Unusual query structures

## 📊 Expected Research Outcomes

### 1. Detection Accuracy
- **Brute Force**: >95% detection rate
- **SQL Injection**: >90% detection rate
- **False Positive Rate**: <5%
- **Response Time**: <1 second

### 2. Unsupervised Learning Benefits
- **No Labeled Data Required**: Eliminates manual labeling effort
- **Adaptive Detection**: Learns new attack patterns automatically
- **Scalability**: Can be deployed across multiple systems
- **Cost Effectiveness**: Reduces security operation costs

### 3. Research Contributions
- **Novel Feature Engineering**: Multi-dimensional attack analysis
- **SIEM Integration**: Seamless integration with existing security tools
- **Real-time Processing**: Immediate threat detection
- **Academic Value**: Contributes to cybersecurity research

## 🔧 Implementation Details

### Log Format for ML Analysis
```
2025-10-03 11:09:42.177 +07:00 ::1 POST /api/login?username=admin'%20OR%201=1--&password=anything 500 "Mozilla/5.0..." "SQL syntax error - Database processing failed" "SELECTs to the left and right of UNION do not have the same number of result columns" "SESS_1234567890_abc123" "sql_injection" "SELECT * FROM users WHERE username = 'admin' OR 1=1--' AND password = 'anything'" "http://localhost:3000/" "5ms" "78bytes" "{"content-type":"application/json"}"
```

### ML Pipeline
1. **Data Ingestion**: Real-time log collection
2. **Preprocessing**: Feature extraction and normalization
3. **Model Training**: Unsupervised learning algorithms
4. **Anomaly Detection**: Real-time scoring
5. **Alert Generation**: Automated threat notifications
6. **Pattern Analysis**: Attack sequence identification

### Performance Metrics
```python
# Evaluation Metrics
- Precision: TP / (TP + FP)
- Recall: TP / (TP + FN)  
- F1-Score: 2 * (Precision * Recall) / (Precision + Recall)
- AUC-ROC: Area under ROC curve
- False Positive Rate: FP / (FP + TN)
```

## 📈 Research Timeline

### Phase 1: System Development (Weeks 1-2)
- ✅ Web application with intentional vulnerabilities
- ✅ Log generation system
- ✅ Wazuh SIEM integration
- ✅ Basic ML framework

### Phase 2: Data Collection (Weeks 3-4)
- 🔄 Attack simulation and data generation
- 🔄 Log aggregation and storage
- 🔄 Feature engineering pipeline
- 🔄 Data quality validation

### Phase 3: ML Model Development (Weeks 5-6)
- 🔄 Unsupervised algorithm implementation
- 🔄 Hyperparameter tuning
- 🔄 Model validation and testing
- 🔄 Performance optimization

### Phase 4: Integration & Testing (Weeks 7-8)
- 🔄 Real-time detection system
- 🔄 Dashboard development
- 🔄 Alert system implementation
- 🔄 System performance evaluation

### Phase 5: Analysis & Documentation (Weeks 9-10)
- 🔄 Results analysis and interpretation
- 🔄 Comparison with supervised methods
- 🔄 Research paper preparation
- 🔄 Thesis documentation

## 🎓 Academic Impact

### Research Questions
1. **Can unsupervised ML effectively detect SQL injection attacks without labeled training data?**
2. **How does unsupervised detection compare to rule-based and supervised approaches?**
3. **What features are most effective for identifying attack patterns?**
4. **How can real-time anomaly detection be optimized for SIEM integration?**

### Expected Publications
- Conference paper on unsupervised cybersecurity ML
- Journal article on SIEM integration techniques
- Open-source tool contribution
- Academic thesis completion

### Industry Applications
- **Security Operations Centers (SOC)**: Automated threat detection
- **Managed Security Service Providers (MSSP)**: Scalable protection
- **Enterprise Security**: Cost-effective threat monitoring
- **Government Agencies**: Critical infrastructure protection

## 🔍 Testing & Validation

### Attack Scenarios
1. **Brute Force Variations**:
   - Dictionary attacks
   - Credential stuffing
   - Distributed attacks
   - Time-based attacks

2. **SQL Injection Types**:
   - Union-based injection
   - Boolean-based blind
   - Time-based blind
   - Error-based injection

3. **Evasion Techniques**:
   - Encoding variations
   - Comment-based bypasses
   - Case alternation
   - Whitespace manipulation

### Validation Methods
- **Cross-validation**: K-fold validation on attack datasets
- **Temporal validation**: Time-based train/test splits
- **Adversarial testing**: Evasion technique evaluation
- **Real-world deployment**: Production environment testing

## 📚 References & Resources

### Academic Papers
- "Anomaly Detection in Network Traffic Using Unsupervised Machine Learning"
- "SQL Injection Attack Detection Using Machine Learning Techniques"
- "Unsupervised Learning for Cybersecurity: A Survey"

### Tools & Frameworks
- **Wazuh SIEM**: Open-source security monitoring
- **scikit-learn**: Machine learning algorithms
- **pandas/numpy**: Data processing
- **Next.js/React**: Web application framework

### Datasets
- **Custom Generated**: Simulated attack scenarios
- **Public Datasets**: NSL-KDD, CICIDS2017
- **Real-world Logs**: Production environment data

---

**Research Supervisor**: [Supervisor Name]  
**Student**: [Your Name]  
**Institution**: [University Name]  
**Academic Year**: 2024-2025  
**Department**: Information Security
