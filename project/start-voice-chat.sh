#!/bin/bash

echo "🎤 Starting Voice Chat Application"
echo "=================================="

# Check if backend is running
echo "🔍 Checking if backend is running on port 8080..."
if curl -s http://localhost:8080/api/transcribe/health > /dev/null; then
    echo "✅ Backend is already running"
else
    echo "❌ Backend not running. Starting backend server..."
    echo "📝 Please run the following command in a separate terminal:"
    echo "   cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend/demo"
    echo "   ./gradlew bootRun"
    echo ""
    echo "⏳ Waiting for backend to start..."
    sleep 5
fi

# Check if frontend is running
echo "🔍 Checking if frontend is running on port 5173..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is already running"
else
    echo "❌ Frontend not running. Starting frontend server..."
    echo "📝 Please run the following command in a separate terminal:"
    echo "   cd /Users/darshparikh/Documents/GitHub/mrgybapp/project"
    echo "   npm run dev"
    echo ""
fi

echo ""
echo "🎯 Voice Chat Setup Complete!"
echo "============================="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo "Health:   http://localhost:8080/api/transcribe/health"
echo ""
echo "🎤 To test voice chat:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Navigate to any chat interface"
echo "3. Click the microphone icon"
echo "4. Allow microphone permission"
echo "5. Speak and click mic again to stop"
echo ""
echo "📝 Make sure to set your OpenAI API key in:"
echo "   - Frontend: .env file (VITE_OPENAI_API_KEY)"
echo "   - Backend: .env file or application.yml (OPENAI_API_KEY)"
