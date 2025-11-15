// src/utils/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const USER_ID = process.env.NEXT_PUBLIC_USER_ID || '1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'user-id': USER_ID,
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  createSession: async () => {
    const response = await api.post('/api/chatbot/session');
    return response.data;
  },

  sendMessage: async (message: string, sessionId: string, preferredProvider?: 'gemini' | 'openai') => {
    const response = await api.post('/api/chatbot/chat', {
      message,
      sessionId,
      preferredProvider,
    });
    return response.data;
  },

  getSessionHistory: async (sessionId: string) => {
    const response = await api.get(`/api/chatbot/session/${sessionId}/history`);
    return response.data;
  },

  getBudgetStatus: async () => {
    const response = await api.get('/api/chatbot/budget-status');
    return response.data;
  },

  getHealthCheck: async () => {
    const response = await api.get('/api/chatbot/health');
    return response.data;
  },

  // NEW: Document upload endpoints
  uploadDocument: async (file: File, sessionId: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('sessionId', sessionId);

    const response = await axios.post(
      `${API_BASE_URL}/api/chatbot/upload-document`,
      formData,
      {
        headers: {
          'user-id': USER_ID,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file upload
      }
    );
    return response.data;
  },

  getSessionDocuments: async (sessionId: string) => {
    const response = await api.get(`/api/chatbot/session/${sessionId}/documents`);
    return response.data;
  },

  deleteDocument: async (documentId: number) => {
    const response = await api.delete(`/api/chatbot/document/${documentId}`);
    return response.data;
  },
};