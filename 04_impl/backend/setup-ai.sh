#!/bin/bash

# [accelerate] AI Integration Setup Script
# Helps users configure their AI API keys for the Vision Holder project

echo "🤖 Vision Holder AI Integration Setup"
echo "====================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    echo "Current AI Provider: $(grep 'AI_PROVIDER=' .env | cut -d'=' -f2 || echo 'Not set')"
    echo ""
else
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
    echo ""
fi

echo "🔑 AI Provider Configuration"
echo "Choose your preferred AI provider:"
echo "1. OpenAI (GPT-4) - Recommended for best results"
echo "2. Google Gemini - Good alternative"
echo "3. Anthropic Claude - Another option"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "You selected OpenAI"
        sed -i '' 's/AI_PROVIDER=.*/AI_PROVIDER=openai/' .env
        echo ""
        echo "🔑 Please enter your OpenAI API key:"
        echo "   Get one at: https://platform.openai.com/api-keys"
        read -p "OpenAI API Key: " openai_key
        sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env
        ;;
    2)
        echo "You selected Google Gemini"
        sed -i '' 's/AI_PROVIDER=.*/AI_PROVIDER=gemini/' .env
        echo ""
        echo "🔑 Please enter your Google Gemini API key:"
        echo "   Get one at: https://makersuite.google.com/app/apikey"
        read -p "Gemini API Key: " gemini_key
        sed -i '' "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$gemini_key/" .env
        ;;
    3)
        echo "You selected Anthropic Claude"
        sed -i '' 's/AI_PROVIDER=.*/AI_PROVIDER=claude/' .env
        echo ""
        echo "🔑 Please enter your Anthropic Claude API key:"
        echo "   Get one at: https://console.anthropic.com/"
        read -p "Claude API Key: " claude_key
        sed -i '' "s/CLAUDE_API_KEY=.*/CLAUDE_API_KEY=$claude_key/" .env
        ;;
    *)
        echo "Invalid choice. Using OpenAI as default."
        sed -i '' 's/AI_PROVIDER=.*/AI_PROVIDER=openai/' .env
        ;;
esac

echo ""
echo "✅ AI configuration complete!"
echo ""
echo "🚀 To start the services, run:"
echo "   ./start-services.sh"
echo ""
echo "📝 Your .env file has been configured with your API key."
echo "   Keep this file secure and never commit it to version control."
echo "" 