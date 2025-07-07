#!/usr/bin/env node

// [accelerate] AI Chat Demonstration
// Shows the AI integration in action with a simple chat interface

const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = 'http://localhost:3002';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Chat history
let conversationHistory = [];

// Function to ask user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Function to send message to AI
async function sendMessage(message) {
  try {
    const response = await axios.post(`${API_BASE_URL}/orchestrator/chat`, {
      message,
      conversationHistory,
      attachments: []
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    return {
      response: 'Sorry, I encountered an error. Please try again.',
      wisdom_used: [],
      context: {}
    };
  }
}

// Main chat loop
async function startChat() {
  console.log('🤖 Vision Holder AI Chat Demo');
  console.log('=============================');
  console.log('');
  console.log('This demo shows the AI integration in action.');
  console.log('The AI will learn from your interactions and provide personalized responses.');
  console.log('');
  console.log('Type "quit" to exit the chat.');
  console.log('');

  while (true) {
    const userMessage = await askQuestion('You: ');
    
    if (userMessage.toLowerCase() === 'quit') {
      console.log('\n👋 Thanks for trying the AI chat demo!');
      break;
    }

    if (!userMessage.trim()) {
      continue;
    }

    console.log('\n🤖 AI is thinking...\n');

    // Send message to AI
    const aiResponse = await sendMessage(userMessage);

    // Display AI response
    console.log('AI:', aiResponse.response);
    
    // Show wisdom insights if any were used
    if (aiResponse.wisdom_used && aiResponse.wisdom_used.length > 0) {
      console.log('\n💡 Wisdom Insights Used:');
      aiResponse.wisdom_used.forEach(wisdom => {
        console.log(`   • ${wisdom.insight}`);
      });
    }

    // Update conversation history
    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'ai', content: aiResponse.response });

    // Keep only last 10 messages to prevent context overflow
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    console.log('');
  }

  rl.close();
}

// Check if services are running before starting
async function checkServices() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error('❌ Backend services are not running.');
    console.log('');
    console.log('💡 To start the services:');
    console.log('   cd 04_impl/backend');
    console.log('   ./start-services.sh');
    console.log('');
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Checking if services are running...\n');
  
  const servicesRunning = await checkServices();
  
  if (servicesRunning) {
    console.log('✅ Services are running. Starting chat demo...\n');
    await startChat();
  } else {
    process.exit(1);
  }
}

// Run the demo
main().catch(console.error); 