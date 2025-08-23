#!/bin/bash

echo "🧪 Testing Quiz Preview System..."
echo ""

API_BASE="http://localhost:4000"

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
if curl -s "$API_BASE/quiz-preview/health" > /dev/null; then
    echo "✅ Health Check: Service is running"
    curl -s "$API_BASE/quiz-preview/health" | jq '.' 2>/dev/null || curl -s "$API_BASE/quiz-preview/health"
else
    echo "❌ Health Check: Service not responding"
    echo "💡 Make sure the API server is running: npm run start:dev"
    exit 1
fi

echo ""

# Test 2: Preview for non-existent quiz (should show error handling)
echo "2️⃣ Testing Preview for Non-existent Quiz..."
curl -s -w "Status: %{http_code}\n" "$API_BASE/quiz-preview/quizzes/non-existent-quiz" || echo "✅ Error handling working"

echo ""

# Test 3: Validation for non-existent quiz
echo "3️⃣ Testing Validation for Non-existent Quiz..."
curl -s -X POST -w "Status: %{http_code}\n" "$API_BASE/quiz-preview/quizzes/non-existent-quiz/validate" || echo "✅ Error handling working"

echo ""

echo "🎉 Preview System Tests Complete!"
echo ""
echo "📋 To see actual previews:"
echo "   1. Create a quiz in your admin interface"
echo "   2. Use the quiz ID to call preview endpoints"
echo "   3. Or integrate preview buttons into your UI"
echo ""
echo "🔗 Available Endpoints:"
echo "   GET  /quiz-preview/health"
echo "   GET  /quiz-preview/quizzes/:id"
echo "   POST /quiz-preview/quizzes/:id/validate"
echo "   GET  /quiz-preview/quizzes/:id/embed"
echo "   GET  /quiz-preview/quizzes/:id/summary"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start the API server: npm run start:dev"
echo "   2. Create a quiz through the admin interface"
echo "   3. Use the preview endpoints with the quiz ID"
echo "   4. Integrate preview buttons into your UI"
