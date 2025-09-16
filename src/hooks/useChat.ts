/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '@/types/chat';
import { chatAPI } from '@/utils/api';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const [session, setSession] = useState<ChatSession>({
    sessionId: '',
    userId: 1,
    messages: [],
    isLoading: false,
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

        setIsInitialized(true);
        console.log('✅ Chat session initialized:', response.data.sessionId);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err: any) {
      console.error('❌ Failed to initialize chat:', err);
      setError(`Failed to initialize chat: ${err.response?.data?.message || err.message}`);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !session.sessionId) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      setError(null);
      console.log('💬 Sending message:', content);
      
      const response = await chatAPI.sendMessage(content, session.sessionId);

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
    clearChat,
    resetChat,
  };
};