const axios = require('axios');

const API_BASE = 'http://localhost:4000';

async function testPreviewSystem() {
  console.log('🧪 Testing Quiz Preview System...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/quiz-preview/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Try to get preview for a non-existent quiz (should show error handling)
    console.log('2️⃣ Testing Preview for Non-existent Quiz...');
    try {
      await axios.get(`${API_BASE}/quiz-preview/quizzes/non-existent-quiz`);
    } catch (error) {
      console.log('✅ Error Handling:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Try to validate non-existent quiz
    console.log('3️⃣ Testing Validation for Non-existent Quiz...');
    try {
      await axios.post(`${API_BASE}/quiz-preview/quizzes/non-existent-quiz/validate`);
    } catch (error) {
      console.log('✅ Error Handling:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Preview System Tests Complete!');
    console.log('\n📋 To see actual previews:');
    console.log('   1. Create a quiz in your admin interface');
    console.log('   2. Use the quiz ID to call preview endpoints');
    console.log('   3. Or integrate preview buttons into your UI');
    console.log('\n🔗 Available Endpoints:');
    console.log('   GET  /quiz-preview/health');
    console.log('   GET  /quiz-preview/quizzes/:id');
    console.log('   POST /quiz-preview/quizzes/:id/validate');
    console.log('   GET  /quiz-preview/quizzes/:id/embed');
    console.log('   GET  /quiz-preview/quizzes/:id/summary');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the API server is running:');
    console.log('   npm run start:dev');
  }
}

// Run the test
testPreviewSystem();
