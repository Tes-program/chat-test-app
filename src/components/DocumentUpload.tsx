/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DocumentUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { UploadedDocument } from '@/types/chat';

interface DocumentUploadProps {
  sessionId: string;
  documents: UploadedDocument[];
  onUploadSuccess: (document: UploadedDocument) => void;
  onDeleteDocument: (documentId: number) => void;
  disabled?: boolean;
}

export const DocumentUpload = ({ 
  sessionId, 
  documents, 
  onUploadSuccess, 
  onDeleteDocument,
  disabled 
}: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload PDF, DOCX, TXT, or Excel files.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { chatAPI } = await import('@/utils/api');
      const response = await chatAPI.uploadDocument(file, sessionId);

      if (response.success) {
        const newDocument: UploadedDocument = {
          id: response.data.documentId,
          fileName: response.data.fileName,
          fileType: response.data.fileType,
          fileSize: file.size,
          storageUrl: response.data.storageUrl,
          uploadStatus: 'completed',
          chunkCount: response.data.totalChunks,
          createdAt: new Date().toISOString(),
        };

        onUploadSuccess(newDocument);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error : any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    return '📎';
  };

  return (
    <div className="border-t bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <File className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Documents ({documents.length})</span>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt,.xls,.xlsx"
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto chat-scrollbar">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(doc.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {doc.fileName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    {doc.chunkCount && (
                      <>
                        <span>•</span>
                        <span>{doc.chunkCount} chunks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {doc.uploadStatus === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {doc.uploadStatus === 'processing' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {doc.uploadStatus === 'failed' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}

                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  disabled={disabled}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  title="Remove document"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {documents.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Upload documents (PDF, DOCX, TXT, Excel) to enhance chat context. Max 10MB.
        </p>
      )}
    </div>
  );
};