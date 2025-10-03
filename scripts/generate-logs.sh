#!/bin/bash

# Simple script to generate attack logs for AI analysis
# Usage: ./scripts/generate-logs.sh

echo "🤖 Generating attack logs for AI analysis..."

# Configuration
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/login"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test data
declare -a USERS=("admin" "user" "john" "sarah" "mike" "emma")
declare -a PASSWORDS=("password" "123456" "admin123" "password123" "letmein" "qwerty")
declare -a SQL_PAYLOADS=(
    "admin' OR '1'='1"
    "admin'--"
    "' OR 1=1--"
    "admin' UNION SELECT 1,'admin','password'--"
    "admin'; DROP TABLE users--"
)

generate_normal_logins() {
    echo -e "${BLUE}🔐 Generating normal login attempts...${NC}"
    
    for user in "${USERS[@]}"; do
        for pass in "${PASSWORDS[@]}"; do
            curl -s -X POST "$API_URL" \
                -H "Content-Type: application/json" \
                -d "{\"username\":\"$user\",\"password\":\"$pass\"}" > /dev/null
            sleep 0.2
        done
    done
    
    echo -e "${GREEN}✅ Normal logins completed${NC}"
}

generate_sql_injections() {
    echo -e "${BLUE}💉 Generating SQL injection attempts...${NC}"
    
    for payload in "${SQL_PAYLOADS[@]}"; do
        curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$payload\",\"password\":\"anything\"}" > /dev/null
        sleep 0.3
    done
    
    echo -e "${GREEN}✅ SQL injections completed${NC}"
}

generate_brute_force() {
    echo -e "${BLUE}🔨 Generating brute force attempts...${NC}"
    
    # Rapid attempts from same IP
    for i in {1..20}; do
        curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"admin\",\"password\":\"pass$i\"}" > /dev/null
        sleep 0.1
    done
    
    echo -e "${GREEN}✅ Brute force attempts completed${NC}"
}

show_log_stats() {
    echo -e "${YELLOW}📊 Log Statistics:${NC}"
    
    if [ -f "logs/attacks.log" ]; then
        total=$(wc -l < logs/attacks.log)
        echo "Total log entries: $total"
        
        sql_count=$(grep -c "sql_injection" logs/attacks.log 2>/dev/null || echo "0")
        brute_count=$(grep -c "brute_force" logs/attacks.log 2>/dev/null || echo "0")
        normal_count=$(grep -c "normal_login" logs/attacks.log 2>/dev/null || echo "0")
        
        echo "SQL Injections: $sql_count"
        echo "Brute Force: $brute_count"
        echo "Normal Logins: $normal_count"
    else
        echo "No log file found yet"
    fi
}

# Main execution
echo "Starting log generation for AI analysis..."
echo "Target URL: $BASE_URL"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Error: Web server is not running at $BASE_URL"
    echo "Please start the server first: npm run dev"
    exit 1
fi

echo "✅ Web server is running"
echo ""

# Generate different types of attacks
generate_normal_logins
generate_sql_injections
generate_brute_force

echo ""
echo "🎉 Log generation completed!"
echo ""
show_log_stats

echo ""
echo "📝 Main log file: logs/attacks.log"
echo "🤖 Ready for AI analysis and detection!"
echo ""
echo "To monitor logs in real-time:"
echo "  tail -f logs/attacks.log"
