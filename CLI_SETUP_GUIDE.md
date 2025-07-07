# 🚀 CLI Setup Guide for Vision Holder

This guide will help you set up Claude Code CLI and Gemini API integration with Vision Holder.

## 📋 Prerequisites

- Node.js 18+ installed
- Vision Holder backend running
- Terminal access

## 🧠 Claude Code CLI Setup

### Option 1: Official Claude Code CLI (Recommended)

1. **Install Claude Code CLI**:
```bash
# Install via npm (if available)
npm install -g @anthropic/claude-code

# Or install via pip (Python)
pip install claude-code-cli
```

2. **Set up your Anthropic API key**:
```bash
# Set environment variable
export ANTHROPIC_API_KEY="your-api-key-here"

# Or create ~/.anthropic/config file
mkdir -p ~/.anthropic
echo "api_key=your-api-key-here" > ~/.anthropic/config
```

3. **Test the installation**:
```bash
claude --version
claude code --help
```

### Option 2: Alternative Claude CLI (if official not available)

1. **Install alternative Claude CLI**:
```bash
# Via npm
npm install -g claude-cli

# Or via pip
pip install claude-3-cli
```

2. **Configure authentication**:
```bash
claude auth login
# Follow prompts to authenticate
```

### Option 3: Custom Integration (Fallback)

If no CLI is available, Vision Holder will use direct API calls:

1. **Add your Anthropic API key to Vision Holder**:
```bash
cd /Users/ryanvalley/Desktop/webboruso-five-pillars-v2/04_impl/backend
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

## 🌟 Google Gemini API Setup

### Method 1: Direct API Integration (Current)

Vision Holder already has Gemini API integrated. To configure:

1. **Set up your Google AI API key**:
```bash
cd /Users/ryanvalley/Desktop/webboruso-five-pillars-v2/04_impl/backend
echo "GEMINI_API_KEY=your-gemini-api-key-here" >> .env
```

2. **Get your Gemini API key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

### Method 2: Google Cloud CLI (For Advanced Features)

1. **Install Google Cloud CLI**:
```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

2. **Initialize and authenticate**:
```bash
gcloud init
gcloud auth login
gcloud auth application-default login
```

3. **Set up your project**:
```bash
gcloud config set project your-project-id
gcloud services enable aiplatform.googleapis.com
```

4. **Test the setup**:
```bash
gcloud ai models list --region=us-central1
```

## 🔧 Vision Holder Configuration

### Update Environment Variables

Create or update your `.env` file in the backend directory:

```bash
cd /Users/ryanvalley/Desktop/webboruso-five-pillars-v2/04_impl/backend
```

Create/edit `.env` file:
```env
# Claude/Anthropic Integration
ANTHROPIC_API_KEY=your-anthropic-api-key-here
CLAUDE_MODEL=claude-3-sonnet-20240229

# Google Gemini Integration  
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-pro

# AI Provider Selection (claude, gemini, or auto)
AI_PROVIDER=auto

# Google Cloud (optional for advanced features)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Command API Configuration
COMMAND_API_PORT=3006
ENABLE_CLAUDE_CLI=true
ENABLE_GOOGLE_CLI=true
```

### Update AI Service Integration

I'll update the AI service to support your API keys:

```typescript
// File: [accelerate]-ai-service-integration.ts
export class AIServiceFactory {
  static getInstance(): AIService {
    const provider = process.env['AI_PROVIDER'] || 'auto';
    
    switch (provider) {
      case 'claude':
        return new ClaudeService(process.env['ANTHROPIC_API_KEY']!);
      case 'gemini':
        return new GeminiService(process.env['GEMINI_API_KEY']!);
      case 'auto':
        // Try Gemini first (you already have this working)
        if (process.env['GEMINI_API_KEY']) {
          return new GeminiService(process.env['GEMINI_API_KEY']);
        }
        // Fallback to Claude if available
        if (process.env['ANTHROPIC_API_KEY']) {
          return new ClaudeService(process.env['ANTHROPIC_API_KEY']);
        }
        // Default fallback
        return new MockAIService();
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
}
```

## 🧪 Testing Your Setup

### Test Claude Code CLI

1. **Run the test command**:
```bash
# If you have claude CLI installed
claude code --help

# Test with a simple file
echo "console.log('hello');" > test.js
claude code review test.js
```

2. **Test through Vision Holder**:
   - Open Vision Holder Dev Workspace
   - Click "Commands" button
   - Type: "review current file with Claude"
   - Should see Claude Code commands generated

### Test Gemini API

1. **Test API key**:
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

2. **Test through Vision Holder**:
   - Open Chat Interface
   - Send a message
   - Should get Gemini AI responses

### Test Google Cloud CLI

1. **Test authentication**:
```bash
gcloud auth list
gcloud config list
```

2. **Test through Vision Holder**:
   - Open Commands panel
   - Type: "deploy to Google Cloud"
   - Should see gcloud commands generated

## 🚨 Troubleshooting

### Claude Code CLI Issues

**Problem**: `claude: command not found`
```bash
# Check if installed
which claude
npm list -g | grep claude

# Reinstall if needed
npm uninstall -g claude-cli
npm install -g claude-cli
```

**Problem**: Authentication errors
```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Re-authenticate
claude auth logout
claude auth login
```

### Gemini API Issues

**Problem**: API key not working
```bash
# Verify API key format (should start with "AI...")
echo $GEMINI_API_KEY

# Test with curl
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

**Problem**: Rate limits or quota issues
- Check your [Google AI Studio quota](https://makersuite.google.com/app/prompts)
- Upgrade to paid tier if needed

### Google Cloud CLI Issues

**Problem**: `gcloud: command not found`
```bash
# Reinstall Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Problem**: Permission issues
```bash
# Re-authenticate
gcloud auth revoke --all
gcloud auth login
gcloud auth application-default login
```

### Vision Holder Integration Issues

**Problem**: Commands not generated
1. Check backend logs:
```bash
cd /Users/ryanvalley/Desktop/webboruso-five-pillars-v2/04_impl/backend
./start-services.sh
```

2. Check Command API health:
```bash
curl http://localhost:3006/health
```

3. Check available tools:
```bash
curl http://localhost:3006/commands/available-tools
```

## 🎯 Quick Setup Script

Save this as `setup-cli.sh` and run it:

```bash
#!/bin/bash

echo "🚀 Setting up CLI tools for Vision Holder..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install Claude CLI (try multiple methods)
echo "🧠 Installing Claude CLI..."
npm install -g claude-cli 2>/dev/null || pip install claude-3-cli 2>/dev/null || echo "⚠️ Claude CLI installation failed - will use API integration"

# Install/Update Google Cloud CLI
echo "☁️ Checking Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    echo "Installing Google Cloud CLI..."
    curl https://sdk.cloud.google.com | bash
    exec -l $SHELL
fi

# Create .env file template
echo "📝 Creating environment configuration..."
cd /Users/ryanvalley/Desktop/webboruso-five-pillars-v2/04_impl/backend

if [ ! -f .env ]; then
    cat > .env << EOF
# Add your API keys here
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
AI_PROVIDER=auto
COMMAND_API_PORT=3006
ENABLE_CLAUDE_CLI=true
ENABLE_GOOGLE_CLI=true
EOF
    echo "✅ Created .env file template"
    echo "⚠️ Please add your API keys to .env file"
else
    echo "✅ .env file already exists"
fi

echo "🎉 Setup complete! Please:"
echo "1. Add your API keys to the .env file"
echo "2. Restart Vision Holder backend: ./start-services.sh"
echo "3. Test in the Vision Holder Commands panel"
```

## 🔑 Getting API Keys

### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up/login
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `sk-`)

### Google Gemini API Key  
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key (starts with `AI`)

### Google Cloud Service Account (optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. IAM & Admin → Service Accounts
3. Create service account
4. Download JSON key file
5. Set path in GOOGLE_APPLICATION_CREDENTIALS

---

**Need help?** Check the troubleshooting section or ask in the Vision Holder Commands panel!