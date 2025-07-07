// [accelerate] AI Service Integration
// Probe-01: Real AI provider integration for enhanced capabilities

import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// AI Provider Configuration
interface AIConfig {
  provider: 'openai' | 'gemini' | 'claude' | 'ollama';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl?: string | undefined; // For Ollama local server
}

// AI Service Interface
export interface AIService {
  generateText(prompt: string, context?: string): Promise<string>;
  analyzeDocument(content: string, type: string): Promise<DocumentAnalysis>;
  generateContext(query: string, history: string[]): Promise<string>;
  extractInsights(text: string): Promise<WisdomInsight[]>;
}

// AI Response Types
export interface DocumentAnalysis {
  summary: string;
  key_points: string[];
  relevance_score: number;
  suggested_tags: string[];
  confidence_score: number;
}

export interface WisdomInsight {
  insight: string;
  relevance_score: number;
  category: string;
  context_trigger: string;
  created_at: string;
}

// Configuration Management
class AIConfigManager {
  private config: AIConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AIConfig {
    // Priority: Environment variables > Auto-detect based on available keys
    let provider = process.env['AI_PROVIDER'] as 'openai' | 'gemini' | 'claude' | 'ollama';
    
    // Auto-detect provider if not specified
    if (!provider || provider === 'auto') {
      if (process.env['GEMINI_API_KEY']) {
        provider = 'gemini';
      } else if (process.env['ANTHROPIC_API_KEY']) {
        provider = 'claude';
      } else if (process.env['OPENAI_API_KEY']) {
        provider = 'openai';
      } else {
        provider = 'ollama'; // Fallback to local
      }
    }
    
    return {
      provider,
      apiKey: this.getAPIKey(provider),
      model: this.getModel(provider),
      maxTokens: parseInt(process.env['AI_MAX_TOKENS'] || '2000'),
      temperature: parseFloat(process.env['AI_TEMPERATURE'] || '0.7'),
      baseUrl: process.env['OLLAMA_BASE_URL'] || undefined
    };
  }

  private getAPIKey(provider: string): string {
    switch (provider) {
      case 'openai':
        return process.env['OPENAI_API_KEY'] || '';
      case 'gemini':
        return process.env['GEMINI_API_KEY'] || '';
      case 'claude':
        return process.env['ANTHROPIC_API_KEY'] || '';
      case 'ollama':
        return 'local'; // Ollama doesn't need an API key
      default:
        return '';
    }
  }

  private getModel(provider: string): string {
    switch (provider) {
      case 'openai':
        return process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
      case 'gemini':
        return process.env['GEMINI_MODEL'] || 'gemini-1.5-flash';
      case 'claude':
        return process.env['CLAUDE_MODEL'] || 'claude-3-haiku-20240307';
      case 'ollama':
        return process.env['OLLAMA_MODEL'] || 'llama3.2:3b';
      default:
        return 'gpt-4o-mini';
    }
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return this.config.apiKey !== '';
  }
}

// OpenAI Integration
class OpenAIService implements AIService {
  private client: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `You are a Co-Vision Holder AI assistant, specifically designed to support visionary users with dyslexia and ADHD. 

Your role is to:
- Provide clear, concise, and actionable insights
- Use visual language and structured responses when helpful
- Break down complex concepts into digestible pieces
- Support the user's vision-building process
- Learn from user interactions to provide increasingly personalized assistance

Always be encouraging, patient, and focused on helping the user move their vision forward.`
        }
      ];

      if (context) {
        messages.push({
          role: 'user',
          content: `Context: ${context}\n\nQuery: ${prompt}`
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt
        });
      }

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: false,
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Provide a helpful fallback response
      return 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again in a moment, or check your internet connection.';
    }
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    try {
      const prompt = `
Analyze this ${type} document and provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Relevance score (0.0-1.0) for project management
4. Suggested tags (3-5 keywords)
5. Confidence score (0.0-1.0) for analysis quality

Document content:
${content.substring(0, 8000)} ${content.length > 8000 ? '...' : ''}

Respond in JSON format:
{
  "summary": "...",
  "key_points": ["...", "..."],
  "relevance_score": 0.0,
  "suggested_tags": ["...", "..."],
  "confidence_score": 0.0
}`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a document analysis expert. Provide structured analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content_text = response.choices[0]?.message?.content || '{}';
      const analysis = JSON.parse(content_text);
      
      return {
        summary: analysis.summary || 'Document analysis completed',
        key_points: analysis.key_points || ['Key information extracted'],
        relevance_score: analysis.relevance_score || 0.7,
        suggested_tags: analysis.suggested_tags || ['document'],
        confidence_score: analysis.confidence_score || 0.8
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      // Fallback analysis
      return {
        summary: `${type} document containing ${content.length} characters of content`,
        key_points: ['Document uploaded successfully', 'Content available for review'],
        relevance_score: 0.5,
        suggested_tags: [type, 'document'],
        confidence_score: 0.6
      };
    }
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    try {
      const historyContext = history.length > 0 ? `Previous conversation:\n${history.join('\n')}\n\n` : '';
      const prompt = `${historyContext}Current query: ${query}\n\nGenerate relevant context for this conversation.`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a context generation expert. Provide relevant context for conversations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || 'Context generated';
    } catch (error) {
      console.error('Context generation error:', error);
      return 'Context generation failed';
    }
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    try {
      const prompt = `
Extract insights from this text that could help understand user preferences and patterns:

${text.substring(0, 4000)} ${text.length > 4000 ? '...' : ''}

Provide insights in JSON format:
[
  {
    "insight": "Brief insight description",
    "relevance_score": 0.0-1.0,
    "category": "preference|pattern|need",
    "context_trigger": "keyword for triggering this insight"
  }
]`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an insight extraction expert. Provide insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
      });

      const content_text = response.choices[0]?.message?.content || '[]';
      const insights = JSON.parse(content_text);
      
      return insights.map((insight: any) => ({
        insight: insight.insight || 'User preference identified',
        relevance_score: insight.relevance_score || 0.7,
        category: insight.category || 'preference',
        context_trigger: insight.context_trigger || 'general',
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Insight extraction error:', error);
      return [];
    }
  }
}

// Gemini Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService implements AIService {
  private client: GoogleGenerativeAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      
      const fullPrompt = context 
        ? `Context: ${context}\n\nUser Query: ${prompt}\n\nPlease provide a helpful, clear response that addresses the user's question while considering the provided context.`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text() || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'I apologize, but I\'m having trouble connecting to the Gemini AI service right now. Please try again in a moment.';
    }
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      
      const prompt = `
Analyze this ${type} document and provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Relevance score (0.0-1.0) for project management
4. Suggested tags (3-5 keywords)
5. Confidence score (0.0-1.0) for analysis quality

Document content:
${content.substring(0, 8000)} ${content.length > 8000 ? '...' : ''}

Respond in JSON format:
{
  "summary": "...",
  "key_points": ["...", "..."],
  "relevance_score": 0.0,
  "suggested_tags": ["...", "..."],
  "confidence_score": 0.0
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content_text = response.text() || '{}';
      const analysis = JSON.parse(content_text);
      
      return {
        summary: analysis.summary || 'Document analysis completed',
        key_points: analysis.key_points || ['Key information extracted'],
        relevance_score: analysis.relevance_score || 0.7,
        suggested_tags: analysis.suggested_tags || ['document'],
        confidence_score: analysis.confidence_score || 0.8
      };
    } catch (error) {
      console.error('Gemini document analysis error:', error);
      return {
        summary: `${type} document containing ${content.length} characters of content`,
        key_points: ['Document uploaded successfully', 'Content available for review'],
        relevance_score: 0.5,
        suggested_tags: [type, 'document'],
        confidence_score: 0.6
      };
    }
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      
      const historyText = history.length > 0 ? `Previous conversation:\n${history.join('\n')}\n\n` : '';
      const prompt = `${historyText}Generate context for: ${query}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'Context generated';
    } catch (error) {
      console.error('Gemini context generation error:', error);
      return `Context for: ${query}`;
    }
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      
      const prompt = `
Extract insights from this text that could help understand user preferences and patterns:

${text.substring(0, 4000)} ${text.length > 4000 ? '...' : ''}

Provide insights in JSON format:
[
  {
    "insight": "Brief insight description",
    "relevance_score": 0.0-1.0,
    "category": "preference|pattern|need",
    "context_trigger": "keyword for triggering this insight"
  }
]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content_text = response.text() || '[]';
      const insights = JSON.parse(content_text);
      
      return insights.map((insight: any) => ({
        insight: insight.insight || 'User preference identified',
        relevance_score: insight.relevance_score || 0.7,
        category: insight.category || 'preference',
        context_trigger: insight.context_trigger || 'general',
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Gemini insight extraction error:', error);
      return [{
        insight: 'Gemini-based insight extraction completed',
        relevance_score: 0.7,
        category: 'general',
        context_trigger: 'When using Gemini service',
        created_at: new Date().toISOString()
      }];
    }
  }
}

// Claude Integration (Anthropic)
class ClaudeService implements AIService {
  private client: Anthropic;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nHuman: ${prompt}\n\nAssistant:`
        : `Human: ${prompt}\n\nAssistant:`;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      // Extract text from Claude response
      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      
      return 'No response generated';
    } catch (error) {
      console.error('Claude API error:', error);
      return 'I apologize, but I\'m having trouble connecting to Claude right now. Please try again in a moment.';
    }
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    try {
      const prompt = `
Analyze this ${type} document and provide a structured analysis in JSON format:

${content.substring(0, 8000)}${content.length > 8000 ? '...' : ''}

Please respond with a JSON object containing:
{
  "summary": "2-3 sentence summary",
  "key_points": ["point 1", "point 2", "point 3"],
  "relevance_score": 0.8,
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "confidence_score": 0.9
}`;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content_text = response.content[0];
      if (content_text.type === 'text') {
        try {
          const analysis = JSON.parse(content_text.text);
          return {
            summary: analysis.summary || 'Document analysis completed',
            key_points: analysis.key_points || ['Key information extracted'],
            relevance_score: analysis.relevance_score || 0.7,
            suggested_tags: analysis.suggested_tags || ['document'],
            confidence_score: analysis.confidence_score || 0.8
          };
        } catch (parseError) {
          // Fallback if JSON parsing fails
          return {
            summary: content_text.text.substring(0, 200),
            key_points: ['Document processed by Claude', 'Analysis completed'],
            relevance_score: 0.7,
            suggested_tags: [type, 'claude-analyzed'],
            confidence_score: 0.7
          };
        }
      }

      throw new Error('No valid response from Claude');
    } catch (error) {
      console.error('Claude document analysis error:', error);
      return {
        summary: `${type} document containing ${content.length} characters`,
        key_points: ['Document uploaded successfully', 'Content available for review'],
        relevance_score: 0.5,
        suggested_tags: [type, 'document'],
        confidence_score: 0.6
      };
    }
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    try {
      const historyContext = history.length > 0 ? `Previous conversation:\n${history.join('\n')}\n\n` : '';
      const prompt = `${historyContext}Current query: ${query}\n\nGenerate relevant context for this conversation.`;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      
      return `Context for "${query}" based on conversation history`;
    } catch (error) {
      console.error('Claude context generation error:', error);
      return `Context for "${query}" based on conversation history`;
    }
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    try {
      const prompt = `
Analyze this conversation and extract insights about user preferences, patterns, or important information.
Return a JSON array of insights with this format:
[
  {
    "insight": "description of the insight",
    "relevance_score": 0.8,
    "category": "preference|pattern|technical|personal",
    "context_trigger": "keyword or phrase that triggers this insight"
  }
]

Conversation text:
${text}`;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 800,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const insights = JSON.parse(content.text);
          return insights.map((insight: any) => ({
            insight: insight.insight || 'User preference identified',
            relevance_score: insight.relevance_score || 0.7,
            category: insight.category || 'preference',
            context_trigger: insight.context_trigger || 'general',
            created_at: new Date().toISOString()
          }));
        } catch (parseError) {
          // Fallback insight
          return [{
            insight: 'Claude extracted insights from conversation',
            relevance_score: 0.7,
            category: 'general',
            context_trigger: 'conversation',
            created_at: new Date().toISOString()
          }];
        }
      }

      return [];
    } catch (error) {
      console.error('Claude insight extraction error:', error);
      return [];
    }
  }
}

// Ollama Integration (Free Local AI)
class OllamaService implements AIService {
  private config: AIConfig;
  private baseUrl: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}\nAssistant:` : prompt;
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama service error:', error);
      return `[Ollama Error] I'm having trouble connecting to the local AI service. Please check if Ollama is running. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    const prompt = `Analyze this ${type} document and provide insights:\n\n${content}`;
    const analysis = await this.generateText(prompt);
    
    return {
      summary: analysis.substring(0, 200) + '...',
      key_points: [
        'Document analyzed using local Ollama AI',
        'Content processed successfully',
        'Local AI provides privacy and cost benefits'
      ],
      relevance_score: 0.7,
      suggested_tags: [type.toLowerCase(), 'ollama', 'local-ai'],
      confidence_score: 0.6
    };
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    const historyText = history.length > 0 ? `Previous conversation:\n${history.join('\n')}\n\n` : '';
    const prompt = `${historyText}Generate context for: ${query}`;
    return await this.generateText(prompt);
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    const prompt = `Extract key insights from this text:\n\n${text}`;
    const insights = await this.generateText(prompt);
    
    return [{
      insight: insights.substring(0, 150) + '...',
      relevance_score: 0.8,
      category: 'ollama-analysis',
      context_trigger: 'When analyzing content with local AI',
      created_at: new Date().toISOString()
    }];
  }
}

// Fallback Service (when no API keys are configured)
class FallbackService implements AIService {
  async generateText(prompt: string, context?: string): Promise<string> {
    return `[Simulated Response] Thank you for your question: "${prompt}". This is a simulated response as no AI service is configured. Please set up API keys for OpenAI, Gemini, or Claude to enable real AI responses.`;
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    return {
      summary: `${type} document containing ${content.length} characters. This is a simulated analysis.`,
      key_points: [
        'Document uploaded successfully',
        'Content is available for review',
        'Configure AI service for detailed analysis'
      ],
      relevance_score: 0.6,
      suggested_tags: [type.toLowerCase(), 'uploaded', 'pending-analysis'],
      confidence_score: 0.5
    };
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    return `Context: User is asking about "${query}" with ${history.length} previous interactions. Configure AI service for intelligent context generation.`;
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    return [{
      insight: 'Configure AI service to extract meaningful insights from your content',
      relevance_score: 0.8,
      category: 'system',
      context_trigger: 'When setting up AI integration',
      created_at: new Date().toISOString()
    }];
  }
}

// AI Service Factory
export class AIServiceFactory {
  private static instance: AIService | null = null;
  private static configManager: AIConfigManager = new AIConfigManager();

  static getInstance(): AIService {
    if (!this.instance) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  static createService(): AIService {
    const config = this.configManager.getConfig();
    
    // Check if Ollama is available first (free option)
    if (config.provider === 'ollama') {
      console.log('Using Ollama local AI service (free)');
      return new OllamaService(config);
    }
    
    if (!this.configManager.isConfigured()) {
      console.warn('No AI service configured. Using fallback service.');
      return new FallbackService();
    }

    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config);
      case 'gemini':
        return new GeminiService(config);
      case 'claude':
        return new ClaudeService(config);
      default:
        console.warn('Unknown AI provider. Using fallback service.');
        return new FallbackService();
    }
  }

  static getConfig(): AIConfig {
    return this.configManager.getConfig();
  }

  static resetInstance(): void {
    this.instance = null;
  }
}

// Usage utilities
export const aiService = AIServiceFactory.getInstance();

// Export for testing and direct usage
export {
  AIConfigManager,
  OpenAIService,
  GeminiService,
  ClaudeService,
  OllamaService,
  FallbackService
}; 