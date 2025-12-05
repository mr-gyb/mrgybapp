#!/bin/bash

# Script to restart the backend server

echo "🔄 Restarting backend server..."

# Find and kill existing server process
PID=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PID" ]; then
  echo "🛑 Stopping existing server (PID: $PID)..."
  kill $PID
  sleep 2
fi

# Start the server
echo "🚀 Starting server..."
cd "$(dirname "$0")"
npm start

