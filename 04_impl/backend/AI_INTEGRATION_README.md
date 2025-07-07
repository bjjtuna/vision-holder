# AI Integration Setup Guide

## Overview
The Vision Holder project now includes real AI service integration for enhanced chat functionality and context engineering. The system supports multiple AI providers and automatically falls back to simulated responses if no API keys are configured.

## Supported AI Providers

### 1. OpenAI (Recommended)
- **Model**: GPT-4o-mini (default) or GPT-4
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/)
- **Environment Variable**: `OPENAI_API_KEY`

### 2. Google Gemini
- **Model**: Gemini 1.5 Flash (default)
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/)
- **Environment Variable**: `GEMINI_API_KEY`
- **Note**: Requires installing `@google/generative-ai` package

### 3. Anthropic Claude
- **Model**: Claude 3 Haiku (default)
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)
- **Environment Variable**: `CLAUDE_API_KEY`

## Configuration

### Environment Variables
Create a `.env` file in the backend directory with the following variables:

```bash
# AI Service Configuration
AI_PROVIDER=openai  # or 'gemini' or 'claude'

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7

# Server Configuration
PORT=3002
```

### Provider Selection
The system automatically selects the AI provider based on:
1. `AI_PROVIDER` environment variable
2. Available API keys
3. Fallback to simulated responses if no keys are configured

## Features

### Enhanced Context Engineering
- **Systemic Ledger Integration**: AI responses incorporate mission, pillars, and project context
- **Wisdom Memory Injection**: User preferences and insights are automatically included
- **Conversation History**: Recent chat history provides continuity
- **Real-time Learning**: New insights are extracted and stored from conversations

### Chat Interface Improvements
- **Real AI Responses**: No more simulated responses
- **Contextual Awareness**: AI understands your project structure
- **Voice Input Support**: Speech-to-text for easier communication
- **File Upload Integration**: Share documents for better context
- **Typing Indicators**: Visual feedback during AI processing

### Learning Mechanism
- **Pattern Recognition**: AI learns from your interaction patterns
- **Preference Tracking**: Stores communication style and detail level preferences
- **Insight Extraction**: Automatically identifies valuable insights from conversations
- **Context Triggers**: Associates insights with specific keywords and situations

## API Endpoints

### Chat Endpoint
```
POST /orchestrator/chat
{
  "message": "User message",
  "systemicLedger": { /* optional project context */ },
  "stream": false
}
```

### Context Generation
```
POST /orchestrator/context
{
  "task": "Task description",
  "builderType": "code|design|planning|analysis",
  "mission": { /* optional */ },
  "pillars": [ /* optional */ ]
}
```

### Wisdom Management
```
GET /orchestrator/wisdom
POST /orchestrator/wisdom
GET /orchestrator/chat/history
```

## Testing

### Health Check
```bash
curl http://localhost:3002/health
```

### Test Chat
```bash
curl -X POST http://localhost:3002/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me with my project?"}'
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check environment variables are set correctly
   - Verify API key is valid and has sufficient credits
   - Check provider selection in `AI_PROVIDER` variable

2. **Rate Limiting**
   - Reduce request frequency
   - Check API provider's rate limits
   - Consider upgrading API plan

3. **Model Not Available**
   - Verify model name is correct
   - Check if model is available in your region
   - Try a different model variant

### Fallback Behavior
If AI services are unavailable, the system will:
- Return helpful fallback responses
- Continue to function with simulated AI
- Log errors for debugging
- Maintain all other functionality

## Security Considerations

- API keys are stored in environment variables only
- No API keys are logged or exposed in responses
- Rate limiting is implemented to prevent abuse
- Input validation and sanitization are in place
- Error messages don't expose sensitive information

## Next Steps

1. **Choose AI Provider**: Select OpenAI, Gemini, or Claude based on your needs
2. **Get API Key**: Sign up and obtain API key from chosen provider
3. **Configure Environment**: Set up environment variables
4. **Test Integration**: Verify chat functionality works
5. **Monitor Usage**: Track API usage and costs
6. **Customize Prompts**: Adjust system prompts for your specific use case

## Support

For issues with AI integration:
1. Check the troubleshooting section above
2. Verify API provider status
3. Review server logs for detailed error messages
4. Test with different AI providers if needed 