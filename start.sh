#!/bin/bash

# Start both backend and frontend

echo "Starting HealthSupp PWA..."
echo ""

# Start backend
echo "📦 Starting backend on port 5000..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "⚛️  Starting frontend on port 3000..."
cd ../frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!

echo ""
echo "✓ Backend running: http://localhost:5000"
echo "✓ Frontend running: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
