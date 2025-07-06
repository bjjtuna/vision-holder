'use client';

// [accelerate] Knowledge Base View Component
// Based on UX vision: /02_intent/[empathize]-user-experience-vision.md

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Download,
  Trash2,
  Edit,
  Star,
  Tag,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Brain,
  MessageSquare
} from 'lucide-react';

interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  uploaded_at: string;
  tags: string[];
  description?: string;
  ai_analysis?: {
    summary: string;
    key_points: string[];
    relevance_score: number;
    suggested_tags: string[];
  };
  url: string;
  is_analyzed: boolean;
}

interface KnowledgeBaseViewProps {
  className?: string;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ className = '' }) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'relevance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3003/knowledge/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        throw new Error('Failed to load documents');
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load knowledge base. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file, i, files.length);
      }
      
      setShowUploadModal(false);
      setNewDocument({ name: '', description: '', tags: '' });
      loadDocuments(); // Refresh the list
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFile = async (file: File, index: number, total: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', newDocument.name || file.name);
    formData.append('description', newDocument.description);
    formData.append('tags', newDocument.tags);

    const response = await fetch('http://localhost:3003/knowledge/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }

    // Update progress
    const progress = ((index + 1) / total) * 100;
    setUploadProgress(progress);
  };

  const analyzeDocument = async (documentId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/knowledge/analyze/${documentId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const analysis = await response.json();
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, ai_analysis: analysis.analysis, is_analyzed: true }
            : doc
        ));
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze document. Please try again.');
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/knowledge/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-6 h-6" />;
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <Music className="w-6 h-6" />;
      case 'archive': return <Archive className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'relevance':
          comparison = (b.ai_analysis?.relevance_score || 0) - (a.ai_analysis?.relevance_score || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            Loading knowledge base...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
            Connection Issue
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly mb-4">
            {error}
          </p>
          <button
            onClick={loadDocuments}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex ${className}`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-dyslexia-friendly">
              Knowledge Base
            </h1>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="archive">Archives</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="relevance">Relevance</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-auto">
          {filteredAndSortedDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly mb-4">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
                  >
                    Upload Document
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4">
                {filteredAndSortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer transition-all hover:shadow-md ${
                      selectedDocument?.id === doc.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-primary-600 dark:text-primary-400">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly truncate">
                            {doc.name}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly mt-1">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            {doc.ai_analysis && (
                              <span className="flex items-center">
                                <Brain className="w-3 h-3 mr-1" />
                                Analyzed
                              </span>
                            )}
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-dyslexia-friendly"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!doc.is_analyzed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              analyzeDocument(doc.id);
                            }}
                            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition-colors"
                            title="Analyze with AI"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.url, '_blank');
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Details Sidebar */}
      {selectedDocument && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
                Document Details
              </h2>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-dyslexia-friendly mb-2">
                  {selectedDocument.name}
                </h3>
                {selectedDocument.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                    {selectedDocument.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{selectedDocument.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>
                  <span className="text-gray-900 dark:text-white">{formatFileSize(selectedDocument.size)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedDocument.uploaded_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-dyslexia-friendly mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded text-dyslexia-friendly"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.ai_analysis && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-dyslexia-friendly mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Analysis
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white text-dyslexia-friendly mb-1">
                        Summary
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                        {selectedDocument.ai_analysis.summary}
                      </p>
                    </div>
                    {selectedDocument.ai_analysis.key_points.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white text-dyslexia-friendly mb-1">
                          Key Points
                        </h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly space-y-1">
                          {selectedDocument.ai_analysis.key_points.map((point, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Relevance Score:</span>
                      <span className="text-gray-900 dark:text-white">
                        {Math.round(selectedDocument.ai_analysis.relevance_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => window.open(selectedDocument.url, '_blank')}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedDocument.url;
                    link.download = selectedDocument.name;
                    link.click();
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-dyslexia-friendly"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
                Upload Document
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly mb-2">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newDocument.tags}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly mb-2">
                  Select Files
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 text-dyslexia-friendly">
                    Supports documents, images, videos, and more
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="*/*"
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-dyslexia-friendly"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 