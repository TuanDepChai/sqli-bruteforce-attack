#!/bin/bash

# 🌐 Show LAN IP Address for Network Access
# Quick script to display your IP address for LAN access

echo "🌐 SQLi BruteForce Attack - Network Access Information"
echo "=================================================="
echo ""

# Get LAN IP address
LAN_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LAN_IP" ]; then
    LAN_IP=$(ip route get 1 | awk '{print $7; exit}')
fi

# Get all IP addresses
echo "📱 All Network Interfaces:"
ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1" | while read line; do
    IP=$(echo $line | awk '{print $2}' | cut -d'/' -f1)
    INTERFACE=$(echo $line | awk '{print $NF}')
    echo "   $INTERFACE: $IP"
done

echo ""
echo "🎯 Primary LAN IP: $LAN_IP"
echo ""
echo "📋 Access URLs:"
echo "   Local:  http://localhost:3000"
echo "   LAN:    http://$LAN_IP:3000"
echo ""
echo "🔐 Admin URLs:"
echo "   Local:  http://localhost:3000/admin"
echo "   LAN:    http://$LAN_IP:3000/admin"
echo ""
echo "💡 Other devices can access using the LAN URL"
echo ""
