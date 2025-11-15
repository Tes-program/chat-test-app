/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isShariahCompliant?: boolean;
  principlesInvolved?: string[];
  recommendedIssuances?: any[];
  platformActions?: string[];
  modelUsed?: string;
  cost?: number;
  sources?: Array<{ title: string; url: string }>;
}

export interface ChatSession {
  sessionId: string;
  userId: number;
  messages: ChatMessage[];
  isLoading: boolean;
  uploadedDocuments?: UploadedDocument[];
}

export interface UploadedDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  uploadStatus: 'processing' | 'completed' | 'failed';
  chunkCount?: number;
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    isShariahCompliant: boolean;
    principlesInvolved: string[];
    recommendedIssuances: any[];
    suggestedActions: string[];
    quickSuggestions: string[];
    sessionId: string;
    timestamp: string;
    personalized: boolean;
    modelUsed: string;
    cost: number;
    sources?: Array<{ title: string; url: string }>;
  };
}

export interface SessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    userId?: number;
    welcomeMessage: string;
    islamicPrinciples: string[];
    platformFeatures: string[];
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    documentId: number;
    fileName: string;
    fileType: string;
    totalChunks: number;
    storageUrl: string;
  };
}