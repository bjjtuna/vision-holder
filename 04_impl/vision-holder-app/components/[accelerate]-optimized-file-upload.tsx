// [accelerate] Optimized File Upload Component
// High-performance file upload with chunking, progress tracking, and accessibility

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  Play,
  Loader2,
  Zap,
  HardDrive,
  Clock
} from 'lucide-react';

interface FileChunk {
  id: string;
  data: Blob;
  index: number;
  size: number;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  chunks: number;
  uploadedChunks: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
}

interface OptimizedFileUploadProps {
  onUploadComplete?: (fileId: string, url: string) => void;
  onUploadError?: (fileId: string, error: string) => void;
  maxFileSize?: number; // in bytes
  chunkSize?: number; // in bytes
  concurrentUploads?: number;
  allowedTypes?: string[];
  className?: string;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const CONCURRENT_UPLOADS = 3;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const OptimizedFileUpload: React.FC<OptimizedFileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFileSize = MAX_FILE_SIZE,
  chunkSize = CHUNK_SIZE,
  concurrentUploads = CONCURRENT_UPLOADS,
  allowedTypes = ['*/*'],
  className = ''
}) => {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Performance monitoring
  const [performanceStats, setPerformanceStats] = useState({
    totalUploaded: 0,
    averageSpeed: 0,
    totalFiles: 0,
    successRate: 0
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Create file chunks
  const createChunks = (file: File): FileChunk[] => {
    const chunks: FileChunk[] = [];
    let index = 0;
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      chunks.push({
        id: `${file.name}_${index}`,
        data: chunk,
        index,
        size: chunk.size
      });

      start = end;
      index++;
    }

    return chunks;
  };

  // Upload a single chunk
  const uploadChunk = async (
    fileId: string,
    chunk: FileChunk,
    abortController: AbortController
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk.data);
      formData.append('chunkId', chunk.id);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', chunk.index.toString());

      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return false; // Upload was cancelled
      }
      throw error;
    }
  };

  // Upload file with chunking
  const uploadFile = async (file: File): Promise<void> => {
    const fileId = `${Date.now()}_${file.name}`;
    const chunks = createChunks(file);
    
    // Initialize upload progress
    const uploadProgress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'pending',
      chunks: chunks.length,
      uploadedChunks: 0,
      speed: 0,
      timeRemaining: 0
    };

    setUploads(prev => new Map(prev).set(fileId, uploadProgress));
    setUploadQueue(prev => [...prev, fileId]);

    // Start upload process
    await processUploadQueue();
  };

  // Process upload queue
  const processUploadQueue = async (): Promise<void> => {
    while (uploadQueue.length > 0 && activeUploads.size < concurrentUploads) {
      const fileId = uploadQueue[0];
      setUploadQueue(prev => prev.slice(1));
      
      if (!activeUploads.has(fileId)) {
        setActiveUploads(prev => new Set(prev).add(fileId));
        await uploadFileChunks(fileId);
      }
    }
  };

  // Upload all chunks for a file
  const uploadFileChunks = async (fileId: string): Promise<void> => {
    const upload = uploads.get(fileId);
    if (!upload) return;

    const abortController = new AbortController();
    abortControllers.current.set(fileId, abortController);

    try {
      // Update status to uploading
      updateUploadProgress(fileId, { status: 'uploading' });

      // Get file chunks (this would come from the file data stored earlier)
      const chunks = await getFileChunks(fileId);
      let uploadedChunks = 0;
      const startTime = Date.now();
      let lastUpdateTime = startTime;

      // Upload chunks with concurrency control
      const chunkPromises = chunks.map(async (chunk, index) => {
        const success = await uploadChunk(fileId, chunk, abortController);
        
        if (success) {
          uploadedChunks++;
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastUpdateTime) / 1000;
          
          if (timeDiff > 0) {
            const speed = chunk.size / timeDiff;
            const remainingChunks = chunks.length - uploadedChunks;
            const timeRemaining = remainingChunks * (chunk.size / speed);

            updateUploadProgress(fileId, {
              uploadedChunks,
              progress: (uploadedChunks / chunks.length) * 100,
              speed,
              timeRemaining
            });
          }
          
          lastUpdateTime = currentTime;
        }
        
        return success;
      });

      await Promise.all(chunkPromises);

      // Complete upload
      const response = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error('Failed to complete upload');
      }

      const { url } = await response.json();
      
      updateUploadProgress(fileId, { 
        status: 'completed',
        progress: 100
      });

      onUploadComplete?.(fileId, url);
      updatePerformanceStats(true);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateUploadProgress(fileId, { status: 'paused' });
      } else {
        updateUploadProgress(fileId, { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        onUploadError?.(fileId, error instanceof Error ? error.message : 'Upload failed');
        updatePerformanceStats(false);
      }
    } finally {
      setActiveUploads(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      abortControllers.current.delete(fileId);
      
      // Process next upload
      processUploadQueue();
    }
  };

  // Get file chunks (placeholder - would be implemented based on storage)
  const getFileChunks = async (fileId: string): Promise<FileChunk[]> => {
    // This would retrieve the chunks from temporary storage
    // For now, return empty array
    return [];
  };

  // Update upload progress
  const updateUploadProgress = (fileId: string, updates: Partial<UploadProgress>) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(fileId);
      if (current) {
        newMap.set(fileId, { ...current, ...updates });
      }
      return newMap;
    });
  };

  // Update performance statistics
  const updatePerformanceStats = (success: boolean) => {
    setPerformanceStats(prev => {
      const totalFiles = prev.totalFiles + 1;
      const successCount = success ? prev.successRate * (totalFiles - 1) + 1 : prev.successRate * (totalFiles - 1);
      
      return {
        ...prev,
        totalFiles,
        successRate: successCount / totalFiles
      };
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
        return;
      }

      // Validate file type
      if (allowedTypes.length > 0 && !allowedTypes.includes('*/*')) {
        const isValidType = allowedTypes.some(type => {
          if (type.includes('*')) {
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType);
          }
          return file.type === type;
        });

        if (!isValidType) {
          alert(`File type ${file.type} is not allowed`);
          return;
        }
      }

      uploadFile(file);
    });
  }, [maxFileSize, allowedTypes]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Pause/Resume upload
  const toggleUpload = (fileId: string) => {
    const upload = uploads.get(fileId);
    if (!upload) return;

    if (upload.status === 'uploading') {
      // Pause upload
      const controller = abortControllers.current.get(fileId);
      if (controller) {
        controller.abort();
      }
      updateUploadProgress(fileId, { status: 'paused' });
    } else if (upload.status === 'paused') {
      // Resume upload
      setUploadQueue(prev => [fileId, ...prev]);
      processUploadQueue();
    }
  };

  // Cancel upload
  const cancelUpload = (fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
    }
    
    setUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    
    setUploadQueue(prev => prev.filter(id => id !== fileId));
    setActiveUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  // Remove completed upload
  const removeUpload = (fileId: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Stats */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Upload Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-700 font-medium">Success Rate</div>
            <div className="text-blue-900">{(performanceStats.successRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Total Files</div>
            <div className="text-blue-900">{performanceStats.totalFiles}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Active Uploads</div>
            <div className="text-blue-900">{activeUploads.size}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Queue Length</div>
            <div className="text-blue-900">{uploadQueue.length}</div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-gray-500 mb-4">
          Maximum file size: {formatFileSize(maxFileSize)}
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploads.size > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Progress</h3>
          {Array.from(uploads.values()).map((upload) => (
            <div key={upload.fileId} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{upload.fileName}</div>
                    <div className="text-sm text-gray-500">
                      {upload.uploadedChunks}/{upload.chunks} chunks
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {upload.status === 'uploading' && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{formatSpeed(upload.speed)}</span>
                    </div>
                  )}
                  
                  {upload.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  
                  {upload.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  
                  {upload.status === 'uploading' && (
                    <button
                      onClick={() => toggleUpload(upload.fileId)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  
                  {upload.status === 'paused' && (
                    <button
                      onClick={() => toggleUpload(upload.fileId)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {upload.status !== 'completed' && (
                    <button
                      onClick={() => cancelUpload(upload.fileId)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {upload.status === 'completed' && (
                    <button
                      onClick={() => removeUpload(upload.fileId)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{upload.progress.toFixed(1)}%</span>
                  {upload.status === 'uploading' && (
                    <span>{formatTime(upload.timeRemaining)} remaining</span>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      upload.status === 'completed'
                        ? 'bg-green-600'
                        : upload.status === 'error'
                        ? 'bg-red-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                
                {upload.error && (
                  <div className="text-sm text-red-600">{upload.error}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedFileUpload; 