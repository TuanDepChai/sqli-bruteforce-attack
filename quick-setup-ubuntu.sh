#!/bin/bash

# 🚀 Quick Ubuntu Setup Script
# One-command installation for SQLi BruteForce Attack Training Platform

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Quick Ubuntu Setup - SQLi BruteForce Attack Training Platform${NC}"
echo ""

# Download and run main setup script
echo -e "${BLUE}📥 Downloading setup script...${NC}"
curl -fsSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/setup.sh -o setup.sh

# Make it executable
chmod +x setup.sh

# Run the setup
echo -e "${BLUE}🔧 Running setup...${NC}"
./setup.sh

echo ""
echo -e "${GREEN}✅ Quick setup completed!${NC}"
echo -e "${YELLOW}Run: npm run dev${NC} to start the application"
