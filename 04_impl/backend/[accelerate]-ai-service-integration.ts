// [accelerate] AI Service Integration
// Probe-01: Real AI provider integration for enhanced capabilities

import { OpenAI } from 'openai';
// Note: Install @google/generative-ai package for Gemini support
// import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Provider Configuration
interface AIConfig {
  provider: 'openai' | 'gemini' | 'claude';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
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
    // Priority: Environment variables > Default configuration
    const provider = (process.env['AI_PROVIDER'] as 'openai' | 'gemini' | 'claude') || 'openai';
    
    return {
      provider,
      apiKey: this.getAPIKey(provider),
      model: this.getModel(provider),
      maxTokens: parseInt(process.env['AI_MAX_TOKENS'] || '2000'),
      temperature: parseFloat(process.env['AI_TEMPERATURE'] || '0.7')
    };
  }

  private getAPIKey(provider: string): string {
    switch (provider) {
      case 'openai':
        return process.env['OPENAI_API_KEY'] || '';
      case 'gemini':
        return process.env['GEMINI_API_KEY'] || '';
      case 'claude':
        return process.env['CLAUDE_API_KEY'] || '';
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
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a helpful AI assistant for the Vision Holder project, designed to support visionary users with dyslexia and ADHD. Be concise, clear, and focus on actionable insights.'
        }
      ];

      if (context) {
        messages.push({
          role: 'system',
          content: `Context: ${context}\n\nQuery: ${prompt}`
        });
      } else {
        messages.push({
          role: 'system' as const,
          content: prompt
        });
      }

      console.log(messages);

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate text with OpenAI');
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
        relevance_score: 0.6,
        suggested_tags: [type.toLowerCase(), 'uploaded'],
        confidence_score: 0.5
      };
    }
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    try {
      const prompt = `
Based on the conversation history and current query, generate a minimal context prompt that captures the essential information needed to provide a helpful response.

Query: ${query}
Recent History: ${history.slice(-5).join('\n')}

Generate a concise context prompt (max 200 words) that includes:
1. Current user intent
2. Relevant historical context
3. Key constraints or preferences
4. Expected response format

Context prompt:`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a context engineering expert. Generate minimal, effective context prompts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || 'Context: User query about project management';
    } catch (error) {
      console.error('Context generation error:', error);
      return `Context: User is asking about "${query}" in the context of project management`;
    }
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    try {
      const prompt = `
Extract actionable insights from this text that would be valuable for future project decisions.

Text: ${text.substring(0, 4000)}

Generate 2-3 insights in JSON format:
{
  "insights": [
    {
      "insight": "Specific actionable insight",
      "relevance_score": 0.0,
      "category": "planning|execution|communication|technology",
      "context_trigger": "When to apply this insight"
    }
  ]
}`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a wisdom extraction expert. Generate actionable insights from text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.6,
      });

      const content_text = response.choices[0]?.message?.content || '{"insights": []}';
      const result = JSON.parse(content_text);
      
      return result.insights.map((insight: any) => ({
        insight: insight.insight || 'Insight extracted from text',
        relevance_score: insight.relevance_score || 0.7,
        category: insight.category || 'general',
        context_trigger: insight.context_trigger || 'When making project decisions',
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Insight extraction error:', error);
      return [{
        insight: 'Text contains valuable information for project reference',
        relevance_score: 0.6,
        category: 'general',
        context_trigger: 'When reviewing project materials',
        created_at: new Date().toISOString()
      }];
    }
  }
}

// Gemini Integration
class GeminiService implements AIService {
  private client: any; // GoogleGenerativeAI when package is installed
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    console.warn('Gemini service requires @google/generative-ai package. Using fallback responses.');
    // this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    // Placeholder implementation until @google/generative-ai is installed
    return `[Gemini Service] Response to: ${prompt}${context ? ` (Context: ${context.substring(0, 100)}...)` : ''}. Install @google/generative-ai package for full functionality.`;
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    return {
      summary: `${type} document analysis via Gemini service (install @google/generative-ai for full functionality)`,
      key_points: ['Document processed', 'Content analyzed'],
      relevance_score: 0.7,
      suggested_tags: [type.toLowerCase(), 'gemini-analyzed'],
      confidence_score: 0.7
    };
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    return `Context for "${query}" based on conversation history (install @google/generative-ai for full functionality)`;
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    return [{
      insight: 'Gemini-based insight extraction (install @google/generative-ai for full functionality)',
      relevance_score: 0.7,
      category: 'general',
      context_trigger: 'When using Gemini service',
      created_at: new Date().toISOString()
    }];
  }
}

// Claude Integration (placeholder for future implementation)
class ClaudeService implements AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    console.warn('Claude integration not yet implemented. Using fallback responses.');
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    // Placeholder implementation
    return `[Claude Service] Response to: ${prompt}${context ? ` (Context: ${context.substring(0, 100)}...)` : ''}`;
  }

  async analyzeDocument(content: string, type: string): Promise<DocumentAnalysis> {
    return {
      summary: `${type} document analysis via Claude service`,
      key_points: ['Document processed', 'Content analyzed'],
      relevance_score: 0.7,
      suggested_tags: [type.toLowerCase(), 'claude-analyzed'],
      confidence_score: 0.7
    };
  }

  async generateContext(query: string, history: string[]): Promise<string> {
    return `Context for "${query}" based on conversation history`;
  }

  async extractInsights(text: string): Promise<WisdomInsight[]> {
    return [{
      insight: 'Claude-based insight extraction',
      relevance_score: 0.7,
      category: 'general',
      context_trigger: 'When using Claude service',
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
  FallbackService
}; 