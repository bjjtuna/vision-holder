// Simple Gemini API test
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🤖 Testing Gemini API Integration...');
    
    const genAI = new GoogleGenerativeAI('AIzaSyDVkLIc6AU35xSuTJLTzwb6Mr_iTccdRTo');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = 'Hello! Can you help me with a coding project?';
    console.log('📤 Sending prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Gemini Response:', text);
    console.log('✅ Gemini API test successful!');
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}

testGemini().then(success => {
  if (success) {
    console.log('\n🎉 Your Gemini API key is working correctly!');
    console.log('The Vision Holder system can now use Gemini for AI responses.');
  } else {
    console.log('\n💡 Please check your Gemini API key and try again.');
  }
  process.exit(success ? 0 : 1);
}); 