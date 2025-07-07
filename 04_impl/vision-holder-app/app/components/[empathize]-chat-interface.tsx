'use client';

// [empathize] Chat Interface Component
// AI chat with voice input and file uploads for users with dyslexia

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Upload, 
  File, 
  X, 
  Download,
  MessageCircle,
  Bot,
  User,
  Loader
} from 'lucide-react';
import { aiOrchestratorAPI } from '../services/[accelerate]-service-integration';
import HandoffManager from './[empathize]-handoff-manager';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: File[];
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
  onNewEntry?: (entry: any) => void;
  systemicLedger?: any; // Add Systemic Ledger context
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  className = '',
  onNewEntry,
  systemicLedger
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [showHandoffManager, setShowHandoffManager] = useState(false);
  const [wisdomMemoryData, setWisdomMemoryData] = useState<any>({});
  const [userPreferences, setUserPreferences] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user preferences and wisdom memory data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user preferences
        const prefsResponse = await aiOrchestratorAPI.getUserPreferences();
        if (prefsResponse) {
          setUserPreferences(prefsResponse);
        }

        // Load wisdom memory
        const wisdomResponse = await aiOrchestratorAPI.getWisdomInsights();
        if (wisdomResponse) {
          setWisdomMemoryData(wisdomResponse);
        }
      } catch (error) {
        console.error('[empathize] Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Monitor conversation length for handoff triggers
  useEffect(() => {
    // Auto-show handoff manager when conversation gets long
    if (messages.length > 50) {
      setShowHandoffManager(true);
    }
  }, [messages.length]);

  // Start voice recording
  const startRecording = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Save conversation to knowledge base
  const saveConversationToKnowledgeBase = async (userMessage: ChatMessage, aiMessage: ChatMessage) => {
    try {
      // Create chat session document for knowledge base
      const chatSession = {
        session_id: `chat_${Date.now()}`,
        messages: [userMessage, aiMessage],
        metadata: {
          user_id: 'default_user',
          session_start: userMessage.timestamp.toISOString(),
          session_end: aiMessage.timestamp.toISOString(),
          topics: extractTopicsFromMessages([userMessage, aiMessage]),
          key_decisions: extractKeyDecisions([userMessage, aiMessage]),
          ai_commitments: extractAICommitments([aiMessage])
        },
        type: 'chat_session'
      };

      // Save to knowledge base using the existing API
      const formData = new FormData();
      const chatBlob = new Blob([JSON.stringify(chatSession, null, 2)], { type: 'application/json' });
      formData.append('file', chatBlob, `chat_session_${Date.now()}.json`);
      formData.append('name', `Chat Session - ${new Date().toLocaleString()}`);
      formData.append('description', `AI conversation about: ${userMessage.content.slice(0, 100)}...`);
      formData.append('tags', 'chat_session,conversation,ai_interaction');

      // Upload to knowledge base (port 3003)
      await fetch('http://localhost:3003/knowledge/upload', {
        method: 'POST',
        body: formData
      });

      console.log('[empathize] Chat session saved to knowledge base');
    } catch (error) {
      console.error('[empathize] Failed to save chat to knowledge base:', error);
    }
  };

  // Extract topics from messages
  const extractTopicsFromMessages = (messages: ChatMessage[]): string[] => {
    const topics = new Set<string>();
    const keywords = ['accessibility', 'dyslexia', 'adhd', 'vision holder', 'ai', 'chat', 'handoff'];
    
    messages.forEach(msg => {
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          topics.add(keyword);
        }
      });
    });
    
    return Array.from(topics);
  };

  // Extract key decisions from messages
  const extractKeyDecisions = (messages: ChatMessage[]): string[] => {
    return messages
      .filter(msg => 
        msg.content.toLowerCase().includes('decision') || 
        msg.content.toLowerCase().includes('decided') ||
        msg.content.toLowerCase().includes('chosen')
      )
      .map(msg => msg.content.slice(0, 100));
  };

  // Extract AI commitments
  const extractAICommitments = (messages: ChatMessage[]): any[] => {
    return messages
      .filter(msg => 
        msg.type === 'ai' && (
          msg.content.toLowerCase().includes('i will') || 
          msg.content.toLowerCase().includes("i'll") ||
          msg.content.toLowerCase().includes('i can help')
        )
      )
      .map(msg => ({
        content: msg.content.slice(0, 100),
        timestamp: msg.timestamp.toISOString()
      }));
  };

  // Send message with real AI integration
  const sendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    console.log('Sending message:', inputValue);
    
    // Store the message before clearing the input
    const messageText = inputValue.trim();
    const messageAttachments = [...attachments];

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      attachments: messageAttachments
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsProcessing(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      console.log('Making API call to /orchestrator/chat');
      const requestData = {
        message: messageText,
        systemicLedger: systemicLedger,
        attachments: messageAttachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
      };
      console.log('Chat request data:', requestData);
      
      // Call the new real AI chat endpoint
      const response = await aiOrchestratorAPI.post<{
        response: string;
        context: string;
        wisdom_insights: any[];
        new_insights_count: number;
      }>('/orchestrator/chat', requestData);
      console.log('API response received:', response);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response || 'I understand your request. How can I help you with your vision?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save conversation to knowledge base for future context retrieval
      await saveConversationToKnowledgeBase(userMessage, aiMessage);

      // Trigger new entry callback if provided
      if (onNewEntry) {
        onNewEntry({
          type: 'chat',
          content: messageText,
          response: aiMessage.content,
          timestamp: new Date(),
          wisdom_insights: response.wisdom_insights,
          new_insights_count: response.new_insights_count
        });
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Co-Vision Chat</h3>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowHandoffManager(!showHandoffManager)}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Context Manager
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            <span>{isProcessing ? 'AI thinking...' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Handoff Manager */}
      {showHandoffManager && (
        <div className="border-b bg-gray-50 dark:bg-gray-900/50">
          <HandoffManager
            className="p-4"
            systemicLedgerData={systemicLedger}
            wisdomMemoryData={wisdomMemoryData}
            conversationHistory={messages}
            userPreferences={userPreferences}
            onHandoffTriggered={(handoffId) => {
              console.log('[empathize] Handoff triggered:', handoffId);
              // In production, this would initiate the actual AI handoff
            }}
            onHandoffComplete={(handoffId) => {
              console.log('[empathize] Handoff completed:', handoffId);
              // Add system message about seamless transition
              const systemMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'ai',
                content: 'I\'m your fresh AI assistant, seamlessly continuing our conversation. All your preferences and context have been preserved. How can I help you next?',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, systemMessage]);
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Welcome to your AI Co-Vision Holder!</p>
            <p className="text-sm">Start a conversation to get personalized guidance for your vision.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex items-center space-x-1">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs opacity-75">
                            <File className="w-3 h-3" />
                            <span>{file.name}</span>
                            <span>({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 p-2 bg-white rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Attachments:</span>
              <button
                onClick={() => setAttachments([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <File className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              rows={1}
              disabled={isProcessing}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
          </div>
          
          {/* Voice Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-2 rounded-lg ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload files"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && attachments.length === 0) || isProcessing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility Note */}
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Use voice input for easier communication, or upload files to share context with your AI partner.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 