#!/bin/bash

# Linux Script for Testing SQLi BruteForce Attack Detection
# Author: TuanDepChai
# Usage: ./scripts/test-attacks-linux.sh

echo "🧪 SQLi BruteForce Attack Detection Test Suite"
echo "=============================================="

# Configuration
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/login"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Test credentials
declare -a TEST_CREDENTIALS=(
    "admin:admin123:true"
    "user:password:true"
    "john:john2024:true"
    "admin:wrong:false"
    "invalid:password:false"
)

# SQL Injection payloads
declare -a SQL_PAYLOADS=(
    "admin' OR '1'='1:anything:Basic OR 1=1 bypass"
    "admin'--::Comment-based bypass"
    "' OR 1=1--:anything:Always true condition"
    "admin' UNION SELECT 1,'admin','password'--:anything:UNION SELECT injection"
    "admin'; DROP TABLE users--::Stacked queries"
    "admin' AND SLEEP(5)--::Time-based blind injection"
)

# Brute force test data
declare -a BRUTE_FORCE_USERS=("admin" "user" "john" "sarah" "mike" "emma")
declare -a BRUTE_FORCE_PASSWORDS=("password" "123456" "admin123" "password123" "letmein" "qwerty" "abc123")

test_normal_login() {
    echo -e "\n${GREEN}🔐 Testing Normal Login Attempts${NC}"
    echo -e "${GREEN}================================${NC}"
    
    for cred in "${TEST_CREDENTIALS[@]}"; do
        IFS=':' read -r username password expected <<< "$cred"
        
        response=$(curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$username\",\"password\":\"$password\"}")
        
        success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' ')
        
        if [ "$success" = "true" ]; then
            status="✅ SUCCESS"
            color=$GREEN
        else
            status="❌ FAILED"
            color=$RED
        fi
        
        if [ "$expected" = "true" ]; then
            expected_status="✅ SUCCESS"
        else
            expected_status="❌ FAILED"
        fi
        
        if [ "$success" = "$expected" ]; then
            echo -e "${color}$status${NC} | $username:$password | Expected: $expected_status"
        else
            echo -e "${color}$status${NC} | $username:$password | Expected: $expected_status | ⚠️ UNEXPECTED"
        fi
        
        sleep 0.5
    done
}

test_sql_injection() {
    echo -e "\n${RED}💉 Testing SQL Injection Attacks${NC}"
    echo -e "${RED}================================${NC}"
    
    for payload in "${SQL_PAYLOADS[@]}"; do
        IFS=':' read -r username password description <<< "$payload"
        
        response=$(curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$username\",\"password\":\"$password\"}")
        
        success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' ')
        vulnerability=$(echo "$response" | grep -o '"vulnerability":"[^"]*"' | cut -d'"' -f4)
        
        if [ "$success" = "true" ]; then
            status="🚨 SUCCESS (VULNERABLE!)"
            color=$RED
        else
            status="✅ BLOCKED"
            color=$GREEN
        fi
        
        echo -e "${color}$status${NC} | $description"
        echo -e "${GRAY}   Payload: $username${NC}"
        
        if [ -n "$vulnerability" ]; then
            echo -e "${YELLOW}   Detection: $vulnerability${NC}"
        fi
        
        sleep 0.5
    done
}

test_brute_force() {
    echo -e "\n${MAGENTA}🔨 Testing Brute Force Attacks${NC}"
    echo -e "${MAGENTA}===============================${NC}"
    
    attempts=0
    successful=0
    
    for user in "${BRUTE_FORCE_USERS[@]}"; do
        for pass in "${BRUTE_FORCE_PASSWORDS[@]}"; do
            response=$(curl -s -X POST "$API_URL" \
                -H "Content-Type: application/json" \
                -d "{\"username\":\"$user\",\"password\":\"$pass\"}")
            
            success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' ')
            brute_force_detected=$(echo "$response" | grep -o '"bruteForceDetected":"[^"]*"' | cut -d'"' -f4)
            
            ((attempts++))
            
            if [ "$success" = "true" ]; then
                ((successful++))
                echo -e "${RED}🎯 SUCCESS${NC} | $user:$pass"
            else
                echo -e "${GRAY}❌ FAILED${NC} | $user:$pass"
            fi
            
            if [ -n "$brute_force_detected" ]; then
                echo -e "${YELLOW}   🛡️ Brute Force Detected: $brute_force_detected${NC}"
            fi
            
            sleep 0.2
        done
    done
    
    echo -e "\n${CYAN}📊 Brute Force Summary:${NC}"
    echo -e "${GRAY}   Total Attempts: $attempts${NC}"
    echo -e "${RED}   Successful: $successful${NC}"
    echo -e "${GRAY}   Failed: $((attempts - successful))${NC}"
    
    if [ $attempts -gt 0 ]; then
        success_rate=$(echo "scale=2; $successful * 100 / $attempts" | bc -l 2>/dev/null || echo "0")
        echo -e "${YELLOW}   Success Rate: ${success_rate}%${NC}"
    fi
}

test_web_interface() {
    echo -e "\n${BLUE}🌐 Testing Web Interface${NC}"
    echo -e "${BLUE}========================${NC}"
    
    # Test main page
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ Web Interface: Accessible${NC}"
    else
        echo -e "${RED}❌ Web Interface: HTTP $status_code${NC}"
    fi
    
    # Test admin dashboard
    admin_status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")
    if [ "$admin_status_code" = "200" ]; then
        echo -e "${GREEN}✅ Admin Dashboard: Accessible${NC}"
    else
        echo -e "${RED}❌ Admin Dashboard: HTTP $admin_status_code${NC}"
    fi
}

show_log_files() {
    echo -e "\n${CYAN}📁 Checking Log Files${NC}"
    echo -e "${CYAN}====================${NC}"
    
    log_files=("logs/attacks.log" "logs/sql_injection.log" "logs/brute_force.log" "logs/critical-attacks.log")
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            size=$(du -h "$log_file" | cut -f1)
            echo -e "${GREEN}✅ $log_file ($size)${NC}"
        else
            echo -e "${RED}❌ $log_file (Not found)${NC}"
        fi
    done
    
    # Show recent log entries
    if [ -f "logs/attacks.log" ]; then
        echo -e "\n${YELLOW}📝 Recent Log Entries:${NC}"
        tail -3 "logs/attacks.log" | while read -r line; do
            echo -e "${GRAY}   $line${NC}"
        done
    fi
}

show_database() {
    echo -e "\n${CYAN}🗄️ Checking Database${NC}"
    echo -e "${CYAN}===================${NC}"
    
    if [ -f "vulnerable.db" ]; then
        size=$(du -h "vulnerable.db" | cut -f1)
        echo -e "${GREEN}✅ Database: vulnerable.db ($size)${NC}"
        
        # Try to query database
        if command -v sqlite3 &> /dev/null; then
            attack_logs=$(sqlite3 vulnerable.db "SELECT COUNT(*) FROM attack_logs;" 2>/dev/null || echo "0")
            users=$(sqlite3 vulnerable.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
            echo -e "${GRAY}   Attack Logs: $attack_logs records${NC}"
            echo -e "${GRAY}   Users: $users records${NC}"
        else
            echo -e "${YELLOW}   ⚠️ Cannot query database (sqlite3 not found)${NC}"
        fi
    else
        echo -e "${RED}❌ Database: vulnerable.db (Not found)${NC}"
    fi
}

show_statistics() {
    echo -e "\n${CYAN}📊 Attack Statistics${NC}"
    echo -e "${CYAN}===================${NC}"
    
    if [ -f "logs/attacks.log" ]; then
        total_attacks=$(grep -c "ATTACK_ATTEMPT" logs/attacks.log 2>/dev/null || echo "0")
        successful_attacks=$(grep -c "SUCCESS.*: YES" logs/attacks.log 2>/dev/null || echo "0")
        sql_injections=$(grep -c "sql_injection" logs/attacks.log 2>/dev/null || echo "0")
        brute_forces=$(grep -c "brute_force" logs/attacks.log 2>/dev/null || echo "0")
        
        echo -e "${GRAY}   Total Attacks: $total_attacks${NC}"
        echo -e "${RED}   Successful: $successful_attacks${NC}"
        echo -e "${YELLOW}   SQL Injections: $sql_injections${NC}"
        echo -e "${MAGENTA}   Brute Forces: $brute_forces${NC}"
    fi
}

# Main execution
echo "Starting comprehensive attack testing..."
echo "Base URL: $BASE_URL"
echo ""

# Run all tests
test_web_interface
test_normal_login
test_sql_injection
test_brute_force
show_log_files
show_database
show_statistics

echo -e "\n${GREEN}🎉 Testing Complete!${NC}"
echo -e "${GREEN}==================${NC}"
echo -e "${GRAY}Check the following:${NC}"
echo -e "${GRAY}• Web Interface: $BASE_URL${NC}"
echo -e "${GRAY}• Admin Dashboard: $BASE_URL/admin${NC}"
echo -e "${GRAY}• Help Documentation: $BASE_URL/help${NC}"
echo -e "${GRAY}• Log Files: logs/ directory${NC}"
echo -e "${GRAY}• Database: vulnerable.db${NC}"

echo -e "\n${CYAN}📊 For real-time log monitoring, run:${NC}"
echo -e "${YELLOW}tail -f logs/attacks.log${NC}"
