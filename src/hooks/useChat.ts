// src/hooks/useChat.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession, UploadedDocument } from '@/types/chat';
import { chatAPI } from '@/utils/api';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const [session, setSession] = useState<ChatSession>({
    sessionId: '',
    userId: 1,
    messages: [],
    isLoading: false,
    uploadedDocuments: [],
  });
  
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, scrollToBottom]);

  const loadSessionDocuments = useCallback(async (sessionId: string) => {
    try {
      const response = await chatAPI.getSessionDocuments(sessionId);
      if (response.success) {
        setSession(prev => ({
          ...prev,
          uploadedDocuments: response.data.documents,
        }));
      }
    } catch (err) {
      console.error('Failed to load session documents:', err);
    }
  }, []);

  const initializeChat = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Initializing chat session...');
      
      const response = await chatAPI.createSession();
      
      if (response.success) {
        setSession(prev => ({
          ...prev,
          sessionId: response.data.sessionId,
          userId: response.data.userId || 1,
        }));

        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: uuidv4(),
          content: response.data.welcomeMessage,
          sender: 'assistant',
          timestamp: new Date(),
        };

        setSession(prev => ({
          ...prev,
          messages: [welcomeMessage],
        }));

        // Load any existing documents
        await loadSessionDocuments(response.data.sessionId);

        setIsInitialized(true);
        console.log('✅ Chat session initialized:', response.data.sessionId);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err: any) {
      console.error('❌ Failed to initialize chat:', err);
      setError(`Failed to initialize chat: ${err.response?.data?.message || err.message}`);
    }
  }, [loadSessionDocuments]);

  const sendMessage = useCallback(async (content: string, preferredProvider?: 'gemini' | 'openai') => {
    if (!content.trim() || !session.sessionId) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      setError(null);
      console.log('💬 Sending message:', content);

      const response = await chatAPI.sendMessage(content, session.sessionId, preferredProvider);

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
          isShariahCompliant: response.data.isShariahCompliant,
          principlesInvolved: response.data.principlesInvolved,
          recommendedIssuances: response.data.recommendedIssuances,
          platformActions: response.data.suggestedActions,
          modelUsed: response.data.modelUsed,
          cost: response.data.cost,
          sources: response.data.sources,
        };

        setSession(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        setQuickSuggestions(response.data.quickSuggestions || []);

        console.log('✅ Message sent successfully, model:', response.data.modelUsed);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('❌ Failed to send message:', err);

      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: `Sorry, I encountered an error: ${err.response?.data?.message || err.message}. Please try again.`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));

      setError(`Failed to send message: ${err.response?.data?.message || err.message}`);
    }
  }, [session.sessionId]);

  const handleDocumentUpload = useCallback((document: UploadedDocument) => {
    setSession(prev => ({
      ...prev,
      uploadedDocuments: [...(prev.uploadedDocuments || []), document],
    }));

    // Add system message about document upload
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      content: `✅ Document "${document.fileName}" uploaded successfully. You can now ask questions about it.`,
      sender: 'assistant',
      timestamp: new Date(),
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, systemMessage],
    }));
  }, []);

  const handleDocumentDelete = useCallback(async (documentId: number) => {
    try {
      await chatAPI.deleteDocument(documentId);
      
      setSession(prev => ({
        ...prev,
        uploadedDocuments: (prev.uploadedDocuments || []).filter(doc => doc.id !== documentId),
      }));

      console.log('✅ Document deleted:', documentId);
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Failed to delete document');
    }
  }, []);

  const clearChat = useCallback(() => {
    setSession(prev => ({
      ...prev,
      messages: [],
    }));
    setQuickSuggestions([]);
    setError(null);
  }, []);

  const resetChat = useCallback(async () => {
    clearChat();
    setIsInitialized(false);
    await initializeChat();
  }, [clearChat, initializeChat]);

  return {
    session,
    quickSuggestions,
    error,
    isInitialized,
    messagesEndRef,
    initializeChat,
    sendMessage,
    handleDocumentUpload,
    handleDocumentDelete,
    clearChat,
    resetChat,
  };
};