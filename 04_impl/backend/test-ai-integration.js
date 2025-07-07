#!/usr/bin/env node

// [accelerate] AI Integration Test Script
// Tests the AI service integration to ensure it's working properly

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testAIIntegration() {
  console.log('🤖 Testing AI Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('   AI Service:', healthResponse.data.ai_service);
    console.log('   Wisdom Memory Count:', healthResponse.data.wisdom_memory_count);
    console.log('');

    // Test 2: Chat Endpoint
    console.log('2. Testing chat endpoint...');
    const chatResponse = await axios.post(`${API_BASE_URL}/orchestrator/chat`, {
      message: 'Hello! I\'m testing the AI integration. Can you help me understand how this works?',
      conversationHistory: [],
      attachments: []
    });
    
    console.log('✅ Chat response received');
    console.log('   Response length:', chatResponse.data.response.length, 'characters');
    console.log('   Wisdom used:', chatResponse.data.wisdom_used.length, 'insights');
    console.log('   Sample response:', chatResponse.data.response.substring(0, 100) + '...');
    console.log('');

    // Test 3: Context Generation
    console.log('3. Testing context generation...');
    const contextResponse = await axios.post(`${API_BASE_URL}/orchestrator/context`, {
      task: 'Create a simple user interface component',
      builderType: 'design',
      mission: null,
      pillars: []
    });
    
    console.log('✅ Context generation successful');
    console.log('   Alignment check:', contextResponse.data.alignment_check);
    console.log('   Wisdom injected:', contextResponse.data.wisdom_injected.length, 'insights');
    console.log('   Instructions length:', contextResponse.data.builder_instructions.length, 'characters');
    console.log('');

    console.log('🎉 All AI integration tests passed!');
    console.log('');
    console.log('The AI service is working correctly and ready to use.');
    console.log('You can now start the frontend application to test the chat interface.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure the backend services are running:');
      console.log('   cd 04_impl/backend');
      console.log('   ./start-services.sh');
    } else if (error.response?.status === 401) {
      console.log('');
      console.log('💡 Check your AI API key configuration:');
      console.log('   ./setup-ai.sh');
    }
    
    process.exit(1);
  }
}

// Run the test
testAIIntegration(); 