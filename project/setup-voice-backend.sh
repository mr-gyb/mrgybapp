#!/bin/bash

echo "🎤 Setting up Voice Chat Backend Server"
echo "======================================"

# Navigate to backend directory
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend

echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "🔧 Backend Setup Complete!"
echo "========================="
echo ""
echo "📝 Next steps:"
echo "1. Set your OpenAI API key in backend/.env file:"
echo "   OPENAI_API_KEY=your_openai_api_key_here"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "3. Start the frontend server:"
echo "   npm run dev"
echo ""
echo "🎯 The backend will run on http://localhost:8080"
echo "🎯 The frontend will run on http://localhost:5173"
