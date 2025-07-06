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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  className = '',
  onNewEntry 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
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

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: [...attachments]
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
      // Prepare context for AI
      const context = {
        task: inputValue,
        builderType: 'chat',
        attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
        conversationHistory: messages.slice(-5).map(m => ({
          role: m.type,
          content: m.content
        }))
      };

      // Call AI Orchestrator
      const response = await aiOrchestratorAPI.post<{ data: any }>('/orchestrator/context', context);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.builder_instructions || 'I understand your request. How can I help you with your vision?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger new entry callback if provided
      if (onNewEntry) {
        onNewEntry({
          type: 'chat',
          content: inputValue,
          response: aiMessage.content,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
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
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Co-Vision Chat</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Chat with your AI partner using text or voice. Upload files to share context.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Co-Vision Chat</h3>
            <p className="text-gray-600 mb-4">
              Start a conversation with your AI partner. You can type or use voice input.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Mic className="w-4 h-4" />
                <span>Voice Input</span>
              </div>
              <div className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                <span>File Upload</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                      >
                        <File className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center order-2">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
              >
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(file.size)})
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Upload file"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {/* Voice Input */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
              aria-pressed={isRecording}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={(!inputValue.trim() && attachments.length === 0) || isProcessing}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600" role="status" aria-live="polite">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span>Recording... Click the microphone to stop</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 